const socketIO = require('socket.io');
const chatService = require('../controllers/chatService');

/**
 * 소켓 서버를 설정하는 함수
 * @param {object} server - HTTP 서버 인스턴스
 * @param {object} mysql - MySQL 데이터베이스 연결 객체
 * @returns {object} 소켓 서버 인스턴스
 */
const setupSocketIO = (server, mysql) => {
    const io = socketIO(server, {
        cors: {
            origin: "*"
        }
    });

    io.on('connection', (socket) => {
        socket.on('userList room', async ({ userNo }) => {
            socket.emit("userList room", { userList: await chatService.getChatList(mysql, userNo) });
        });

        socket.on('join room', async ({ roomNo, fromUserNo }) => {
            socket.join(roomNo);

            await mysql.query(`
                UPDATE chat SET readStatus = 1 
                WHERE roomNo = ? AND toUserNo = ?
            `, [roomNo, fromUserNo]);

            const [rows] = await mysql.query(`
                SELECT chat.*, user.id, user.nickname, user.imgUrl 
                FROM chat 
                LEFT JOIN user ON chat.userNo = user.userNo
                WHERE chat.roomNo = ? 
                ORDER BY chat.sendDate
            `, [roomNo]);

            io.to(roomNo).emit('join room', rows);
        });

        socket.on('private message', async ({ message, roomNo, user, toUserNo }) => {
            try {
                const nowDate = new Date();
                const kstOffset = 9 * 60 * 60 * 1000;
                const kstDate = new Date(nowDate.getTime() + kstOffset);

                const userInfo = user[0];
                const roomUsers = userInfo.userNo + "," + toUserNo;

                const [rows] = await mysql.query(`
                INSERT INTO
                chat(roomNo, userNo, toUserNo, message, sendDate, roomUsers) 
                VALUES(?, ?, ?, ?, ?, ?)
                `, [roomNo, userInfo.userNo, toUserNo, message, kstDate, roomUsers]);

                socket.emit("userList room", { userList: await chatService.getChatList(mysql, userInfo.userNo) });

                io.to(roomNo).emit('private message', {
                    chatNo: rows.insertId,
                    roomNo,
                    toUserNo,
                    message,
                    userNo: userInfo.userNo,
                    id: userInfo.id,
                    nickname: userInfo.nickname,
                    imgUrl: userInfo.imgUrl,
                    sendDate: kstDate, readStatus: 0,
                    roomUsers
                });
            } catch (e) {
                console.error(e);
            }
        });

        socket.on('read message', async ({ roomNo, chatNo }) => {
            await mysql.query(`
                UPDATE chat SET readStatus = 1 
                WHERE chatNo = ?
            `, [chatNo]);

            io.to(roomNo).emit('read message', { chatNo, readStatus: 1 });
        });

        socket.on('disconnect', () => {
            // console.log('user disconnected');
        });
    });

    return io;
};

module.exports = {
    setupSocketIO
}; 