from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Création du compte démo: demo / demo'

    def handle(self, *args, **options):
        if not User.objects.filter(username='demo').exists():
            User.objects.create_user(username='demo', password='demo')
            self.stdout.write(self.style.SUCCESS('Compte démo créé.'))
        else:
            self.stdout.write('Compte démo déjà existant.')
