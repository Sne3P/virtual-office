from django import forms
from .models import File, Directory

class FileUploadForm(forms.ModelForm):
    class Meta:
        model = File
        fields = ['name', 'file']

class DirectoryCreationForm(forms.ModelForm):
    class Meta:
        model = Directory
        fields = ['name']

class RenameForm(forms.Form):
    new_name = forms.CharField(max_length=255, label="New Name")

class MoveForm(forms.Form):
    target_directory = forms.ModelChoiceField(queryset=Directory.objects.none(), label="Target Directory")
    def __init__(self, drive, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['target_directory'].queryset = drive.directories.all()

class DeleteSelectedForm(forms.Form):
    selected = forms.CharField(widget=forms.HiddenInput())
