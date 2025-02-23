from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class DesktopSetting(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='desktop_setting')
    config = models.JSONField(default=dict, blank=True)  # stocke positions, icônes épinglées, etc.

    def __str__(self):
        return f"Desktop configuration for {self.user.username}"
