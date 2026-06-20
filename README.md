# StarWords ✦ 背單字抽小卡

> 學英文單字 × 收集韓國偶像小卡的闖關式互動網頁應用

長庚大學 網頁程式設計課程 Spring 2026｜期末專題

---

## 專題簡介

**StarWords** 是一個結合英文單字學習與偶像卡牌收集的互動網站。

使用者透過回答中英文單字題目來累積「星點」，再用星點進行扭蛋抽卡，收集 BTS、TWICE、TXT、BLACKPINK、IU 等 K-pop 偶像的限定小卡。

學習有了動力，收藏有了目標。

---

## 功能介紹

| 功能 | 說明 |
|------|------|
| 📚 **背單字** | 從中文題目輸入英文單字，可使用首字母提示；答對得 2 點，用提示後答對得 1 點 |
| 📖 **單字本** | 瀏覽所有單字與詞性，方便課外複習 |
| 🎁 **抽卡包** | 花費 10 星點抽取 3 張偶像小卡，附帶抽卡動畫與音效演出 |
| 🎴 **我的卡冊** | 查看已收集的卡片、答題統計與收集進度 |
| 🔢 **連擊系統** | 連續答對可觸發 Combo 加成，額外獲得星點獎勵 |

### 抽卡機率

| 稀有度 | 機率 |
|--------|------|
| SSR | 5% |
| SR | 15% |
| R | 35% |
| N | 45% |

### 偶像卡片（共 30 張）

- **BTS** — Jungkook、V、Suga、J-Hope、RM、Jimin、Jin
- **TWICE** — Nayeon、Jihyo、Momo、Sana、Jeongyeon、Dahyun、Chaeyoung、Mina、Tzuyu
- **TXT** — Yeonjun、Soobin、Beomgyu、Taehyun、Huening Kai
- **BLACKPINK** — JENNIE、LISA、JISOO、ROSÉ
- **IU** — Celebrity、Palette、Through the Night、BBIBBI、Twenty-Three

---

## 技術架構

```
starwords/
├── api/                  # Django REST API 後端
│   ├── models.py         # Word、Card、UserRecord 資料模型
│   ├── views.py          # API 邏輯（答題、抽卡、使用者）
│   ├── serializers.py    # DRF 序列化
│   └── urls.py           # API 路由
├── starwords/            # Django 專案設定
├── react_frontend/       # React 前端
│   └── src/
│       ├── pages/        # IndexPage、QuizPage、GachaPage、ProfilePage、VocabPage
│       ├── components/   # Nav、Toast、PhotoCarousel
│       └── utils/        # 狀態管理、Cookie 工具
└── manage.py
```

### 使用技術

**後端**
- Python / Django
- Django REST Framework
- SQLite

**前端**
- React 19
- React Router v7
- 純 CSS（無 UI 框架）

---

## API 端點

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/words/` | 取得所有單字 |
| GET | `/api/cards/` | 取得所有卡片 |
| GET | `/api/user/<username>/` | 取得（或自動建立）使用者 |
| POST | `/api/user/<username>/answer/` | 提交答題結果 |
| POST | `/api/user/<username>/gacha/` | 執行抽卡（消耗 10 點）|

---

## 本地啟動

### 前置需求

- Python 3.10+
- Node.js 18+

### 後端

```bash
# 建立虛擬環境（選用）
python -m venv .venv
source .venv/bin/activate

# 安裝套件
pip install django djangorestframework

# 套用資料庫
python manage.py migrate

# 啟動後端（port 8000）
python manage.py runserver
```

### 前端

```bash
cd react_frontend
npm install
npm start   # 開發伺服器：localhost:3000
```

> 前端預設將 API 請求代理到 `localhost:8000`，兩個伺服器需同時運行。
