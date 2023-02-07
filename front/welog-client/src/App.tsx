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

axios.defaults.baseURL = "http://localhost:3690";

function App() {
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