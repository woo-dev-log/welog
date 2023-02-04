import axios from "axios";
import { useState } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from "react-router-dom";
import Button from "../components/button/Button";
import "./BoardAdd.scss"

const BoardAdd = () => {
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const navigate = useNavigate();

    const boardAddApi = async () => {
        if (title === "" || contents === "") {
            alert("모두 입력");
        } else {
            try {
                const { data } = await axios.post("/boardAdd", { title, contents });
                
                if (data === "OK") {
                    navigate("/");
                } else {
                    alert("작성 실패");
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    return (
        <div className="boardAdd-container">
            <div className="boardAdd-titleBlock">
                <div className="boardAdd-titleLabel">제목</div>
                <input placeholder="제목을 입력하세요" onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="boardAdd-contentsLabel">내용</div>
            <ReactQuill onChange={setContents} />
            <div className="boardAdd-button">
                <Button onClick={boardAddApi} text="글쓰기" />
            </div>
        </div>
    )
}

export default BoardAdd;