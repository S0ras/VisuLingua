# 📚 VisuLingua - Flashcard App

Eine moderne, web-basierte Flashcard-App mit OCR-Scan und KI-Bildgenerierung, optimiert für mobiles Lernen unterwegs.

## ✨ Features

- 🔐 **Benutzerauthentifizierung** mit Supabase
- 📦 **Set-Management** - Erstelle und verwalte Karteikarten-Sets
- 📇 **Karteikarten-Verwaltung** - CRUD für einzelne Flashcards
- 📸 **Scan & Create Workflow** - Kamera-Zugriff und Bildupload
- 🤖 **OCR Integration** - Amazon Textract für Texterkennung
- 🌐 **Automatische Übersetzung** - Amazon Translate (Spanisch ↔ Deutsch)
- 🧠 **Spaced Repetition System** - SM-2 Algorithmus für effektives Lernen
- 🎨 **KI-Bildgenerierung** - Amazon Bedrock für visuelle Unterstützung (optional)
- 📱 **PWA Support** - Installierbar auf Mobilgeräten

## 🛠️ Tech Stack

- **Frontend/Backend:** Next.js 15 mit TypeScript
- **Styling:** Tailwind CSS
- **Datenbank & Auth:** Supabase (PostgreSQL)
- **AWS Services:**
  - Amazon Textract (OCR)
  - Amazon Translate
  - Amazon Bedrock (Bildgenerierung)
- **Hosting:** AWS Amplify (geplant)

## 🚀 Installation & Setup

### 1. Repository klonen

```bash
git clone https://github.com/your-username/VisuLingua.git
cd VisuLingua
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

Kopiere `.env.example` zu `.env.local` und fülle die Werte aus:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AWS
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### 4. Supabase Datenbank einrichten

1. Erstelle ein Supabase-Projekt auf [supabase.com](https://supabase.com)
2. Öffne den SQL Editor in Supabase
3. Führe das SQL-Schema aus `supabase-schema.sql` aus

### 5. AWS Services konfigurieren

Stelle sicher, dass dein AWS-Konto Zugriff auf folgende Services hat:
- Amazon Textract
- Amazon Translate
- Amazon Bedrock (optional für Bildgenerierung)

### 6. Development Server starten

```bash
npm run dev
```

Die App läuft auf [http://localhost:3000](http://localhost:3000)

## 📖 Verwendung

### Erste Schritte

1. **Registrieren** - Erstelle ein Konto auf `/register`
2. **Set erstellen** - Lege dein erstes Karteikarten-Set an
3. **Scannen** - Nutze die Scan-Funktion, um Text zu fotografieren
4. **Lernen** - Starte den Lernmodus mit Spaced Repetition

### Scan-Workflow

1. Navigiere zu `/scan`
2. Öffne die Kamera oder lade ein Bild hoch
3. Der Text wird automatisch erkannt (OCR)
4. Die Übersetzung wird generiert
5. Bearbeite und speichere die Karteikarte in einem Set

### Lernmodus

1. Öffne ein Set und klicke auf "Lernen starten"
2. Sieh die Vorderseite und versuche dich zu erinnern
3. Zeige die Antwort an
4. Bewerte deine Erinnerung (0-5)
5. Das System passt automatisch die Wiederholungsintervalle an

## 🗂️ Projektstruktur

```
VisuLingua/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── ocr/             # Textract Integration
│   │   ├── translate/       # Amazon Translate
│   │   └── generate-image/  # Bedrock Integration
│   ├── dashboard/           # Dashboard Seite
│   ├── login/               # Login Seite
│   ├── register/            # Registrierung
│   ├── scan/                # Scan-Interface
│   └── sets/                # Set- und Card-Management
├── components/              # React Komponenten
│   └── Navbar.tsx
├── lib/                     # Utility Functions
│   ├── auth.ts             # Authentifizierung
│   ├── database.ts         # Datenbank-Queries
│   ├── srs.ts              # Spaced Repetition
│   └── supabase.ts         # Supabase Client
├── types/                   # TypeScript Typen
│   └── index.ts
├── public/                  # Statische Assets
│   ├── manifest.json       # PWA Manifest
│   └── sw.js               # Service Worker
└── supabase-schema.sql     # Datenbankschema
```

## 🔒 Sicherheit

- Row Level Security (RLS) in Supabase aktiviert
- Benutzer können nur ihre eigenen Daten sehen und bearbeiten
- API Routes validieren Benutzereingaben
- AWS Credentials nie im Client-Code

## 🌐 Deployment

### AWS Amplify (empfohlen)

1. Verbinde dein GitHub Repository mit AWS Amplify
2. Konfiguriere die Umgebungsvariablen in Amplify
3. Amplify baut und deployed automatisch bei jedem Push

### Alternative: Vercel

```bash
npm install -g vercel
vercel
```

## 🤝 Beitragen

Contributions sind willkommen! Bitte erstelle einen Pull Request.

## 📄 Lizenz

MIT License

## 🙋 Support

Bei Fragen oder Problemen öffne ein Issue auf GitHub.

---

Entwickelt mit ❤️ für authentisches Sprachlernen unterwegs
Flash Card App for Travelling
