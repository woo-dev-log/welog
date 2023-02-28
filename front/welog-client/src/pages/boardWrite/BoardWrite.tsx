import Swal from "sweetalert2";
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { boardUpdate, loginUser } from "../../store/atoms";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import { writeBoardApi } from "../../api/board";
import SEO from "../../components/SEO";
import Line from "../../components/line/Line";
import Label from "../../components/label/Label";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import "./BoardWrite.scss"
import 'react-quill/dist/quill.snow.css';
const ReactQuill = lazy(() => import('react-quill'));

const BoardWrite = () => {
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [updateValue, setUpdateValue] = useRecoilState(boardUpdate);
    const [boardBoolean, setBoardBoolean] = useState(false);
    const navigate = useNavigate();

    const WriteBoardOnClick = async (type: number) => {
        if (title === "" || contents === "") {
            ToastWarn("모두 입력해주세요");
            return;
        } else if (title.length > 30) {
            ToastWarn("제목을 30자 이내로 작성해주세요");
            return;
        } else {
            let typeTitle = "글을 등록하시겠어요?";
            let typeUrl = "/writeBoard";
            let typeData = { title, contents, userNo: userInfo[0].userNo, boardNo: 0 };

            if (type === 1) {
                typeTitle = "글을 수정하시겠어요?"
                typeUrl = "/updateBoard";
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
                    await writeBoardApi(typeUrl, typeData);
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

    const CheckBoardLoginOnFocus = () => {
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
            <div className="boardWrite-backbutton" onClick={() => navigate(-1)}>&lt;&nbsp;&nbsp;이전으로</div>
            <SEO title="글쓰기" contents="글쓰기" />
            <div className="boardWrite-container">
                <div className="boardWrite-titleBlock">
                    <Label text="제목" />
                    <Input placeholder="제목을 입력해주세요" disabled={boardBoolean}
                        onFocus={CheckBoardLoginOnFocus} onChange={e => setTitle(e.target.value)} value={title} />
                </div>
                <Label text="내용" />
                <Line />
                <Suspense fallback={<div>Loading...</div>}>
                    <ReactQuill onChange={setContents} value={contents} placeholder="내용을 입력해주세요" />
                </Suspense>
                <div className="boardWrite-button">
                    {updateValue.titleValue ? <Button onClick={() => WriteBoardOnClick(1)} text="글 수정" />
                        : <Button onClick={() => WriteBoardOnClick(0)} text="글 등록" />}
                </div>
            </div>
        </>
    )
}

export default BoardWrite;