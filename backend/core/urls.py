from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from categories.views import CategoryViewSet
from transactions.views import DashboardSummaryView, TransactionViewSet
from users.views import ChangePasswordView, DeleteAccountView, MeView, RegisterView

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"transactions", TransactionViewSet, basename="transaction")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/auth/me/", MeView.as_view(), name="me"),
    path("api/auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("api/auth/delete-account/", DeleteAccountView.as_view(), name="delete-account"),
    path("api/dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("api/", include(router.urls)),
]
