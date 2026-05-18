# 🌌 ANTIGRAVITY — DEEP UI/UX AUDIT SYSTEM
**Target**: Klolakelas Platform (Next.js App Router, Tailwind CSS, Supabase)
**Tech Stack**: React, TypeScript, Tailwind CSS, Lucide Icons
**Auditor**: Antigravity AI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🗺️ FASE 0: INVENTARISASI & PEMETAAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**STEP 1 — Daftar Halaman**

| Nama Halaman | Role | Ada? | Catatan Awal |
| :--- | :--- | :--- | :--- |
| Dashboard / Beranda | Guru | ✅ | `DashboardTab.tsx` — Ada Bento grid, list siswa, & leaderboard. |
| Pembelajaran (Materi & Tugas) | Guru | ✅ | `PembelajaranTab.tsx` — Sub-navigasi untuk Materi & Penugasan. |
| Penilaian & Pipeline | Guru | ✅ | `PipelineView.tsx` — Kanban style untuk tracking tugas. |
| Laporan & Analitik | Guru | ✅ | `AnalyticsDashboard.tsx` — Class Insights, Grade Distribution. |
| Presensi / Absensi | Guru | ✅ | Modul absensi harian. |
| Profil / Portfolio | Guru | ✅ | `PortfolioTab.tsx` — Profil guru. |
| Manajemen Kelas (Khusus) | Guru | ❌ | Tidak ada halaman khusus, pindah kelas via Topbar Dropdown. |
| Jadwal Mengajar | Guru | ❌ | Belum ada UI kalender/jadwal spesifik. |
| ------------------------|--------|------|----------------|
| Platform Overview | Admin | ✅ | `AdminOverview.tsx` — Global stats & metrics. |
| Manajemen Sekolah | Admin | ✅ | `SchoolManagement.tsx` — Manajemen tenant sekolah & kode. |
| Manajemen User | Admin | ✅ | `UserManagement.tsx` — Kontrol role & status user. |
| Health Radar | Admin | ✅ | `SchoolHealthRadar.tsx` — Indikator performa sekolah. |
| Monitoring Aktivitas | Admin | ✅ | `PlatformMonitoring.tsx` — Platform-wide metrics. |
| Audit Timeline | Admin | ✅ | `AuditTimeline.tsx` — Riwayat aksi sistem (Security focus). |
| Kebijakan Global | Admin | ✅ | `PolicySettings.tsx` — System settings. |

