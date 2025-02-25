import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from .models import DesktopSetting
from .apps_config import APPS  # Import de la configuration des apps

@login_required
def dashboard(request):
    # Passage de la configuration des applications au template
    return render(request, 'dashboard.html', {'apps': APPS})

@login_required
@require_http_methods(["GET"])
def load_desktop_config(request):
    setting, created = DesktopSetting.objects.get_or_create(user=request.user)
    return JsonResponse(setting.config)

@login_required
@require_http_methods(["POST"])
def save_desktop_config(request):
    try:
        data = json.loads(request.body.decode('utf-8'))
        setting, created = DesktopSetting.objects.get_or_create(user=request.user)
        setting.config = data
        setting.save()
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
