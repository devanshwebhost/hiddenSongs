const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Use SESSION_SECRET environment variable or default to a strong secret
    resave: false,
    saveUninitialized: true
}));

// Middleware to serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Sample data (for demonstration)
const artists = ['Arjit Singh', 'indresh ji', 'krishna', 'Radha ji', 'shree ram', 'Top hits'];

// Authentication middleware
const authenticate = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Login endpoint
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'devansh' && password === 'hiddenSongs') {
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        res.status(401).send('Invalid username or password');
    }
});

// Endpoint to fetch songs with artist information
app.get('/api/songs', authenticate, (req, res) => {
    const songsWithInfo = artists.map(artist => {
        const artistDir = path.join(__dirname, 'songs', artist);
        const songs = getSongs(artistDir, artist);
        return {
            artist,
            songs
        };
    });
    res.json(songsWithInfo);
});

// Function to read songs from the directory
const getSongs = (dir, artist) => {
    const songs = [];
    try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isFile()) {
                songs.push({ title: path.basename(file, path.extname(file)), artist, url: `/songs/${artist}/${file}` });
            }
        });
    } catch (err) {
        console.error(`Error reading songs for ${artist}:`, err);
    }
    return songs;
};

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
