import axios from 'axios'
import { Route, Routes } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import './App.scss'
import Header from './components/header/Header'
import Board from './pages/board/Board'
import BoardAdd from './pages/boardAdd/BoardAdd'
import BoardDetail from './pages/boardDetail/BoardDetail'
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'
import { useEffect } from 'react'
import useCookies from 'react-cookie/cjs/useCookies'


function App() {
  const [cookies, setCookies] = useCookies();
  axios.defaults.baseURL = "http://localhost:3690";
  axios.defaults.headers.common["Access-Control-Allow-Origin"] = "http://localhost:5173/Login";
  // axios.defaults.headers.common["Access-Control-Allow-Credentials"] = "true";
  axios.defaults.withCredentials = true;
  
  const silentRefresh = () => {
    console.log(cookies);
    // axios.defaults.headers.common['Authorization'] = `Bearer ${data}`;
  };

  useEffect(() => {
    silentRefresh();
  }, []);

  return (
    <RecoilRoot>
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
    </RecoilRoot>
  )
}

export default App