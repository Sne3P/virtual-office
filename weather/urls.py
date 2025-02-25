from django.urls import path
from . import views

app_name = 'weather'

urlpatterns = [
    path('', views.weather_view, name='weather'),
    path('get_weather/', views.get_weather, name='get_weather'),
]
