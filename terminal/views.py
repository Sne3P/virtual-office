import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from .command_processor import process_command

def terminal_view(request):
    # Affiche la page du terminal
    return render(request, 'terminal/terminal.html')

@csrf_exempt
def execute_command(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        command = data.get('command', '')
        output = process_command(command)
        response_data = {
            'command': command,
            'output': output
        }
        return JsonResponse(response_data)
    return JsonResponse({'error': 'Requête invalide'}, status=400)
