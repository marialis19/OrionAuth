from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView # vista incluida en SimpleJWT para refrescar tokens

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
