from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("tipo", "valor", "categoria", "data", "usuario", "created_at")
    list_filter = ("tipo", "data")
