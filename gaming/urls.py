from django.urls import path
from .views import gaming_view  # Assure-toi que la vue est bien importée

urlpatterns = [
    path('', gaming_view, name='gaming'),  # La page principale du jeu
]
