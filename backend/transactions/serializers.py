from datetime import date
from decimal import Decimal

from rest_framework import serializers

from categories.serializers import CategorySerializer
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    categoria_detail = CategorySerializer(source="categoria", read_only=True)

    class Meta:
        model = Transaction
        fields = (
            "id",
            "valor",
            "tipo",
            "categoria",
            "categoria_detail",
            "data",
            "descricao",
            "created_at",
        )
        read_only_fields = ("created_at",)

    def validate_valor(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError("Valor deve ser maior que zero.")
        return value

    def validate_data(self, value):
        if value > date.today():
            raise serializers.ValidationError("Data não pode ser futura.")
        return value

    def validate(self, attrs):
        request = self.context["request"]
        categoria = attrs.get("categoria") or getattr(self.instance, "categoria", None)
        tipo = attrs.get("tipo") or getattr(self.instance, "tipo", None)

        if categoria and categoria.usuario_id != request.user.id:
            raise serializers.ValidationError({"categoria": "Categoria inválida."})

        if categoria and tipo and categoria.tipo != tipo:
            raise serializers.ValidationError(
                {"categoria": "Categoria deve ser do mesmo tipo da transação."}
            )
        return attrs
