// index.js
const express = require('express');
const sequelize = require('./config/database');
const socketIo = require('socket.io');

const axios = require('axios');  // Importieren von Axios, um HTTP-Anfragen zu stellen
const http = require('http');   // Importieren von HTTP, um den Server zu erstellen

const cors = require('cors'); // Importieren von CORS, um den Zugriff über verschiedene Domänen zu ermöglichen
require('dotenv').config();  // Laden der Umgebungsvariablen aus der .env-Datei

const app = express();                  // Erstellen einer Express-App
const server = http.createServer(app);  // Erstellen eines HTTP-Servers mit der App

app.use(cors());         // Middleware für CORS
app.use(express.json()); // Middleware zum Parsen von JSON-Daten

const io = socketIo(server, {
  cors: {
    origin: '*',                // Erlauben des Zugriffs von allen Ursprüngen
    methods: ['GET', 'POST']    // Erlauben nur der Methoden GET und POST
  }
}); 
const PORT = 3000;   // Festlegen des Ports für den Server

const User = require('./models/User');              // Importieren des User-Modells
const Photo = require('./models/Photo');            // Importieren des Photo-Modells
const UserPhotos = require('./models/UserPhotos');  // Importieren des Modells für die Benutzer-Foto-Beziehung

// Definieren der Beziehung zwischen Benutzern und Fotos mit Sequelize
User.belongsToMany(Photo, {
  through: UserPhotos,     // Beziehung über das Zwischenmodell UserPhotos
  foreignKey: 'userId',    // Fremdschlüssel für den Benutzer
  otherKey: 'photoId'      // Fremdschlüssel für das Foto
});

Photo.belongsToMany(User, {
  through: UserPhotos,      
  foreignKey: 'photoId',    
  otherKey: 'userId'        
});

// API-Endpunkt zum Abrufen von Bildern von Unsplash
app.get('/api/images', async (req, res) => {
  const query = req.query.query || 'nature';  // Wenn keine Anfrage übergeben wird, verwenden wir 'nature' als Standardwert

  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: query,
        per_page: 15,   // Anzahl der abgerufenen Bilder
      },
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`, // Hinzufügen des Zugriffsschlüssels für Unsplash
      },
    });

    res.json(response.data); // Die abgerufenen Daten von Unsplash an den Client senden
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images' });
  }
});

// API-Endpunkt für die Registrierung eines neuen Benutzers
app.post('/signup', async (req, res) => {
  const { username, password } = req.body 
  try {
    const user = await User.create({ username, password }); // Benutzer in der Datenbank erstellen
    res.json(user);  // Die Benutzerdaten an den Client senden
  } catch (err) {
    res.status(400).json({ error: 'Username bereits vergeben' }); // Wenn der Benutzername bereits vergeben ist
  }
});

// API-Endpunkt für das Login eines Benutzers
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("req", req.body);
  const user = await User.findOne({ 
    where: { username },
    attributes: ['id', 'username', 'password']
  })
  if (user && user.password === password) {
    res.json({
      id: user.id,
      username: user.username,
      message: 'Login erfolgreich'  // Wenn die Login-Daten korrekt sind
    })
  } else {
    res.status(401).json({ error: 'Falsche Anmeldedaten' }); // Wenn die Login-Daten falsch sind
  }
});

// API-Endpunkt, um einem Bild ein "Like" zu geben
app.post('/like', async (req, res) => {
  const { userId, photoId, url, alt } = req.body;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const [photo] = await Photo.findOrCreate({
      where: { id: photoId },
      defaults: { url, alt } 
    });

    await user.addPhoto(photo);  // Foto zur Liste der vom Benutzer "gelikten" Fotos hinzufügen

    res.status(200).json({ 
      message: 'Photo liked successfully',
      photo: { id: photo.id, url: photo.url, alt: photo.alt }
    });

  } catch (err) {
    console.error('Error liking photo:', err);
    res.status(500).json({ error: 'Error liking photo', details: err.message }); // Fehler beim "Liken" des Fotos
  }
});
// API-Endpunkt, um das "Like" von einem Bild zu entfernen
app.delete('/unlike', async (req, res) => {
  try {
    const { userId, photoId } = req.body;
    if (!userId || !photoId) {
      return res.status(400).json({ message: 'UserId and PhotoId are required.' });
    }

    await UserPhotos.destroy({  // Die Beziehung zwischen Benutzer und Foto aus der Datenbank entfernen
      where: { userId, photoId }
    });

    res.status(200).json({ message: 'Photo unliked successfully.' }); // Erfolgreiches Entfernen des "Likes"
  } catch (error) {
    console.error('Error unliking photo:', error);
    res.status(500).json({ message: 'Server error.' }); // Serverfehler
  }
});
// API-Endpunkt, um die vom Benutzer geteilten Fotos abzurufen
app.get('/shared-photos', async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Photo,
        through: { attributes: [] },
        attributes: ['id', 'url', 'alt'],
        include: {
          model: User,
          attributes: ['id', 'username'],
          through: { attributes: [] }
        }
      },
    });
    res.status(200).json(users); // Erfolgreich alle Benutzer und ihre geteilten Fotos abrufen
  } catch (err) {
    res.status(500).send('Error fetching shared photos'); // Fehler beim Abrufen der geteilten Fotos
  }
});

/**************************  WebSocket **************************/
// Speichern des Online-Status der Benutzer
const onlineUsers = new Map();

// Speichern des Online-Status der Benutzer
io.on('connection', (socket) => {

  // Wenn der Status eines Benutzers aktualisiert wird (online oder offline)
  socket.on('update-user-status', (userId, isOnline) => {
    onlineUsers[userId] = isOnline; // Status im Map aktualisieren
    console.log(`User ${userId} is ${isOnline ? 'online' : 'offline'}`);
    io.emit('update-user-status', userId, isOnline); // Alle Benutzer über den Status des Benutzers informieren
  });

  // Wenn sich ein neuer Benutzer verbindet
  socket.on('user-connected', (userId) => {
    onlineUsers.set(userId, {   // Benutzer in der Map mit seinem Status hinzufügen
      status: true,
      socketId: socket.id
    });
    io.emit('update-user-status', userId, true); // Alle Benutzer benachrichtigen, dass der Benutzer online ist
  });

  // Anfrage nach den Status aller Benutzer
  socket.on('request-statuses', () => {
    socket.emit('current-statuses', Object.fromEntries(onlineUsers)); // Senden des aktuellen Status aller Benutzer an den Client
  });

  // Manuelle Trennung
  socket.on('manual-disconnect', () => {
    for (let [userId, data] of onlineUsers.entries()) {
      if (data.socketId === socket.id) {    // Wenn dieser Benutzer die Verbindung getrennt hat
        onlineUsers.delete(userId);         // Benutzer aus der Map entfernen
        io.emit('update-user-status', userId, false); // Alle Benutzer benachrichtigen, dass der Benutzer offline ist
        break;
      }
    }
  });

});
// Synchronisieren der Datenbank und Starten des Servers
sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);  // Serverstartmeldung
  })
})

