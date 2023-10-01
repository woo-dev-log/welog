import { useState } from "react";
import { useCookies } from "react-cookie";
import { useRecoilState } from "recoil";
import { postSignInApi } from "../../api/sign";
import { loginCheckCnt, loginModalIsOpen, loginUser } from "../../store/atoms";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import SEO from "../../components/SEO";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import './Sign.scss';
import Modal from 'react-modal';
Modal.setAppElement('#root')

const SignIn = () => {
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [checkCnt, setCheckCnt] = useRecoilState(loginCheckCnt);
    const [cookies, setCookie, removeCookie] = useCookies(['welogJWT']);
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [checkLogin, setCheckLogin] = useState("");
    const [modalIsOpen, setIsOpen] = useRecoilState(loginModalIsOpen);

    const enterCheckOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            postLoginOnClick();
        }
    }

    const pwCheckOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g;
        let value = e.target.value;
        if (hangul.test(value)) {
            value = value.replace(hangul, "");
            setPw(value);
            ToastWarn("한글은 입력할 수 없어요");
            return;
        } else {
            setPw(value);
        }
    }

    const postLoginOnClick = async () => {
        if (id === "" || pw === "") {
            ToastWarn("모두 입력해주세요");
            return;
        } else {
            try {
                const data = await postSignInApi(id, pw);;

                if (data === "no") {
                    if (checkLogin === "유저 정보와 일치하지 않아요"
                        || checkLogin === "유저 정보와 일치하지 않아요 x " + (checkCnt)) {
                        setCheckLogin("유저 정보와 일치하지 않아요 x " + (checkCnt + 1));
                        setCheckCnt(checkCnt + 1);
                    } else setCheckLogin("유저 정보와 일치하지 않아요");
                } else {
                    removeCookie("welogJWT", { path: '/', sameSite: 'strict' });
                    setCookie("welogJWT", data.token, { path: '/', sameSite: 'strict' });
                    setUserInfo(data.user);
                    ToastSuccess(data.user[0].nickname + "님 안녕하세요!");
                    setIsOpen(false);
                    setId("");
                    setPw("");
                    return;
                }
            } catch (e) {
                ToastError("로그인을 실패했어요");
                console.error(e);
            }
        }
    }

    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setIsOpen(false)}
            contentLabel="Example Modal"
            className="Modal"
            overlayClassName="Overlay"
        >
            <SEO title="로그인" contents="로그인" />
            <div className="container">
                {checkLogin && <div style={{ color: "red" }}>{checkLogin}</div>}
                <Input autoFocus={true} placeholder="아이디" onChange={e => setId(e.target.value)} value={id} />
                <Input placeholder="비밀번호" type="password" value={pw}
                    onChange={pwCheckOnChange} onKeyUp={enterCheckOnKeyUp} />
                <Button onClick={postLoginOnClick} text="로그인" />
            </div>
        </Modal>
    )
}

export default SignIn;