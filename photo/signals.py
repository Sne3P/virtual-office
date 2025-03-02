from django.db.models.signals import post_save
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
