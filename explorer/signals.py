import os
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from explorer.models import File
from photo.models import Photo

IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

@receiver(post_save, sender=File)
def create_photo_from_file(sender, instance, created, **kwargs):
    if created:
        ext = instance.extension.lower()
        if ext in IMAGE_EXTENSIONS and not hasattr(instance, 'photo'):
            Photo.objects.create(
                file=instance,
                title=instance.name
            )

@receiver(post_delete, sender=File)
def delete_file_from_storage(sender, instance, **kwargs):
    # Ce signal s'assure que le fichier physique est supprimé
    if instance.file:
        try:
            if os.path.isfile(instance.file.path):
                os.remove(instance.file.path)
        except Exception as e:
            print("Erreur lors de la suppression du fichier:", e)
