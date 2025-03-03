import requests
from django.shortcuts import render, get_object_or_404
from .forms import NewsSearchForm
from .models import NewsArticle
import urllib.parse

def fetch_default_news():
    url = "https://newsapi.org/v2/everything?q=Lille&apiKey=d37c4ac4b97f4dd5bea2dd70035b7e0c"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        articles = []
        
        for article_data in data.get('articles', []):
            # save l'article dans la base de données
            article, created = NewsArticle.objects.get_or_create(
                title=article_data['title'],
                defaults={
                    'description': article_data['description'],
                    'url': article_data['url'],
                    'published_at': article_data['publishedAt'],
                }
            )
            articles.append(article)
        return articles
    return []

def news_view(request):
    articles = None
    form = NewsSearchForm(request.GET or None)

    if form.is_valid() and form.cleaned_data['query']:
        query = form.cleaned_data['query']
        url = f"https://newsapi.org/v2/everything?q={query}&apiKey=d37c4ac4b97f4dd5bea2dd70035b7e0c"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            articles = []
            
            for article_data in data.get('articles', []):
                # save l article dans la base de données
                article, created = NewsArticle.objects.get_or_create(
                    title=article_data['title'],
                    defaults={
                        'description': article_data['description'],
                        'url': article_data['url'],
                        'published_at': article_data['publishedAt'],
                    }
                )
                articles.append(article)

    if articles is None:
        articles = fetch_default_news()

    return render(request, 'new/news.html', {'form': form, 'articles': articles})

# Vue pour afficher les détails d'un article
def article_detail(request, title):
    decoded_title = urllib.parse.unquote(title)
    article = get_object_or_404(NewsArticle, title=decoded_title)
    
    return render(request, 'new/article_detail.html', {'article': article})
