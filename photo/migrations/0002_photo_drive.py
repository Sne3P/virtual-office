# Generated by Django 5.1.6 on 2025-03-01 13:30

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('explorer', '0004_file_owner'),
        ('photo', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='photo',
            name='drive',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='photos', to='explorer.drive'),
            preserve_default=False,
        ),
    ]
