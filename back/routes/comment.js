const express = require('express');
const router = express.Router();
const mysql = require('../mysql');

// 게시물 댓글 조회
router.post('/boardComment', async (req, res) => {
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
});

// 게시물 댓글 작성
router.post('/writeBoardComment', async (req, res) => {
    try {
        const { boardNo, boardCommentAdd, userNo, toUserNo, lockState } = req.body;
        if (userNo === 0) {
            return res.status(400).send("fail");
        } else {
            const [rows] = await mysql.query(`
            INSERT INTO
            comment(boardNo, userNo, contents, rgstrDate, lockState)   
            VALUES(?, ?, ?, now(), ?)
            `, [boardNo, userNo, boardCommentAdd, lockState]);

            await mysql.query(`
            INSERT INTO
            notification(boardNo, userNo, toUserNo, contents, sendDate)   
            VALUES(?, ?, ?, ?, now())
            `, [boardNo, userNo, toUserNo, boardCommentAdd]);

            return res.status(200).send("success");
        }
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 게시물 댓글 수정
router.post('/updateBoardComment', async (req, res) => {
    try {
        const { boardNo, boardCommentUpdate, userNo, commentNo, lockState } = req.body;
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
});

// 게시물 댓글 삭제
router.post('/deleteBoardComment', async (req, res) => {
    try {
        const { boardNo, commentNo } = req.body;
        const [rows] = await mysql.query("DELETE FROM comment WHERE boardNo = ? AND commentNo = ?", [boardNo, commentNo]);

        return res.status(200).send("success");
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 게시물 대댓글 작성
router.post('/writeBoardSubComment', async (req, res) => {
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
});

module.exports = router; 