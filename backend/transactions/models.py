from django.db import models
from django.conf import settings

from categories.models import Category


class Transaction(models.Model):
    class Type(models.TextChoices):
        RECEITA = "receita", "Receita"
        DESPESA = "despesa", "Despesa"

    valor = models.DecimalField(max_digits=12, decimal_places=2)
    tipo = models.CharField(max_length=10, choices=Type.choices)
    categoria = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="transactions",
    )
    data = models.DateField()
    descricao = models.CharField(max_length=255, blank=True)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-data", "-created_at"]

    def __str__(self):
        return f"{self.tipo} {self.valor} em {self.data}"
