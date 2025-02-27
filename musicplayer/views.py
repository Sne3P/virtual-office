import requests
from django.shortcuts import render
from .forms import MusicSearchForm
from .models import LocalMusic
from .models import LocalMusic


def musicplayer_view(request):
    tracks = None  # Mettre `None` au lieu de `[]` pour différencier l'état initial
    form = MusicSearchForm(request.GET or None)

    if form.is_valid():
        query = form.cleaned_data['query']
        url = f"https://api.deezer.com/search?q={query}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            tracks = [
                {
                    'title': track['title'],
                    'artist': track['artist']['name'],
                    'preview_url': track['preview'],
                    'cover_url': track['album']['cover_medium']
                }
                for track in data.get('data', [])
            ]

    return render(request, 'musicplayer/musicplayer.html', {'form': form, 'tracks': tracks})

