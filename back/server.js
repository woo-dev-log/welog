const express = require('express');
const app = express();
const port = process.env.PORT || 3690;
const mysql = require('./mysql');
const jwt = require("jsonwebtoken");
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credential: 'true'
// }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/images', express.static('images'));
app.use(express.static(path.join(__dirname, "./dist")));

let imageName = [];
const imageUpload = multer({
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

// const resizeHandler = async (file, newPath, imageName) => {
const resizeHandler = async (file, imageName) => {
    // if (file.size <= 500 * 1024) {
    //     await sharp(file.path).toFile("./images/" + newPath);
    // } else {
    //     if (file.originalname.split(".").reverse()[0] === "png") {
    //         await sharp(file.path).resize({ width: 500 }).png({ quality: 80 }).toFile("./images/" + newPath);
    //     } else {
    //         await sharp(file.path).resize({ width: 500 }).jpeg({ quality: 80 }).toFile("./images/" + newPath);
    //     }
    // }
    const newFilePath = new Date().valueOf() + '_' + Buffer.from(file.originalname, 'latin1').toString('utf8');

    const { width } = await sharp(file.path).metadata();
    if (width > 500 && newFilePath.split(".").reverse()[0] !== "gif") {
        const rename = newFilePath.slice(0, newFilePath.lastIndexOf(".")) + ".webp";
        await sharp(file.path).resize({ width: 800 }).webp().toFile("./images/" + rename);

        fs.unlink("./images/" + imageName, (err) => {
            if (err) {
                return console.error(err);
            }
        });

        return rename;
    }
    return newFilePath;
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

app.post("/api/updateUserProfile", imageUpload.single('userProfileImg'), async (req, res) => {
    try {
        const { userNo, updateProfileName, updateProfileContents, profileImgUrl } = req.body;

        let newFilePath = imageName.length > 0 ? imageName : profileImgUrl;
        if (req.file) {
            newFilePath = await resizeHandler(req.file, imageName);
        }

        imageName = [];
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
        const { userNickname, page } = req.body;
        const pageNum = page * 5 - 5;

        const [rows] = await mysql.query(`
            SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, b.views, 
            b.tags, b.boardImgUrl, u.nickname, u.imgUrl, 
            COUNT(*) OVER() AS boardCnt, 
            (SELECT count(*) FROM comment c WHERE c.boardNo = b.boardNo) commentCnt 
            FROM board b 
            INNER JOIN user u 
            ON b.userNo = u.userNo 
            where u.nickname = ? 
            ORDER BY b.rgstrDate DESC
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
        const { boardNo, commentNo, boardSubCommentAdd, userNo } = req.body;
        if (userNo === 0) {
            return res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            INSERT INTO
            comment(boardNo, parentCommentNo, userNo, contents, rgstrDate)   
            VALUES(?, ?, ?, ?, now())
            `, [boardNo, commentNo, userNo, boardSubCommentAdd]);

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
            SET contents = ?, updateDate = now() 
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
        const { boardNo, boardCommentAdd, userNo } = req.body;
        if (userNo === 0) {
            return res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            INSERT INTO
            comment(boardNo, userNo, contents, rgstrDate)   
            VALUES(?, ?, ?, now())
            `, [boardNo, userNo, boardCommentAdd]);

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
        SELECT c.commentNo, c.boardNo, c.parentCommentNo, c.userNo, c.contents, c.rgstrDate, c.updateDate, 
        u.nickname, u.imgUrl, COUNT(*) OVER() AS boardCommentCnt 
        FROM comment c 
        INNER JOIN user u
        ON c.userNo = u.userNo
        WHERE boardNo = ? AND parentCommentNo = 0 
        ORDER BY rgstrDate DESC 
        LIMIT ?, 5
        `, [boardNo, pageNum]);

        const [subCommentRows] = await mysql.query(`
        SELECT c.commentNo, c.boardNo, c.parentCommentNo, c.userNo, c.contents, c.rgstrDate, c.updateDate, 
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
            fs.unlink("./images/" + rows[0].boardImgUrl, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send("fail");
                }
            });
        }

        return res.status(200).send("success");
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/updateBoard", imageUpload.single('thumbnail'), async (req, res) => {
    try {
        const { title, contents, boardNo, userNo, tags, boardImgUrl } = req.body;

        let newFilePath = imageName.length > 0 ? imageName : boardImgUrl;
        if (req.file) {
            newFilePath = await resizeHandler(req.file, imageName);
        }

        imageName = [];
        if (userNo === 0) {
            return res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            UPDATE board 
            SET title = ?, contents = ?, updateDate = now(), 
            tags = ?, boardImgUrl = ?
            WHERE boardNo = ? AND userNo = ?
            `, [title, contents, tags, newFilePath, boardNo, userNo]);
            return res.status(200).send("success");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/writeBoardImg", imageUpload.single('boardImg'), async (req, res) => {
    try {
        let newFilePath = imageName;
        if (req.file) {
            newFilePath = await resizeHandler(req.file, imageName);
        }

        imageName = [];
        return res.status(200).send({ fileName: newFilePath });
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/writeBoard", imageUpload.single('thumbnail'), async (req, res) => {
    try {
        const { title, contents, userNo, tags, boardType } = req.body;

        let newFilePath = imageName.length > 0 ? imageName : "React.png";
        if (req.file) {
            newFilePath = await resizeHandler(req.file, imageName);
        }

        imageName = [];
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
        const { search, page } = req.body;
        const pageNum = page * 5 - 5;
        const value = "%" + search + "%";

        const [rows] = await mysql.query(`
            SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, 
            b.views, b.tags, b.boardImgUrl, u.nickname, u.imgUrl, 
            COUNT(*) OVER() AS boardCnt, 
            (SELECT count(*) FROM comment c WHERE c.boardNo = b.boardNo) commentCnt 
            FROM board b 
            INNER JOIN user u 
            ON b.userNo = u.userNo 
            WHERE b.title LIKE ? OR b.contents LIKE ? OR u.nickname LIKE ?
            ORDER BY b.rgstrDate DESC
            LIMIT ?, 5
            `, [value, value, value, pageNum]);

        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/api/board", async (req, res) => {
    try {
        const { page, boardType } = req.body;
        const pageNum = page * 5 - 5;

        const [rows] = await mysql.query(`
        SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, b.boardType, 
        b.views, b.tags, b.boardImgUrl, u.nickname, u.imgUrl, 
        COUNT(*) OVER() AS boardCnt, 
        (SELECT count(*) FROM comment c WHERE c.boardNo = b.boardNo) AS commentCnt 
        FROM board b 
        INNER JOIN user u 
        ON b.userNo = u.userNo
        WHERE b.boardType = ? 
        ORDER BY b.rgstrDate DESC
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

        let newFilePath = imageName.length > 0 ? imageName : "loopy.png";
        if (req.file) {
            newFilePath = await resizeHandler(req.file, imageName);
        }

        const [rows] = await mysql.query(`
        INSERT INTO 
        user(id, password, nickname, imgUrl) 
        VALUES(?, ?, ?, ?)
        `, [id, pw, nickname, newFilePath]);

        imageName = [];
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

app.listen(port, () => {
    console.log(port + " port listening on!!");
})