# Generated by Django 4.2 on 2023-08-09 00:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('simulador_elecciones', '0003_userinput_hash'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userinput',
            name='hash',
            field=models.CharField(blank=True, max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='userinput',
            name='loser',
            field=models.CharField(blank=True, max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='userinput',
            name='random_id',
            field=models.CharField(blank=True, max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='userinput',
            name='round',
            field=models.CharField(blank=True, max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='userinput',
            name='winner',
            field=models.CharField(blank=True, max_length=250, null=True),
        ),
    ]
