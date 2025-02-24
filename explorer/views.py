from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Drive, Directory, File
from .forms import FileUploadForm, DirectoryCreationForm

def get_or_create_personal_drive(user):
    drive, created = Drive.objects.get_or_create(
        owner=user, drive_type='personal', 
        defaults={'name': f"{user.username}'s Drive"}
    )
    return drive

def get_or_create_common_drive():
    drive, created = Drive.objects.get_or_create(
        drive_type='common', 
        defaults={'name': 'Common Drive'}
    )
    return drive

def get_or_create_admin_drive():
    drive, created = Drive.objects.get_or_create(
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
    
    if drive_type is None:
        selected_drive = personal_drive
        selected_drive_type = 'personal'
    else:
        selected_drive = next((d for dt, d in drives if dt == drive_type), personal_drive)
        selected_drive_type = drive_type

    root_directory = Directory.objects.filter(drive=selected_drive, parent__isnull=True).first()
    if not root_directory:
        root_directory = Directory.objects.create(name='Root', drive=selected_drive)
    current_directory = get_object_or_404(Directory, id=directory_id) if directory_id else root_directory

    sort_field = request.GET.get('sort', 'name')
    files = current_directory.files.all().order_by(sort_field)
    subdirectories = current_directory.subdirectories.all().order_by('name')
    
    context = {
        'current_directory': current_directory,
        'subdirectories': subdirectories,
        'files': files,
        'drives': drives,
        'selected_drive_type': selected_drive_type,
        'sort_field': sort_field,
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
            return redirect('explorer:view', directory_id=directory_id)
    else:
        form = DirectoryCreationForm()
    return render(request, 'explorer/create_directory.html', {'form': form, 'current_directory': current_directory})
