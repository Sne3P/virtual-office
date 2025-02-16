# explorer/urls.py
from django.urls import path
from .views import explorer_view

urlpatterns = [
    path('', explorer_view, name='explorer'),
]
