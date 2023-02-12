import axios from "axios";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { loginUser } from "../../components/atoms";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import './Sign.scss';

const SignUp = () => {
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    // const cookies = new Cookies();
    const [cookies, setCookie] = useCookies(['welogJWT']);
    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [checkLogin, setCheckLogin] = useState("");

    const onKeyUpHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            loginApi();
        }
    }

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g;
        let value = e.target.value;
        if (hangul.test(value)) {
            value = value.replace(hangul, "");
            setPw(value);
            return;
            // 수정중
        } else {
            setPw(value);
        }
    }

    const loginApi = async () => {
        if (id === "" || pw === "") {
            ToastWarn("모두 입력해주세요");
            return;
        } else {
            try {
                const { data } = await axios.post("/login", { id, pw });

                if (data === "no") {
                    setCheckLogin("유저 정보와 일치하지 않아요");
                } else {
                    // setCookie("welogJWT", data.token, { httpOnly: true });
                    setCookie("welogJWT", data.token);
                    setUserInfo(data.user);
                    ToastSuccess(data.user[0].nickname + "님 안녕하세요!");
                    navigate(-1);
                    return;
                }
            } catch (e) {
                ToastError("로그인을 실패했어요");
                console.error(e);
            }
        }
    }

    return (
        <>
            <div className="container">
                <Input placeholder="아이디" onChange={e => setId(e.target.value)} value={id} />
                <Input placeholder="비밀번호" type="password" value={pw}
                    onChange={onChangeHandler} onKeyUp={onKeyUpHandler} />
                <div style={{ color: "red" }}>{checkLogin}</div>
                <Button onClick={loginApi} text="로그인" />
            </div>
        </>
    )
}

export default SignUp;