import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { loginUser } from '../../store/atoms';
import { io, Socket } from 'socket.io-client';
import './Chat.scss';
import { useParams } from 'react-router-dom';
import DayFormat from '../DayFormat';
import { chatUserInfoApi } from '../../api/board';

interface MsgType {
    message: string;
    sendDate: Date;
    readStatus: number;
    user?: UserProfileType;
}

interface userInfoType {
    userNo: string;
    id: string;
    nickname: string;
    imgUrl: string;
    profileContents: string;
}

const Chat = () => {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<MsgType[]>([]);
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [chatUserInfo, setChatUserInfo] = useState<userInfoType>();
    const [roomNumber, setRoomNumber] = useState('');
    const [socket, setSocket] = useState<Socket | undefined>();
    const { chatNo } = useParams();
    const ServerImgUrl = import.meta.env.VITE_SERVER_IMG_URL;
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const sendMessage = () => {
        if (message !== '' && socket) {
            socket.emit('private message', { message, roomNo: roomNumber, user: userInfo, chatNo });
            setMessage('');
        }
    };

    const chatUserApi = async () => {
        if (chatNo) {
            const user = await chatUserInfoApi(chatNo);
            setChatUserInfo(user[0]);
        }
    }

    useEffect(() => {
        if (scrollRef.current) {
            const { scrollHeight } = scrollRef.current;
            scrollRef.current.scrollTop = scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (socket && roomNumber !== '') {
            socket.emit("join room", {roomNumber, fromUserNo: userInfo[0].userNo});
        }
    }, [socket, roomNumber]);

    useEffect(() => {
        if (userInfo[0].userNo !== 0) {
            const roomNo = [Number(chatNo), userInfo[0].userNo].sort((a, b) => a - b).join('');
            setRoomNumber(roomNo);
        }
    }, [chatNo, userInfo]);

    useEffect(() => {
        chatUserApi();

        if (userInfo[0].userNo !== 0) {
            const newSocket = io(import.meta.env.VITE_CHAT_TEST_API_URL);
            setSocket(newSocket);

            newSocket.on("join room", (data) => {
                setMessages(data);
            });

            newSocket.on("private message", (data) => {
                setMessages(messages => [...messages, data]);
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, [userInfo]);

    return (
        <>
            {chatUserInfo &&
                <div className='chatUser-container'>
                    <header className='chatUser-header'>
                        <img src={`${ServerImgUrl}${chatUserInfo.imgUrl}`} alt="userImg"
                            loading="lazy" className='chatUser-img' />
                        <p>{chatUserInfo.nickname} 채팅방</p>
                    </header>
                    <div>{chatUserInfo.profileContents}</div>
                </div>}

            <div ref={scrollRef} className='chatMsg-container'>
                {userInfo[0].userNo === 0
                    ? <div>로그인이 필요합니다</div>
                    : messages.map((data, i) =>
                        <div key={i} className={userInfo[0].userNo === data.user?.userNo ? 'chat-myProfile' : 'chat-otherProfile'}>
                            <div className='chat-profileHeader'>
                                <p>{data.user?.nickname}</p>
                                <img src={`${ServerImgUrl}${data.user?.imgUrl}`} alt="userImg" loading="lazy"
                                    className='chat-img' />
                            </div>
                            <div className='chat-msgBlock'>
                                <p className='chat-readStatusMsg'>{data.readStatus === 0 ? "읽지 않음" : "읽음"}</p>
                                <div className='chat-msg'>
                                    <p dangerouslySetInnerHTML={{ __html: data.message.replaceAll(/(\n|\r\n)/g, '<br>') }} />
                                </div>
                            </div>
                            <p className='chat-date'>{DayFormat(data.sendDate)}</p>
                        </div>)}
            </div>

            {userInfo[0].userNo !== 0 &&
                <div className='chat-send'>
                    <textarea className='chat-textArea' placeholder="내용을 입력해주세요"
                        onChange={(e) => setMessage(e.target.value)} value={message} />
                    <button className='chat-sendBtn' onClick={sendMessage}>보내기</button>
                </div>}
        </>
    )
}

export default Chat;