const express = require('express');
const router = express.Router();
const mysql = require('../mysql');
const { imageUpload } = require('../middlewares');
const { resizeAndUploadImage } = require('../utils/imageUtils');
const { generateToken, verifyToken } = require('../utils/authUtils');

// 사용자 목록 조회
router.get('/userList', async (req, res) => {
    try {
        const [rows] = await mysql.query("SELECT imgUrl, nickname, userNo, profileContents FROM user");
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 사용자 프로필 정보 조회
router.post('/userProfile', async (req, res) => {
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
});

// 사용자 프로필 업데이트
router.post('/updateUserProfile', imageUpload.single('userProfileImg'), async (req, res) => {
    try {
        const { userNo, updateProfileName, updateProfileContents, profileImgUrl } = req.body;

        let newFilePath = profileImgUrl;
        if (req.file) {
            newFilePath = await resizeAndUploadImage(req.file);
        }

        const [rows] = await mysql.query(`
        UPDATE user SET nickname = ?, imgUrl = ?, profileContents = ? WHERE userNo = ?
        `, [updateProfileName, newFilePath, updateProfileContents, userNo]);

        const [userRows] = await mysql.query(`SELECT * FROM user WHERE userNo = ?`, [userNo]);
        return res.status(200).send(await generateToken(userRows));
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 사용자 댓글 조회
router.post('/userComment', async (req, res) => {
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
});

// 회원가입 ID 체크
router.post('/checkSignUpId', async (req, res) => {
    const { id } = req.body;

    const [rows] = await mysql.query("SELECT EXISTS (SELECT * FROM user WHERE id = ?) as cnt", [id]);

    return rows[0].cnt === 1 ? res.send("no") : res.send("yes");
});

// 회원가입 닉네임 체크
router.post('/checkSignUpNickname', async (req, res) => {
    const { nickname } = req.body;

    const [rows] = await mysql.query("SELECT EXISTS (SELECT * FROM user WHERE nickname = ?) as cnt", [nickname]);

    return rows[0].cnt === 1 ? res.send("no") : res.send("yes");
});

// 로그인 토큰 검증
router.post('/loginToken', async (req, res) => {
    try {
        const { welogJWT } = req.body;
        const user = verifyToken(welogJWT);
        return res.send(user);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 회원가입
router.post('/signUp', imageUpload.single('thumbnail'), async (req, res) => {
    try {
        const { nickname, id, pw } = req.body;

        let newFilePath = "loopy.png";
        if (req.file) {
            newFilePath = await resizeAndUploadImage(req.file);
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
});

// 로그인
router.post('/signIn', async (req, res) => {
    try {
        const { id, pw } = req.body;
        const [rows] = await mysql.query(`
        SELECT * FROM user WHERE id = ? AND password = ?
        `, [id, pw]);

        if (rows.length > 0) {
            return res.status(200).send(await generateToken(rows));
        } else {
            return res.status(200).send("no");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

module.exports = router; 