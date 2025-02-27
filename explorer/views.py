import os
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponseBadRequest, JsonResponse
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .models import Drive, Directory, File
from .forms import FileUploadForm, DirectoryCreationForm, RenameForm, MoveForm, DeleteSelectedForm

def get_or_create_drive(user, drive_type):
    if drive_type == 'personal':
        drive, _ = Drive.objects.get_or_create(
            drive_type='personal', owner=user,
            defaults={'name': f"{user.username}'s Drive"}
        )
    elif drive_type == 'common':
        drive, _ = Drive.objects.get_or_create(
            drive_type='common',
            defaults={'name': 'Common Drive'}
        )
    elif drive_type == 'admin':
        if not user.is_staff:
            return None
        drive, _ = Drive.objects.get_or_create(
            drive_type='admin',
            defaults={'name': 'Admin Drive'}
        )
    else:
        drive = None
    return drive

def get_root_directory(drive):
    root = drive.directories.filter(parent__isnull=True).first()
    if not root:
        root = Directory.objects.create(name='Root', drive=drive)
    return root

@login_required
def explorer_view(request, drive_type, directory_id=None):
    drive = get_or_create_drive(request.user, drive_type)
    if drive is None:
        return HttpResponseBadRequest("Drive inaccessible.")
    root = get_root_directory(drive)
    current = get_object_or_404(Directory, id=directory_id) if directory_id else root

    # Génère les URL en passant uniquement l'argument 'directory_id'
    create_directory_url = reverse('explorer:create_directory', kwargs={'directory_id': current.id})
    upload_file_url = reverse('explorer:upload_file', kwargs={'directory_id': current.id})

    sort_field = request.GET.get('sort', 'name')
    view_type = request.GET.get('view', 'grid')
    context = {
        'current_directory': current,
        'subdirectories': current.subdirectories.all().order_by('name'),
        'files': current.files.all().order_by(sort_field),
        'drive_type': drive_type,
        'view_type': view_type,
        'create_directory_url': create_directory_url,
        'upload_file_url': upload_file_url,
        # Veillez à fournir "drives" dans le contexte (via context processor ou ajout ici)
    }
    return render(request, 'explorer/explorer.html', context)

@login_required
def create_directory(request, directory_id):
    current = get_object_or_404(Directory, id=directory_id)
    if request.method == 'POST':
        form = DirectoryCreationForm(request.POST)
        if form.is_valid():
            new_dir = form.save(commit=False)
            new_dir.parent = current
            new_dir.drive = current.drive
            new_dir.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': True, 'directory_id': new_dir.id, 'name': new_dir.name})
            return redirect('explorer:explorer_view', drive_type=current.drive.drive_type, directory_id=current.id)
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': False, 'errors': form.errors})
    else:
        form = DirectoryCreationForm()
    return render(request, 'explorer/create_directory.html', {'form': form, 'current_directory': current})

@login_required
def upload_file(request, directory_id):
    current = get_object_or_404(Directory, id=directory_id)
    if request.method == 'POST':
        f = request.FILES.get('file')
        if f:
            new_file = File.objects.create(
                name=f.name,
                directory=current,
                owner=request.user,
                file=f
            )
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': True, 'file_id': new_file.id, 'name': new_file.name})
            return redirect('explorer:explorer_view', drive_type=current.drive.drive_type, directory_id=current.id)
        return HttpResponseBadRequest("Aucun fichier envoyé.")
    form = FileUploadForm()
    return render(request, 'explorer/upload_file.html', {'form': form, 'current_directory': current})

@login_required
def rename_item(request, item_type, item_id):
    # Renommage inline : on ne gère que POST
    if item_type == 'directory':
        item = get_object_or_404(Directory, id=item_id)
    elif item_type == 'file':
        item = get_object_or_404(File, id=item_id)
    else:
        return HttpResponseBadRequest("Type d'item invalide.")
    if request.method == 'POST':
        form = RenameForm(request.POST)
        if form.is_valid():
            item.name = form.cleaned_data['new_name']
            item.save()
            return JsonResponse({'success': True, 'new_name': item.name})
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    return HttpResponseBadRequest("GET non autorisé pour le renommage.")

@login_required
def delete_item(request, item_type, item_id):
    if item_type == 'directory':
        item = get_object_or_404(Directory, id=item_id)
        parent = item.parent if item.parent else get_root_directory(item.drive)
    elif item_type == 'file':
        item = get_object_or_404(File, id=item_id)
        parent = item.directory
    else:
        return HttpResponseBadRequest("Type d'item invalide.")
    item.delete()
    return redirect('explorer:explorer_view', drive_type=parent.drive.drive_type, directory_id=parent.id)

@login_required
def move_item(request, item_type, item_id):
    if item_type == 'directory':
        item = get_object_or_404(Directory, id=item_id)
        drive = item.drive
        redirect_id = item.parent.id if item.parent else get_root_directory(drive).id
    elif item_type == 'file':
        item = get_object_or_404(File, id=item_id)
        drive = item.directory.drive
        redirect_id = item.directory.id
    else:
        return HttpResponseBadRequest("Type d'item invalide.")
    if request.method == 'POST':
        form = MoveForm(drive, request.POST)
        if form.is_valid():
            target = form.cleaned_data['target_directory']
            if item_type == 'directory':
                item.parent = target
            else:
                item.directory = target
            item.save()
            return redirect('explorer:explorer_view', drive_type=drive.drive_type, directory_id=target.id)
    else:
        form = MoveForm(drive)
    return render(request, 'explorer/move_item.html', {'form': form, 'item': item, 'item_type': item_type})

@login_required
def delete_selected(request, directory_id):
    current = get_object_or_404(Directory, id=directory_id)
    if request.method == 'POST':
        form = DeleteSelectedForm(request.POST)
        if form.is_valid():
            for entry in form.cleaned_data['selected'].split(','):
                try:
                    item_type, item_id = entry.split('-')
                    if item_type == 'file':
                        obj = File.objects.filter(id=item_id, directory=current).first()
                    elif item_type == 'directory':
                        obj = Directory.objects.filter(id=item_id, parent=current).first()
                    else:
                        continue
                    if obj:
                        obj.delete()
                except Exception as ex:
                    print("Erreur lors de la suppression de", entry, ex)
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'success': True})
            return redirect('explorer:explorer_view', drive_type=current.drive.drive_type, directory_id=current.id)
    else:
        form = DeleteSelectedForm()
    return render(request, 'explorer/delete_selected.html', {'form': form, 'current_directory': current})
