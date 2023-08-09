from django.db import models
from django.db.models import JSONField

class UserInput(models.Model):
    data = JSONField(blank=True, null=True, default=dict)
    random_id = models.CharField(max_length=250, blank=True, null=True)
    winner = models.CharField(max_length=250, blank=True, null=True)
    round = models.CharField(max_length=250, blank=True, null=True)
    percentage = models.FloatField(blank=True, null=True)
    loser = models.CharField(max_length=250, blank=True, null=True)
    hash = models.CharField(max_length=250, blank=True, null=True)

    def __str__(self):
        return f"{self.id}"
