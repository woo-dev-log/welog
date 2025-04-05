/**
 * 사용자의 채팅 목록을 가져오는 함수
 * @param {object} mysql - MySQL 데이터베이스 연결 객체
 * @param {number} userNo - 사용자 번호
 * @returns {Array} 채팅 목록
 */
const getChatList = async (mysql, userNo) => {
    try {
        const [rows] = await mysql.query(`
            SELECT c.*, u.*
            FROM (
                SELECT chatNo
                FROM chat as outerChat
                WHERE FIND_IN_SET(?, roomUsers)
                AND chatNo = (
                    SELECT MAX(chatNo)
                    FROM chat
                    WHERE FIND_IN_SET(?, roomUsers) AND roomNo = outerChat.roomNo
                )
            ) AS latestChats
            JOIN chat c ON c.chatNo = latestChats.chatNo
            LEFT JOIN user u ON u.userNo = CASE WHEN c.userNo = ? THEN c.toUserNo ELSE c.userNo END
            ORDER BY c.chatNo DESC;
        `, [userNo, userNo, userNo]);

        return rows;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
 * 채팅 상태를 확인하는 함수
 * @param {object} mysql - MySQL 데이터베이스 연결 객체
 * @param {number} userNo - 사용자 번호
 * @returns {Array} 읽지 않은 채팅 수
 */
const getChatStatus = async (mysql, userNo) => {
    try {
        const [rows] = await mysql.query(`
            SELECT COUNT(*) readStatus 
            FROM chat 
            WHERE userNo != ? AND toUserNo = ? AND readStatus = 0;
        `, [userNo, userNo]);

        return rows;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

/**
 * 특정 사용자 정보를 가져오는 함수
 * @param {object} mysql - MySQL 데이터베이스 연결 객체
 * @param {number} userNo - 사용자 번호
 * @returns {Array} 사용자 정보
 */
const getChatUserInfo = async (mysql, userNo) => {
    try {
        const [rows] = await mysql.query(`
            SELECT userNo, id, nickname, imgUrl, profileContents 
            FROM user 
            WHERE userNo = ?
        `, [userNo]);
        
        return rows;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

module.exports = {
    getChatList,
    getChatStatus,
    getChatUserInfo
}; 