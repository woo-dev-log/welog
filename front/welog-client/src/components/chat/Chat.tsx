import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { chatModalIsOpen, loginUser, user } from '../../store/atoms';
import Button from '../button/Button';
import { io } from 'socket.io-client';
import Modal from 'react-modal';
import Input from '../input/Input';
Modal.setAppElement('#root')

const Chat = () => {
    const [modalIsOpen, setModalIsOpen] = useRecoilState(chatModalIsOpen);
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<string[]>([]);
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [userProfile, setUserProfile] = useRecoilState(user);
    const socket = io(import.meta.env.VITE_CHAT_TEST_API_URL);
    const roomNumber = [userProfile[0].userNo, userInfo[0].userNo].sort((a, b) => a - b).join('');
    socket.emit("join room", roomNumber);

    const sendMessage = () => {
        if (message !== '') {
            socket.emit('private message', { msg: message, roomNo: roomNumber });
            setMessage('');
        }
    };

    useEffect(() => {
        socket.on("private message", (data) => {
            setMessages(messages => [...messages, data.msg]);
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
            <Input autoFocus={true} placeholder="메시지" onChange={(e) => setMessage(e.target.value)} value={message} />
            <Button onClick={sendMessage} text="보내기" />
            {messages.map((msg, index) => <p key={index}>{msg}</p>)}
        </>
        // </Modal>
    )
}

export default Chat;