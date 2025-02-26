from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required

@login_required
def calculator_view(request):
    return render(request, 'calculator/calculator.html')