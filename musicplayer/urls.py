from django.urls import path
from . import views

urlpatterns = [
    path('', views.musicplayer_view, name='music_player'),  # Utiliser musicplayer_view ici
]
