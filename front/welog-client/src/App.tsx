import axios from 'axios'
import { Route, Routes } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { loginUser } from './store/atoms'
import { Toast } from './components/Toast'
import Header from './components/header/Header'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import Board from './pages/board/Board'
import BoardWrite from './pages/boardWrite/BoardWrite'
import BoardDetail from './pages/boardDetail/BoardDetail'
import UserBoard from './pages/userBoard/UserBoard'
import './App.scss'

function App() {
  const [cookies] = useCookies(['welogJWT', 'themeColor']);
  const [userInfo, setUserInfo] = useRecoilState(loginUser);
  // axios.defaults.baseURL = "https://welog.fly.dev/api/";
  axios.defaults.baseURL = "http://localhost:3690/api/";

  let osTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark': 'light';
  if(cookies.themeColor) {
    document.body.dataset.theme = cookies.themeColor;
  } else {
    if(osTheme === "dark"){
      document.body.dataset.theme = osTheme;
    } else document.body.dataset.theme = 'light';
  }

  const silentRefresh = async () => {
    if (cookies.welogJWT) {
      const { data } = await axios.post("loginToken", { welogJWT: cookies.welogJWT });
      setUserInfo([{ userNo: data.userNo, id: data.id, nickname: data.nickname, imgUrl: data.imgUrl }]);
    }
  };

  useEffect(() => {
    silentRefresh();
  }, [cookies.welogJWT]);

  return (
    <>
      <Toast />
      <Header />
      <div className='app-block'>
        <Routes>
          <Route path='/' element={<Board />} />
          <Route path='/:boardNo' element={<BoardDetail />} />
          <Route path='/userBoard/:userNickname' element={<UserBoard />} />
          <Route path='/BoardWrite' element={<BoardWrite />} />
          <Route path='/SignIn' element={<SignIn />} />
          <Route path='/SignUp' element={<SignUp />} />
        </Routes>
      </div>
    </>
  )
}

export default App