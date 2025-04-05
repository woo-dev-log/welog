const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const multer = require('multer');

// 이미지 업로드 설정
const imageUpload = multer({
    storage: multer.memoryStorage()
});

/**
 * Express 앱에 미들웨어를 설정하는 함수
 * @param {object} app - Express 앱 인스턴스
 */
const setupMiddlewares = (app) => {
    app.use(compression());
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, "../dist")));
};

module.exports = {
    setupMiddlewares,
    imageUpload
}; 