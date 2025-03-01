from django.db import models
from explorer.models import File

class Photo(models.Model):
    file = models.OneToOneField(
        File,
        on_delete=models.CASCADE,
        related_name='photo'
    )
    title = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.title if self.title else (self.file.name if self.file else "Sans fichier")
    
    def delete(self, *args, **kwargs):
        if self.file:
            self.file.delete()  # Appelle notre méthode personnalisée dans File qui supprime le fichier sur disque
        super().delete(*args, **kwargs)
