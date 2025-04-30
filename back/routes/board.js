const express = require('express');
const router = express.Router();
const mysql = require('../mysql');
const { imageUpload } = require('../middlewares');
const { resizeAndUploadImage, deleteImage } = require('../utils/imageUtils');

// 게시판 목록 조회
router.post('/board', async (req, res) => {
    try {
        const { page, boardType, sortBy } = req.body;
        const pageNum = (page - 1) * 6;
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
        LIMIT ?, 6
        `, [boardType, pageNum]);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 게시판 검색
router.post('/boardSearch', async (req, res) => {
    try {
        const { search, page, sortBy } = req.body;
        const pageNum = (page - 1) * 6;
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
            LIMIT ?, 6
            `, [value, value, value, value, pageNum]);

        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 게시물 상세 조회
router.post('/boardDetail', async (req, res) => {
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
});

// 게시물 조회수 업데이트
router.post('/boardViews', async (req, res) => {
    try {
        const { boardNo, views } = req.body;
        const [rows] = await mysql.query("UPDATE board SET views = ? WHERE boardNo = ?", [views, boardNo]);

        return res.status(200).send("success");
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 게시물 작성
router.post('/writeBoard', imageUpload.single('thumbnail'), async (req, res) => {
    try {
        const { title, contents, userNo, tags, boardType } = req.body;

        let newFilePath = "React.png";
        if (req.file) {
            newFilePath = await resizeAndUploadImage(req.file);
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
});

// 게시물 이미지 업로드
router.post('/writeBoardImg', imageUpload.single('boardImg'), async (req, res) => {
    try {
        let newFilePath;
        if (req.file) {
            newFilePath = await resizeAndUploadImage(req.file);
        }

        return res.status(200).send({ fileName: newFilePath });
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 게시물 수정
router.post('/updateBoard', imageUpload.single('thumbnail'), async (req, res) => {
    try {
        const { title, contents, boardNo, userNo, tags, boardImgUrl, boardType } = req.body;

        let newFilePath = boardImgUrl;
        if (req.file) {
            newFilePath = await resizeAndUploadImage(req.file);
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
});

// 게시물 삭제
router.post('/deleteBoard', async (req, res) => {
    try {
        const { boardNo } = req.body;
        const [rows] = await mysql.query("SELECT boardImgUrl FROM board WHERE boardNo = ?", [boardNo]);
        await mysql.query("DELETE FROM board WHERE boardNo = ?", [boardNo]);
        await mysql.query("DELETE FROM comment WHERE boardNo = ?", [boardNo]);

        if (rows[0].boardImgUrl !== "React.png") {
            await deleteImage(rows[0].boardImgUrl);
        }

        return res.status(200).send("success");
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 사용자 게시물 조회
router.post('/userBoard', async (req, res) => {
    try {
        const { userNickname, page, sortBy } = req.body;
        const pageNum = (page - 1) * 6;
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
            LIMIT ?, 6
            `, [userNickname, pageNum]);

        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

module.exports = router; 