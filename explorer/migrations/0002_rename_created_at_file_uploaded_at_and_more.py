import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('explorer', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameField(
            model_name='file',
            old_name='created_at',
            new_name='uploaded_at',
        ),
        migrations.RemoveField(
            model_name='directory',
            name='is_common',
        ),
        migrations.RemoveField(
            model_name='directory',
            name='owner',
        ),
        migrations.RemoveField(
            model_name='file',
            name='owner',
        ),
        migrations.RemoveField(
            model_name='file',
            name='updated_at',
        ),
        migrations.CreateModel(
            name='Drive',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('drive_type', models.CharField(choices=[('personal', 'Personal'), ('common', 'Common'), ('admin', 'Admin')], max_length=20)),
                ('name', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(blank=True, help_text='Obligatoire pour un drive personnel, laissé vide pour les drives communs ou admin.', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='drives', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='directory',
            name='drive',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='directories', to='explorer.drive'),
            preserve_default=False,
        ),
    ]
