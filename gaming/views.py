from django.shortcuts import render

def gaming_view(request):
    return render(request, "gaming/gaming.html")  # Ajoute "gaming/" pour Django
