# 📸 PhotoBooth — Fotokabin Sistemi

> **TR** | Dokunmatik ekran kiosk için tam otomatik fotoğraf kabini yazılımı.  
> **EN** | Fully automated photo booth software for touch-screen kiosk setups.

---

## 🇹🇷 Türkçe

### Proje Hakkında

Canon EOS 600D DSLR kamera ile çalışan, React tabanlı bir fotoğraf kabini sistemidir. digiCamControl CLI üzerinden kamera kontrolü sağlar; WebSocket ile canlı önizleme (LiveView) sunar ve DS620 termal yazıcıya otomatik baskı gönderir.

### Özellikler

- 🎞️ 3 veya 4 fotoğraflı çekim seçeneği
- 📡 WebSocket üzerinden gerçek zamanlı LiveView (Canon EOS 600D)
- ⏱️ Geri sayımlı otomatik çekim (3-2-1)
- 🖼️ Onlarca çerçeve/tema şablonu (Şablon üzerine fotoğraf otomatik yerleşimi)
- 🖨️ DS620 termal yazıcıya otomatik baskı (SumatraPDF + PDF pipeline)
- 📧 Gmail ile e-posta gönderimi
- 📱 QR kod ile fotoğraf indirme
- 🔁 State Machine: IDLE → LIVEVIEW → CAPTURING → PROCESSING → ERROR
- 🧵 Queue sistemi: Çakışmasız FIFO kamera ve baskı kuyruğu
- 🗑️ 7 günlük otomatik fotoğraf temizleme
- ⚖️ KVKK uyumlu aydınlatma metni

### Sistem Mimarisi

```
[ React Kiosk UI ]
      ↓ (HTTP + WebSocket)
[ Node.js API Server ]
      ↓
[ Orchestrator Layer ]
   ├── Queue Manager      → captureQueue / printQueue / systemQueue
   ├── State Machine      → IDLE / LIVEVIEW / CAPTURING / PROCESSING / ERROR
   ├── Camera Controller  → TEK giriş noktası (Single Entry Point)
   └── LiveView Loop      → 350ms bağımsız döngü
      ↓
[ digiCamControl CLI (CameraControlCmd.exe) ]
      ↓
[ Canon EOS 600D (USB) ]

[ Print Controller ]
      ↓
[ DS620 Printer System ]
```

### Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | React 18 |
| Backend | Node.js + Express |
| Gerçek Zamanlı | WebSocket (ws) |
| Kamera | digiCamControl CLI |
| Baskı | SumatraPDF + pdf-to-printer |
| Görsel İşleme | Sharp + PDFKit |
| E-posta | Nodemailer (Gmail) |

### Kurulum

#### Gereksinimler

