import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import './Sign.scss';

const SignUp = () => {
    const navigate = useNavigate();
    const [nickname, setNickName] = useState('');
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [image, setImage] = useState('');

    const signUpApi = async () => {
        if (nickname === '' || id === '' || pw === '') {
            alert("모두 입력");
        } else {
            try {
                const { data, status } = await axios.post("/signUp", { nickname, id, pw });

                if (status == 200) {
                    navigate("/Login");
                } else {
                    alert("회원가입 실패");
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    const onUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return;
        }
        console.log(e.target.files[0]);
        console.log(e.target.files[0].name);
        setImage(URL.createObjectURL(e.target.files[0]));
        const formData = new FormData();
        formData.append('thumbnail', e.target.files[0]);
        // try {
        //     const { data } = await axios.post("/test", formData);
        //     console.log(data);
        // } catch (e) {
        //     console.error(e);
        // }
    };

    return (
        <div className="container">
            <img src={image} />
            <label className="signup-profileImg-label" htmlFor="profileImg">프로필 이미지 추가</label>
            <input
                type="file"
                accept="image/*"
                onChange={onUploadImage}
                id="profileImg"
            />
            <Input placeholder='닉네임' onChange={e => setNickName(e.target.value)} />
            <Input placeholder="아이디" onChange={e => setId(e.target.value)} />
            <Input type="password" placeholder='비밀번호' onChange={e => setPw(e.target.value)} />
            <Button onClick={signUpApi} text="회원가입" />
        </div>
    )
}

export default SignUp;