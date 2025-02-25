from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Event
import json
from datetime import datetime

@login_required
def event_list(request):
    return render(request, "agenda/event_list.html")

@login_required
def get_events(request):
    events = Event.objects.filter(user=request.user)
    event_list = [{
        'id': event.id,
        'title': event.title,
        'start': event.start_time.isoformat(),
        'end': event.end_time.isoformat(),
    } for event in events]
    return JsonResponse(event_list, safe=False)

@csrf_exempt
@login_required
def add_event(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            title = data.get("title")
            start = data.get("start")
            end = data.get("end")

            if not title or not start or not end:
                return JsonResponse({"success": False, "error": "Données manquantes"})

            event = Event(
                title=title,
                start_time=datetime.fromisoformat(start),
                end_time=datetime.fromisoformat(end),
                user=request.user
            )
            event.save()

            return JsonResponse({"success": True, "id": event.id})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "error": "Méthode non autorisée"}, status=405)
@csrf_exempt
@login_required
def delete_event(request, event_id):
    if request.method == "DELETE":
        try:
            event = get_object_or_404(Event, id=event_id, user=request.user)
            event.delete()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=500)
    
    return JsonResponse({"success": False, "error": "Méthode non autorisée"}, status=405)
