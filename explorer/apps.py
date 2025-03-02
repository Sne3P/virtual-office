from django.apps import AppConfig

class ExplorerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'explorer'

    def ready(self):
        import explorer.signals