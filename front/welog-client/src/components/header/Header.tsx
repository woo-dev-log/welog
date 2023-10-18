import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import Swal from 'sweetalert2';
import { boardType, loginModalIsOpen, loginUser } from '../../store/atoms';
import { ToastError, ToastSuccess } from '../Toast';
import './Header.scss';
import { statusChatApi } from '../../api/board';

const Header = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [cookies, setCookie, removeCookie] = useCookies(['welogJWT', 'themeColor']);
    const [themeColor, setThemeColor] = useState(document.body.dataset.theme);
    const [modalIsOpen, setIsOpen] = useRecoilState(loginModalIsOpen);
    const [boardTypeNum, setBoardTypeNum] = useRecoilState(boardType);
    const [readStatus, setReadStatus] = useState(0);
    const ServerImgUrl = import.meta.env.VITE_SERVER_IMG_URL;

    const themeOnClick = (color: string) => {
        setThemeColor(color);
        removeCookie("themeColor", { path: '/', sameSite: 'strict' });
        setCookie("themeColor", color, { path: '/', sameSite: 'strict' });
    }

    const homeOnClick = () => {
        setBoardTypeNum(1);
        navigate("/");
    }

    const logOut = async () => {
        const result = await Swal.fire({
            title: '로그아웃을 하시겠어요?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'black',
            cancelButtonColor: 'red',
            confirmButtonText: '네',
            cancelButtonText: '아니요'
        })

        if (result.isConfirmed) {
            ToastSuccess(userInfo[0].nickname + "님 안녕히가세요!");
            removeCookie("welogJWT", { path: '/', sameSite: 'strict' });
            setUserInfo([{ userNo: 0, nickname: "", id: "", imgUrl: "" }]);
        }
    }

    const statusChat = async () => {
        try {
            const data = await statusChatApi(userInfo[0].userNo);
            setReadStatus(data[0].readStatus);
        } catch (e) {
            ToastError("채팅 상태를 가져올 수 없어요");
        }
    }

    useEffect(() => {
        if (userInfo[0].userNo !== 0) statusChat();
    }, [userInfo]);

    return (
        <div className="header-container">
            <div className="header-home">
                <p onClick={homeOnClick}>우리의 하루</p>
                <button className='themeColorBtn'>
                    {themeColor === 'dark'
                        ? <img onClick={() => themeOnClick('light')}
                            className='header-themeImg' src="/dark-mode.svg" alt="dark-mode" />
                        : <img onClick={() => themeOnClick('dark')}
                            className='header-themeImg' src="/light-mode.svg" alt="light-mode" />}
                </button>
            </div>

            <div className='header-box'>
                {userInfo[0].userNo !== 0 ?
                    <>
                        <div className='header-loginBlock'>
                            {/* <img className="header-notificationImg" src="/notification.svg" alt="notification" /> */}
                            <img className="header-chatImg" onClick={() => navigate("/Chat")}
                                src="/chat.svg" alt="chat" />
                            {readStatus > 0 && <div className='readStatus-dot' />}
                        </div>
                        <div className="header-block">
                            <img className="header-userImg" src={`${ServerImgUrl}${userInfo[0].imgUrl}`} alt={userInfo[0].imgUrl} />
                            <div className="header-nickname">{userInfo[0].nickname}</div>
                            <ul>
                                <li><span onClick={() => navigate("/userBoard/" + userInfo[0].nickname)}>마이페이지</span></li>
                                <li><span onClick={logOut}>로그아웃</span></li>
                            </ul>
                        </div>
                    </>
                    :
                    <div className="header-block">
                        <div className="header-signIn" onClick={() => setIsOpen(true)}>로그인</div>
                        <div className="header-signUp" onClick={() => navigate("/SignUp")}>회원가입</div>
                    </div >
                }
            </div>
        </div>
    )
}

export default Header;