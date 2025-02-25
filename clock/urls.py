from django.urls import path
from . import views

app_name = 'clock'

urlpatterns = [
    path('', views.clock_view, name='clock'),
    path('time/', views.get_time, name='get_time'),
]
