const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const port = 3000;

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: 'your_secret_key', // Change this to a strong secret
    resave: false,
    saveUninitialized: true
}));

// Middleware to serve static files (HTML, CSS, JS)
app.use(express.static('public'));
app.use('/songs', express.static('songs')); // Serve songs directory as static files

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
    if (username === 'adminsongs' && password === '8920419664') {
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        res.send('Invalid username or password');
    }
});

// Endpoint to fetch songs with cover image and info
app.get('/api/songs', authenticate, (req, res) => {
    const artists = ['Arjit Singh', 'indresh ji', 'krishna', 'Radha ji', 'shree ram', 'Top hits'];
    const songsWithInfo = artists.map(artist => {
        const artistDir = path.join(__dirname, 'songs', artist);
        const coverPath = path.join(artistDir, 'cover.jpg');
        const infoPath = path.join(artistDir, 'info.json');

        // Read cover image and info JSON
        let cover = null;
        let info = null;

        try {
            cover = fs.readFileSync(coverPath, 'base64'); // Read cover image as base64 for easier frontend handling
            info = JSON.parse(fs.readFileSync(infoPath, 'utf8')); // Read info JSON
        } catch (err) {
            console.error(`Error reading cover/info for ${artist}:`, err);
        }

        // Retrieve songs for the artist
        const songs = getSongs(artistDir, artist);

        return {
            artist,
            cover: cover ? `data:image/jpeg;base64,${cover}` : null, // Base64 encoded image
            info,
            songs
        };
    });

    res.json(songsWithInfo);
});

// Function to read songs from the directory
const getSongs = (dir, artist) => {
    const songs = [];
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && file !== 'cover.jpg' && file !== 'info.json') {
            songs.push({ title: path.basename(file, path.extname(file)), artist, url: `/songs/${artist}/${file}` });
        }
    });
    return songs;
};

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
