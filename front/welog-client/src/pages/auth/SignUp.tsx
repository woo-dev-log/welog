import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import Label from "../../components/label/Label";
import './Sign.scss';

const SignUp = () => {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState("");
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [image, setImage] = useState<File>();
    const [blobImg, setBlobImg] = useState("");
    const [dupCheckId, setDupCheckId] = useState(false);
    const [dupCheckNickname, setDupCheckNickname] = useState(false);
    const [checkNickname, setCheckNickName] = useState("");
    const [checkId, setCheckId] = useState("");

    const pwCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (pw.length > 15) {
            alert("비밀번호를 15자 이내로 생성해주세요");
            return;
        } else setPw(e.target.value);
    }

    const idCheck = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 15) {
            alert("아이디를 15자 이내로 생성해주세요");
            return;
        } else setId(e.target.value);

        if (e.target.value === "") {
            setCheckId("");
            setDupCheckId(false);
            return;
        } else {
            try {
                const { data } = await axios.post("/idCheck", { id: e.target.value });

                if (data === "no") {
                    setCheckId("중복된 아이디예요");
                    setDupCheckId(false);
                    return;
                } else {
                    setCheckId("사용가능한 아이디예요");
                    setDupCheckId(true);
                    return;
                }
            } catch (e) {
                console.error(e);;
            }
        }
    };

    const nicknameCheck = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 10) {
            alert("닉네임을 10자 이내로 생성해주세요");
            return;
        } else setNickname(e.target.value);

        if (e.target.value === "") {
            setCheckNickName("");
            setDupCheckId(false);
            return;
        } else {
            try {
                const { data } = await axios.post("/nicknameCheck", { nickname: e.target.value });

                if (data === "no") {
                    setCheckNickName("중복된 닉네임이에요");
                    setDupCheckNickname(false);
                    return;
                } else {
                    setCheckNickName("사용가능한 닉네임이에요");
                    document.getElementsByClassName("signUp-checkNickname")[0];
                    setDupCheckNickname(true);
                    return;
                }
            } catch (e) {
                console.error(e);;
            }
        }
    }

    const signUpApi = async () => {
        if (nickname === "" || id === "" || pw === "" || !image) {
            alert("모두 입력해주세요");
            return;
        } else if (dupCheckNickname === false || dupCheckId === false) {
            alert("중복된 정보를 변경해주세요");
            return;
        } else {
            try {
                let formData = new FormData();
                formData.append('nickname', nickname);
                formData.append('id', id);
                formData.append('pw', pw);
                formData.append('thumbnail', image);

                const { data, status } = await axios.post("/signUp", formData);

                if (status === 200) {
                    URL.revokeObjectURL(blobImg);
                    alert("회원가입 완료");
                    navigate("/Login");
                }
            } catch (e) {
                alert("회원가입 실패");
                console.error(e);
            }
        }
    }

    const onUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return;
        }
        setImage(e.target.files[0]);
        setBlobImg(URL.createObjectURL(e.target.files[0]));
    };

    return (
        <div className="container">
            <div className="signUp-img">
                {image && <img src={blobImg} />}
            </div>
            <label className="signUp-imgSelect" htmlFor="profileImg">사진 선택</label>
            <input type="file" accept="image/*" onChange={onUploadImage} id="profileImg" />
            <div className="signUp-nickname">
                <Input placeholder='닉네임' onChange={nicknameCheck} value={nickname} />
                {checkNickname &&
                    <div style={dupCheckNickname ? { color: 'green', fontSize: '14px' } : { color: 'red', fontSize: '14px' }}>
                        {checkNickname}
                    </div>}
            </div>
            <div className="signUp-id">
                <Input placeholder="아이디" onChange={idCheck} value={id} />
                {checkId &&
                    <div style={dupCheckId ? { color: 'green', fontSize: '14px' } : { color: 'red', fontSize: '14px' }}>
                        {checkId}
                    </div>}
            </div>
            <Input type="password" placeholder='비밀번호' onChange={pwCheck} value={pw} />
            <Button onClick={signUpApi} text="회원가입" />
        </div>
    )
}

export default SignUp;