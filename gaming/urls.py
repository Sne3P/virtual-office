from django.urls import path
from .views import gaming_view 

urlpatterns = [
    path('', gaming_view, name='gaming'), 
]
