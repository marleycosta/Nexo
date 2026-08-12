from rest_framework import status, viewsets
from rest_framework.response import Response

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    pagination_class = None

    def get_queryset(self):
        return Category.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.transactions.exists():
            return Response(
                {
                    "detail": (
                        "Esta categoria está sendo usada em transações "
                        "e não pode ser excluída."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)
