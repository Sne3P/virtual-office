import json
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponseBadRequest
from django.contrib.auth.decorators import login_required
from .models import Drive, Directory, File
from .forms import FileUploadForm, DirectoryCreationForm, RenameForm, MoveForm, DeleteSelectedForm

def get_or_create_personal_drive(user):
    drive, _ = Drive.objects.get_or_create(
        owner=user, drive_type='personal',
        defaults={'name': f"{user.username}'s Drive"}
    )
    return drive

def get_or_create_common_drive():
    drive, _ = Drive.objects.get_or_create(
        drive_type='common',
        defaults={'name': 'Common Drive'}
    )
    return drive

def get_or_create_admin_drive():
    drive, _ = Drive.objects.get_or_create(
        drive_type='admin',
        defaults={'name': 'Admin Drive'}
    )
    return drive

@login_required
def explorer_view(request, directory_id=None, drive_type=None):
    user = request.user
    drives = []
    personal_drive = get_or_create_personal_drive(user)
    common_drive = get_or_create_common_drive()
    drives.append(('personal', personal_drive))
    drives.append(('common', common_drive))
    if user.is_staff:
        admin_drive = get_or_create_admin_drive()
        drives.append(('admin', admin_drive))
    
    # Sélection du drive selon le paramètre drive_type
    if drive_type is None:
        selected_drive = personal_drive
        selected_drive_type = 'personal'
    else:
        selected_drive = next((d for dt, d in drives if dt == drive_type), personal_drive)
        selected_drive_type = drive_type

    # Récupération ou création du dossier racine pour le drive sélectionné
    root_directory = Directory.objects.filter(drive=selected_drive, parent__isnull=True).first()
    if not root_directory:
        root_directory = Directory.objects.create(name='Root', drive=selected_drive)
    current_directory = get_object_or_404(Directory, id=directory_id) if directory_id else root_directory

    # Tri et mode de vue (grid ou list)
    sort_field = request.GET.get('sort', 'name')
    view_type = request.GET.get('view', 'grid')
    files = current_directory.files.all().order_by(sort_field)
    subdirectories = current_directory.subdirectories.all().order_by('name')
    
    context = {
        'current_directory': current_directory,
        'subdirectories': subdirectories,
        'files': files,
        'drives': drives,
        'selected_drive_type': selected_drive_type,
        'sort_field': sort_field,
        'view_type': view_type,
    }
    return render(request, 'explorer/explorer.html', context)

@login_required
def upload_file(request, directory_id):
    current_directory = get_object_or_404(Directory, id=directory_id)
    if request.method == 'POST':
        form = FileUploadForm(request.POST, request.FILES)
        if form.is_valid():
            file_obj = form.save(commit=False)
            file_obj.directory = current_directory
            file_obj.owner = request.user
            file_obj.save()
            return redirect('explorer:view', directory_id=directory_id)
    else:
        form = FileUploadForm()
    return render(request, 'explorer/upload_file.html', {'form': form, 'current_directory': current_directory})

@login_required
def create_directory(request, directory_id):
    current_directory = get_object_or_404(Directory, id=directory_id)
    if request.method == 'POST':
        form = DirectoryCreationForm(request.POST)
        if form.is_valid():
            dir_obj = form.save(commit=False)
            dir_obj.parent = current_directory
            dir_obj.drive = current_directory.drive
            dir_obj.save()
            return redirect('explorer:view', directory_id=current_directory.id)
    else:
        form = DirectoryCreationForm()
    return render(request, 'explorer/create_directory.html', {'form': form, 'current_directory': current_directory})

@login_required
def rename_item(request, item_type, item_id):
    if item_type == 'directory':
        item = get_object_or_404(Directory, id=item_id)
        redirect_dir = item.parent.id if item.parent else item.drive.directories.filter(parent__isnull=True).first().id
    elif item_type == 'file':
        item = get_object_or_404(File, id=item_id)
        redirect_dir = item.directory.id
    else:
        return HttpResponseBadRequest("Invalid item type.")
    
    if request.method == 'POST':
        form = RenameForm(request.POST)
        if form.is_valid():
            item.name = form.cleaned_data['new_name']
            item.save()
            return redirect('explorer:view', directory_id=redirect_dir)
    else:
        form = RenameForm(initial={'new_name': item.name})
    return render(request, 'explorer/rename_item.html', {'form': form, 'item': item, 'item_type': item_type})

@login_required
def delete_item(request, item_type, item_id):
    if item_type == 'directory':
        item = get_object_or_404(Directory, id=item_id)
        parent_dir = item.parent if item.parent else item.drive.directories.filter(parent__isnull=True).first()
    elif item_type == 'file':
        item = get_object_or_404(File, id=item_id)
        parent_dir = item.directory
    else:
        return HttpResponseBadRequest("Invalid item type.")
    
    if request.method == 'POST':
        item.delete()
        return redirect('explorer:view', directory_id=parent_dir.id if parent_dir else None)
    return render(request, 'explorer/delete_item.html', {'item': item, 'item_type': item_type})

@login_required
def move_item(request, item_type, item_id):
    if item_type == 'directory':
        item = get_object_or_404(Directory, id=item_id)
        drive = item.drive
        redirect_dir = item.parent.id if item.parent else item.drive.directories.filter(parent__isnull=True).first().id
    elif item_type == 'file':
        item = get_object_or_404(File, id=item_id)
        drive = item.directory.drive
        redirect_dir = item.directory.id
    else:
        return HttpResponseBadRequest("Invalid item type.")
    
    if request.method == 'POST':
        form = MoveForm(drive, request.POST)
        if form.is_valid():
            target_directory = form.cleaned_data['target_directory']
            if item_type == 'directory':
                item.parent = target_directory
            else:
                item.directory = target_directory
            item.save()
            return redirect('explorer:view', directory_id=target_directory.id)
    else:
        form = MoveForm(drive)
    return render(request, 'explorer/move_item.html', {'form': form, 'item': item, 'item_type': item_type})

@login_required
def delete_selected(request, directory_id):
    current_directory = get_object_or_404(Directory, id=directory_id)
    if request.method == 'POST':
        form = DeleteSelectedForm(request.POST)
        if form.is_valid():
            selected_str = form.cleaned_data['selected']  # expected format: "file-12,directory-3,..."
            if selected_str:
                entries = selected_str.split(',')
                for entry in entries:
                    try:
                        item_type, item_id = entry.split('-')
                        if item_type == 'file':
                            item = File.objects.filter(id=item_id, directory=current_directory).first()
                        elif item_type == 'directory':
                            item = Directory.objects.filter(id=item_id, parent=current_directory).first()
                        else:
                            continue
                        if item:
                            item.delete()
                    except Exception as ex:
                        print("Error deleting", entry, ex)
            return redirect('explorer:view', directory_id=directory_id)
    else:
        form = DeleteSelectedForm()
    return render(request, 'explorer/delete_selected.html', {'form': form, 'current_directory': current_directory})
