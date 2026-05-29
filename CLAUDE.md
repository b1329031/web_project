# StarWords — K-Pop 單字學習網站

## 專題簡介

網頁程式設計期末專題。使用者背英文單字累積點數，點數可以抽韓國偶像小卡盲盒。
技術範圍：HTML / CSS / Bootstrap / JavaScript / DOM 操作 / Ajax / Cookie / Session / Django REST framework / SQLite。

---

## 專案架構

```
starwords/                  ← Django 專案根目錄
├── manage.py
├── starwords/              ← Django 設定資料夾
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── api/                    ← Django app（後端 API）
│   ├── models.py           ← 資料庫 schema
│   ├── serializers.py      ← JSON 序列化
│   ├── views.py            ← API 邏輯
│   └── urls.py             ← API 路由
├── frontend/               ← 所有前端靜態檔案
│   ├── index.html          ← 首頁（目前 all-in-one prototype）
│   ├── quiz.html           ← 背單字頁（待拆）
│   ├── gacha.html          ← 抽盲盒頁（待拆）
│   ├── profile.html        ← 個人資料 + 卡冊（待拆）
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── data.js         ← WORDS + CARDS 資料
│       ├── state.js        ← localStorage / Cookie 邏輯
│       └── main.js         ← 頁面邏輯
└── db.sqlite3              ← SQLite 資料庫（自動產生）
```

---

## 安裝與啟動

```bash
pip install django djangorestframework django-cors-headers
django-admin startproject starwords
cd starwords
python manage.py startapp api
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

`settings.py` 必須加入：
```python
INSTALLED_APPS = [
    ...
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 要放最上面
    ...
]

CORS_ALLOW_ALL_ORIGINS = True  # 開發時允許前端跨域
```

---

## 資料庫 Models（api/models.py）

```python
from django.db import models

class Word(models.Model):
    chinese = models.CharField(max_length=20)
    english = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.chinese} / {self.english}"

class Card(models.Model):
    RARITY_CHOICES = [('SSR','SSR'),('SR','SR'),('R','R'),('N','N')]
    card_id  = models.CharField(max_length=20, unique=True)
    name     = models.CharField(max_length=30)
    group    = models.CharField(max_length=20)
    rarity   = models.CharField(max_length=3, choices=RARITY_CHOICES)
    emoji    = models.CharField(max_length=5)
    quote    = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.group} - {self.name} ({self.rarity})"

class UserRecord(models.Model):
    username   = models.CharField(max_length=30)
    points     = models.IntegerField(default=0)
    correct    = models.IntegerField(default=0)
    wrong      = models.IntegerField(default=0)
    collection = models.JSONField(default=list)   # 存已抽到的 card_id list
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
```

---

## API 路由規劃（api/urls.py）

| Method | URL | 功能 |
|--------|-----|------|
| GET | `/api/words/` | 拿全部單字（前端答題用） |
| GET | `/api/cards/` | 拿全部卡片資料 |
| GET | `/api/user/<username>/` | 拿使用者資料 |
| POST | `/api/user/<username>/answer/` | 回答單字，更新點數 |
| POST | `/api/user/<username>/gacha/` | 抽盲盒，消耗點數回傳卡片 |

---

## 遊戲規則

- 答對單字：+1 點
- 答錯單字：不扣點，顯示正確答案
- 抽一次盲盒：消耗 3 點
- 抽卡機率：SSR 5%、SR 15%、R 35%、N 45%

---

## Cookie 使用方式（前端）

Cookie 存「使用者名稱」，讓前端知道現在是誰在玩：

```javascript
// 寫入 cookie（7天過期）
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

// 讀取 cookie
function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? parts[1] : r;
    }, null);
}

// 用法
setCookie('username', 'StarFan', 7);
const user = getCookie('username');  // → 'StarFan'
```

---

## localStorage 資料結構（前端暫存）

```js
{
  points: Number,
  correct: Number,
  wrong: Number,
  combo: Number,
  bestCombo: Number,
  answered: [],       // 已答過的單字（中文）
  collection: [],     // 已抽到的 card_id
  history: []         // 抽卡紀錄（最新在前）
}
```

---

## Ajax 呼叫範例（前端 fetch）

```javascript
// 拿單字列表
const res = await fetch('http://127.0.0.1:8000/api/words/');
const words = await res.json();

// 回答單字
await fetch(`http://127.0.0.1:8000/api/user/${username}/answer/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word_id: 1, correct: true })
});

// 抽盲盒
const res = await fetch(`http://127.0.0.1:8000/api/user/${username}/gacha/`, {
    method: 'POST'
});
const card = await res.json();  // → { card_id, name, group, rarity, ... }
```

---

## 卡片清單（共 29 張）

| 團體 | 人數 | 成員與稀有度 |
|------|------|-------------|
| BTS | 7 | 田柾國(SSR)、金泰亨(SR)、閔玧其(SR)、鄭號錫(R)、金南俊(R)、朴智旻(N)、金碩珍(N) |
| TWICE | 9 | 나연(SSR)、지효(SR)、모모(SR)、사나(R)、정연(R)、다현(R)、채영(N)、미나(N)、쯔위(N) |
| TXT | 5 | 연준(SSR)、수빈(SR)、범규(SR)、태현(R)、휴닝카이(N) |
| BLACKPINK | 4 | JENNIE(SSR)、LISA(SR)、ROSÉ(SR)、JISOO(R) |
| IU | 4 | Celebrity(SSR)、Palette(SR)、BBIBBI(R)、스물셋(N) |

---

## 待完成功能清單

### 後端（Django）
- [ ] 建立 `api` app，完成 models.py
- [ ] 寫 serializers.py
- [ ] 寫 views.py（words list、cards list、user CRUD、gacha 邏輯）
- [ ] 設定 urls.py 路由
- [ ] 用 Django Admin 填入單字和卡片資料
- [ ] 測試 API（用瀏覽器開 http://127.0.0.1:8000/api/words/）

### 前端
- [ ] 補足單字到 300 個（先在 data.js 裡，之後改成 Ajax 從後端拿）
- [ ] 拆成多頁（quiz.html / gacha.html / profile.html）
- [ ] 把 Ajax fetch 接上 Django API
- [ ] Cookie 存使用者名稱
- [ ] profile.html：完整卡冊 + 答題統計
- [ ] Bootstrap 排版（profile 頁）
- [ ] 盲盒換成實際偶像圖片

---

## 注意事項

- Demo 環境：`python manage.py runserver` 跑在本機 8000 port，前端直接開 html 檔
- 不用部署，本機跑就好
- 不用 React/Vue，純原生 JS + DOM 操作
- 虛擬環境不要 commit（加進 .gitignore）
- `db.sqlite3` 可以 commit，裡面有測試資料