**STEP 2 — Role Design Differentiation Check**
- **Guru**: Menggunakan aksen **Indigo/Purple**. Layout bersifat *comfortable* dengan *glass-panel* membulat (radius `2rem` - `2.5rem`), list siswa menggunakan avatar, memberikan kesan *approachable*.
- **Admin**: Menggunakan aksen **Rose/Slate**. Layout lebih padat (*compact*). Adanya fitur **Command Palette (⌘K)** dan sidebar **Inspector** langsung memberikan kesan teknikal, efisien, dan *powerful* layaknya Vercel atau Stripe Dashboard.
- **Verdict 3 Detik**: PASS ✅ (Sangat mudah dibedakan antara Guru dan Admin berkat aksen warna dan tata letak `Inspector` vs `Leaderboard`).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔬 FASE 1: AUDIT PER HALAMAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔═══════════════════════════════════════════════════════════════════════╗
║  📄 DASHBOARD (BERANDA) — ROLE: GURU                                 ║
╠═══════════════════════════════════════════════════════════════════════╣
║  SKOR HALAMAN: 85/100                                                 ║
║  Status: 🟡 Cukup Baik (Perlu Polish Sedikit)                         ║
╠═══════════════════════════════════════════════════════════════════════╣
║  [A] 🎯 TUJUAN & RELEVANSI                                            ║
╠═══════════════════════════════════════════════════════════════════════╣
║  □ Tujuan utama: Memberikan guru *bird's-eye view* atas keaktifan     ║
║    kelas dan tugas tertunda yang butuh perhatian hari ini.            ║
║  □ Layout mendukung tujuan, dengan *Work Queue* di bagian atas kiri.  ║
║  □ Info paling kritis: "Apa yang harus dinilai hari ini?" (Work Queue)║
║  BENCHMARK: Google Classroom menggunakan "To Review" widget yang      ║
║  sangat menonjol. Di sini `WorkQueue` sudah ada, tapi desainnya       ║
║  bisa dibuat lebih mencolok daripada tabel siswa.                     ║
╠═══════════════════════════════════════════════════════════════════════╣
║  [B] 🏗️ LAYOUT & VISUAL HIERARCHY                                     ║
╠═══════════════════════════════════════════════════════════════════════╣
║  □ Focal Point: Saat ini mata cenderung tertuju pada tabel "Perkem-   ║
║    bangan Siswa" karena ukurannya yang masif.                         ║
║  □ Grid: Menggunakan grid 12 kolom (8 kiri, 4 kanan). Proporsinya     ║
║    sudah sangat standar B2B (mirip struktur Stripe/Linear).           ║
║  □ Whitespace: Penggunaan *glass-panel* dengan padding `p-8`          ║
║    memberikan ruang lega, menghindari kesan *overwhelming*.           ║
╠═══════════════════════════════════════════════════════════════════════╣
║  [C] 🖥️ UI QUALITY — PIXEL-LEVEL INSPECTION                           ║
╠═══════════════════════════════════════════════════════════════════════╣
║  □ Typography: Hierarki jelas (`text-xl font-black` untuk judul card).║
║    Teks meta menggunakan `uppercase tracking-widest` yang memberi     ║
║    kesan premium.                                                     ║
║  □ Color: Penggunaan `bg-emerald-500/10 text-emerald-400` untuk status║
║    TUNTAS sudah tepat secara semantik.                                ║
║  □ States:                                                            ║
║    Hover: ✅ (Baris tabel memudar dan mengganti BG saat di-hover)     ║
║    Empty: ✅ (Pencarian Nihil state sudah ada dan sangat detail)      ║
╠═══════════════════════════════════════════════════════════════════════╣
║  [E] 🌊 WORKFLOW SIMULATION                                           ║
╠═══════════════════════════════════════════════════════════════════════╣
║  TUGAS 1: "Cari progres siswa bernama Budi"                           ║
║  Step 1: Klik input search (auto-focus belum ada).                    ║
║  Step 2: Ketik "Budi" → list langsung terfilter.                      ║
║  Step 3: Klik *ChevronRight* di baris Budi untuk ke profil.           ║
║  Total klik: 2 | Estimasi: 4 detik.                                   ║
║  Friction: Input search tidak otomatis aktif via shortcut.            ║
║  Rekomendasi: Tambahkan keyboard shortcut (misal: `/` untuk fokus     ║
║  ke pencarian siswa).                                                 ║
╠═══════════════════════════════════════════════════════════════════════╣
║  📋 TEMUAN HALAMAN INI                                                ║
╠═══════════════════════════════════════════════════════════════════════╣
║  🟡 MINOR — Search Shortcut                                           ║
║  Input pencarian siswa bisa jauh lebih efisien dengan shortcut `/`.   ║
║  FIX: Tambahkan event listener pada global window untuk menangkap `/` ║
║  dan melakukan `inputRef.current?.focus()`.                           ║
║                                                                       ║
║  ✅ YANG SUDAH BAGUS: Empty state pencarian siswa ("Pencarian Nihil") ║
║  sangat rapi dengan ikon *opacity* rendah.                            ║
╚═══════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════╗
║  📄 PEMBELAJARAN (MATERI & TUGAS) — ROLE: GURU                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║  SKOR HALAMAN: 75/100                                                 ║
║  Status: 🟠 Perlu Perbaikan (Sistem Tab/Sub-navigasi)                 ║
╠═══════════════════════════════════════════════════════════════════════╣
║  [A] 🎯 TUJUAN & RELEVANSI                                            ║
╠═══════════════════════════════════════════════════════════════════════╣
║  □ Tujuan utama: Mengunggah materi dan membuat penugasan.             ║
║  □ Informasi paling kritis: Tombol "Kirim Materi/Tugas Baru".         ║
║  BENCHMARK: Di Notion/Linear, action "Create New" selalu sticky       ║
║  atau merupakan elemen list teratas. Di sini menggunakan *Card* besar ║
║  sebagai tombol tambah (sudah diperbaiki menjadi lebih compact).      ║
╠═══════════════════════════════════════════════════════════════════════╣
║  [B] 🏗️ LAYOUT & VISUAL HIERARCHY                                     ║
╠═══════════════════════════════════════════════════════════════════════╣
║  □ Focal Point: Sub-tab "Modul Materi" vs "Penugasan".                ║
║  □ Grid: Card `MaterialPanel` menggunakan grid responsif              ║
║    `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`.                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║  📋 TEMUAN HALAMAN INI                                                ║
╠═══════════════════════════════════════════════════════════════════════╣
║  🟠 MAJOR — Sub-navigation Inconsistency                              ║
║  Lokasi: `PembelajaranTab.tsx` (Pilihan antara Materi dan Penugasan)  ║
║  Masalah: Sub-tab navigasi seringkali mengambil desain "button group" ║
║  yang kaku, kurang menyerupai pola tab standar B2B (garis bawah).     ║
║  Dampak user: Membingungkan hierarki antara Topbar dan Konten.        ║
║  Benchmark: Linear menggunakan tab underline yang sangat bersih.      ║
║                                                                       ║
║  FIX:                                                                 ║
║  Gunakan komponen standar Tab dengan `border-b` dan indikator aktif   ║
║  menggunakan *framer-motion* atau minimal *border-indigo-500*.        ║
╚═══════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════╗
║  📄 ADMIN DASHBOARD (OVERVIEW & ALL) — ROLE: ADMIN                   ║
╠═══════════════════════════════════════════════════════════════════════╣
║  SKOR HALAMAN: 95/100                                                 ║
║  Status: 🟢 Sudah Optimal (High Standard B2B)                         ║
╠═══════════════════════════════════════════════════════════════════════╣
║  [A] 🎯 TUJUAN & RELEVANSI                                            ║
╠═══════════════════════════════════════════════════════════════════════╣
║  □ Tujuan utama: Command center, mengontrol seluruh tenant sekolah.   ║
║  BENCHMARK: Vercel Dashboard dan Stripe. Penggunaan `AdminInspector`  ║
║  sebagai panel samping kanan yang sticky adalah pola *expert-level*   ║
║  UX yang sangat mempercepat referensi data saat Admin sedang bekerja. ║
╠═══════════════════════════════════════════════════════════════════════╣
║  [B] 🏗️ LAYOUT & VISUAL HIERARCHY                                     ║
╠═══════════════════════════════════════════════════════════════════════╣
║  □ Grid: `xl:grid-cols-[1fr_360px]` sangat ideal. Mengalokasikan 360px║
║    untuk inspector menjaga konten utama tetap mendominasi.            ║
╠═══════════════════════════════════════════════════════════════════════╣
║  [E] 🌊 WORKFLOW SIMULATION                                           ║
╠═══════════════════════════════════════════════════════════════════════╣
║  TUGAS 1: "Cek log audit"                                             ║
║  Step 1: Tekan `Cmd + K` (Command Palette terbuka).                   ║
║  Step 2: Ketik "Audit" → Enter.                                       ║
║  Total klik: 0 (Keyboard only) | Estimasi: 2 detik.                   ║
║  Verdict: PERFECT 💯                                                  ║
╠═══════════════════════════════════════════════════════════════════════╣
║  📋 TEMUAN HALAMAN INI                                                ║
╠═══════════════════════════════════════════════════════════════════════╣
║  ✅ YANG SUDAH BAGUS:                                                 ║
║  → Keberadaan `CommandPalette` dan `AdminInspector` mengangkat level  ║
║    aplikasi ini menjadi setara dengan standar Global SaaS. Teks *hint*║
║    di dalam inspector juga membantu discoverability shortcut.         ║
╚═══════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔭 FASE 2: ROLE DESIGN DNA AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 👩‍🏫 GURU DESIGN DNA
**CURRENT STATE vs IDEAL**
- **Color palette**: Sesuai (Indigo/Purple/Emerald), memberikan kesan edukatif, hangat, namun profesional.
- **Typography**: Sesuai (Inter/Sans-serif dengan *tracking-widest* untuk meta-data).
- **Density**: Comfortable. Jarak antar elemen (`p-8`, `gap-6`) cukup lega, sangat cocok untuk pengguna tablet (iPad) yang sering dipakai guru di kelas.
- **Navigation**: Sidebar standar.
- **GAP**: Tidak ada *global quick-add* (Tombol Plus besar di pojok atau shortcut untuk tambah tugas/absen dari halaman mana saja). Guru sering butuh aksi cepat tanpa pindah menu.

