from django import forms
from explorer.models import Drive
from explorer.views import get_root_directory
from django.db.models import Q

class PhotoUploadForm(forms.Form):
    title = forms.CharField(max_length=255, required=True, label="Titre")
    image = forms.ImageField(required=True, label="Photo")
    drive = forms.ModelChoiceField(queryset=Drive.objects.none(), label="Choisir le drive", required=True)

    def __init__(self, user=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if user:
            qs = Drive.objects.filter(Q(drive_type='personal', owner=user) | Q(drive_type='common'))
            if user.is_staff:
                qs = qs | Drive.objects.filter(drive_type='admin')
            self.fields['drive'].queryset = qs.distinct()

    def save(self):
        from explorer.models import File
        drive = self.cleaned_data['drive']
        title = self.cleaned_data['title']
        image = self.cleaned_data['image']
        root = get_root_directory(drive)
        file_obj = File.objects.create(
            name=title,
            directory=root,
            file=image,
            owner=drive.owner
        )
        return file_obj
