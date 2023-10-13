import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { loginUser } from '../../store/atoms';
import { io, Socket } from 'socket.io-client';
import './Chat.scss';
import { useNavigate, useParams } from 'react-router-dom';
import DayFormat from '../DayFormat';
import { chatListApi, chatUserInfoApi } from '../../api/board';
import { ToastError } from '../Toast';

interface MsgType {
    chatNo: number;
    message: string;
    sendDate: Date;
    readStatus: number;
    userNo: number;
    id: string;
    nickname: string;
    imgUrl: string;
}

interface userInfoType {
    userNo: string;
    id: string;
    nickname: string;
    imgUrl: string;
    profileContents: string;
}

interface chatListType {
    userNo: string;
    id: string;
    nickname: string;
    imgUrl: string;
    message: string;
    sendDate: Date;
}

const Chat = () => {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<MsgType[]>([]);
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [chatUserInfo, setChatUserInfo] = useState<userInfoType>();
    const [chatList, setChatList] = useState<chatListType[]>();
    const [roomNumber, setRoomNumber] = useState('');
    const [socket, setSocket] = useState<Socket | undefined>();
    const { chatNo } = useParams();
    const ServerImgUrl = import.meta.env.VITE_SERVER_IMG_URL;
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    const readMessage = (readChatNo: number) => {
        if(socket) {
            socket.emit('read message', { roomNo: roomNumber, readChatNo });
        }
    }

    const sendMessage = () => {
        if (message !== '' && socket) {
            socket.emit('private message', { message, roomNo: roomNumber, user: userInfo, chatNo });
            setMessage('');
        }
    };

    const chatListApiEvent = async () => {
        try {
            const data = await chatListApi(userInfo[0].userNo);
            setChatList(data);
        } catch (e) {
            ToastError("채팅방 목록 조회를 실패했어요");
            console.error(e);
        }
    }

    const chatUserApi = async () => {
        try {
            if (chatNo) {
                const user = await chatUserInfoApi(chatNo);
                setChatUserInfo(user[0]);
            }
        } catch (e) {
            ToastError("채팅방 유저 조회를 실패했어요");
            console.error(e);
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
            socket.emit("join room", { roomNumber, fromUserNo: userInfo[0].userNo });
            chatUserApi();
        }
    }, [socket, roomNumber]);

    useEffect(() => {
        if (userInfo[0].userNo !== 0 && chatNo) {
            const roomNo = [Number(chatNo), userInfo[0].userNo].sort((a, b) => a - b).join('');
            setRoomNumber(roomNo);
        }

        if(!chatNo) {
            setChatUserInfo(undefined);
        }
    }, [chatNo, userInfo]);

    useEffect(() => {
        if (userInfo[0].userNo !== 0) {
            chatListApiEvent();

            const newSocket = io(import.meta.env.VITE_CHAT_TEST_API_URL);
            setSocket(newSocket);

            newSocket.on("join room", (data) => {
                setMessages(data);
            });

            newSocket.on("private message", (data) => {
                setMessages(messages => [...messages, data]);

                readMessage(data.chatNo);
            });

            newSocket.on("read message", (data) => {
                console.log("test");
                // setMessages(messages => messages.map(value =>
                //     value.chatNo === data.chatNo ? { ...value, readStatus: data.readStatus } : value
                // ));
            });

            return () => {
                newSocket.off("join room");
                newSocket.off("private message");
                newSocket.disconnect();
            };
        }
    }, [userInfo]);

    return (
        <>
            {chatUserInfo
                ? <>
                    <div className='chatUser-container'>
                        <header className='chatUser-header'>
                            <img src={`${ServerImgUrl}${chatUserInfo.imgUrl}`} alt="userImg"
                                loading="lazy" className='chatUser-img' />
                            <p>{chatUserInfo.nickname} 채팅방</p>
                        </header>
                        <div>{chatUserInfo.profileContents}</div>
                    </div>

                    <div ref={scrollRef} className='chatMsg-container'>
                        {userInfo[0].userNo === 0
                            ? <div>로그인이 필요합니다</div>
                            : messages.map((data, i) =>
                                <div key={i} className={userInfo[0].userNo === data.userNo ? 'chat-myProfile' : 'chat-otherProfile'}>
                                    <div className='chat-profileHeader'>
                                        <p>{data.nickname}</p>
                                        <img src={`${ServerImgUrl}${data.imgUrl}`} alt="userImg" loading="lazy"
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
                : <>
                    <div className='chatUser-container'>
                        <header className='chatUser-header'>
                            <img src={`${ServerImgUrl}${userInfo[0].imgUrl}`} alt="userImg"
                                loading="lazy" className='chatUser-img' />
                            <p>{userInfo[0].nickname} 채팅방 목록</p>
                        </header>
                    </div>
                    <div className='chatMsg-container'>
                        {chatList?.map((data, i) =>
                            <div key={i} className='chatUserRoom' onClick={() => navigate("/Chat/" + data.userNo)}>
                                <img src={`${ServerImgUrl}${data.imgUrl}`} alt="userImg"
                                    loading="lazy" className='chatUser-img' />
                                <p>{data.nickname}</p>
                                <p>{data.message}</p>
                                <p>{DayFormat(data.sendDate)}</p>
                            </div>
                        )}
                    </div>
                </>}
        </>
    )
}

export default Chat;