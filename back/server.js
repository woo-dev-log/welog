const express = require('express');
const app = express();
const port = 3690;
const mysql = require('./mysql');
const jwt = require("jsonwebtoken");
const cors = require('cors');
// app.use(cors({
//     origin: 'http://localhost:5173/',
//     credential: 'true'
// }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/loginToken", async (req, res) => {
    try {
        const { welogJWT } = req.body;
        const user = await jwt.verify(welogJWT, "welogJWT");
        res.send(user);
    } catch (e) {
        console.error(e);
    }
})

app.post("/boardCommentAdd", async (req, res) => {
    try {
        const { boardNo, boardCommentAdd } = req.body;
        const [rows] = await mysql.query(`
        INSERT INTO
        comment(boardNo, userNo, contents, rgstrDate)   
        VALUES(?, ?, ?, now())
        `, [boardNo, 1, boardCommentAdd]);

        res.status(200).send("success");
    } catch (e) {
        res.status(400).send("fail");
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
        res.status(400).send("fail");
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
        res.status(400).send("fail");
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
        res.status(200).send("success");
    } catch (e) {
        res.status(400).send("fail");
        console.error(e);
    }
})

app.get("/board", async (req, res) => {
    try {
        const [rows] = await mysql.query(`
        SELECT * FROM board b 
        LEFT OUTER JOIN user u 
        ON b.userNo = u.userNo 
        ORDER BY b.rgstrDate DESC
        `);
        rows.length > 0 ? res.status(200).send(rows) : res.status(400).send("fail");
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
        res.status(200).send("success");
    } catch (e) {
        res.status(400).send("fail");
        console.error(e);
    }
})

app.post("/login", async (req, res) => {
    try {
        const { id, pw } = req.body;
        const [rows] = await mysql.query(`
        SELECT * FROM user WHERE id = ? AND password = ?
        `, [id, pw]);
        console.log(id, pw);

        if (rows.length > 0) {

            const user = [{ id: rows[0].id, nickname: rows[0].nickname }];
            const token = await jwt.sign(
                {
                    type: "JWT",
                    userNo: rows.userNo,
                    id: rows[0].id,
                    nickname: rows[0].nickname
                },
                "welogJWT",
                {
                    expiresIn: "30d",
                    issuer: "test"
                }
            );
            
            res.status(200).send({ user, token });
        } else {
    res.status(400).send("fail");
}
    } catch (e) {
    res.status(400).send("fail");
    console.error(e);
}
})

app.listen(port, () => {
    console.log(port + " port listening on!!");
})