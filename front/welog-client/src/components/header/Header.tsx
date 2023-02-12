import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import Swal from 'sweetalert2';
import { loginUser } from '../atoms';
import { ToastWarn } from '../Toast';
import './Header.scss';

const Header = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [cookies, setCookie, removeCookie] = useCookies(['welogJWT']);

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
            ToastWarn(userInfo[0].nickname + "님 안녕히가세요!");
            removeCookie("welogJWT");
            setUserInfo([{ userNo: 0, nickname: "", id: "", imgUrl: "" }]);
        }
    }

    return (
        <div className="header-container">
            <p onClick={() => navigate("/")}>홈</p>
            <div className='header-box'>
                {userInfo[0].userNo !== 0 ?
                    <div className="header-block">
                        <img src={`http://localhost:3690/images/${userInfo[0].imgUrl}`} />
                        <p>{userInfo[0].nickname}</p>
                        <ul><li onClick={logOut}>로그아웃</li></ul>
                    </div>
                    :
                    <div className="header-block">
                        <p onClick={() => navigate("/Login")}>로그인</p>
                        <p onClick={() => navigate("/SignUp")}>회원가입</p>
                    </div >
                }
            </div>
        </div>
    )
}

export default Header;