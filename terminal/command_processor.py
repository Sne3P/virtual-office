import datetime

def process_command(command):
    cmd = command.strip()
    if not cmd:
        return ""
    
    tokens = cmd.split()
    base_command = tokens[0].lower()

    if base_command == 'help':
        return ("Commandes disponibles:\n"
                "help - Affiche ce message\n"
                "clear - Efface l'écran\n"
                "date - Affiche la date et l'heure actuelles\n"
                "echo [texte] - Affiche le texte\n"
                "open [app] - Ouvre une application (ex: explorer, terminal, ...)\n"
                "ls - Liste les commandes disponibles\n"
                "shutdown - Simule l'arrêt du système\n"
                "calc [expression] - Calcule une expression arithmétique basique")
    elif base_command == 'clear':
        # Retourne une chaîne spéciale que le JS interprétera pour vider l'écran
        return "__clear__"
    elif base_command == 'date':
        now = datetime.datetime.now()
        return now.strftime("%Y-%m-%d %H:%M:%S")
    elif base_command == 'echo':
        return ' '.join(tokens[1:]) if len(tokens) > 1 else ""
    elif base_command == 'open':
        if len(tokens) > 1:
            app = tokens[1].lower()
            # Ici, vous pourriez déclencher une action côté client pour ouvrir l'application.
            return f"Lancement de l'application '{app}' (simulation)"
        else:
            return "Usage: open [nom_app]"
    elif base_command == 'ls':
        return "help, clear, date, echo, open, ls, shutdown, calc"
    elif base_command == 'shutdown':
        return "Simulation d'arrêt du système. Au revoir !"
    elif base_command == 'calc':
        try:
            expression = ' '.join(tokens[1:])
            allowed_chars = "0123456789+-*/(). "
            if any(c not in allowed_chars for c in expression):
                return "Expression invalide"
            result = eval(expression)
            return str(result)
        except Exception as e:
            return f"Erreur de calcul: {str(e)}"
    else:
        return f"Commande inconnue: {command}. Tapez 'help' pour la liste des commandes."
