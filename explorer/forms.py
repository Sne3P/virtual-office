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
