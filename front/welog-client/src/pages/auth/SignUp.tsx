import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import './Sign.scss';
import Swal from "sweetalert2";
import SEO from "../../components/SEO";
import { postSignUpApi, checkSignUpIdApi, checkSignUpNicknameApi } from "../../api/sign";

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

    const pwCheckOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g;
        let value = e.target.value;

        if (pw.length > 15) {
            ToastWarn("비밀번호를 15자 이내로 생성해주세요");
            return;
        } else if (hangul.test(value)) {
            value = value.replace(hangul, "");
            setPw(value);
            ToastWarn("한글은 입력할 수 없어요");
            return;
        } else {
            setPw(value);
        }
    }

    const idCheckOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 15) {
            ToastWarn("아이디를 15자 이내로 생성해주세요");
            return;
        } else setId(e.target.value);

        if (e.target.value === "") {
            setCheckId("");
            setDupCheckId(false);
            return;
        } else {
            try {
                const data = await checkSignUpIdApi(e.target.value);

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

    const nicknameCheckOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 10) {
            ToastWarn("닉네임을 10자 이내로 생성해주세요");
            return;
        } else setNickname(e.target.value);

        if (e.target.value === "") {
            setCheckNickName("");
            setDupCheckId(false);
            return;
        } else {
            try {
                const data = await checkSignUpNicknameApi(e.target.value);

                if (data === "no") {
                    setCheckNickName("중복된 닉네임이에요");
                    setDupCheckNickname(false);
                    return;
                } else {
                    setCheckNickName("사용가능한 닉네임이에요");
                    // document.getElementsByClassName("signUp-checkNickname")[0];
                    setDupCheckNickname(true);
                    return;
                }
            } catch (e) {
                console.error(e);;
            }
        }
    }

    const postSignUpOnClick = async () => {
        if (nickname === "" || id === "" || pw === "" || !image) {
            ToastWarn("모두 입력해주세요");
            return;
        } else if (dupCheckNickname === false || dupCheckId === false) {
            ToastWarn("중복된 정보를 변경해주세요");
            return;
        } else {
            const result = await Swal.fire({
                title: '회원가입을 하시겠어요?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: 'black',
                cancelButtonColor: 'red',
                confirmButtonText: '네',
                cancelButtonText: '아니요'
            })

            if (result.isConfirmed) {
                try {
                    let formData = new FormData();
                    formData.append('nickname', nickname);
                    formData.append('id', id);
                    formData.append('pw', pw);
                    formData.append('thumbnail', image);

                    const data = await postSignUpApi(formData);

                    if (data.status === 200) {
                        URL.revokeObjectURL(blobImg);
                        ToastSuccess("회원가입을 성공했어요!");
                        navigate("/");
                    }
                } catch (e) {
                    ToastError("회원가입을 실패했어요");
                    console.error(e);
                }
            }
        }
    }

    const uploadImageOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return;
        }
        setImage(e.target.files[0]);
        setBlobImg(URL.createObjectURL(e.target.files[0]));
    };

    return (
        <div className="container">
            <SEO title="회원가입" contents="회원가입" />
            <div className="signUp-img">
                {image && <img src={blobImg} />}
            </div>
            <label className="signUp-imgSelect" htmlFor="profileImg">사진 선택</label>
            <input type="file" accept="image/*" onChange={uploadImageOnChange} id="profileImg" />
            <div className="signUp-nickname">
                <Input placeholder='닉네임' onChange={nicknameCheckOnChange} value={nickname} />
                {checkNickname &&
                    <div style={dupCheckNickname
                        ? { marginTop: '10px', color: 'green', fontSize: '14px' }
                        : { marginTop: '10px', color: 'red', fontSize: '14px' }}>
                        {checkNickname}
                    </div>}
            </div>
            <div className="signUp-id">
                <Input placeholder="아이디" onChange={idCheckOnChange} value={id} />
                {checkId &&
                    <div style={dupCheckId
                        ? { marginTop: '10px', color: 'green', fontSize: '14px' }
                        : { marginTop: '10px', color: 'red', fontSize: '14px' }}>
                        {checkId}
                    </div>}
            </div>
            <Input type="password" placeholder='비밀번호' onChange={pwCheckOnChange} value={pw} />
            <Button onClick={postSignUpOnClick} text="회원가입" />
        </div>
    )
}

export default SignUp;