from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='/desktop/', permanent=False)),  # Redirige la racine vers /desktop/
    path('accounts/', include('accounts.urls')),
    path('explorer/', include('explorer.urls', namespace='explorer')),
    path('terminal/', include('terminal.urls')),
    path('desktop/', include('desktop.urls')),
    path('clock/', include('clock.urls')),
    path('chatbot/', include('chatbot.urls')),
    path('weather/', include('weather.urls')),
    path('agenda/', include('agenda.urls')),
    path('calculator/', include('calculator.urls')),
    path('musicplayer/', include('musicplayer.urls')),
    path('news/', include('news.urls')),
]
