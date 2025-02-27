from django import forms

class MusicSearchForm(forms.Form):
    query = forms.CharField(label="Rechercher une chanson", max_length=255)
