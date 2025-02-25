import json
import cohere
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render

# Remplace par ta clé API Cohere (elle est gratuite t'es pas obligé de me voler la mienne fait pas le flemmard)
cohere_client = cohere.Client("kWy6hVux38mEMUfUGhLaa6Z9GDKMwbbVvP1vaHR2")

def chatbot_view(request):
    return render(request, 'chatbot/chatbot.html')

@csrf_exempt
def chatbot_response(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_message = data.get("message", "")

            if not user_message:
                return JsonResponse({"error": "Message vide"}, status=400)

            # Envoi du message à Cohere
            response = cohere_client.chat(
                message=user_message,
                model="command"  # Modèle gratuit
            )

            bot_message = response.text  # Récupère la réponse du chatbot

            return JsonResponse({"message": bot_message})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Requête invalide"}, status=400)
