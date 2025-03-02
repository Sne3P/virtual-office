from django import forms

class StockSearchForm(forms.Form):
    symbol = forms.CharField(label="Rechercher un symbole", max_length=10)
