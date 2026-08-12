from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from categories.models import Category


class Command(BaseCommand):
    help = "Cria usuário demo (demo / demo123) com categorias iniciais"

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username="demo",
            defaults={"email": "demo@nexo.app"},
        )
        if created:
            user.set_password("demo123")
            user.save()
            self.stdout.write(self.style.SUCCESS("Usuário demo criado."))
        else:
            user.set_password("demo123")
            user.email = "demo@nexo.app"
            user.save()
            self.stdout.write(self.style.WARNING("Usuário demo já existia — senha resetada."))

        defaults = [
            ("Alimentação", "#df7d71", "despesa"),
            ("Transporte", "#1b3456", "despesa"),
            ("Moradia", "#304260", "despesa"),
            ("Salário", "#0e2a4f", "receita"),
            ("Freelance", "#f3907b", "receita"),
        ]
        for nome, cor, tipo in defaults:
            Category.objects.get_or_create(
                usuario=user,
                nome=nome,
                defaults={"cor": cor, "tipo": tipo},
            )

        self.stdout.write(self.style.SUCCESS("Pronto. Login: demo / demo123"))
