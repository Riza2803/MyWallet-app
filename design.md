# Design Specification: Warm Modern FinTech & Expense Tracker

Dokumen ini mendefinisikan sistem desain, token gaya visual, prinsip antarmuka, serta spesifikasi komponen UI yang diabstraksi langsung dari referensi visual antarmuka mobile finansial (Home, Expenses, dan Reports).

---

## 1. Visual Identity & Moodboard

* **Arah Desain:** *Warm Organic Neomorphism / Soft Modernist FinTech*.
* **Karakter Visual:** Ramah, bersih, modern, approachable, dan bebas dari intimidasi spreadsheet angka perbankan konvensional.
* **Ciri Khas Visual:**
  * Latar belakang bernuansa *off-white/cream/warm alabaster* dengan gradasi blur hangat (*sun-kissed aura*).
  * Kartu utama (*primary card*) berwarna kuning cerah (*vibrant warm yellow*) dengan tekstur topografi/garis abstrak halus.
  * *Pill tabs* dan kartu statistik menggunakan palet pastel lembut (*soft blush red*, *gentle lavender purple*, *fresh mint*).
  * Radius sudut serba bulat (*rounded-pill & super-ellipse/squircle*).
  * Ikon sirkular terisolasi dengan kontras warna pastel (*tinted pill containers*).

---

## 2. Design Tokens

### 2.1 Color Palette

#### Primary & Signature Accents
| Token Name | Hex Code | Deskripsi & Penggunaan |
| :--- | :--- | :--- |
| `color-primary-yellow` | `#F9D938` | Warna dominan kartu saldo utama, aksen aktif, dan segmen donut chart. |
| `color-primary-yellow-light`| `#FDF6D6` | State hover/light tint untuk tombol atau indikator list item. |
| `color-primary-yellow-dark` | `#E1BD14` | Border halus, text accent, atau outline active state. |

#### Semantic & Card Accents (Soft Pastel Category)
| Token Name | Hex Code | Background Tint | Penggunaan |
| :--- | :--- | :--- | :--- |
| `color-expense-coral` | `#E84D60` | `#FCEBE9` | Expenses card, minus value, kategori shopping/lainnya. |
| `color-income-lavender`| `#7B73F6` | `#EFEBFE` | Income card, plus value, kategori beauty/bar chart. |
| `color-pet-mint` | `#2EC4B6` | `#E6F7F5` | Kategori pet / entertainment, segmen teal chart. |
| `color-cyan-glow` | `#1AC8DB` | `#E3F8FB` | Ring chart cyan segment. |
| `color-pink-rose` | `#F24379` | `#FDE7EE` | Ring chart rose accent. |

#### Neutrals & Surfaces
| Token Name | Hex Code | Penggunaan |
| :--- | :--- | :--- |
| `color-bg-canvas` | `#F6F5EE` | Background dasar aplikasi (hangat, bukan putih murni `#FFF`). |
| `color-surface-card` | `#FFFFFF` | Latar belakang modul kartu (kontras di atas canvas hangat). |
| `color-surface-subtle`| `#F3F3ED` | Background toggle tab tidak aktif, search badge, button utility. |
| `color-text-main` | `#1A1A1A` | Judul, angka nominal saldo utama, heading section. |
| `color-text-body` | `#4B4B4B` | Label kategori, subtitle aktif. |
| `color-text-muted` | `#949492` | Sub-teks (misal: "Expire date", timestamp "5 Aug 2025"). |
| `color-border-subtle` | `#EAE9E2` | Divider tipis atau batas container chart. |

---

### 2.2 Typography

* **Font Family Utama:** Sans-serif modern berkarakter geometri humanist (contoh: `Plus Jakarta Sans`, `Inter`, atau `SF Pro Rounded`).

| Skala Tipografi | Weight | Size (Mobile) | Line Height | Tracking | Penggunaan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Hero** | Bold (700) | `26px - 28px` | `1.2` | `-0.02em` | Nominal saldo utama (`$7,7652504.000`). |
| **Headline / Chart**| Bold (700) | `22px` | `1.25` | `-0.01em` | Angka sentral chart (`622.00`). |
| **Title / Card** | SemiBold (600)| `17px - 18px` | `1.3` | `-0.01em` | Header bagian ("Expenses", "Recent transaction"). |
| **Stat Label** | Medium (500) | `15px` | `1.4` | `normal` | Label transaksi ("Investments", "Gift"). |
| **Body** | Regular (400)| `13px - 14px` | `1.4` | `normal` | Sub-teks kartu, breakdown kategori persentase. |
| **Caption / Badge** | Medium (500) | `11px - 12px` | `1.3` | `+0.01em` | Metadata tanggal, label "Expire date", toggle switch. |

---

### 2.3 Spacing, Borders & Shadows

* **Base Spacing Unit:** `4px` / `8px`
* **Screen Padding:** Horizontal `20px`, Vertical `16px`.
* **Border Radii:**
  * `radius-pill`: `9999px` (Tombol switch, search button circular, tag selector).
  * `radius-card`: `24px` (Kartu utama, kartu statistik, container recent transactions).
  * `radius-card-sm`: `16px` (Item transaksi list, sub-card expenses/income).
  * `radius-icon`: `50%` / sirkular sempurna.
* **Elevation & Box Shadow:**
  * *Soft Ambient Shadow:* `0px 8px 24px rgba(0, 0, 0, 0.04)` (digunakan pada kartu putih agar terangkat lembut dari background `#F6F5EE`).
  * *Floating Action / Header Icon:* `0px 4px 12px rgba(0, 0, 0, 0.03)`.
  * *Active Toggle Tab:* `0px 2px 8px rgba(249, 217, 56, 0.35)` (pada pill kuning aktif).

---

