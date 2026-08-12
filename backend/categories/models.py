from django.db import models
from django.conf import settings


class Category(models.Model):
    class Type(models.TextChoices):
        RECEITA = "receita", "Receita"
        DESPESA = "despesa", "Despesa"

    nome = models.CharField(max_length=100)
    cor = models.CharField(max_length=7)
    tipo = models.CharField(max_length=10, choices=Type.choices)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
    )

    class Meta:
        ordering = ["nome"]
        verbose_name_plural = "categories"

    def __str__(self):
        return f"{self.nome} ({self.tipo})"
