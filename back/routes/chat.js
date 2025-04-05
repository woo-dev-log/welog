const express = require('express');
const router = express.Router();
const mysql = require('../mysql');
const chatService = require('../controllers/chatService');

// 채팅 목록 조회
router.post('/chatList', async (req, res) => {
    try {
        const { userNo } = req.body;
        return res.status(200).send(await chatService.getChatList(mysql, userNo));
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 채팅 사용자 정보 조회
router.post('/chatUserInfo', async (req, res) => {
    try {
        const { userNo } = req.body;
        return res.status(200).send(await chatService.getChatUserInfo(mysql, userNo));
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

// 채팅 알림 상태 조회
router.post('/statusChat', async (req, res) => {
    try {
        const { userNo } = req.body;
        return res.status(200).send(await chatService.getChatStatus(mysql, userNo));
    } catch (e) {
        console.error(e);
        return res.status(400).send("fail");
    }
});

module.exports = router; 