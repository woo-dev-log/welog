const express = require('express');
const router = express.Router();
const mysql = require('../mysql');

// 알림 목록 조회
router.post('/statusAlram', async (req, res) => {
    try {
        const { userNo } = req.body;

        const [rows] = await mysql.query(`
            SELECT *, (SELECT COUNT(*) FROM notification WHERE readStatus = 0 AND userNo != ? AND toUserNo = ?) as unreadCount 
            FROM notification n 
            LEFT JOIN board b ON n.boardNo = b.boardNo 
            LEFT JOIN user u ON n.userNo = u.userNo 
            WHERE n.userNo != ? AND n.toUserNo = ?
            ORDER BY n.sendDate DESC;
        `, [userNo, userNo, userNo, userNo]);

        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 알림 읽음 처리
router.post('/statusUpdateAlram', async (req, res) => {
    try {
        const { alramNo } = req.body;

        const [rows] = await mysql.query(`
            UPDATE notification SET readStatus = 1 WHERE notificationNo = ?
        `, [alramNo]);
        return res.status(200).send(rows);
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

module.exports = router; 