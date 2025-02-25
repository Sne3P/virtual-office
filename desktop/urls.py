from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),  # Vue principale pour /desktop/
    path('load/', views.load_desktop_config, name='load_desktop_config'),
    path('save/', views.save_desktop_config, name='save_desktop_config'),
]
