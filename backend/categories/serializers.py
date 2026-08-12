import re

from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "nome", "cor", "tipo")

    def validate_cor(self, value):
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", value):
            raise serializers.ValidationError("Cor deve estar no formato #RRGGBB.")
        return value

    def validate_nome(self, value):
        nome = value.strip()
        if not nome:
            raise serializers.ValidationError("Informe o nome.")
        request = self.context["request"]
        qs = Category.objects.filter(usuario=request.user, nome__iexact=nome)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Já existe uma categoria com este nome.")
        return nome