- Windows 10/11 (Yönetici yetkisi ile çalıştırılmalı)
- Node.js 18+
- [digiCamControl](http://digicamcontrol.com/) kurulu olmalı
- Canon EOS 600D USB ile bağlı olmalı
- DS620 yazıcı kurulu olmalı (opsiyonel)

#### Adımlar

```bash
# Repoyu klonla
git clone https://github.com/ebrarcetinkaya/photobooth.git
cd photobooth

# Backend bağımlılıklarını yükle
cd fotokabin-backend
npm install

# Frontend bağımlılıklarını yükle
cd ../fotokabin-projesi
npm install
```

#### .env Dosyası (fotokabin-backend/.env)

```env
PORT=3001
HOST_IP=localhost

# E-posta (Gmail App Password)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password

# Yazıcı
PRINTER_NAME=DP-DS620
PRINTER_PAPER_SIZE=(6x4)
PRINT_USE_SUMATRA=true
PREVENT_PARALLEL_PRINT=true
PRINT_DUPLICATE_WINDOW_MS=10000
```

#### Çalıştırma

```bash
# Backend (Yönetici olarak çalıştır!)
cd fotokabin-backend
node server.js

# Frontend
cd fotokabin-projesi
npm start
```

---

## 🇬🇧 English

### About

A Canon EOS 600D DSLR-powered photo booth system built with React. Camera control is handled via digiCamControl CLI, LiveView is streamed over WebSocket, and prints are sent automatically to a DS620 thermal printer.

### Features

- 🎞️ 3 or 4-photo session modes
- 📡 Real-time LiveView over WebSocket (Canon EOS 600D)
- ⏱️ Auto-capture with countdown (3-2-1)
- 🖼️ Dozens of frame/theme templates with automatic photo slot detection
- 🖨️ Auto print to DS620 thermal printer (SumatraPDF + PDF pipeline)
- 📧 Email delivery via Gmail
- 📱 QR code photo download
- 🔁 State Machine: IDLE → LIVEVIEW → CAPTURING → PROCESSING → ERROR
- 🧵 Queue system: Collision-free FIFO camera and print queues
- 🗑️ 7-day automatic photo cleanup
- ⚖️ GDPR/KVKK compliant consent screen

### Architecture

```
[ React Kiosk UI ]
      ↓ (HTTP + WebSocket)
[ Node.js API Server ]
      ↓
[ Orchestrator Layer ]
   ├── Queue Manager      → captureQueue / printQueue / systemQueue
   ├── State Machine      → IDLE / LIVEVIEW / CAPTURING / PROCESSING / ERROR
   ├── Camera Controller  → Single Entry Point
   └── LiveView Loop      → Independent 350ms loop
      ↓
[ digiCamControl CLI (CameraControlCmd.exe) ]
      ↓
[ Canon EOS 600D (USB) ]

[ Print Controller ]
      ↓
[ DS620 Printer System ]
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Backend | Node.js + Express |
| Real-time | WebSocket (ws) |
| Camera | digiCamControl CLI |
| Printing | SumatraPDF + pdf-to-printer |
| Image Processing | Sharp + PDFKit |
| Email | Nodemailer (Gmail) |

### Setup

#### Requirements

- Windows 10/11 (must run as Administrator)
- Node.js 18+
- [digiCamControl](http://digicamcontrol.com/) installed
- Canon EOS 600D connected via USB
- DS620 printer installed (optional)

#### Steps

```bash
# Clone the repo
git clone https://github.com/ebrarcetinkaya/photobooth.git
cd photobooth

# Install backend dependencies
cd fotokabin-backend
npm install

# Install frontend dependencies
cd ../fotokabin-projesi
npm install
```

#### .env File (fotokabin-backend/.env)

```env
PORT=3001
HOST_IP=localhost

# Email (Gmail App Password)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password

# Printer
PRINTER_NAME=DP-DS620
PRINTER_PAPER_SIZE=(6x4)
PRINT_USE_SUMATRA=true
PREVENT_PARALLEL_PRINT=true
PRINT_DUPLICATE_WINDOW_MS=10000
```

#### Running

```bash
# Backend (run as Administrator!)
cd fotokabin-backend
node server.js

# Frontend
cd fotokabin-projesi
npm start
```

---

## 📁 Project Structure

```
photobooth/
├── fotokabin-backend/
│   ├── server.js           # HTTP + WebSocket server
│   ├── stateMachine.js     # Camera state management
│   ├── queueManager.js     # FIFO queue system
│   ├── cameraController.js # Single camera entry point
│   ├── liveViewLoop.js     # Independent LiveView loop
│   ├── printService.js     # Print pipeline (Sharp + PDF)
│   ├── SumatraPDF.exe      # PDF printer
│   └── .env
└── fotokabin-projesi/
    └── src/
        ├── PhotoBooth.js   # Main app + all screens
        ├── AdminPanel.js   # Admin panel
        └── PhotoBooth.css  # Styles
```

---

## ⚠️ Kritik Kurallar / Critical Rules

> **TR:** Kamera ile iletişim SADECE `CameraController` üzerinden yapılır. Hiçbir route veya React bileşeni direkt `exec` çağırmaz.  
> **EN:** All camera communication goes EXCLUSIVELY through `CameraController`. No route or React component calls `exec` directly.

---
