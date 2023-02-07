const express = require('express');
const app = express();
const port = 3690;
const mysql = require('./mysql');
const jwt = require("jsonwebtoken");
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/boardCommentAdd", async (req, res) => {
    try {
        const { boardNo, boardCommentAdd } = req.body;
        const [rows] = await mysql.query(`
        INSERT INTO
        comment(boardNo, userNo, contents, rgstrDate)   
        VALUES(?, ?, ?, now())
        `, [boardNo, 1, boardCommentAdd]);

        res.status(200).send(rows);
    } catch (e) {
        console.error(e);
    }
})

app.post("/boardComment", async (req, res) => {
    try {
        const { boardNo } = req.body;
        const [rows] = await mysql.query(`
        SELECT * FROM comment c
        LEFT OUTER JOIN user u
        ON c.userNo = u.userNo
        WHERE boardNo = ? 
        ORDER BY rgstrDate DESC
        `, [boardNo]);
        res.status(200).send(rows);
    } catch (e) {
        console.error(e);
    }
})

app.post("/boardDetail", async (req, res) => {
    try {
        const { boardNo } = req.body;
        const [rows] = await mysql.query(`
        SELECT * FROM board b 
        LEFT OUTER JOIN user u 
        ON b.userNo = u.userNo 
        WHERE b.boardNo = ?
        `, [boardNo]);

        res.status(200).send(rows);
    } catch (e) {
        console.error(e);
    }
})

app.post("/boardAdd", async (req, res) => {
    try {
        const { title, contents } = req.body;
        const [rows] = await mysql.query(`
            INSERT INTO
            board(userNo, title, contents, rgstrDate)
            VALUES(?, ?, ?, now())
        `, [2, title, contents]);

        res.status(200).send(200);
    } catch (e) {
        console.error(e);
    }
})

app.get("/board", async (req, res) => {
    try {
        const [rows] = await mysql.query("SELECT * FROM board b LEFT OUTER JOIN user u ON b.userNo = u.userNo ORDER BY b.rgstrDate DESC");
        res.status(200).send(rows);
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
        res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        res.send("오류");
    }
})

app.post("/login", async (req, res) => {
    try {
        const { id, pw } = req.body;
        const [rows] = await mysql.query(`
        SELECT * FROM user WHERE id = ? AND password = ?
        `, [id, pw]);
        console.log(id, pw);
        rows.length > 0 ? res.status(200).send(rows) : res.status(400);
    } catch (e) {
        console.error(e);
    }
})

app.listen(port, () => {
    console.log(port + " port listening on!!");
})