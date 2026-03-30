# 🎲 GameNight GameNight App

Eine mobile React-Native App für Boardgame-Events, Spielvoting, Reviews, Chat & Restaurant-Empfehlungen.

Die GameNight Companion App unterstützt Spieler:innen und Gastgeber:innen bei der Organisation eines gemeinsamen Brettspielabends.  
Sie umfasst Event-Planung, Spiele-Voting im Swipe-Stil, Review-System, Echtzeit-Chat, Essenspräferenzen und Empfehlungen für nahegelegene Restaurants.

---

## 🚀 Features

### 🏠 **Event Management**

- Events erstellen & verwalten (inkl. Datum, Uhrzeit, Ort)
- Teilnahme-Status verwalten (Zusagen/Absagen)
- Gastgeber Rotation für Fairness
- Automatisches Ermitteln des letzten aktiven Events

### 🎮 **Game Voting (Tinder-Swipe Mechanik)**

- Spiele hinzufügen / bearbeiten
- Kartenswiping: Like/Dislike mit flüssigen Animationen
- Live-Auswertung über materialisierte Views
- Statistiken: Beliebteste Spiele & Votes pro Event

### ⭐ **Review System**

- Review erst 5h nach dem Event möglich (Missbrauchsschutz)
- Bewertungskategorien: Host, Location, Food, Overall
- Game-Ratings pro Event (1–5 Sterne)
- Review-Statistiken als Dashboard

### 💬 **Realtime Chat**

- 1:1 Chats mit Supabase Realtime Channels
- Nachrichten, Bilder & Emojis
- Typing Indicators, Delivered/Read, Online Status
- Optimistic UI Updates für sofortige Nutzer-Feedback
- Skalierbare Channel-Architektur (Gruppenchat möglich)

### 🍽️ **Restaurant Empfehlungssystem**

- Integration der **Geoapify Places API**
- Restaurants in der Nähe anzeigen
- Öffnungszeiten, Website, Telefonnummer
- Essensrichtungen automatisch erkennen
- Like-System pro Event
- "Favoriten"-Tab sortiert Restaurants nach Likes

### 🔐 **Authentication**

- Login via **Clerk**
- Synchronisierung mit Supabase via Webhooks
- Rollen & Besitzrechte pro User
- RLS Policies für Daten- & Schreibschutz

---

## 🧰 Tech Stack

### 🎨 **Client**

- React Native (Expo)
- TypeScript
- Expo Router
- React Query (Datenverwaltung)
- NativeWind (Tailwind für RN)
- Lottie Animations
- Zustand / Context als State Layer

### 🗄️ **Backend & Infrastruktur**

- Supabase (Auth, DB, Storage, Realtime)
- PostgreSQL + RLS Policies
- Supabase RPCs & Materialized Views
- Geoapify Places API (Restaurants & Details)

### 🔐 **Authentication**

- Clerk (User Management)
- Supabase Webhook Sync
- JWT-basierte Autorisierung

### 🛠️ **Development Workflow**

- VS Code
- Expo Go / Android Emulator
- GitHub Repository
- Local Testing über Expo

---

## 🗂️ Datenbankmodell

Das Projekt folgt einer klar getrennten Domain-Struktur:

- **Events**  
  `events`, `attendance`, `food_preferences`

- **Games**  
  `games`, `game_votes`, `review_game_ratings`

- **Reviews**  
  `reviews`

- **Restaurants**  
  `restaurant_likes`

- **Messaging**  
  `channels`, `channel_users`, `messages`

- **Users**  
  `users` (aus Clerk synchronisiert)

> Details + ER-Diagramm siehe /docs oder Projektbericht.

---

## 📱 App Struktur
/app
/home
/games
/chats
/review
/restaurants
/components
/providers
/utils
/types

## ⚙️ Setup & Installation

1️⃣ Repository klonen
```bash
git clone https://github.com/<your-user>/<your-repo>.git
cd <your-repo>
2️⃣ Dependencies installieren
npm install

3️⃣ Environment Variablen

Du benötigst eine .env Datei:

EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON=...
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
GEOAPIFY_API_KEY=...

4️⃣ App starten
npx expo start

📖 Projektziel

Dieses Projekt wurde im Rahmen einer Fallstudie entwickelt.
Ziel war die Konzeption & technische Umsetzung einer Event-Management App mit Fokus auf:

kollaborativen Features

skalierbarer Architektur

real-time Kommunikation

klarer Datenmodellierung

moderner UX/UI

