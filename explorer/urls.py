from django.urls import path
from . import views

app_name = 'explorer'

urlpatterns = [
    path('', views.explorer_view, name='view'),
    path('drive/<str:drive_type>/', views.explorer_view, name='view_by_drive'),
    path('directory/<int:directory_id>/', views.explorer_view, name='view'),
    path('upload/<int:directory_id>/', views.upload_file, name='upload_file'),
    path('create-directory/<int:directory_id>/', views.create_directory, name='create_directory'),
    path('rename/<str:item_type>/<int:item_id>/', views.rename_item, name='rename_item'),
    path('delete/<str:item_type>/<int:item_id>/', views.delete_item, name='delete_item'),
    path('move/<str:item_type>/<int:item_id>/', views.move_item, name='move_item'),
    path('delete-selected/<int:directory_id>/', views.delete_selected, name='delete_selected'),
]
