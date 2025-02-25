from django.urls import path
from .views import chatbot_view
from .views import chatbot_response
urlpatterns = [
    path('', chatbot_view, name='chatbot'),
    path("response/", chatbot_response, name="chatbot_response"),# Assurez-vous que c'est le bon chemin
]
