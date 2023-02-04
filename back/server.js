const express = require('express');
const app = express();
const port = 3690;
const mysql = require('./mysql');
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/boardAdd", async (req, res) => {
    try {
        const { title, contents } = req.body;
        const [rows] = await mysql.query(`
            INSERT INTO
            board(userNo, title, contents, rgstrDate)
            VALUES(?, ?, ?, now())
        `, [2, title, contents]);

        res.send(200); 
    } catch (e) {
        console.error(e);
    }
})

app.get("/board", async (req, res) => {
    try {
        const [rows] = await mysql.query("SELECT * FROM board b LEFT OUTER JOIN user u ON b.userNo = u.no ORDER BY b.rgstrDate DESC");
        res.send(rows);
    } catch (e) {
        console.error(e);
    }
})

app.post("/signUp", async (req, res) => {
    try {
        const { nickname, id, pw } = req.body;
        const [rows] = await mysql.query(`
        INSERT INTO 
        user(id, password, nickname) 
        VALUES(?, ?, ?)
        `, [id, pw, nickname]);
        res.send(rows);
    } catch (e) {
        console.error(e);
        res.send("오류");
    }
})

app.post("/login", async (req, res) => {
    try {
        const { id, pw } = req.body;
        console.log(id, pw);
        const [rows] = await mysql.query(`
        SELECT * FROM user WHERE id = ? AND password = ?
        `, [id, pw]);
        res.send(rows);
    } catch (e) {
        console.error(e);
    }
})

app.listen(port, () => {
    console.log(port + " port listening on!!");
})