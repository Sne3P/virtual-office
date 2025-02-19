# Generated by Django 5.1.6 on 2025-02-16 16:00

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DesktopSetting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('config', models.JSONField(blank=True, default=dict)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='desktop_setting', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
