
from django.urls import path
from . import views
from .views import event_list, get_events, add_event, delete_event

urlpatterns = [
    path('', views.event_list, name='event_list'), 
    path('events/', views.get_events, name='get_events'),
    path("add_event/", add_event, name="add_event"),
    path("delete_event/<int:event_id>/", delete_event, name="delete_event"),
]
