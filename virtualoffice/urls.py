from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('desktop.urls')),  # Route vide pour le bureau
    path('accounts/', include('accounts.urls')),
    path('explorer/', include('explorer.urls')),
    path('terminal/', include('terminal.urls')),
]
