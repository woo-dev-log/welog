import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { loginUser } from '../atoms';
import './Header.scss';

const Header = () => {
    const navigate = useNavigate();
    const userInfo = useRecoilValue(loginUser);

    return (
        <div className="header-container">
            <div onClick={() => navigate("/")}>홈</div>
            <div className='header-box'>
                {userInfo.length > 0 ? 
                <>
                    <img src="" />
                    <div>{userInfo[0].nickname}님</div>
                </>
                    :
                    <>
                        <div onClick={() => navigate("/Login")}>로그인</div>
                        <div onClick={() => navigate("/SignUp")}>회원가입</div>
                    </>
                }
                </div>
        </div>
            )
}

            export default Header;