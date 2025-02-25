import requests
from django.shortcuts import render
from django.http import JsonResponse

API_KEY = 'e48f1812840cb1399c2dccddedda0558'  # Remplace par ta propre clé API OpenWeatherMap

def weather_view(request):
    return render(request, 'weather/weather.html')

def get_weather(request):
    city = 'Lille'  # Remplace par la ville souhaitée ou rend cela dynamique
    url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric'
    response = requests.get(url)
    weather_data = response.json()
    
    if weather_data.get('cod') != 200:
        return JsonResponse({'error': 'Impossible de récupérer la météo'}, status=400)

    temp = weather_data['main']['temp']
    description = weather_data['weather'][0]['description']
    return JsonResponse({'temp': temp, 'description': description})
