from calendar import monthrange
from datetime import date
from decimal import Decimal

from django.db.models import Sum
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = (
            Transaction.objects.filter(usuario=self.request.user)
            .select_related("categoria")
        )
        category = self.request.query_params.get("category")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if category:
            qs = qs.filter(categoria_id=category)
        if date_from:
            qs = qs.filter(data__gte=date_from)
        if date_to:
            qs = qs.filter(data__lte=date_to)
        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class DashboardSummaryView(APIView):
    def get(self, request):
        month = request.query_params.get("month")
        today = date.today()

        if month:
            try:
                year_str, month_str = month.split("-")
                year, month_num = int(year_str), int(month_str)
                start = date(year, month_num, 1)
                end = date(year, month_num, monthrange(year, month_num)[1])
            except (ValueError, TypeError):
                return Response(
                    {"detail": "Parâmetro month inválido. Use YYYY-MM."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            start = date(today.year, today.month, 1)
            end = date(today.year, today.month, monthrange(today.year, today.month)[1])

        qs = Transaction.objects.filter(
            usuario=request.user,
            data__gte=start,
            data__lte=end,
        ).select_related("categoria")

        income = qs.filter(tipo="receita").aggregate(total=Sum("valor"))["total"] or Decimal("0")
        expenses = qs.filter(tipo="despesa").aggregate(total=Sum("valor"))["total"] or Decimal("0")
        balance = income - expenses

        by_category = (
            qs.values("categoria_id", "categoria__nome", "categoria__cor")
            .annotate(total=Sum("valor"))
            .order_by("-total")
        )

        payload = {
            "balance": float(balance),
            "income": float(income),
            "expenses": float(expenses),
            "by_category": [
                {
                    "category_id": row["categoria_id"],
                    "name": row["categoria__nome"],
                    "color": row["categoria__cor"],
                    "total": float(row["total"] or 0),
                }
                for row in by_category
            ],
        }
        return Response(payload)
