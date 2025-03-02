import os, json
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponseBadRequest, JsonResponse
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .models import Drive, Directory, File
from .forms import FileUploadForm, DirectoryCreationForm, RenameForm, MoveForm

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

    create_directory_url = reverse('explorer:create_directory', kwargs={'directory_id': current.id})
    upload_file_url = reverse('explorer:upload_file', kwargs={'directory_id': current.id})
    delete_selected_url = reverse('explorer:delete_selected', kwargs={'directory_id': current.id})
    sort_field = request.GET.get('sort', 'name')
    view_type = request.GET.get('view', 'grid')
    
    # Affichage des drives accessibles : personnel, commun, et admin pour les staff
    drives = []
    personal = get_or_create_drive(request.user, 'personal')
    if personal:
        drives.append(personal)
    common = get_or_create_drive(request.user, 'common')
    if common:
        drives.append(common)
    if request.user.is_staff:
        admin = get_or_create_drive(request.user, 'admin')
        if admin:
            drives.append(admin)
    
    context = {
        'current_directory': current,
        'subdirectories': current.subdirectories.all().order_by('name'),
        'files': current.files.all().order_by(sort_field),
        'drive_type': drive_type,
        'view_type': view_type,
        'create_directory_url': create_directory_url,
        'upload_file_url': upload_file_url,
        'delete_selected_url': delete_selected_url,
        'drives': drives,
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
    elif item_type == 'file':
        item = get_object_or_404(File, id=item_id)
        drive = item.directory.drive
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
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    else:
        form = MoveForm(drive)
    return render(request, 'explorer/move_item.html', {'form': form, 'item': item, 'item_type': item_type})

@login_required
def delete_selected(request, directory_id):
    current = get_object_or_404(Directory, id=directory_id)
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON payload'})
        selected_items = data.get('selected', [])
        if selected_items:
            for entry in selected_items:
                try:
                    item_type = entry.get('type')
                    item_id = entry.get('id')
                    if item_type == 'file':
                        File.objects.filter(id=item_id, directory=current).delete()
                    elif item_type == 'directory':
                        Directory.objects.filter(id=item_id, parent=current).delete()
                except Exception as ex:
                    print("Erreur lors de la suppression de", entry, ex)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'No items selected'})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})
