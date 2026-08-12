from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken


def validate_unique_username(username: str, exclude_pk=None):
    username = (username or "").strip()
    if not username:
        raise serializers.ValidationError("Informe o usuário.")
    qs = User.objects.filter(username__iexact=username)
    if exclude_pk is not None:
        qs = qs.exclude(pk=exclude_pk)
    if qs.exists():
        raise serializers.ValidationError("Este nome de usuário já está em uso.")
    return username


def validate_unique_email(email: str, exclude_pk=None):
    email = (email or "").strip().lower()
    if not email:
        raise serializers.ValidationError("Informe o e-mail.")
    qs = User.objects.filter(email__iexact=email)
    if exclude_pk is not None:
        qs = qs.exclude(pk=exclude_pk)
    if qs.exists():
        raise serializers.ValidationError("Já existe uma conta com este e-mail.")
    return email


def user_payload(user: User):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }


def blacklist_user_tokens(user: User):
    try:
        from rest_framework_simplejwt.token_blacklist.models import (
            BlacklistedToken,
            OutstandingToken,
        )

        for token in OutstandingToken.objects.filter(user=user):
            BlacklistedToken.objects.get_or_create(token=token)
    except Exception:
        pass


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def validate_email(self, value):
        return validate_unique_email(value)

    def validate_username(self, value):
        return validate_unique_username(value)

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()

    def validate_username(self, value):
        user = self.context["request"].user
        return validate_unique_username(value, exclude_pk=user.pk)

    def validate_email(self, value):
        user = self.context["request"].user
        return validate_unique_email(value, exclude_pk=user.pk)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError(
                {"current_password": "Senha atual incorreta."}
            )
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "As senhas não coincidem."}
            )
        if attrs["current_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "A nova senha deve ser diferente da atual."}
            )
        try:
            validate_password(attrs["new_password"], user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"new_password": list(exc.messages)})
        return attrs


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Senha incorreta.")
        return value


class MeView(APIView):
    def get(self, request):
        return Response(user_payload(request.user))

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.username = serializer.validated_data["username"]
        user.email = serializer.validated_data["email"]
        user.save(update_fields=["username", "email"])
        return Response(user_payload(user))


class DeleteAccountView(APIView):
    def post(self, request):
        serializer = DeleteAccountSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = request.user
        with transaction.atomic():
            blacklist_user_tokens(user)
            user.transactions.all().delete()
            user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        blacklist_user_tokens(user)
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "detail": "Senha atualizada com sucesso.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }
        )
