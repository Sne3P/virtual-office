from django.urls import path
from . import views

app_name = 'explorer'

urlpatterns = [
    path('', views.explorer_view, name='view'),
    path('drive/<str:drive_type>/', views.explorer_view, name='view_by_drive'),
    path('<int:directory_id>/', views.explorer_view, name='view'),
    path('<int:directory_id>/upload/', views.upload_file, name='upload_file'),
    path('<int:directory_id>/create/', views.create_directory, name='create_directory'),
]
