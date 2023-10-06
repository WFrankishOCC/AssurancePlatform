# Generated by Django 3.2.8 on 2023-10-06 09:00

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("eap_api", "0006_auto_20230925_1225"),
    ]

    operations = [
        migrations.AlterField(
            model_name="propertyclaim",
            name="strategy",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="strategies",
                to="eap_api.strategy",
            ),
        ),
    ]
