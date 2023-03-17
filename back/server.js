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

const boardImgUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'images/boardImg/'),
        filename: (req, file, cb) => {
            const originalName = file.originalname.replace(" ", "");
            let fileName = new Date().valueOf() + '_' + Buffer.from(originalName, 'latin1').toString('utf8');
            cb(null, fileName);
            imageName.push(fileName);
        }
    })
});

app.post("/updateProfileContents", async (req, res) => {
    try {
        const { userNo, profileContents } = req.body;
        const [rows] = await mysql.query(`
            UPDATE user SET profileContents = ? WHERE userNo = ?
            `, [profileContents, userNo]);
        return res.status(200).send("success");
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/userComment", async (req, res) => {
    try {
        const { userNo, page } = req.body;
        const pageNum = page * 5 - 5;

        const [rows] = await mysql.query(`
            SELECT *
            FROM comment
            WHERE userNo = ?
            LIMIT ?, 5
            `, [userNo, pageNum]);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/userProfile", async (req, res) => {
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

app.post("/userBoard", async (req, res) => {
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

app.post("/checkSignUpId", async (req, res) => {
    const { id } = req.body;

    const [rows] = await mysql.query("SELECT EXISTS (SELECT * FROM user WHERE id = ?) as cnt", [id]);

    return rows[0].cnt === 1 ? res.send("no") : res.send("yes");
})

app.post("/checkSignUpNickname", async (req, res) => {
    const { nickname } = req.body;

    const [rows] = await mysql.query("SELECT EXISTS (SELECT * FROM user WHERE nickname = ?) as cnt", [nickname]);

    return rows[0].cnt === 1 ? res.send("no") : res.send("yes");
})

app.post("/loginToken", async (req, res) => {
    try {
        const { welogJWT } = req.body;
        const user = await jwt.verify(welogJWT, "welogJWT");
        return res.send(user);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/deleteBoardComment", async (req, res) => {
    try {
        const { boardNo, commentNo } = req.body;
        const [rows] = await mysql.query("DELETE FROM comment WHERE boardNo = ? AND commentNo = ?", [boardNo, commentNo]);

        return res.status(200).send("success");
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/updateBoardComment", async (req, res) => {
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

app.post("/writeBoardComment", async (req, res) => {
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

app.post("/boardComment", async (req, res) => {
    try {
        const { boardNo, page } = req.body;
        const pageNum = page * 5 - 5;

        const [rows] = await mysql.query(`
        SELECT c.commentNo, c.boardNo, c.userNo, c.contents, c.rgstrDate, c.updateDate, 
        u.nickname, u.imgUrl, COUNT(*) OVER() AS boardCommentCnt 
        FROM comment c 
        INNER JOIN user u
        ON c.userNo = u.userNo
        WHERE boardNo = ? 
        ORDER BY rgstrDate DESC
        LIMIT ?, 5;
        `, [boardNo, pageNum]);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/deleteBoard", async (req, res) => {
    try {
        const { boardNo } = req.body;
        const [rows] = await mysql.query("SELECT boardImgUrl FROM board WHERE boardNo = ?", [boardNo]);
        await mysql.query("DELETE FROM board WHERE boardNo = ?", [boardNo]);

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

app.post("/updateBoard", imageUpload.single('thumbnail'), async (req, res) => {
    try {
        const { title, contents, boardNo, userNo, tags, boardImgUrl } = req.body;

        let newFilePath = boardImgUrl;
        if (req.file) {
            let reImage = '';
            newFilePath = new Date().valueOf() + '_' + Buffer.from(req.file.originalname, 'latin1').toString('utf8');
            if (req.file.size <= 500 * 1024) {
                reImage = await sharp(req.file.path).toFile("./images/" + newFilePath);
            } else {
                if (req.file.originalname.split(".").reverse()[0] === "png") {
                    reImage = await sharp(req.file.path).resize({ width: 500 }).png({ quality: 80 }).toFile("./images/" + newFilePath);
                } else {
                    reImage = await sharp(req.file.path).resize({ width: 500 }).jpeg({ quality: 80 }).toFile("./images/" + newFilePath);
                }
            }

            fs.unlink("./images/" + imageName, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send("fail");
                }
            });
        }

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

app.post("/writeBoardImg", boardImgUpload.single('boardImg'), async (req, res) => {
    try {
        let newFilePath = imageName;
        if (req.file) {
            if (req.file.originalname.split(".").reverse()[0] === "gif") {
                imageName = [];
                return res.status(200).send({ fileName: newFilePath });
            }

            let reImage = '';
            newFilePath = new Date().valueOf() + '_' + Buffer.from(req.file.originalname, 'latin1').toString('utf8');
            if (req.file.size <= 500 * 1024) {
                reImage = await sharp(req.file.path).toFile("./images/boardImg/" + newFilePath);
            } else {
                if (req.file.originalname.split(".").reverse()[0] === "png") {
                    reImage = await sharp(req.file.path).resize({ width: 500 }).png({ quality: 80 }).toFile("./images/boardImg/" + newFilePath);
                } else {
                    reImage = await sharp(req.file.path).resize({ width: 500 }).jpeg({ quality: 80 }).toFile("./images/boardImg/" + newFilePath);
                }
            }

            fs.unlink("./images/boardImg/" + imageName, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send("fail");
                }
            });
        }

        imageName = [];
        return res.status(200).send({ fileName: newFilePath });
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/writeBoard", imageUpload.single('thumbnail'), async (req, res) => {
    try {
        const { title, contents, userNo, tags } = req.body;

        let newFilePath = "React.png";
        if (req.file) {
            let reImage = '';
            newFilePath = new Date().valueOf() + '_' + Buffer.from(req.file.originalname, 'latin1').toString('utf8');
            if (req.file.size <= 500 * 1024) {
                reImage = await sharp(req.file.path).toFile("./images/" + newFilePath);
            } else {
                if (req.file.originalname.split(".").reverse()[0] === "png") {
                    reImage = await sharp(req.file.path).resize({ width: 500 }).png({ quality: 80 }).toFile("./images/" + newFilePath);
                } else {
                    reImage = await sharp(req.file.path).resize({ width: 500 }).jpeg({ quality: 80 }).toFile("./images/" + newFilePath);
                }
            }

            fs.unlink("./images/" + imageName, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(400).send("fail");
                }
            });
        }

        imageName = [];
        if (userNo === 0) {
            return res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            INSERT INTO
            board(userNo, title, contents, rgstrDate, tags, boardImgUrl)
            VALUES(?, ?, ?, now(), ?, ?)
            `, [userNo, title, contents, tags, newFilePath]);
            return res.status(200).send("success");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/boardViews", async (req, res) => {
    try {
        const { boardNo, views } = req.body;
        const [rows] = await mysql.query("UPDATE board SET views = ? WHERE boardNo = ?", [views, boardNo]);

        return res.status(200).send("success");
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/boardDetail", async (req, res) => {
    try {
        const { boardNo } = req.body;
        const [rows] = await mysql.query(`
        SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, b.updateDate, 
        b.views, b.tags, b.boardImgUrl, 
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

app.get("/boardDaily", async (req, res) => {
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
        LIMIT 4;
        `);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/boardSearch", async (req, res) => {
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

app.post("/board", async (req, res) => {
    try {
        const { page } = req.body;
        const pageNum = page * 5 - 5;

        const [rows] = await mysql.query(`
        SELECT b.boardNo, b.userNo, b.title, b.contents, b.rgstrDate, 
        b.views, b.tags, b.boardImgUrl, u.nickname, u.imgUrl, 
        COUNT(*) OVER() AS boardCnt, 
        (SELECT count(*) FROM comment c WHERE c.boardNo = b.boardNo) AS commentCnt 
        FROM board b 
        INNER JOIN user u 
        ON b.userNo = u.userNo 
        ORDER BY b.rgstrDate DESC
        LIMIT ?, 5
        `, [pageNum]);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
})

app.post("/signUp", imageUpload.single('thumbnail'), async (req, res) => {
    try {
        const { nickname, id, pw } = req.body;

        let reImage = '';
        const newFilePath = new Date().valueOf() + '_' + Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        if (req.file.size <= 500 * 1024) {
            reImage = await sharp(req.file.path).toFile("./images/" + newFilePath);
        } else {
            if (req.file.originalname.split(".").reverse()[0] === "png") {
                reImage = await sharp(req.file.path).resize({ width: 500 }).png({ quality: 80 }).toFile("./images/" + newFilePath);
            } else {
                reImage = await sharp(req.file.path).resize({ width: 500 }).jpeg({ quality: 80 }).toFile("./images/" + newFilePath);
            }
        }

        fs.unlink("./images/" + imageName, (err) => {
            if (err) {
                console.error(err);
                return res.status(400).send("fail");
            }
        });

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

app.post("/signIn", async (req, res) => {
    try {
        const { id, pw } = req.body;
        const [rows] = await mysql.query(`
        SELECT * FROM user WHERE id = ? AND password = ?
        `, [id, pw]);

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

            return res.status(200).send({ user, token });
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