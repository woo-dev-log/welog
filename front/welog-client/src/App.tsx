import axios from 'axios'
import { Route, Routes } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import './App.scss'
import Header from './components/header/Header'
import Board from './pages/Board'
import BoardAdd from './pages/BoardAdd'
import Login from './pages/Login'
import SignUp from './pages/SignUp'

axios.defaults.baseURL = "http://localhost:3690";

function App() {
  return (
    <RecoilRoot>
      <Header />
      <div className='app-block'>
        <Routes>
          <Route path='/' element={<Board />} />
          <Route path='/BoardAdd' element={<BoardAdd />} />
          <Route path='/Login' element={<Login />} />
          <Route path='/SignUp' element={<SignUp />} />
        </Routes>
      </div>
    </RecoilRoot>
  )
}

export default App