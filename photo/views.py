from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Photo
from .forms import PhotoUploadForm
from explorer.models import Drive
from django.db.models import Q

def photo_list(request):
    # recupere les drives auxquels l'utilisateur a acces
    drives = []
    personal = Drive.objects.filter(drive_type='personal', owner=request.user).first()
    if personal:
        drives.append(personal)
    common = Drive.objects.filter(drive_type='common').first()
    if common:
        drives.append(common)
    if request.user.is_staff:
        admin = Drive.objects.filter(drive_type='admin').first()
        if admin:
            drives.append(admin)
    photos = Photo.objects.filter(file__directory__drive__in=drives).distinct()
    form = PhotoUploadForm(user=request.user)
    return render(request, 'photo/photo_list.html', {
        'photos': photos.order_by('-file__uploaded_at'),
        'upload_form': form,
    })

def photo_detail(request, pk):
    photo = get_object_or_404(Photo, pk=pk)
    return render(request, 'photo/photo_detail.html', {'photo': photo})

def photo_upload(request):
    if request.method == 'POST':
        form = PhotoUploadForm(user=request.user, data=request.POST, files=request.FILES)
        if form.is_valid():
            file_obj = form.save()  # Le signal post_save sur File (dans Explorer) créera l'objet Photo associé
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    else:
        form = PhotoUploadForm(user=request.user)
    return render(request, 'photo/photo_upload.html', {'form': form})

def photo_delete(request, pk):
    photo = get_object_or_404(Photo, pk=pk)
    photo.delete()
    return JsonResponse({'success': True})
