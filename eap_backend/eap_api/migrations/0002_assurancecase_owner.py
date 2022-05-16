# Generated by Django 3.2.8 on 2022-05-12 14:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("eap_api", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="assurancecase",
            name="owner",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="cases",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
