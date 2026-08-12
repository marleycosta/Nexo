from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("categories", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Transaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("valor", models.DecimalField(decimal_places=2, max_digits=12)),
                ("tipo", models.CharField(choices=[("receita", "Receita"), ("despesa", "Despesa")], max_length=10)),
                ("data", models.DateField()),
                ("descricao", models.CharField(blank=True, max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "categoria",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="transactions",
                        to="categories.category",
                    ),
                ),
                (
                    "usuario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="transactions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-data", "-created_at"],
            },
        ),
    ]
