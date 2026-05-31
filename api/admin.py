from django.contrib import admin
from .models import Word, Card, UserRecord

# 💡 1. 讓單字庫在後台顯示得更漂亮，具有欄位標題與搜尋功能
@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    # 後台列表要直接顯示哪些欄位（不用點進去就能看到）
    list_display = ('id', 'english', 'chinese', 'part_of_speech')
    # 讓管理者可以用英文或中文關鍵字，在頂端搜尋欄瘋狂搜尋
    search_fields = ('english', 'chinese')
    # 在右側加入詞性（n./v./adj.）的快速篩選器
    list_filter = ('part_of_speech',)

# 💡 2. 讓偶像卡片庫擁有強大的過濾與搜尋功能
@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ('card_id', 'name', 'group', 'rarity', 'emoji')
    # 可以用名字、團體或是卡片 ID 進行搜尋
    search_fields = ('name', 'group', 'card_id')
    # 在右側加入稀有度（SSR/SR/R/N）與團體的快速過濾選單
    list_filter = ('rarity', 'group')

# 💡 3. 讓使用者紀錄在後台一目了然
@admin.register(UserRecord)
class UserRecordAdmin(admin.ModelAdmin):
    list_display = ('username', 'points', 'correct', 'wrong', 'updated_at')
    search_fields = ('username',)