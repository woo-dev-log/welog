import axios from "axios";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useRecoilState } from "recoil";
import { loginUser } from "../../components/atoms";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import './Sign.scss';

const SignUp = () => {
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    // const cookies = new Cookies();
    const [cookies, setCookie] = useCookies(['welogJWT']);
    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [checkLogin, setCheckLogin] = useState("");

    const loginApi = async () => {
        if (id === "" || pw === "") {
            alert("모두 입력");
            return;
        } else {
            try {
                const { data } = await axios.post("/login", { id, pw });
                
                if (data === "no") {
                    setCheckLogin("유저 정보와 일치하지 않아요");
                } else {
                    toast.success('🦄 Wow so easy!', {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });

                    // setCookie("welogJWT", data.token, { httpOnly: true });
                    setCookie("welogJWT", data.token);
                    setUserInfo(data.user);
                    navigate(-1);
                    return;
                }
            } catch (e) {
                alert("로그인 실패");
                console.error(e);
            }
        }
    }

    return (
        <>
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className="container">
                <Input placeholder="아이디" onChange={e => setId(e.target.value)} value={id} />
                <Input placeholder="비밀번호" type="password" onChange={e => setPw(e.target.value)} value={pw} />
                <div style={{ color: "red" }}>{checkLogin}</div>
                <Button onClick={loginApi} text="로그인" />
            </div>
        </>
    )
}

export default SignUp;