const express = require('express');
const path = require('path');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const app = express();
const PORT = 3000;

const mongoURL = 'mongodb://localhost:27017';
const dbName = 'film-dbs';
const collectionName = 'film_collection';

app.use(express.static(path.join(__dirname, 'pages')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/films', async (req, res) => {
    try {
        const client = await MongoClient.connect(mongoURL, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const films = await collection.aggregate([{ $sample: { size:30 } }]).toArray();
        const filmCards = films.map(film => `
                <div class="film-card">
                    <a href="${film.link}" target=”_blank”>
                        <img src="src/banners/${film.isim}.jpg" alt="${film.isim}">
                        <div class="film-info">
                            <h2>${film.isim}</h2>
                            <div class="rating">
                                <span class="star">⭐</span>
                                <span class="imdb-rating">${film['imdb-rate']}</span>
                            </div>
                        </div>
                    </a>
                </div>
            `).join('');
        res.send(filmCards);
        client.close();
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).send('Sunucu hatası');
    }
});




app.post('/filteredFilms', async (req, res) => {
    try {
        const client = await MongoClient.connect(mongoURL, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const requestedGenres = req.body.genres; // frontendden gelen türlerin dizisi

        const films = await collection.find({ tur: { $all: requestedGenres } }).toArray(); // Veritabanından istenen türleri içeren filmleri getir

        const filmCards = films.map(film => `
                <div class="film-card">
                    <a href="${film.link}" target=”_blank”>
                        <img src="src/banners/${film.isim}.jpg" alt="${film.isim}">
                        <div class="film-info">
                            <h2>${film.isim}</h2>
                            <div class="rating">
                                <span class="star">⭐</span>
                                <span class="imdb-rating">${film['imdb-rate']}</span>
                            </div>
                        </div>
                    </a>
                </div>
            `).join('');

        res.send(filmCards);
        client.close();
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).send('Sunucu hatası');
    }
});

app.get('/', async (req, res) => {
    try {
        const genres = req.query.genre;
        if (!genres || genres.length === 0) {
        } else {
            const client = await MongoClient.connect(mongoURL, { useUnifiedTopology: true });
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            const films = await collection.find({ tur: { $in: genres } }).toArray();

            const filmCards = films.map(film => `
                <div class="film-card">
                    <a href="${film.link}" target=”_blank”>
                        <img src="src/banners/${film.isim}.jpg" alt="${film.isim}">
                        <div class="film-info">
                            <h2>${film.isim}</h2>
                            <div class="rating">
                                <span class="star">⭐</span>
                                <span class="imdb-rating">${film['imdb-rate']}</span>
                            </div>
                        </div>
                    </a>
                </div>
            `).join('');

            res.send(filmCards);

            client.close();
        }
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).send('Sunucu hatası');
    }
});

// Sunucuyu dinle
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
