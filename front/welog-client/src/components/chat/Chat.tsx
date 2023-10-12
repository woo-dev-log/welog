import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { chatModalIsOpen, loginUser } from '../../store/atoms';
import Button from '../button/Button';
import { io, Socket } from 'socket.io-client';
import Modal from 'react-modal';
import './Chat.scss';
import { useParams } from 'react-router-dom';
import DayFormat from '../DayFormat';
import { chatUserInfoApi } from '../../api/board';
import Line from '../line/Line';
// Modal.setAppElement('#root')

interface MsgType {
    message: string;
    sendDate: Date;
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
    // const [modalIsOpen, setModalIsOpen] = useRecoilState(chatModalIsOpen);
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<MsgType[]>([]);
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [chatUserInfo, setChatUserInfo] = useState<userInfoType>();
    const [roomNumber, setRoomNumber] = useState('');
    const [socket, setSocket] = useState<Socket | undefined>();
    const { chatNo } = useParams();
    const ServerImgUrl = import.meta.env.VITE_SERVER_IMG_URL;

    const sendMessage = () => {
        if (message !== '' && socket) {
            socket.emit('private message', { message, roomNo: roomNumber, user: userInfo });
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
        if (userInfo[0].userNo) {
            const roomNo = [Number(chatNo), userInfo[0].userNo].sort((a, b) => a - b).join('');
            setRoomNumber(roomNo);
        }
    }, [chatNo, userInfo]);

    useEffect(() => {
        chatUserApi();
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
            console.log('disconnect');
        };
    }, []);

    useEffect(() => {
        if (socket && roomNumber !== '') {
            socket.emit("join room", roomNumber);
        }
    }, [socket, roomNumber]);

    return (
        // <Modal
        //     isOpen={modalIsOpen}
        //     onRequestClose={() => setModalIsOpen(false)}
        //     contentLabel="Chat Modal"
        //     className="Modal"
        //     overlayClassName="Overlay"
        // >
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

            <div className='chatMsg-container'>
                {messages && userInfo.length > 0 && messages.map((data, i) =>
                    <div key={i} className={userInfo[0].userNo === data.user?.userNo ? 'chat-myProfile' : 'chat-otherProfile'}>
                        <div className='chat-profileHeader'>
                            <p>{data.user?.nickname}</p>
                            <img src={`${ServerImgUrl}${data.user?.imgUrl}`} alt="userImg" loading="lazy"
                                className='chat-img' />
                        </div>
                        <div className='chat-msg'>
                            <p dangerouslySetInnerHTML={{ __html: data.message.replaceAll(/(\n|\r\n)/g, '<br>') }} />
                        </div>
                        <p className='chat-date'>{DayFormat(data.sendDate)}</p>
                    </div>
                )}
            </div>
            
            <textarea className='chat-textArea' placeholder="메시지" onChange={(e) => setMessage(e.target.value)} value={message} />
            <Button onClick={sendMessage} text="보내기" />
        </>
        // </Modal>
    )
}

export default Chat;