from django.urls import path
from . import views

urlpatterns = [
    path("", views.notepad_view, name="notepad"),
    path("save/", views.save_note, name="save_note"),
    path("update/<int:note_id>/", views.update_note, name="update_note"),
    path("delete/<int:note_id>/", views.delete_note, name="delete_note"),
]
