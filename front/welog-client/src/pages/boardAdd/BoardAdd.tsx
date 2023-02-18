import axios from "axios";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { boardUpdate, loginUser } from "../../components/atoms";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import Label from "../../components/label/Label";
import Line from "../../components/line/Line";
import Swal from "sweetalert2";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import "./BoardAdd.scss"
import SEO from "../../components/SEO";

const BoardAdd = () => {
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [updateValue, setUpdateValue] = useRecoilState(boardUpdate);
    const [boardBoolean, setBoardBoolean] = useState(false);
    const navigate = useNavigate();

    const boardAddApi = async (type: number) => {
        if (title === "" || contents === "") {
            ToastWarn("모두 입력해주세요");
            return;
        } else if (title.length > 30) {
            ToastWarn("제목을 30자 이내로 작성해주세요");
            return;
        } else {
            let typeTitle = "글을 등록하시겠어요?";
            let typeUrl = "/boardAdd";
            let typeData = { title, contents, userNo: userInfo[0].userNo, boardNo: 0 };

            if (type === 1) {
                typeTitle = "글을 수정하시겠어요?"
                typeUrl = "/boardUpdate";
                typeData.boardNo = updateValue.boardNo;
            }

            const result = await Swal.fire({
                title: typeTitle,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: 'black',
                cancelButtonColor: 'red',
                confirmButtonText: '네',
                cancelButtonText: '아니요'
            })

            if (result.isConfirmed) {
                try {
                    await axios.post(typeUrl, typeData);
                    if (type === 1) {
                        ToastSuccess("글이 수정되었어요!");
                    } else ToastSuccess("글이 등록되었어요!");
                    setUpdateValue({ titleValue: "", contentsValue: "", boardNo: 0 });
                    navigate("/");
                } catch (e) {
                    if (type === 1) {
                        ToastError("수정을 실패했어요");
                    } else ToastError("등록을 실패했어요");
                    console.error(e);
                }
            }
        }
    }

    const boardLoginCheck = () => {
        if (userInfo[0].userNo === 0) {
            ToastWarn("로그인을 해주세요");
            setBoardBoolean(true);
            return;
        }
    }

    // 수정시
    useEffect(() => {
        if (updateValue.titleValue) {
            setTitle(updateValue.titleValue);
        } else setTitle("");

        if (updateValue.contentsValue) {
            setContents(updateValue.contentsValue);
        } else setContents("");
    }, [updateValue.titleValue, updateValue.contentsValue]);

    return (
        <>
            <button className="boardDetail-backbutton" onClick={() => navigate(-1)}>&lt;&nbsp;&nbsp;이전으로</button>
            <SEO title="글쓰기" contents="글쓰기" />
            <div className="boardAdd-container">
                <div className="boardAdd-titleBlock">
                    <Label text="제목" />
                    <Input placeholder="제목을 입력해주세요" disabled={boardBoolean}
                        onFocus={boardLoginCheck} onChange={e => setTitle(e.target.value)} value={title} />
                </div>
                <Label text="내용" />
                <Line />
                <ReactQuill onChange={setContents} value={contents} placeholder="내용을 입력해주세요" />
                <div className="boardAdd-button">
                    {updateValue.titleValue ? <Button onClick={() => boardAddApi(1)} text="글 수정" />
                        : <Button onClick={() => boardAddApi(0)} text="글 등록" />}
                </div>
            </div>
        </>
    )
}

export default BoardAdd;