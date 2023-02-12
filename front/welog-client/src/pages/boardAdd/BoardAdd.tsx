import axios from "axios";
import { useState } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { loginUser } from "../../components/atoms";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import Label from "../../components/label/Label";
import Line from "../../components/line/Line";
import Swal from "sweetalert2";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import "./BoardAdd.scss"

const BoardAdd = () => {
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const navigate = useNavigate();

    const boardAddApi = async () => {
        if (title === "" || contents === "") {
            ToastWarn("모두 입력해주세요");
            return;
        } else if (title.length > 30) {
            ToastWarn("제목을 30자 이내로 작성해주세요");
            return;
        } else {
            const result = await Swal.fire({
                title: '글을 등록하시겠어요?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: 'black',
                cancelButtonColor: 'red',
                confirmButtonText: '네',
                cancelButtonText: '아니요'
            })

            if (result.isConfirmed) {
                try {
                    await axios.post("/boardAdd", { title, contents, userNo: userInfo[0].userNo });
                    ToastSuccess("글이 등록되었어요!");
                    navigate("/");
                } catch (e) {
                    ToastError("등록을 실패했어요");
                    console.error(e);
                }
            }
        }
    }

    return (
        <div className="boardAdd-container">
            <div className="boardAdd-titleBlock">
                <Label text="제목" />
                <Input placeholder="제목을 입력해주세요" onChange={e => setTitle(e.target.value)} value={title} />
            </div>
            <Label text="내용" />
            <Line />
            <ReactQuill onChange={setContents} />
            <div className="boardAdd-button"><Button onClick={boardAddApi} text="글쓰기" /></div>
        </div>
    )
}

export default BoardAdd;