import requests
from django.shortcuts import render
from django.http import JsonResponse

API_KEY = 'e48f1812840cb1399c2dccddedda0558'  # Remplace par ta propre clé API OpenWeatherMap

def weather_view(request):
    return render(request, 'weather/weather.html')

def get_weather(request):
    city = request.GET.get('city', 'Lille')  # Récupère la ville passée en paramètre GET, sinon utilise 'Lille'
    url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric'
    response = requests.get(url)
    weather_data = response.json()
    
    if weather_data.get('cod') != 200:
        return JsonResponse({'error': 'Impossible de récupérer la météo'}, status=400)

    # Extraction des différents paramètres météorologiques
    temp = weather_data['main']['temp']
    feels_like = weather_data['main']['feels_like']
    temp_min = weather_data['main']['temp_min']
    temp_max = weather_data['main']['temp_max']
    pressure = weather_data['main']['pressure']
    humidity = weather_data['main']['humidity']
    wind_speed = weather_data['wind']['speed']
    wind_deg = weather_data['wind']['deg']
    description = weather_data['weather'][0]['description']
    icon = weather_data['weather'][0]['icon']
    visibility = weather_data.get('visibility', 'Non disponible')  # Certains champs peuvent être absents

    # Création d'une réponse JSON avec tous les paramètres
    return JsonResponse({
        'city': city,
        'temp': temp,
        'feels_like': feels_like,
        'temp_min': temp_min,
        'temp_max': temp_max,
        'pressure': pressure,
        'humidity': humidity,
        'wind_speed': wind_speed,
        'wind_deg': wind_deg,
        'visibility': visibility,
        'description': description,
        'icon': icon
    })