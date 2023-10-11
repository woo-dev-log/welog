import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { chatModalIsOpen, loginUser, user } from '../../store/atoms';
import Button from '../button/Button';
import { io } from 'socket.io-client';
import Modal from 'react-modal';
import Input from '../input/Input';
import './Chat.scss';
Modal.setAppElement('#root')

interface MsgType {
    msg: string;
    user: UserProfileType[];
    date: string;
}

const Chat = () => {
    const [modalIsOpen, setModalIsOpen] = useRecoilState(chatModalIsOpen);
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<MsgType[]>([]);
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [userProfile, setUserProfile] = useRecoilState(user);
    const ServerImgUrl = import.meta.env.VITE_SERVER_IMG_URL;

    const socket = io(import.meta.env.VITE_CHAT_TEST_API_URL);
    const roomNumber = [userProfile[0].userNo, userInfo[0].userNo].sort((a, b) => a - b).join('');
    socket.emit("join room", roomNumber);

    const sendMessage = () => {
        if (message !== '') {
            socket.emit('private message', { message, roomNo: roomNumber, user: userInfo });
            setMessage('');
        }
    };

    useEffect(() => {
        socket.on("private message", (data) => {
            console.log(data);
            setMessages(messages => [...messages, data]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        // <Modal
        //     isOpen={modalIsOpen}
        //     onRequestClose={() => setModalIsOpen(false)}
        //     contentLabel="Chat Modal"
        //     className="Modal"
        //     overlayClassName="Overlay"
        // >
        <>
            {messages.map((data, i) =>
                <div key={i} className={userInfo[0].userNo === data.user[0].userNo ? 'chat-myProfile' : 'chat-otherProfile'}>
                    <div className='chat-profileHeader'>
                        <p>{data.user[0].nickname}</p>
                        <img src={`${ServerImgUrl}${data.user[0].imgUrl}`} alt="userImg" loading="lazy"
                            className='chat-img' />
                    </div>
                    <div className='chat-msg'>
                        <p dangerouslySetInnerHTML={{ __html: data.msg.replaceAll(/(\n|\r\n)/g, '<br>') }} />
                    </div>
                    {data.date}
                </div>
            )}
            <textarea autoFocus={true} placeholder="메시지" onChange={(e) => setMessage(e.target.value)} value={message} />
            <Button onClick={sendMessage} text="보내기" />
        </>
        // </Modal>
    )
}

export default Chat;