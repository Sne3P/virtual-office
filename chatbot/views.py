import datetime
from django.shortcuts import render
from django.http import JsonResponse
from openai import OpenAI

client = OpenAI(api_key="")
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.conf import settings
def chatbot_view(request):
    return render(request, 'chatbot/chatbot.html')


# Configure OpenAI avec la clé API stockée en environnement
# chatbot/views.py

@csrf_exempt
def chatbot_response(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_message = data.get("message", "")

            if not user_message:
                return JsonResponse({"error": "Message vide"}, status=400)

            # Envoi du message à OpenAI
            response = client.chat.completions.create(model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": user_message}])

            bot_message = response.choices[0].message.content

            return JsonResponse({"message": bot_message})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Requête invalide"}, status=400)