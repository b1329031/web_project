from rest_framework import serializers
from .models import Word, Card, UserRecord


class WordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Word
        fields = ['id', 'chinese', 'english', 'part_of_speech']


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['card_id', 'name', 'group', 'rarity', 'emoji', 'quote']


class UserRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRecord
        fields = ['username', 'points', 'correct', 'wrong', 'collection']
