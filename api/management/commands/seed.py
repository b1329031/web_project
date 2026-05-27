from django.core.management.base import BaseCommand
from api.models import Word, Card


WORDS = [
    # 動物
    ('貓', 'cat'), ('狗', 'dog'), ('鳥', 'bird'), ('魚', 'fish'), ('老虎', 'tiger'),
    ('獅子', 'lion'), ('大象', 'elephant'), ('猴子', 'monkey'), ('熊', 'bear'), ('兔子', 'rabbit'),
    ('馬', 'horse'), ('牛', 'cow'), ('豬', 'pig'), ('羊', 'sheep'), ('雞', 'chicken'),
    ('鴨', 'duck'), ('鵝', 'goose'), ('蛇', 'snake'), ('青蛙', 'frog'), ('烏龜', 'turtle'),
    ('鱷魚', 'crocodile'), ('長頸鹿', 'giraffe'), ('斑馬', 'zebra'), ('狐狸', 'fox'), ('狼', 'wolf'),
    ('鹿', 'deer'), ('松鼠', 'squirrel'), ('海豚', 'dolphin'), ('鯊魚', 'shark'), ('蝴蝶', 'butterfly'),
    # 食物
    ('蘋果', 'apple'), ('香蕉', 'banana'), ('橘子', 'orange'), ('葡萄', 'grape'), ('草莓', 'strawberry'),
    ('西瓜', 'watermelon'), ('芒果', 'mango'), ('鳳梨', 'pineapple'), ('檸檬', 'lemon'), ('桃子', 'peach'),
    ('麵包', 'bread'), ('蛋糕', 'cake'), ('餅乾', 'cookie'), ('披薩', 'pizza'), ('漢堡', 'hamburger'),
    ('壽司', 'sushi'), ('拉麵', 'ramen'), ('沙拉', 'salad'), ('湯', 'soup'), ('米飯', 'rice'),
    ('雞蛋', 'egg'), ('牛奶', 'milk'), ('起司', 'cheese'), ('奶油', 'butter'), ('糖', 'sugar'),
    ('鹽', 'salt'), ('胡椒', 'pepper'), ('醬油', 'soy sauce'), ('番茄醬', 'ketchup'), ('巧克力', 'chocolate'),
    # 顏色
    ('紅色', 'red'), ('藍色', 'blue'), ('綠色', 'green'), ('黃色', 'yellow'), ('橙色', 'orange'),
    ('紫色', 'purple'), ('粉紅色', 'pink'), ('黑色', 'black'), ('白色', 'white'), ('灰色', 'gray'),
    ('棕色', 'brown'), ('金色', 'gold'), ('銀色', 'silver'), ('透明', 'transparent'), ('彩虹', 'rainbow'),
    # 數字與時間
    ('一', 'one'), ('二', 'two'), ('三', 'three'), ('四', 'four'), ('五', 'five'),
    ('六', 'six'), ('七', 'seven'), ('八', 'eight'), ('九', 'nine'), ('十', 'ten'),
    ('百', 'hundred'), ('千', 'thousand'), ('早上', 'morning'), ('下午', 'afternoon'), ('晚上', 'evening'),
    ('今天', 'today'), ('明天', 'tomorrow'), ('昨天', 'yesterday'), ('星期一', 'Monday'), ('星期五', 'Friday'),
    # 家庭
    ('爸爸', 'father'), ('媽媽', 'mother'), ('哥哥', 'brother'), ('姐姐', 'sister'), ('祖父', 'grandfather'),
    ('祖母', 'grandmother'), ('叔叔', 'uncle'), ('阿姨', 'aunt'), ('表弟', 'cousin'), ('朋友', 'friend'),
    # 家庭與房子
    ('房子', 'house'), ('公寓', 'apartment'), ('廚房', 'kitchen'), ('浴室', 'bathroom'), ('臥室', 'bedroom'),
    ('客廳', 'living room'), ('花園', 'garden'), ('窗戶', 'window'), ('門', 'door'), ('屋頂', 'roof'),
    ('桌子', 'table'), ('椅子', 'chair'), ('床', 'bed'), ('沙發', 'sofa'), ('書架', 'bookshelf'),
    ('冰箱', 'refrigerator'), ('洗衣機', 'washing machine'), ('電視', 'television'), ('電燈', 'lamp'), ('鏡子', 'mirror'),
    # 學校
    ('學校', 'school'), ('老師', 'teacher'), ('學生', 'student'), ('教室', 'classroom'), ('黑板', 'blackboard'),
    ('書', 'book'), ('鉛筆', 'pencil'), ('橡皮', 'eraser'), ('尺', 'ruler'), ('書包', 'schoolbag'),
    ('考試', 'exam'), ('作業', 'homework'), ('圖書館', 'library'), ('操場', 'playground'), ('科學', 'science'),
    ('數學', 'math'), ('英文', 'English'), ('歷史', 'history'), ('美術', 'art'), ('體育', 'PE'),
    # 自然
    ('太陽', 'sun'), ('月亮', 'moon'), ('星星', 'star'), ('天空', 'sky'), ('雲朵', 'cloud'),
    ('雨', 'rain'), ('雪', 'snow'), ('風', 'wind'), ('閃電', 'lightning'), ('彩虹', 'rainbow'),
    ('山', 'mountain'), ('河流', 'river'), ('海洋', 'ocean'), ('森林', 'forest'), ('沙漠', 'desert'),
    ('島嶼', 'island'), ('火山', 'volcano'), ('草原', 'grassland'), ('瀑布', 'waterfall'), ('湖泊', 'lake'),
    ('花朵', 'flower'), ('葉子', 'leaf'), ('樹', 'tree'), ('草', 'grass'), ('石頭', 'stone'),
    # 身體
    ('頭', 'head'), ('眼睛', 'eye'), ('耳朵', 'ear'), ('鼻子', 'nose'), ('嘴巴', 'mouth'),
    ('手', 'hand'), ('腳', 'foot'), ('手臂', 'arm'), ('腿', 'leg'), ('背', 'back'),
    ('肚子', 'stomach'), ('心臟', 'heart'), ('大腦', 'brain'), ('牙齒', 'tooth'), ('頭髮', 'hair'),
    # 衣物
    ('T恤', 'T-shirt'), ('褲子', 'pants'), ('裙子', 'skirt'), ('外套', 'jacket'), ('鞋子', 'shoes'),
    ('帽子', 'hat'), ('手套', 'gloves'), ('圍巾', 'scarf'), ('眼鏡', 'glasses'), ('戒指', 'ring'),
    # 交通
    ('汽車', 'car'), ('公車', 'bus'), ('火車', 'train'), ('飛機', 'airplane'), ('腳踏車', 'bicycle'),
    ('摩托車', 'motorcycle'), ('船', 'boat'), ('計程車', 'taxi'), ('地鐵', 'subway'), ('直升機', 'helicopter'),
    # 情緒與形容詞
    ('快樂', 'happy'), ('悲傷', 'sad'), ('生氣', 'angry'), ('害怕', 'scared'), ('驚訝', 'surprised'),
    ('累', 'tired'), ('興奮', 'excited'), ('無聊', 'bored'), ('放鬆', 'relaxed'), ('緊張', 'nervous'),
    ('大', 'big'), ('小', 'small'), ('高', 'tall'), ('矮', 'short'), ('胖', 'fat'),
    ('瘦', 'thin'), ('快', 'fast'), ('慢', 'slow'), ('熱', 'hot'), ('冷', 'cold'),
    ('新', 'new'), ('舊', 'old'), ('美麗', 'beautiful'), ('醜', 'ugly'), ('聰明', 'smart'),
    # 動作動詞
    ('跑', 'run'), ('走', 'walk'), ('跳', 'jump'), ('游泳', 'swim'), ('飛', 'fly'),
    ('唱歌', 'sing'), ('跳舞', 'dance'), ('畫畫', 'draw'), ('讀書', 'read'), ('寫作', 'write'),
    ('吃', 'eat'), ('喝', 'drink'), ('睡覺', 'sleep'), ('玩耍', 'play'), ('工作', 'work'),
    ('說話', 'speak'), ('聽', 'listen'), ('看', 'watch'), ('買', 'buy'), ('賣', 'sell'),
    # 科技
    ('電腦', 'computer'), ('手機', 'phone'), ('平板', 'tablet'), ('網路', 'internet'), ('電子郵件', 'email'),
    ('密碼', 'password'), ('應用程式', 'app'), ('照片', 'photo'), ('影片', 'video'), ('音樂', 'music'),
    # 地點
    ('醫院', 'hospital'), ('銀行', 'bank'), ('超市', 'supermarket'), ('餐廳', 'restaurant'), ('咖啡廳', 'cafe'),
    ('公園', 'park'), ('博物館', 'museum'), ('電影院', 'cinema'), ('機場', 'airport'), ('火車站', 'train station'),
    ('城市', 'city'), ('鄉村', 'village'), ('街道', 'street'), ('橋梁', 'bridge'), ('廣場', 'square'),
    # 職業
    ('醫生', 'doctor'), ('護士', 'nurse'), ('警察', 'police'), ('消防員', 'firefighter'), ('廚師', 'chef'),
    ('工程師', 'engineer'), ('律師', 'lawyer'), ('商人', 'businessman'), ('藝術家', 'artist'), ('音樂家', 'musician'),
    # 運動
    ('足球', 'soccer'), ('籃球', 'basketball'), ('棒球', 'baseball'), ('網球', 'tennis'), ('游泳', 'swimming'),
    ('跑步', 'running'), ('瑜伽', 'yoga'), ('滑板', 'skateboarding'), ('乒乓球', 'table tennis'), ('羽毛球', 'badminton'),
]

