# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-13 17:09
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_auto_20170413_1659'),
    ]

    operations = [
        migrations.AlterField(
            model_name='card',
            name='subtitle',
            field=models.CharField(blank=True, max_length=140, null=True),
        ),
    ]
