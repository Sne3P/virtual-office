from django.urls import path
from django.shortcuts import redirect
from . import views

app_name = 'explorer'

urlpatterns = [
    # Navigation par drive et dossier
    path('', lambda request: redirect('explorer:explorer_view', drive_type='personal')),
    path('drive/<str:drive_type>/', views.explorer_view, name='explorer_view'),
    path('drive/<str:drive_type>/directory/<int:directory_id>/', views.explorer_view, name='explorer_view'),
    
    # Actions sur dossier ou fichier
    path('directory/<int:directory_id>/upload/', views.upload_file, name='upload_file'),
    path('directory/<int:directory_id>/create-directory/', views.create_directory, name='create_directory'),
    path('item/<str:item_type>/<int:item_id>/rename/', views.rename_item, name='rename_item'),
    path('item/<str:item_type>/<int:item_id>/delete/', views.delete_item, name='delete_item'),
    path('item/<str:item_type>/<int:item_id>/move/', views.move_item, name='move_item'),
    path('directory/<int:directory_id>/delete-selected/', views.delete_selected, name='delete_selected'),
]
