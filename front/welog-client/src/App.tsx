import axios from 'axios'
import { Route, Routes } from 'react-router-dom'
import { RecoilRoot, useRecoilState } from 'recoil'
import './App.scss'
import Header from './components/header/Header'
import Board from './pages/board/Board'
import BoardAdd from './pages/boardAdd/BoardAdd'
import BoardDetail from './pages/boardDetail/BoardDetail'
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { loginUser } from './components/atoms'


function App() {
  const [cookies] = useCookies(['welogJWT']);
  const [userInfo, setUserInfo] = useRecoilState(loginUser);
  axios.defaults.baseURL = "http://localhost:3690";
  // axios.defaults.headers.common["Access-Control-Allow-Origin"] = "http://localhost:5173/Login";
  // axios.defaults.headers.common["Access-Control-Allow-Credentials"] = "true";
  // axios.defaults.withCredentials = true;
  // axios.defaults.headers.common['Authorization'] = `Bearer ${data}`;

  const silentRefresh = async () => {
    if(cookies.welogJWT) {
      const { data } = await axios.post("loginToken", { welogJWT: cookies.welogJWT });
      setUserInfo([{ userNo: data.userNo, id: data.id, nickname: data.nickname, imgUrl: data.imgUrl }]);
    }
  };

  useEffect(() => {
    silentRefresh();
  }, []);

  return (
    <>
      <Header />
      <div className='app-block'>
        <Routes>
          <Route path='/' element={<Board />} />
          <Route path='/:boardNo' element={<BoardDetail />} />
          <Route path='/BoardAdd' element={<BoardAdd />} />
          <Route path='/Login' element={<Login />} />
          <Route path='/SignUp' element={<SignUp />} />
        </Routes>
      </div>
    </>
  )
}

export default App