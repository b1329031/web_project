from django.db import models


# 單字資料表：儲存中文、英文對應和詞性
class Word(models.Model):
    POS_CHOICES = [('n.', 'Noun'), ('v.', 'Verb'), ('adj.', 'Adjective'), ('adv.', 'Adverb')]
    chinese = models.CharField(max_length=20)
    english = models.CharField(max_length=50)
    part_of_speech = models.CharField(max_length=5, choices=POS_CHOICES, default='n.')

    def __str__(self):
        return f"{self.chinese} / {self.english} ({self.part_of_speech})"


# 偶像卡片資料表：每張卡有稀有度（SSR/SR/R/N）、所屬團體、emoji 和名言
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


# 使用者資料表：記錄答題成績、點數、已收集的卡片清單
# collection 用 JSONField 儲存 card_id 的陣列，不需要額外關聯表
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
    
# starwords/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # ✨ 【關鍵補上】把你們自己寫的後端 App 資料夾名稱加進來！
    'api',  # 💡 如果你的資料夾叫 words，這裡就填 'words'
]
