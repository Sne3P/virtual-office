from django.urls import path
from . import views

urlpatterns = [
    path('', views.news_view, name='news'),
    path('article/<str:title>/', views.article_detail, name='article_detail'),
]
