import axios from 'axios'
import { Route, Routes } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import './App.scss'
import Header from './components/header/Header'
import Board from './pages/board/Board'
import BoardWrite from './pages/boardWrite/BoardWrite'
import BoardDetail from './pages/boardDetail/BoardDetail'
import Login from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { loginUser } from './store/atoms'
import { Toast } from './components/Toast'
import UserBoard from './pages/userBoard/UserBoard'
import { QueryClient, QueryClientProvider } from 'react-query'


function App() {
  const [cookies] = useCookies(['welogJWT']);
  const [userInfo, setUserInfo] = useRecoilState(loginUser);
  const queryClient = new QueryClient();
  axios.defaults.baseURL = "http://localhost:3690";
  // axios.defaults.headers.common["Access-Control-Allow-Origin"] = "http://localhost:5173/Login";
  // axios.defaults.headers.common["Access-Control-Allow-Credentials"] = "true";
  // axios.defaults.withCredentials = true;
  // axios.defaults.headers.common['Authorization'] = `Bearer ${data}`;

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
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path='/' element={<Board />} />
            <Route path='/:boardNo' element={<BoardDetail />} />
            <Route path='/userBoard/:userNickname' element={<UserBoard />} />
            <Route path='/BoardWrite' element={<BoardWrite />} />
            <Route path='/Login' element={<Login />} />
            <Route path='/SignUp' element={<SignUp />} />
          </Routes>
        </QueryClientProvider>
      </div>
    </>
  )
}

export default App