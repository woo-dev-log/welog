import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { loginUser } from "../../components/atoms";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import './Sign.scss';

const SignUp = () => {
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const navigate = useNavigate();
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');

    const loginApi = async () => {
        if (id === '' || pw === '') {
            alert("모두 입력");
        } else {
            try {
                const { data, status } = await axios.post("/login", { id, pw });
                console.log(data);
                if (status == 200) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                    setUserInfo(data);
                    navigate("/");
                } else {
                    alert("로그인 실패");
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    return (
        <div className="container">
            <Input placeholder="아이디" onChange={e => setId(e.target.value)} />
            <Input placeholder="비밀번호" type="password" onChange={e => setPw(e.target.value)} />
            <Button onClick={loginApi} text="로그인" />
        </div>
    )
}

export default SignUp;