### 🔧 ADMIN DESIGN DNA
**CURRENT STATE vs IDEAL**
- **Color palette**: Sesuai (Rose/Slate/Dark #0A0B0E). Tone lebih dingin, berfokus pada data.
- **Density**: Compact.
- **Navigation**: Sidebar + **Command Palette (⌘K)**.
- **GAP**: Hampir tidak ada gap, implementasi admin sudah setara *Stripe Dashboard*.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📊 FASE 3: LAPORAN KONSOLIDASI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### SCORECARD
| Halaman | Role | Skor | Status | Top Issue |
| :--- | :--- | :--- | :--- | :--- |
| Dashboard Beranda | Guru | 85/100 | 🟡 | Kurang keyboard shortcut untuk *search*. |
| Pembelajaran | Guru | 75/100 | 🟠 | Desain sub-navigasi tab kurang modern. |
| Pipeline & Analytics| Guru | 85/100 | 🟡 | Data density bisa dioptimasi. |
| Admin Center | Admin| 95/100 | 🟢 | Hampir sempurna, *keyboard-first* terimplementasi. |

**Rata-rata Guru Side : 81/100**
**Rata-rata Admin Side : 95/100**
**3-Second Test : PASS** (Perbedaan aksen warna dan tata letak `Inspector` vs `Leaderboard` langsung membedakan role).

### 🚨 SYSTEMATIC PROBLEMS
**[S-01] 🟠 Ketiadaan Empty State Global Component**
Muncul di: Beberapa panel jika data kosong.
Root cause: Developer melakukan hard-code *empty state* di masing-masing file (seperti di tabel `DashboardTab.tsx`).
Fix level: Buat komponen `<EmptyState icon={Search} title="..." desc="..." />` agar standar visual (opacity icon, font tracking) konsisten di seluruh aplikasi.

### 💡 FITUR YANG HILANG — RANKED BY PRODUCTIVITY IMPACT
| Fitur | Role | Impact | Ada di |
| :--- | :--- | :--- | :--- |
| **Global "Quick Add" (Hotkeys: C)** | Guru | 🔥🔥🔥🔥 | Linear, Notion |
| *Membuat tugas/materi langsung dari pop-up modal tanpa perlu navigasi ke tab Pembelajaran.* | | | |
| **Bulk Actions (Checkboxes)** | Keduanya| 🔥🔥🔥 | Stripe, Gmail |
| *Kemampuan memilih beberapa siswa/tugas untuk dinilai/dihapus secara bersamaan.* | | | |

### 🎯 PRIORITY ACTION PLAN

🚨 **SEGERA — (Polish yang berdampak tinggi):**
- Mengganti sub-navigasi di `PembelajaranTab` menjadi tab garis bawah (underline) yang lebih *clean* layaknya standar Linear.
- Membuat komponen `<EmptyState />` reusable agar konsisten.

🔴 **SPRINT 1:**
- Menambahkan **Keyboard Shortcuts** (`/` untuk search siswa di dashboard Guru).
- Mengimplementasikan fitur **Bulk Action** pada tabel nilai/tugas.

🟡 **SPRINT 2:**
- Fitur **Global Quick Add** modal (tekan `C` untuk Create Task/Material) dari layar manapun bagi Guru.

---
*Audit diselesaikan oleh Antigravity System.*


??????????????????????????????????????????????????????????????????????????????
## ?? FASE 4: STUDENT DESIGN DNA AUDIT (TAMBAHAN)
??????????????????????????????????????????????????????????????????????????????

### ?? SISWA DESIGN DNA
**CURRENT STATE vs IDEAL**
- **Color palette**: Sesuai (Emerald/Teal/White). Memberikan kesan positif, fresh, dan gamified (sistem XP & Badge berjalan baik).
- **Typography**: Outfit/Sans-serif memberikan kesan youthful namun mudah dibaca.
- **Navigation**: Menggunakan Sidebar layaknya Guru.
- **TEMUAN & FIX**: 
  1. **Sub-navigation Inconsistency**: Sub-tab di Pembelajaran sebelumnya menggunakan *pill-style* (kaku), kini telah direfaktor ke *underline-style* standar Linear yang jauh lebih *clean*.
  2. **Data Density pada Analitik**: Sama halnya dengan Guru, Card Statistik pada halaman Analitik Siswa telah dirampingkan menjadi orientasi horizontal (Stripe-like) untuk menghemat ruang layar vertikal.

**Verdict**: Siswa UI sudah konsisten dengan Role Design DNA Klolakelas (Clean, Glassmorphism, B2B Standard).


### ?? BONUS: Jadwal Mengajar (Teaching Schedule)
- **Status:** Diimplementasikan dari status ? menjadi ?.
- **UI/UX:** Kalender gaya B2B SaaS dengan layout grid untuk Senin-Jumat dan slot waktu (07:00 - 15:45). Elemen kalender dihiasi dengan animasi pulse dan *glassmorphism*.
