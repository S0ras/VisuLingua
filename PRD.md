# 📝 Product Requirements Document (PRD): VisuLingua

---

## 1. Übersicht & Ziele 🎯

**Projektname:** VisuLingua

**Vision:** Entwicklung einer schnellen, **Web-basierten Flashcard-App** mit OCR-Scan und KI-Bildgenerierung, optimiert für den mobilen Einsatz (PWA/Browser-Kamera-Support). Der Fokus liegt auf authentischem Spracherwerb unterwegs, primär für Spanisch.

| Kriterium | Details |
| :--- | :--- |
| **Primärer Use Case** | Weltreisende/Sprachschüler scannen spanischen Text (z.B. Schilder, Speisekarten) und erstellen daraus mit Übersetzung automatisch Karteikarten. |
| **Erfolgskriterium** | Die Verarbeitung (Scan, Übersetzung, Kartenvorschlag) muss **flüssig** sein. Die Anwendung muss den persönlichen Anforderungen an **Usability und Design** genügen. |

---

## 2. Zielgruppe & Use Cases

**Primäre Zielgruppe:** Individuelle Sprachlerner (Spanisch), die unterwegs auf authentische, visuelle und textuelle Inhalte aus der realen Welt stoßen.

**Kern-Use Case (MVP):**
1.  Der Nutzer öffnet die Web-App (oder PWA) auf dem Handy.
2.  Er nutzt die Kamera-Funktion, um ein Bild eines spanischen Wortes (z.B. auf einer Speisekarte) aufzunehmen.
3.  Die App verarbeitet das Bild.
4.  Die App zeigt einen Karteikarten-Vorschlag (Vorderseite: Spanisch, Rückseite: Deutsche Übersetzung) an.
5.  Der Nutzer speichert die Karte in einem Set ab.
6. Der Nutzer kann die Karteikarten nach einem Spaced Repetion Prinzip lernen, wie es Anki nutzt.

**Sekundärer Use Case:**
* Nach dem Speichern kann der Nutzer optional ein **KI-generiertes Bild** anfordern, das zur visuellen Unterstützung zur Karte hinzugefügt wird.

---

## 3. Technologie-Stack & Hosting 🛠️

Um schnelles Prototyping und Deployment aus einem Single-Repository zu gewährleisten, wird ein Full-Stack-Framework verwendet.

| Komponente | Gewählte Technologie / Dienst | Zweck |
| :--- | :--- | :--- |
| **Frontend/Backend** | **Next.js (React)** | Full-Stack-Framework für schnelles Prototyping und Web-Entwicklung. |
| **Hosting** | **AWS Amplify** | Hosting und CI/CD für die Next.js-Anwendung. |
| **Datenbank/Auth** | **Supabase** | Datenbank (PostgreSQL), Authentifizierung und File Storage. |
| **OCR (Texterkennung)** | **Amazon Textract** | Hochpräziser AWS-Dienst zur Erkennung von Text in Bildern. |
| **Übersetzung** | **Amazon Translate** | Automatische Übersetzung des erkannten Textes (Spanisch $\rightarrow$ Deutsch). |
| **KI-Bildgenerierung** | **Amazon Bedrock (z.B. Stability AI)** | Managed Service von AWS für den Zugriff auf generative Modelle zur Erstellung visueller Hilfsmittel. |

---

## 4. Funktionsanforderungen

### 4.1. MVP-Funktionen (Minimum Viable Product)

* **Benutzerauthentifizierung:** Login/Registrierung über E-Mail/Passwort (via Supabase Auth).
* **Set-Management:** Erstellung, Bearbeitung und Löschung von Karteikarten-Sets.
* **Karteikarten-Verwaltung:** Erstellen, Bearbeiten, Löschen einzelner Karten.
* **Core Feature: Scan & Create Workflow:**
    * Kamera-Zugriff im Browser/PWA für sofortige Fotos.
    * Bild-Upload-Funktion.
    * API-Aufruf an **Amazon Textract** zur Texterkennung.
    * API-Aufruf an **Amazon Translate** zur Übersetzung des erkannten Textes.
    * Generierung eines editierbaren Kartenvorschlags.
* **Lernmodus:** Einfacher Lernmodus (Vorderseite anzeigen $\rightarrow$ Rückseite aufdecken).

### 4.2. Optionale/Zukünftige Funktionen

* **Visuelle Ergänzung:** Button zur Anforderung eines Bildes über **Amazon Bedrock** basierend auf dem Kartentext.
* **Fortgeschrittenes Lernen:** Implementierung eines einfachen Spaced Repetition Systems (SRS).
* **Multi-Language Support:** Erweiterung des Übersetzungsangebots über Spanisch hinaus.

---

## 5. Design & UX-Anforderungen

* **Responsive Design:** Zwingend erforderlich; muss auf allen gängigen Smartphone-Größen und Desktops uneingeschränkt nutzbar sein.
* **Fokus:** Klarheit, Schnelligkeit und intuitive Handhabung des Scan & Create Workflows.
* **Mobile Experience:** Die PWA/Mobile-Browser-Erfahrung muss die Hauptzielsetzung sein.

---