import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import Swal from 'sweetalert2';
import { loginModalIsOpen, loginUser } from '../../store/atoms';
import { ToastSuccess } from '../Toast';
import './Header.scss';

const Header = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [cookies, setCookie, removeCookie] = useCookies(['welogJWT', 'themeColor']);
    const [themeColor, setThemeColor] = useState(document.body.dataset.theme);
    const [modalIsOpen, setIsOpen] = useRecoilState(loginModalIsOpen);
    const ServerImgUrl = "https://d12uvkd7f5nrla.cloudfront.net/";

    const themeOnClick = (color: string) => {
        setThemeColor(color);
        removeCookie("themeColor", { path: '/', sameSite: 'strict' });
        setCookie("themeColor", color, { path: '/', sameSite: 'strict' });
    }

    const homeOnClick = () => {
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

    return (
        <div className="header-container">
            <div className="header-home" onClick={homeOnClick}>우리의 하루</div>
            <button className='themeColorBtn'>
                {themeColor === 'dark'
                    ? <img onClick={() => themeOnClick('light')}
                        className='header-themeImg' src="/dark-mode.svg" alt="dark-mode" />
                    : <img onClick={() => themeOnClick('dark')}
                        className='header-themeImg' src="/light-mode.svg" alt="light-mode" />}
            </button>
            <div className='header-box'>
                {userInfo[0].userNo !== 0 ?
                    <div className="header-block">
                        <img src={`${ServerImgUrl}${userInfo[0].imgUrl}`} alt={userInfo[0].imgUrl} />
                        <div className="header-nickname">{userInfo[0].nickname}</div>
                        <ul>
                            <li><span onClick={() => navigate("/userBoard/" + userInfo[0].nickname)}>마이페이지</span></li>
                            <li><span onClick={logOut}>로그아웃</span></li>
                        </ul>
                    </div>
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