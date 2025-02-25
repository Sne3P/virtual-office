import datetime
from django.shortcuts import render
from django.http import JsonResponse

def clock_view(request):
    return render(request, 'clock/clock.html')

def get_time(request):
    now = datetime.datetime.now()
    return JsonResponse({'time': now.strftime('%H:%M:%S')})
