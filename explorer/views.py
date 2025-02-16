# explorer/views.py
import os
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.shortcuts import render

@login_required
def explorer_view(request):
    # Pour des raisons de sécurité, on limite l'exploration à MEDIA_ROOT
    root_dir = settings.MEDIA_ROOT
    try:
        items = os.listdir(root_dir)
    except Exception:
        items = []
    return render(request, 'explorer/explorer.html', {'items': items})
