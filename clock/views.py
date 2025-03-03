import datetime
from django.shortcuts import render
from django.http import JsonResponse

def clock_view(request):
    return render(request, 'clock/clock.html')

def get_time(request):
    now = datetime.datetime.now()
    return JsonResponse({'time': now.strftime('%H:%M:%S')})

def start_timer(request):
    duration = int(request.GET.get('duration', 0))
    return JsonResponse({'message': 'Minuteur démarré', 'end_time': datetime.datetime.now().timestamp() + duration})
