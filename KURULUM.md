# volkanozturk.dev — Kurulum Rehberi

## 1. Gereksinimler
- Node.js 18+
- Bun (opsiyonel, npm de çalışır)
- Contentful hesabı (ücretsiz)
- Cloudflare hesabı

---

## 2. Projeyi Başlat

```bash
cd volkan-dev
npm install   # veya: bun install
```

---

## 3. Contentful Kurulumu

### 3.1 Space Oluştur
1. [contentful.com](https://contentful.com) → **Create space** → Free plan yeterli
2. Space adı: `volkan-dev` (istediğin isim)

### 3.2 API Anahtarları Al
1. **Settings → API Keys → Add API Key**
2. `Space ID` ve `Content Delivery API - access token` değerlerini kopyala

### 3.3 `.env.local` Dosyası Oluştur
```bash
cp .env.example .env.local
```
Değerleri doldur:
```
CONTENTFUL_SPACE_ID=xxxxxxxxxxxx
CONTENTFUL_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxx
```

### 3.4 Content Type'ları Oluştur

Contentful Dashboard → **Content model** sekmesinde şu 3 content type'ı oluştur:

#### `blogPost`
| Alan Adı | Field ID | Tip |
|----------|----------|-----|
| Başlık | `title` | Short text |
| Slug | `slug` | Short text (unique) |
| Özet | `excerpt` | Short text |
| İçerik | `content` | Rich text |
| Yayın Tarihi | `publishedDate` | Date & time |
| Etiketler | `tags` | Short text, list |
| Kapak Görseli | `coverImage` | Media |

#### `journeyEntry`
| Alan Adı | Field ID | Tip |
|----------|----------|-----|
| Şirket/Okul | `company` | Short text |
| Rol/Derece | `role` | Short text |
| Başlangıç | `startDate` | Date & time |
| Bitiş | `endDate` | Date & time |
| Açıklama | `description` | Long text |
| Tür | `type` | Short text (validation: `work` veya `education`) |
| Konum | `location` | Short text |
| URL | `url` | Short text |

#### `bookmark`
| Alan Adı | Field ID | Tip |
|----------|----------|-----|
| Başlık | `title` | Short text |
| URL | `url` | Short text |
| Açıklama | `description` | Short text |
| Koleksiyon | `collection` | Short text |
| Etiketler | `tags` | Short text, list |

---

## 4. Geliştirme Ortamı

```bash
npm run dev
```
→ http://localhost:3000 adresinde açılır

---

## 5. Cloudflare Pages'e Deploy

### 5.1 GitHub'a Push Et
```bash
git init
git add .
git commit -m "ilk commit"
git remote add origin https://github.com/volkanozturk/volkanozturk.dev.git
git push -u origin main
```

### 5.2 Cloudflare Pages Bağla
1. [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project**
2. GitHub repoyu seç
3. Build ayarları:
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`

### 5.3 Environment Variables Ekle
Cloudflare Pages → Settings → Environment Variables:
```
CONTENTFUL_SPACE_ID = xxxxxxxxxxxx
CONTENTFUL_ACCESS_TOKEN = xxxxxxxxxxxxxxxxxxxx
```

### 5.4 Deploy Et
Her `git push` sonrası Cloudflare otomatik build alır.

---

## 6. Contentful Webhook (Opsiyonel)

Contentful'da içerik güncellediğinde Cloudflare'i otomatik tetiklemek için:
1. Cloudflare Pages → Settings → Build & deploy → **Deploy Hooks** → Hook URL kopyala
2. Contentful → Settings → Webhooks → Add Webhook → URL'yi yapıştır

Artık Contentful'da bir yazı yayınladığında site otomatik yeniden build alır!

---

## 7. Diller (i18n)

Site `next-intl` ile üç dilde yayınlanır: **en** (varsayılan), **tr**, **nl**.

- Çeviri dosyaları: `messages/en.json`, `messages/tr.json`, `messages/nl.json`
- Dil listesi ve varsayılan dil: `i18n.ts`
- Tüm sayfalar `app/[locale]/...` altında; her dinamik route `generateStaticParams()`
  ile bütün dilleri build zamanında üretir.

### Yeni metin eklemek
1. Anahtarı **üç dosyaya birden** ekle (eksik anahtar build'de görünmez, çalışma
   anında hata verir).
2. Bileşende `useTranslations()` (senkron) veya `getTranslations()` (async server
   component) ile kullan. Arayüzde sabit metin bırakma.

### Yeni dil eklemek
1. `messages/<kod>.json` dosyasını oluştur.
2. `i18n.ts` içindeki `locales` dizisine ve `localeDetails` haritasına ekle.
3. `public/index.html` içindeki `supported` dizisine ekle.

### Statik export notu
`output: 'export'` ile Next.js middleware çalışmaz. Bu yüzden `middleware.ts`
yalnızca sunucu tarafı bir deploy'da devreye girer; statik sitede `/` adresini
`public/index.html` karşılar ve tarayıcı dilini okuyup `/en/`, `/tr/` veya `/nl/`
adresine yönlendirir (JavaScript kapalıysa meta refresh ile `/en/`).

---

## 8. Kişiselleştirme

Değiştirmen gereken yerler:
- `messages/*.json` → biyografi, açıklamalar, tüm arayüz metinleri
- `app/[locale]/layout.tsx` → site URL'i, Twitter handle
- `components/navigation.tsx` → site adı (`volkanozturk.dev`)
- `components/footer.tsx` → social link URL'leri
- `app/[locale]/page.tsx` → social link URL'leri