CARDS = [
    # BTS
    {'card_id': 'bts1', 'emoji': '🐰', 'name': 'Jungkook', 'group': 'BTS', 'rarity': 'SSR', 'quote': 'Still With You'},
    {'card_id': 'bts2', 'emoji': '🐱', 'name': 'V', 'group': 'BTS', 'rarity': 'SR', 'quote': 'Singularity'},
    {'card_id': 'bts3', 'emoji': '🐿', 'name': 'Suga', 'group': 'BTS', 'rarity': 'SR', 'quote': 'Agust D'},
    {'card_id': 'bts4', 'emoji': '🐥', 'name': 'J-Hope', 'group': 'BTS', 'rarity': 'R', 'quote': 'Chicken Noodle Soup'},
    {'card_id': 'bts5', 'emoji': '🐨', 'name': 'RM', 'group': 'BTS', 'rarity': 'R', 'quote': 'Mono'},
    {'card_id': 'bts6', 'emoji': '🐹', 'name': 'Jimin', 'group': 'BTS', 'rarity': 'N', 'quote': 'Filter'},
    {'card_id': 'bts7', 'emoji': '🐻', 'name': 'Jin', 'group': 'BTS', 'rarity': 'N', 'quote': 'Moon'},
    # TWICE
    {'card_id': 'tw1', 'emoji': '🍭', 'name': 'Nayeon', 'group': 'TWICE', 'rarity': 'SSR', 'quote': 'FANCY'},
    {'card_id': 'tw2', 'emoji': '🌺', 'name': 'Jihyo', 'group': 'TWICE', 'rarity': 'SR', 'quote': 'Signal'},
    {'card_id': 'tw3', 'emoji': '🍑', 'name': 'Momo', 'group': 'TWICE', 'rarity': 'SR', 'quote': 'Feel Special'},
    {'card_id': 'tw4', 'emoji': '☁️', 'name': 'Sana', 'group': 'TWICE', 'rarity': 'R', 'quote': 'What is Love?'},
    {'card_id': 'tw5', 'emoji': '🌸', 'name': 'Jeongyeon', 'group': 'TWICE', 'rarity': 'R', 'quote': 'Scientist'},
    {'card_id': 'tw6', 'emoji': '🎀', 'name': 'Dahyun', 'group': 'TWICE', 'rarity': 'R', 'quote': 'YES or YES'},
    {'card_id': 'tw7', 'emoji': '🍀', 'name': 'Chaeyoung', 'group': 'TWICE', 'rarity': 'N', 'quote': 'Alcohol-Free'},
    {'card_id': 'tw8', 'emoji': '🌙', 'name': 'Mina', 'group': 'TWICE', 'rarity': 'N', 'quote': 'Likey'},
    {'card_id': 'tw9', 'emoji': '🦋', 'name': 'Tzuyu', 'group': 'TWICE', 'rarity': 'N', 'quote': 'Cheer Up'},
    # TXT
    {'card_id': 'txt1', 'emoji': '🌌', 'name': 'Yeonjun', 'group': 'TXT', 'rarity': 'SSR', 'quote': 'Run Away'},
    {'card_id': 'txt2', 'emoji': '🔮', 'name': 'Soobin', 'group': 'TXT', 'rarity': 'SR', 'quote': '0X1=LOVESONG'},
    {'card_id': 'txt3', 'emoji': '🌊', 'name': 'Beomgyu', 'group': 'TXT', 'rarity': 'SR', 'quote': 'Eternally'},
    {'card_id': 'txt4', 'emoji': '🌙', 'name': 'Taehyun', 'group': 'TXT', 'rarity': 'R', 'quote': 'Blue Hour'},
    {'card_id': 'txt5', 'emoji': '🐦', 'name': 'Huening Kai', 'group': 'TXT', 'rarity': 'N', 'quote': 'Crown'},
    # BLACKPINK
    {'card_id': 'bp1', 'emoji': '🌹', 'name': 'JENNIE', 'group': 'BLACKPINK', 'rarity': 'SSR', 'quote': 'SOLO'},
    {'card_id': 'bp2', 'emoji': '🦋', 'name': 'LISA', 'group': 'BLACKPINK', 'rarity': 'SR', 'quote': 'LALISA'},
    {'card_id': 'bp3', 'emoji': '🌸', 'name': 'JISOO', 'group': 'BLACKPINK', 'rarity': 'R', 'quote': 'FLOWER'},
    {'card_id': 'bp4', 'emoji': '💎', 'name': 'ROSÉ', 'group': 'BLACKPINK', 'rarity': 'SR', 'quote': 'On The Ground'},
    # IU
    {'card_id': 'iu1', 'emoji': '🎵', 'name': 'IU (Celebrity)', 'group': 'IU', 'rarity': 'SSR', 'quote': 'Celebrity'},
    {'card_id': 'iu2', 'emoji': '🌺', 'name': 'IU (Palette)', 'group': 'IU', 'rarity': 'SR', 'quote': 'Palette'},
    {'card_id': 'iu3', 'emoji': '🌙', 'name': 'IU (Through the Night)', 'group': 'IU', 'rarity': 'SR', 'quote': 'Through the Night'},
    {'card_id': 'iu4', 'emoji': '🎀', 'name': 'IU (BBIBBI)', 'group': 'IU', 'rarity': 'R', 'quote': 'BBIBBI'},
    {'card_id': 'iu5', 'emoji': '🍀', 'name': 'IU (Twenty-Three)', 'group': 'IU', 'rarity': 'N', 'quote': 'Twenty-Three'},
]


class Command(BaseCommand):
    help = 'Seed the database with words and cards'

    def handle(self, *args, **kwargs):
        Word.objects.all().delete()
        for ch, en in WORDS:
            Word.objects.create(chinese=ch, english=en)
        self.stdout.write(f'Created {len(WORDS)} words')

        Card.objects.all().delete()
        for c in CARDS:
            Card.objects.create(**c)
        self.stdout.write(f'Created {len(CARDS)} cards')

        self.stdout.write(self.style.SUCCESS('Seed complete!'))
