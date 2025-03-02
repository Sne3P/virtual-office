from django import forms

class NewsSearchForm(forms.Form):
    query = forms.CharField(label="Rechercher des actualités", max_length=255)
