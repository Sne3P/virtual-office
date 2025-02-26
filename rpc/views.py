# Django Import
from django.http.response import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib import messages
from rpc.models import Result

import random
import logging

log = logging.getLogger(__name__)

def game(request):
    """
    Logique du jeu Pierre-Papier-Ciseaux sans gestion d'utilisateur
    """
    gamelist = ["rock", "paper", "scissors"]
    bot_action = random.choice(gamelist)

    if request.method == "POST":
        user_move = request.POST.get("name")  # Le nom est passé par le bouton (rock, paper, scissors)

        if user_move == bot_action:
            status = "Tie"
            messages.info(request, "Égalité !")
        elif (
            (user_move == "rock" and bot_action == "scissors")
            or (user_move == "paper" and bot_action == "rock")
            or (user_move == "scissors" and bot_action == "paper")
        ):
            status = "Win"
            messages.success(request, "Vous avez gagné !")
        else:
            status = "Lose"
            messages.error(request, "Vous avez perdu.")

        # Enregistrer le résultat sans référence à un utilisateur
        Result.objects.create(bot_move=bot_action, user_move=user_move, status=status)
        log.debug(f"Bot: {bot_action} | User: {user_move} | Status: {status}")

    return render(request, "rpc/game.html")


def result(request):
    """
    Afficher tous les résultats
    """
    results = Result.objects.all().order_by("-id")
    return render(request, "rpc/result.html", {"results": results})
