from django.db import models

class LocalMusic(models.Model):
    title = models.CharField(max_length=200)
    artist = models.CharField(max_length=200)
    album = models.CharField(max_length=200, null=True, blank=True)
    file = models.FileField(upload_to='music/')

    def __str__(self):
        return f"{self.title} - {self.artist}"
