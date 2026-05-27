from django.db import models


class Word(models.Model):
    POS_CHOICES = [('n.', 'Noun'), ('v.', 'Verb'), ('adj.', 'Adjective'), ('adv.', 'Adverb')]
    chinese = models.CharField(max_length=20)
    english = models.CharField(max_length=50)
    part_of_speech = models.CharField(max_length=5, choices=POS_CHOICES, default='n.')

    def __str__(self):
        return f"{self.chinese} / {self.english} ({self.part_of_speech})"


class Card(models.Model):
    RARITY_CHOICES = [('SSR', 'SSR'), ('SR', 'SR'), ('R', 'R'), ('N', 'N')]
    card_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=30)
    group = models.CharField(max_length=20)
    rarity = models.CharField(max_length=3, choices=RARITY_CHOICES)
    emoji = models.CharField(max_length=5)
    quote = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.group} - {self.name} ({self.rarity})"


class UserRecord(models.Model):
    username = models.CharField(max_length=30, unique=True)
    points = models.IntegerField(default=0)
    correct = models.IntegerField(default=0)
    wrong = models.IntegerField(default=0)
    collection = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
