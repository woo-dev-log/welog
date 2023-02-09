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
import "./BoardAdd.scss"

const BoardAdd = () => {
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const navigate = useNavigate();

    const boardAddApi = async () => {
        if (title === "" || contents === "") {
            alert("모두 입력");
        } else {
            try {
                await axios.post("/boardAdd", { title, contents, userNo: userInfo[0].userNo });
                navigate("/");
            } catch (e) {
                alert("작성 실패");
                console.error(e);
            }
        }
    }

    return (
        <div className="boardAdd-container">
            <div className="boardAdd-titleBlock">
                <Label text="제목" />
                <Input placeholder="제목을 입력하세요" onChange={e => setTitle(e.target.value)} />
            </div>
            <Label text="내용" />
            <Line />
            <ReactQuill onChange={setContents} />
            <div className="boardAdd-button"><Button onClick={boardAddApi} text="글쓰기" /></div>
        </div>
    )
}

export default BoardAdd;