import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/button/Button";
import Input from "../components/input/Input";
import './Sign.scss';

const SignUp = () => {
    const navigate = useNavigate();
    const [nickname, setNickName] = useState('');
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');

    const signUpApi = async () => {
        if (nickname === '' || id === '' || pw === '') {
            alert("모두 입력");
        } else {
            try {
                const { data } = await axios.post("/signUp", { nickname, id, pw });
                alert(data);
                navigate("/Login");
            } catch (e) {
                console.log(e);
            }
        }
    }

    return (
        <div className="container">
            <Input placeholder='닉네임' onChange={e => setNickName(e.target.value)} />
            <Input placeholder="아이디" onChange={e => setId(e.target.value)} />
            <Input type="password" placeholder='비밀번호' onChange={e => setPw(e.target.value)} />
            <Button onClick={signUpApi} text="회원가입" />
        </div>
    )
}

export default SignUp;