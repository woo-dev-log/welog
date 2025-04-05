const jwt = require('jsonwebtoken');

const JWT_SECRET = 'welogJWT';

/**
 * JWT 토큰을 생성하는 함수
 * @param {Array} userRows - 사용자 정보가 담긴 배열
 * @returns {object} 사용자 정보와 JWT 토큰을 담은 객체
 */
const generateToken = async (userRows) => {
    const user = [{ 
        userNo: userRows[0].userNo, 
        id: userRows[0].id, 
        nickname: userRows[0].nickname, 
        imgUrl: userRows[0].imgUrl 
    }];
    
    const token = await jwt.sign(
        {
            type: "JWT",
            userNo: userRows[0].userNo,
            id: userRows[0].id,
            nickname: userRows[0].nickname,
            imgUrl: userRows[0].imgUrl
        },
        JWT_SECRET
    );

    return { user, token };
};

/**
 * JWT 토큰을 검증하는 함수
 * @param {string} token - JWT 토큰
 * @returns {object} 디코딩된 사용자 정보
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        console.error('토큰 검증 실패:', e);
        throw new Error('유효하지 않은 토큰입니다.');
    }
};

module.exports = {
    generateToken,
    verifyToken
}; 