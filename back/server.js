const express = require('express');
const app = express();
const port = process.env.PORT || 3690;
const mysql = require('./mysql');
const jwt = require("jsonwebtoken");
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const cors = require('cors');
const { S3, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const awsConfig = require('./s3.json');
const s3 = new S3(awsConfig);
const http = require('http');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./dist")));

const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*"
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join room', async ({ roomNumber, fromUserNo }) => {
        console.log(roomNumber + ' user connected');
        socket.join(roomNumber);

        await mysql.query(`
            UPDATE chat SET readStatus = 1 
            WHERE roomNo = ? AND toUserNo = ?
        `, [roomNumber, fromUserNo]);

        const [rows] = await mysql.query(`
            SELECT chat.*, user.id, user.nickname, user.imgUrl 
            FROM chat 
            LEFT JOIN user ON chat.userNo = user.userNo
            WHERE chat.roomNo = ? 
            ORDER BY chat.sendDate
        `, [roomNumber]);

        io.to(roomNumber).emit('join room', rows);
    });

    socket.on('private message', async ({ message, roomNo, user, toUserNo }) => {
        try {
            const nowDate = new Date();
            const userInfo = user[0];

            const [rows] = await mysql.query(`
            INSERT INTO
            chat(roomNo, userNo, toUserNo, message, sendDate) 
            VALUES(?, ?, ?, ?, ?)
            `, [roomNo, userInfo.userNo, toUserNo, message, nowDate]);

            io.to(roomNo).emit('private message', {
                chatNo: rows.insertId,
                roomNo,
                toUserNo,
                message,
                userNo: userInfo.userNo,
                id: userInfo.id,
                nickname: userInfo.nickname,
                imgUrl: userInfo.imgUrl,
                sendDate: nowDate, readStatus: 0
            });
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('read message', async ({ roomNumber, chatNo }) => {
        await mysql.query(`
            UPDATE chat SET readStatus = 1 
            WHERE chatNo = ?
        `, [chatNo]);

        io.to(roomNumber).emit('read message', { chatNo, readStatus: 1 });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const imageUpload = multer({
    storage: multer.memoryStorage()
});

const resizeHandler = async (file) => {
    try {
        let newFilePath = new Date().valueOf() + '_' + Buffer.from(file.originalname, 'latin1').toString('utf8');
        let outputBuffer = file.buffer;
        const extension = file.originalname.split('.').reverse()[0];

        const { width } = await sharp(outputBuffer).metadata();
        if (width > 500 && extension !== "gif") {
            newFilePath = newFilePath.replace(`.${extension}`, '.webp');
            outputBuffer = await sharp(outputBuffer).resize({ width: 800 }).webp().toBuffer();
        }

        await s3.send(new PutObjectCommand({
            Bucket: 'welog-seoul',
            Key: newFilePath,
            Body: outputBuffer,
            ContentType: `image/${extension}`,
            ACL: 'public-read'
        }));

        return newFilePath;
    } catch (err) {
        console.error(err);
    }
}

const jsonWebToken = async (userRows) => {
    const user = [{ userNo: userRows[0].userNo, id: userRows[0].id, nickname: userRows[0].nickname, imgUrl: userRows[0].imgUrl }];
    const token = await jwt.sign(
        {
            type: "JWT",
            userNo: userRows[0].userNo,
            id: userRows[0].id,
            nickname: userRows[0].nickname,
            imgUrl: userRows[0].imgUrl
        },
        "welogJWT"
    );

    return { user, token };
}

app.post("/api/chatList", async (req, res) => {
    try {
        const { userNo } = req.body;

        const [rows] = await mysql.query(`
            SELECT c.*, u.*
            FROM (
                SELECT MAX(chatNo) as maxChatNo, userNo
                FROM chat 
                WHERE toUserNo = ? 
                GROUP BY userNo
            ) as latestChats
            JOIN chat c ON c.chatNo = latestChats.maxChatNo
            LEFT JOIN user u ON c.userNo = u.userNo;
        `, [userNo]);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

app.post("/api/chatUserInfo", async (req, res) => {
    try {
        const { userNo } = req.body;
        const [rows] = await mysql.query(`
            SELECT userNo, id, nickname, imgUrl, profileContents 
            FROM user 
            WHERE userNo = ?
        `, [userNo]);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

app.post("/api/updateUserProfile", imageUpload.single('userProfileImg'), async (req, res) => {
    try {
        const { userNo, updateProfileName, updateProfileContents, profileImgUrl } = req.body;

        let newFilePath = profileImgUrl;
        if (req.file) {
            newFilePath = await resizeHandler(req.file);
        }

        const [rows] = await mysql.query(`
        UPDATE user SET nickname = ?, imgUrl = ?, profileContents = ? WHERE userNo = ?
        `, [updateProfileName, newFilePath, updateProfileContents, userNo]);

        const [userRows] = await mysql.query(`SELECT * FROM user WHERE userNo = ?`, [userNo]);
        return res.status(200).send(await jsonWebToken(userRows));
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/userComment", async (req, res) => {
    try {
        const { userNo, page } = req.body;
        const pageNum = page * 5 - 5;

        const [rows] = await mysql.query(`
            SELECT * 
            FROM comment 
            WHERE userNo = ? 
            ORDER BY rgstrDate DESC 
            LIMIT ?, 5
            `, [userNo, pageNum]);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/userProfile", async (req, res) => {
    try {
        const { userNickname } = req.body;
        const [rows] = await mysql.query(`
            SELECT u.userNo, u.nickname, u.imgUrl, u.profileContents, 
            COUNT(DISTINCT b.boardNo) AS userBoardCnt, COUNT(DISTINCT c.commentNo) AS userCommentCnt 
            FROM user u 
            LEFT JOIN board b ON u.userNo = b.userNo
            LEFT JOIN comment c ON u.userNo = c.userNo
            WHERE u.nickname = ?
            GROUP BY u.userNo, u.nickname, u.imgUrl, u.profileContents
            `, [userNickname]);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/userBoard", async (req, res) => {
    try {
        const { userNickname, page, sortBy } = req.body;
        const pageNum = page * 5 - 5;
        const sort = sortBy === 'commentCnt' ? sortBy : "b." + sortBy;

        const [rows] = await mysql.query(`
            SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, b.views, 
            b.tags, b.boardImgUrl, u.nickname, u.imgUrl, 
            COUNT(*) OVER() AS boardCnt, 
            (SELECT count(*) FROM comment c WHERE c.boardNo = b.boardNo) commentCnt 
            FROM board b 
            INNER JOIN user u 
            ON b.userNo = u.userNo 
            where u.nickname = ? 
            ORDER BY ${sort} DESC
            LIMIT ?, 5
            `, [userNickname, pageNum]);

        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/checkSignUpId", async (req, res) => {
    const { id } = req.body;

    const [rows] = await mysql.query("SELECT EXISTS (SELECT * FROM user WHERE id = ?) as cnt", [id]);

    return rows[0].cnt === 1 ? res.send("no") : res.send("yes");
})

app.post("/api/checkSignUpNickname", async (req, res) => {
    const { nickname } = req.body;

    const [rows] = await mysql.query("SELECT EXISTS (SELECT * FROM user WHERE nickname = ?) as cnt", [nickname]);

    return rows[0].cnt === 1 ? res.send("no") : res.send("yes");
})

app.post("/api/loginToken", async (req, res) => {
    try {
        const { welogJWT } = req.body;
        const user = await jwt.verify(welogJWT, "welogJWT");
        return res.send(user);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/writeBoardSubComment", async (req, res) => {
    try {
        const { boardNo, commentNo, boardSubCommentAdd, userNo, lockState } = req.body;
        if (userNo === 0) {
            return res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            INSERT INTO
            comment(boardNo, parentCommentNo, userNo, contents, rgstrDate, lockState)   
            VALUES(?, ?, ?, ?, now(), ?)
            `, [boardNo, commentNo, userNo, boardSubCommentAdd, lockState]);

            return res.status(200).send("success");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/deleteBoardComment", async (req, res) => {
    try {
        const { boardNo, commentNo } = req.body;
        const [rows] = await mysql.query("DELETE FROM comment WHERE boardNo = ? AND commentNo = ?", [boardNo, commentNo]);

        return res.status(200).send("success");
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/updateBoardComment", async (req, res) => {
    try {
        const { boardNo, boardCommentUpdate, userNo, commentNo } = req.body;
        if (userNo === 0) {
            return res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            UPDATE comment 
            SET contents = ?, updateDate = now(), lockState = ? 
            WHERE boardNo = ? AND userNo = ? AND commentNo = ?
            `, [boardCommentUpdate, boardNo, userNo, commentNo]);

            return res.status(200).send("success");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/writeBoardComment", async (req, res) => {
    try {
        const { boardNo, boardCommentAdd, userNo, lockState } = req.body;
        if (userNo === 0) {
            return res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            INSERT INTO
            comment(boardNo, userNo, contents, rgstrDate, lockState)   
            VALUES(?, ?, ?, now(), ?)
            `, [boardNo, userNo, boardCommentAdd, lockState]);

            return res.status(200).send("success");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/boardComment", async (req, res) => {
    try {
        const { boardNo, page } = req.body;
        const pageNum = page * 5 - 5;

        const [commentRows] = await mysql.query(`
        SELECT c.commentNo, c.boardNo, c.parentCommentNo, c.userNo, c.contents, c.rgstrDate, c.updateDate, c.lockState, 
        u.nickname, u.imgUrl, COUNT(*) OVER() AS boardCommentCnt 
        FROM comment c 
        INNER JOIN user u
        ON c.userNo = u.userNo
        WHERE boardNo = ? AND parentCommentNo = 0 
        ORDER BY rgstrDate DESC 
        LIMIT ?, 5
        `, [boardNo, pageNum]);

        const [subCommentRows] = await mysql.query(`
        SELECT c.commentNo, c.boardNo, c.parentCommentNo, c.userNo, c.contents, c.rgstrDate, c.updateDate, c.lockState, 
        u.nickname, u.imgUrl, COUNT(*) OVER() AS boardCommentCnt 
        FROM comment c 
        INNER JOIN user u
        ON c.userNo = u.userNo
        WHERE boardNo = ? AND parentCommentNo != 0
        `, [boardNo]);

        rows = { commentRows, subCommentRows };
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/deleteBoard", async (req, res) => {
    try {
        const { boardNo } = req.body;
        const [rows] = await mysql.query("SELECT boardImgUrl FROM board WHERE boardNo = ?", [boardNo]);
        await mysql.query("DELETE FROM board WHERE boardNo = ?", [boardNo]);
        await mysql.query("DELETE FROM comment WHERE boardNo = ?", [boardNo]);

        if (rows[0].boardImgUrl !== "React.png") {
            await s3.send(new DeleteObjectCommand({
                Bucket: 'welog-seoul',
                Key: rows[0].boardImgUrl
            }));
        }

        return res.status(200).send("success");
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/updateBoard", imageUpload.single('thumbnail'), async (req, res) => {
    try {
        const { title, contents, boardNo, userNo, tags, boardImgUrl, boardType } = req.body;

        let newFilePath = boardImgUrl;
        if (req.file) {
            newFilePath = await resizeHandler(req.file);
        }

        if (userNo === 0) {
            return res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            UPDATE board 
            SET title = ?, contents = ?, updateDate = now(), 
            tags = ?, boardImgUrl = ?, boardType = ? 
            WHERE boardNo = ? AND userNo = ?
            `, [title, contents, tags, newFilePath, boardType, boardNo, userNo]);
            return res.status(200).send("success");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/writeBoardImg", imageUpload.single('boardImg'), async (req, res) => {
    try {
        let newFilePath;
        if (req.file) {
            newFilePath = await resizeHandler(req.file);
        }

        return res.status(200).send({ fileName: newFilePath });
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/writeBoard", imageUpload.single('thumbnail'), async (req, res) => {
    try {
        const { title, contents, userNo, tags, boardType } = req.body;

        let newFilePath = "React.png";
        if (req.file) {
            newFilePath = await resizeHandler(req.file);
        }

        if (userNo === 0) {
            return res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            INSERT INTO
            board(userNo, title, contents, rgstrDate, tags, boardImgUrl, boardType)
            VALUES(?, ?, ?, now(), ?, ?, ?)
            `, [userNo, title, contents, tags, newFilePath, boardType]);
            return res.status(200).send("success");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/boardViews", async (req, res) => {
    try {
        const { boardNo, views } = req.body;
        const [rows] = await mysql.query("UPDATE board SET views = ? WHERE boardNo = ?", [views, boardNo]);

        return res.status(200).send("success");
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/boardDetail", async (req, res) => {
    try {
        const { boardNo } = req.body;
        const [rows] = await mysql.query(`
        SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, b.updateDate, 
        b.views, b.tags, b.boardImgUrl, b.boardType, 
        u.nickname, u.imgUrl 
        FROM board b 
        INNER JOIN user u 
        ON b.userNo = u.userNo 
        WHERE b.boardNo = ?
        `, [boardNo]);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.get("/api/boardDaily", async (req, res) => {
    try {
        const [rows] = await mysql.query(`
        SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, 
        b.views, b.tags, b.boardImgUrl, u.nickname, u.imgUrl, 
        (SELECT count(*) FROM comment c WHERE c.boardNo = b.boardNo) commentCnt, 
        COUNT(*) AS weekCommentCnt 
        FROM board b 
        INNER JOIN comment c ON b.boardNo = c.boardNo 
        INNER JOIN user u ON u.userNo = b.userNo 
        WHERE c.rgstrDate BETWEEN DATE_SUB(NOW(), INTERVAL 1 WEEK) AND NOW() 
        GROUP BY c.boardNo  
        ORDER BY weekCommentCnt DESC
        LIMIT 5;
        `);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/boardSearch", async (req, res) => {
    try {
        const { search, page, sortBy } = req.body;
        const pageNum = page * 5 - 5;
        const value = "%" + search + "%";
        const sort = sortBy === 'commentCnt' ? sortBy : "b." + sortBy;

        const [rows] = await mysql.query(`
            SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, 
            b.views, b.tags, b.boardImgUrl, u.nickname, u.imgUrl, 
            COUNT(*) OVER() AS boardCnt, 
            (SELECT count(*) FROM comment c WHERE c.boardNo = b.boardNo) commentCnt 
            FROM board b 
            INNER JOIN user u 
            ON b.userNo = u.userNo 
            WHERE b.title LIKE ? OR b.contents LIKE ? OR u.nickname LIKE ? OR b.tags LIKE ?
            ORDER BY ${sort} DESC
            LIMIT ?, 5
            `, [value, value, value, value, pageNum]);

        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/board", async (req, res) => {
    try {
        const { page, boardType, sortBy } = req.body;
        const pageNum = page * 5 - 5;
        const sort = sortBy === 'commentCnt' ? sortBy : "b." + sortBy;

        const [rows] = await mysql.query(`
        SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, b.boardType, 
        b.views, b.tags, b.boardImgUrl, u.nickname, u.imgUrl, 
        COUNT(*) OVER() AS boardCnt, 
        (SELECT count(*) FROM comment c WHERE c.boardNo = b.boardNo) AS commentCnt 
        FROM board b 
        INNER JOIN user u 
        ON b.userNo = u.userNo
        WHERE b.boardType = ? 
        ORDER BY ${sort} DESC
        LIMIT ?, 5
        `, [boardType, pageNum]);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/signUp", imageUpload.single('thumbnail'), async (req, res) => {
    try {
        const { nickname, id, pw } = req.body;

        let newFilePath = "loopy.png";
        if (req.file) {
            newFilePath = await resizeHandler(req.file);
        }

        const [rows] = await mysql.query(`
        INSERT INTO 
        user(id, password, nickname, imgUrl) 
        VALUES(?, ?, ?, ?)
        `, [id, pw, nickname, newFilePath]);

        return res.status(200).send("success");
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/signIn", async (req, res) => {
    try {
        const { id, pw } = req.body;
        const [rows] = await mysql.query(`
        SELECT * FROM user WHERE id = ? AND password = ?
        `, [id, pw]);

        if (rows.length > 0) {
            return res.status(200).send(await jsonWebToken(rows));
        } else {
            return res.status(200).send("no");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, './dist', 'index.html'));
});

server.listen(port, () => {
    console.log(port + " port listening on!!");
})