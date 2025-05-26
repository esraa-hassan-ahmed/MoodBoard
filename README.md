# MoodBoard

## 📝 Beschreibung (Deutsch)

Dies ist ein kollaboratives Moodboard-Webprojekt, das es mehreren Nutzern ermöglicht, gemeinsam inspirierende Bilder in Echtzeit zu teilen. Benutzer können sich registrieren, einloggen, nach Bildern über die Unsplash-API suchen und ihre Lieblingsbilder mit "Like" markieren. Die gelikten Bilder werden in einer gemeinsamen Galerie angezeigt.

Funktionen:

- Benutzerregistrierung und Login
- Bilder suchen über Unsplash-API
- Bilder liken (werden in der Datenbank gespeichert)
- Echtzeit-Updates per WebSocket
- Geteilte Galerie aller gelikten Bilder
- Möglichkeit, Bilder nach Nutzer zu filtern

## 🌐 Description (English)

This is a collaborative moodboard web app that allows multiple users to share inspiring images in real-time. Users can register, log in, search for images using the Unsplash API, and like their favorite ones. Liked images are saved to the database and displayed in a shared gallery.

Features:

- User registration and login
- Search images via Unsplash API
- Like images (saved to database)
- Real-time updates with WebSocket
- Shared gallery for all liked images
- Option to filter images by user

## 💻 Technologien / Technologies

- Frontend: Vue.js, Tailwind CSS
- Backend: Node.js, Express.js
- Datenbank: SQLite mit Sequelize ORM
- API: Unsplash API
- Kommunikation: WebSocket (Socket.IO)

## 🚀 Projekt starten / Start the Project

```bash
# Backend starten
cd backend
npm install
node index.js

# Frontend starten
cd frontend
npm install
npm run dev