## 3. Komponen Utama & Pola Antarmuka (UI Components)

### 3.1 Navigation & App Bar
* **Top Header Row:**
  * Sisi kiri: Foto profil bundar pengguna (`38px x 38px`) berdampingan dengan greeting ("Welcome back" - 11px muted; "Jhon adrina" - 14px bold).
  * Sisi kanan: Tombol aksi sirkular putih (`40px x 40px`, ikon *Bell/Notification* dan *Hamburger/Menu*).
  * Pada layar sub-halaman ("Expenses", "Reports"): Ikon *Arrow Back* di kiri, judul halaman di tengah, dan ikon burger di kanan.

### 3.2 Primary Yellow Balance Card
* **Latar Belakang:** `#F9D938` dengan watermark garis abstrak topografi atau gelombang transparan.
* **Layout:**
  * Header kartu: Teks "Your balance" kecil berdampingan dengan chip dropdown periode (contoh: "Year ⌵" berlatar translucent putih).
  * Angka saldo: Diformat besar dan tebal (`26px+`).
  * Footer kartu: Grid 2 kolom berisi data akun ("Account number" + masking `**** **** 1160`) dan tanggal ("Expire date" + `10/8/2030`).
* **Radius:** `26px`.

### 3.3 Quick Stats Duo (Expenses vs Income)
* Ditempatkan berdampingan secara horizontal (grid 50-50).
* **Expenses Card:**
  * Background: `#FCEBE9` (merah muda pastel).
  * Ikon: Dompet / kuitansi merah muda dalam lingkaran putih.
  * Teks: "Expenses" di atas, nilai negatif di bawah (misal: `-$622.00`).
* **Income Card:**
  * Background: `#EFEBFE` (lavender pastel).
  * Ikon: Kunci / panah ungu dalam lingkaran putih.
  * Teks: "Income" di atas, nilai positif di bawah (misal: `+$5500.00`).

### 3.4 Segmented Control / Time Filters
* Container berbentuk kapsul (*pill*) abu-abu sangat muda `#F1F1EB` berisi item: `Month` vs `Year`.
* State aktif: Kapsul berwarna kuning menyala `#F9D938` dengan teks hitam tegas.
* State tidak aktif: Teks abu-abu netral `#7A7A77`, background transparan.

### 3.5 Circular Gauge / Multi-Segment Donut Chart
* Digunakan pada layar detail pengeluaran (*Spending top*).
* Segmen melingkar tebal dengan ujung membulat (*rounded stroke cap*):
  * Merah muda, Toska muda, Kuning primer, Ungu lavender.
* Area tengah (*donut hole*):
  * Angka total tebal (misal: `622.00`).
  * Keterangan subtitle di bawahnya: "Total expenses" (muted `12px`).
* Breakdown list di bawah chart:
  * Radio bullet warna indikator + Nama Kategori + Persentase di sisi kanan.

### 3.6 Stacked / Floating Rounded Bar Chart (Reports)
* Karakter bar unik: Bukan batangan persegi kaku biasa, melainkan susunan **kapsul membulat independen (*segmented rounded pill bars*)** bertingkat untuk masing-masing sumbu hari (`Sun` s/d `Sat`).
* Tiga warna tingkatan:
  * Kuning: Expense
  * Ungu: Income
  * Biru muda / muted: Balance
* Sumbu horizontal: Hari dalam seminggu dengan teks abu-abu lembut.

### 3.7 Transaction List Item
* Terletak di dalam kartu kontainer putih atau flat list bersih.
* **Item Slot:**
  * Sisi kiri: Lingkaran ikon pastel (`44px`) dengan warna background sesuai kategori (kuning untuk Investment, ungu untuk Gift, hijau untuk Pet, peach untuk Shopping).
  * Kolom tengah: Nama transaksi (`15px` SemiBold) + Stempel waktu (`12px` Regular muted).
  * Sisi kanan: Nilai transaksi (Bold `14px`), warna merah gelap/merah muda untuk pengeluaran (`-100.00`), dan hitam/hijau untuk pemasukan (`500.00`).

---

## 4. Layout & Wireframe Structure

```
+-----------------------------------+
|  [Avatar] Welcome back    [🔔] [☰]|
|           Jhon adrina             |
|                                   |
|  +-----------------------------+  |
|  | Your balance       [Year ⌵] |  |
|  | $7,765,2504.000             |  |
|  |                             |  |
|  | Acc number      Expire date |  |
|  | **** **** 1160    10/8/2030 |  |
|  +-----------------------------+  |
|                                   |
|  [ Expenses   ]  [ Income     ]   |
|  [ -$622.00   ]  [ +$5500.00  ]   |
|                                   |
|  Recent transaction         [🔍]  |
|  +-----------------------------+  |
|  | (🟡) Investments     500.00 |  |
|  | (🟣) Gift           -100.00 |  |
|  | (🟢) Pet            -200.00 |  |
|  | (🟠) Shopping       -236.00 |  |
|  +-----------------------------+  |
+-----------------------------------+
```

---

## 5. Pedoman Implementasi Frontend (CSS / Tailwind Tokens)

Jika mengonversi ke Tailwind CSS:

```js
// tailwind.config.js snippet
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '#F6F5EE',
        brand: {
          yellow: '#F9D938',
          'yellow-light': '#FDF6D6',
        },
        badge: {
          coral: '#FCEBE9',
          coralText: '#E84D60',
          lavender: '#EFEBFE',
          lavenderText: '#7B73F6',
          mint: '#E6F7F5',
          mintText: '#2EC4B6',
        }
      },
      borderRadius: {
        'card': '24px',
        'card-sm': '16px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft-card': '0 8px 24px -4px rgba(0, 0, 0, 0.04)',
      }
    }
  }
}
```