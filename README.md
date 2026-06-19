# 🌐 DataSphere - Enterprise BI & Security Simulation

[English Version Below](#english-version) | [Versi Bahasa Indonesia di Bawah](#bahasa-indonesia)

---

## <a name="english-version"></a>🇬🇧 English Version

DataSphere is a premium, interactive Enterprise Business Intelligence (BI) dashboard and cybersecurity simulation playground. It showcases real-time mock data synchronization across open tabs, custom canvasless vector charting, granular Role-Based Access Control (RBAC), and interactive web exploit vulnerability mitigation triggers.

### 📚 Detailed Documentation
For a complete deep-dive into the architecture, context state model, and security payloads, please refer to the dedicated English documentation file:
👉 **[Read the Full English Documentation](file:///F:/MyCodings/FullStack/DataSphere/docs/documentation_en.md)**

### 🚀 Key Features Overview
1. **Real-Time Cross-Tab Sync**: Automatically mirrors database modifications across open browser tabs using the browser's `BroadcastChannel` API with simulated network latency.
2. **Custom SVG Vector Charting**: A canvasless interactive graphing system rendering Area, Line, and Bar layouts with responsive resize observers and mouse-tracking tooltips.
3. **Role-Based Access Control (RBAC)**: Enforces security contexts (`admin`, `manager`, `viewer`) at the database layer, blocking illegal actions with an animated "Access Violation" terminal overlay.
4. **Interactive Security Sandbox**: Real-time exploit simulation triggers and firewall shields for **XSS**, **SQL Injection**, **CSRF**, and **Rate Limiting**.

### 🛠️ Quick Start Guide
```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Build for production
npm run build
```

---

## <a name="bahasa-indonesia"></a>🇮🇩 Versi Bahasa Indonesia

DataSphere adalah dasbor *Enterprise Business Intelligence (BI)* interaktif premium dan sarana simulasi keamanan siber. Aplikasi ini menampilkan sinkronisasi data *real-time* multi-tab, visualisasi grafik vektor SVG buatan sendiri (*canvasless charting*), Kontrol Akses Berbasis Peran (*Role-Based Access Control* / RBAC), serta modul simulasi kerentanan keamanan web secara langsung.

### 📚 Dokumentasi Lengkap
Untuk panduan mendalam mengenai desain arsitektur, pengolahan *state* konteks global, dan rincian teknis muatan serangan (*exploit payloads*), silakan baca file dokumentasi bahasa Indonesia:
👉 **[Baca Dokumentasi Lengkap Bahasa Indonesia](file:///F:/MyCodings/FullStack/DataSphere/docs/documentation_id.md)**

### 🚀 Ikhtisar Fitur Utama
1. **Sinkronisasi Lintas Tab Real-Time**: Menyinkronkan perubahan database secara otomatis di antara semua jendela tab peramban yang aktif menggunakan API `BroadcastChannel` disertai simulasi latensi jaringan.
2. **Grafik Vektor SVG Kustom**: Visualisasi grafik interaktif responsif tipe Area, Garis (Line), dan Batang (Bar) yang menyesuaikan ukuran wadah piksel secara dinamis dan melacak kursor secara real-time.
3. **Kontrol Akses Berbasis Peran (RBAC)**: Menegakkan izin akses (`admin`, `manager`, `viewer`) pada tingkat manipulasi data dan memblokir aksi ilegal dengan layar peringatan "Access Violation".
4. **Pusat Simulasi Keamanan**: Pemicu simulasi serangan siber langsung serta pengaktifan pelindung firewall terhadap celah keamanan **XSS**, **Injeksi SQL**, **CSRF**, dan **Rate Limiting (Pembatasan Laju)**.

### 🛠️ Panduan Memulai Cepat
```bash
# Pasang dependensi
npm install

# Jalankan server pengembangan lokal
npm run dev

# Kompilasi untuk mode produksi
npm run build
```
