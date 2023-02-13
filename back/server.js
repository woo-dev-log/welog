const express = require('express');
const app = express();
const port = 3690;
const mysql = require('./mysql');
const jwt = require("jsonwebtoken");
const multer = require('multer');
const cors = require('cors');
// app.use(cors({
//     origin: 'http://localhost:5173/',
//     credential: 'true'
// }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/images', express.static('images'));

let imageName = [];
const imageUpload = multer({
    limits: { fieldSize: 25 * 1024 * 1024 },
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'images/'),
        filename: (req, file, cb) => {
            const originalName = file.originalname.replace(" ", "");
            let fileName = new Date().valueOf() + '_' + Buffer.from(originalName, 'latin1').toString('utf8');
            cb(null, fileName);
            imageName.push(fileName);
        }
    })
});

app.post("/userBoard", async (req, res) => {
    try {
        const { userNickname } = req.body;
        const [rows] = await mysql.query(`
            SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, u.nickname, u.imgUrl, 
            (SELECT count(*) FROM comment c WHERE c.boardNo = b.boardNo) commentCnt 
            FROM board b 
            LEFT OUTER JOIN user u 
            ON b.userNo = u.userNo 
            where u.nickname = ?
            ORDER BY b.rgstrDate DESC
            `, [userNickname]);
        rows.length > 0 ? res.status(200).send(rows) : res.status(400).send("fail");
    } catch (e) {
        console.error(e);
    }
})

app.post("/idCheck", async (req, res) => {
    const { id } = req.body;

    const [rows] = await mysql.query("SELECT EXISTS (SELECT * FROM user WHERE id = ?) as cnt", [id]);

    rows[0].cnt === 1 ? res.send("no") : res.send("yes");
})

app.post("/nicknameCheck", async (req, res) => {
    const { nickname } = req.body;

    const [rows] = await mysql.query("SELECT EXISTS (SELECT * FROM user WHERE nickname = ?) as cnt", [nickname]);

    rows[0].cnt === 1 ? res.send("no") : res.send("yes");
})

app.post("/loginToken", async (req, res) => {
    try {
        const { welogJWT } = req.body;
        const user = await jwt.verify(welogJWT, "welogJWT");
        res.send(user);
    } catch (e) {
        console.error(e);
    }
})

app.post("/boardCommentDelete", async (req, res) => {
    try {
        const { boardNo, commentNo } = req.body;
        const [rows] = await mysql.query("DELETE FROM comment WHERE boardNo = ? AND commentNo = ?", [boardNo, commentNo]);

        res.status(200).send("success");
    } catch (e) {
        res.status(400).send("fail");
        console.error(e);
    }
})

app.post("/boardCommentAdd", async (req, res) => {
    try {
        const { boardNo, boardCommentAdd, userNo } = req.body;
        const [rows] = await mysql.query(`
        INSERT INTO
        comment(boardNo, userNo, contents, rgstrDate)   
        VALUES(?, ?, ?, now())
        `, [boardNo, userNo, boardCommentAdd]);

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
        SELECT c.commentNo, c.boardNo, c.userNo, c.contents, c.rgstrDate, u.nickname, u.imgUrl 
        FROM comment c 
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

app.post("/boardDelete", async (req, res) => {
    try {
        const { boardNo } = req.body;
        const [rows] = await mysql.query("DELETE FROM board WHERE boardNo = ?", [boardNo]);

        res.status(200).send("success");
    } catch (e) {
        res.status(400).send("fail");
        console.error(e);
    }
})

app.post("/boardDetail", async (req, res) => {
    try {
        const { boardNo } = req.body;
        const [rows] = await mysql.query(`
        SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, b.updateDate, 
        u.nickname, u.imgUrl 
        FROM board b 
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

app.post("/boardUpdate", async (req, res) => {
    try {
        const { title, contents, boardNo, userNo } = req.body;
        if (userNo === 0) {
            res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            UPDATE board 
            SET title = ?, contents = ?, updateDate = now() 
            WHERE boardNo = ? AND userNo = ?
            `, [title, contents, boardNo, userNo]);
            res.status(200).send("success");
        }
    } catch (e) {
        res.status(400).send("fail");
        console.error(e);
    }
})

app.post("/boardAdd", async (req, res) => {
    try {
        const { title, contents, userNo } = req.body;
        if (userNo === 0) {
            res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            INSERT INTO
            board(userNo, title, contents, rgstrDate)
            VALUES(?, ?, ?, now())
            `, [userNo, title, contents]);
            res.status(200).send("success");
        }
    } catch (e) {
        res.status(400).send("fail");
        console.error(e);
    }
})

app.get("/board", async (req, res) => {
    try {
        const [rows] = await mysql.query(`
        SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, u.nickname, u.imgUrl, 
        (SELECT count(*) FROM comment c WHERE c.boardNo = b.boardNo) commentCnt 
        FROM board b 
        LEFT OUTER JOIN user u 
        ON b.userNo = u.userNo 
        ORDER BY b.rgstrDate DESC
        `);
        rows.length > 0 ? res.status(200).send(rows) : res.status(400).send("fail");
    } catch (e) {
        console.error(e);
    }
})

app.post("/signUp", imageUpload.array('thumbnail'), async (req, res) => {
    try {
        const { nickname, id, pw } = req.body;
        const [rows] = await mysql.query(`
        INSERT INTO 
        user(id, password, nickname, imgUrl) 
        VALUES(?, ?, ?, ?)
        `, [id, pw, nickname, imageName]);
        res.status(200).send("success");
        imageName = [];
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
            const user = [{ userNo: rows[0].userNo, id: rows[0].id, nickname: rows[0].nickname, imgUrl: rows[0].imgUrl }];
            const token = await jwt.sign(
                {
                    type: "JWT",
                    userNo: rows[0].userNo,
                    id: rows[0].id,
                    nickname: rows[0].nickname,
                    imgUrl: rows[0].imgUrl
                },
                "welogJWT",
                {
                    expiresIn: "30d",
                    issuer: "test"
                }
            );

            res.status(200).send({ user, token });
        } else {
            res.status(200).send("no");
        }
    } catch (e) {
        res.status(400).send("fail");
        console.error(e);
    }
})

app.listen(port, () => {
    console.log(port + " port listening on!!");
})