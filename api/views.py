import random
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Word, Card, UserRecord
from .serializers import WordSerializer, CardSerializer, UserRecordSerializer

# 抽卡機率設定：SSR 5%、SR 20%、R 55%、N 100%（累積機率）
RARITY_THRESHOLDS = [
    ('SSR', 5),
    ('SR', 20),
    ('R', 55),
    ('N', 100),
]


def words_list(request):
    words = Word.objects.all()
    return JsonResponse(WordSerializer(words, many=True).data, safe=False)


def cards_list(request):
    cards = Card.objects.all()
    return JsonResponse(CardSerializer(cards, many=True).data, safe=False)


# 取得使用者資料，若帳號不存在則自動建立（登入 / 註冊合一）
def get_user(request, username):
    user, _ = UserRecord.objects.get_or_create(username=username)
    return JsonResponse(UserRecordSerializer(user).data)


@csrf_exempt
@require_http_methods(['POST'])
def answer_word(request, username):
    data = json.loads(request.body)
    is_correct = data.get('correct', False)
    hint_used = data.get('hint_used', False)
    user, _ = UserRecord.objects.get_or_create(username=username)
    # 答對得 2 點；使用提示後答對只得 1 點；答錯不扣分
    if is_correct:
        user.correct += 1
        user.points += 1 if hint_used else 2
    else:
        user.wrong += 1
    user.save()
    return JsonResponse(UserRecordSerializer(user).data)


@csrf_exempt
@require_http_methods(['POST'])
def gacha(request, username):
    user, _ = UserRecord.objects.get_or_create(username=username)
    if user.points < 10:
        return JsonResponse({'error': '點數不足'}, status=400)

    def draw_one():
        # 產生 0~100 的隨機數，對照機率表決定稀有度
        roll = random.random() * 100
        rarity = 'N'
        for r, threshold in RARITY_THRESHOLDS:
            if roll < threshold:
                rarity = r
                break
        pool = list(Card.objects.filter(rarity=rarity))
        if not pool:
            pool = list(Card.objects.all())
        return random.choice(pool) if pool else None

    card = draw_one()
    if not card:
        return JsonResponse({'error': '無可用卡片'}, status=500)

    # 新卡才加入收藏，重複抽到不重複記錄
    if card.card_id not in user.collection:
        user.collection.append(card.card_id)
    user.points -= 10
    user.save()

    card_data = CardSerializer(card).data
    return JsonResponse({'cards': [card_data, card_data, card_data], 'points': user.points})
