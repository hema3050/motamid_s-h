const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS payments (name TEXT, card_number TEXT, expiry_date TEXT, cvv TEXT, country TEXT, amount TEXT, currency TEXT)");
});

// Serve the index.html file
app.get('/view-data-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view-data.html'));
});


app.post('/submit-payment', (req, res) => {
    const { name, card_number, expiry_date, cvv, country, amount, currency } = req.body;
    const stmt = db.prepare("INSERT INTO payments VALUES (?, ?, ?, ?, ?, ?, ?)");
    stmt.run(name, card_number, expiry_date, cvv, country, amount, currency);
    stmt.finalize();

    res.json({ success: true });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'hema' && password === 'aa.1122334455.aa') {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('/view-data', (req, res) => {
    db.all("SELECT * FROM payments", (err, rows) => {
        if (err) {
            res.json({ success: false, message: 'Failed to retrieve data' });
        } else {
            res.json({ success: true, data: rows });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
