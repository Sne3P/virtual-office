from django.urls import path
from . import views

urlpatterns = [
    path('', views.game, name='start_game'),
    path('result/', views.result, name='result'),
]