from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Note
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse


def notepad_view(request):
    notes = Note.objects.all()
    return render(request, "notepad/notepad.html", {"notes": notes})

@csrf_exempt
def save_note(request):
    if request.method == "POST":
        title = request.POST.get("title", "Nouvelle note")
        content = request.POST.get("content", "")
        note = Note(title=title, content=content)
        note.save()
        return JsonResponse({"id": note.id, "title": note.title})

@csrf_exempt
def update_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    if request.method == "POST":
        note.title = request.POST.get("title", note.title)
        note.content = request.POST.get("content", note.content)
        note.save()
        return JsonResponse({"success": True})

@csrf_exempt
def delete_note(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    note.delete()
    return JsonResponse({"success": True})
