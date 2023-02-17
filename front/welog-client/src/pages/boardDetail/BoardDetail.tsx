import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import Swal from "sweetalert2";
import { boardUpdate, loginUser } from "../../components/atoms";
import Button from "../../components/button/Button";
import Label from "../../components/label/Label";
import Line from "../../components/line/Line";
import Paging from "../../components/paging/Paging";
import SEO from "../../components/SEO";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import "./BoardDetail.scss";

interface BoardDetailType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    updateDate: string;
    nickname: string;
    imgUrl: string;
}

interface BoardCommentType {
    commentNo: number;
    boardNo: number;
    userNo: number;
    contents: string;
    rgstrDate: string;
    updateDate: string;
    nickname: string;
    imgUrl: string;
}

const BoardDetail = () => {
    const [boardDetail, setBoardDetail] = useState<BoardDetailType[]>([]);
    const [boardComment, setBoardComment] = useState<BoardCommentType[]>([]);
    const [boardCommentAdd, setBoardCommentAdd] = useState("");
    const [boardCommentUpdate, setBoardCommentUpdate] = useState("");
    const [currentPage, setcurrentPage] = useState(1);
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [updateValue, setUpdateValue] = useRecoilState(boardUpdate);
    const [commentBoolean, setCommentBoolean] = useState(false);
    const [commentUpdateBoolean, setCommentUpdateBoolean] = useState(false);
    const [commentUpdateCheck, setCommentUpdateCheck] = useState(0);
    const { boardNo } = useParams();
    const textRef = useRef<HTMLTextAreaElement>(null);
    const navigate = useNavigate();
    const limit = 5;
    const offset = (currentPage - 1) * limit;

    const autoHeight = () => {
        if (textRef.current) {
            textRef.current.style.height = textRef.current.scrollHeight + "px";
            return;
        }
    };

    const userBoardHandeler = useCallback((nickname: string) => {
        navigate("/userBoard/" + nickname);
    }, []);

    const boardCommentDeleteApi = useCallback(async (commentNo: number) => {
        try {
            await axios.post("/boardCommentDelete", { boardNo, commentNo });
            ToastSuccess("댓글이 삭제되었어요!");
            boardCommentApi();
        } catch (e) {
            ToastError("댓글 삭제를 실패했어요");
            console.error(e);
        }
    }, []);

    const boardCommentUpdateApi = useCallback(async (commentContents: string, commentNo: number) => {
        if (boardCommentUpdate === "") {
            ToastWarn("댓글을 입력해주세요");
            return;
        } else if (commentContents === boardCommentUpdate) {
            ToastWarn("수정된 내용이 없어요");
            setBoardCommentAdd("");
            setBoardCommentUpdate("");
            setCommentUpdateCheck(0);
            setCommentUpdateBoolean(false);
            return;
        } else {
            try {
                await axios.post("/boardCommentUpdate", { boardNo, boardCommentUpdate, userNo: userInfo[0].userNo, commentNo });
                setBoardCommentAdd("");
                setBoardCommentUpdate("");
                setCommentUpdateCheck(0);
                setCommentUpdateBoolean(false);
                ToastSuccess("댓글이 수정되었어요!");
                boardCommentApi();
            } catch (e) {
                ToastError("댓글 수정을 실패했어요");
                console.error(e);
            }
        }
    }, [boardCommentUpdate, userInfo]);

    const boardCommentUpdateCheckApi = (boardCContents: string, boardCNo: number) => {
        setBoardCommentUpdate(boardCContents);
        setCommentUpdateCheck(boardCNo);
        setCommentUpdateBoolean(true);
    }

    const boardCommentAddApi = useCallback(async () => {
        if (boardCommentAdd === "") {
            ToastWarn("댓글을 입력해주세요");
            return;
        } else if (userInfo[0].userNo === 0) {
            ToastWarn("로그인을 해주세요");
            setCommentBoolean(true);
            return;
        } else {
            try {
                await axios.post("/boardCommentAdd", { boardNo, boardCommentAdd, userNo: userInfo[0].userNo });
                setBoardCommentAdd("");
                ToastSuccess("댓글이 등록되었어요!");
                boardCommentApi();
            } catch (e) {
                ToastError("댓글 등록을 실패했어요");
                console.error(e);
            }
        }
    }, [boardCommentAdd, userInfo]);

    const boardCommentLoginCheck = () => {
        if (userInfo[0].userNo === 0) {
            ToastWarn("로그인을 해주세요");
            setCommentBoolean(true);
            return;
        }
    }

    const boardCommentApi = async () => {
        try {
            const { data } = await axios.post("/boardComment", { boardNo });
            setBoardComment(data);
        } catch (e) {
            ToastError("댓글 조회를 실패했어요");
            console.error(e);
        }
    }

    const boardDeleteApi = async () => {
        try {
            const result = await Swal.fire({
                title: '글을 삭제하시겠어요?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'black',
                cancelButtonColor: 'red',
                confirmButtonText: '네',
                cancelButtonText: '아니요'
            })

            if (result.isConfirmed) {
                await axios.post("/boardDelete", { boardNo });
                ToastSuccess("글이 삭제되었어요!");
                navigate("/");
            }

        } catch (e) {
            ToastError("글 삭제를 실패했어요");
            console.error(e);
        }
    }

    const boardUpdateApi = () => {
        setUpdateValue({ titleValue: boardDetail[0].title, contentsValue: boardDetail[0].contents, boardNo: boardDetail[0].boardNo });
        navigate("/boardAdd");
    }

    const boardDetailApi = async () => {
        try {
            const { data } = await axios.post("/boardDetail", { boardNo });
            setBoardDetail(data);
        } catch (e) {
            ToastError("상세 글 조회를 실패했어요");
            console.error(e);
        }
    }

    useEffect(() => {
        boardDetailApi();
        boardCommentApi();
    }, [boardNo]);

    return (
        <>
            <SEO title="상세 글" contents="상세 글" />
            <button className="boardDetail-backbutton" onClick={() => navigate(-1)}>&lt;&nbsp;&nbsp;이전으로</button>
            {boardDetail[0] &&
                <div className="boardDetail-container">
                    <div className="boardDetail-titleContainer">
                        <Label text="제목" />
                        <div className="boardDetail-title">{boardDetail[0].title}</div>
                    </div>
                    <Line />

                    <div className="boardDetail-writerContainer">
                        <img src={`http://localhost:3690/images/${boardDetail[0].imgUrl}`} alt={boardDetail[0].imgUrl}
                            onClick={() => userBoardHandeler(boardDetail[0].nickname)} />
                        <div className="boardDetail-nickname" onClick={() => userBoardHandeler(boardDetail[0].nickname)}>
                            {boardDetail[0].nickname}
                        </div>
                        <div className="boardDetail-date">
                            <div className="boardDetail-rgstrDate">{dayjs(boardDetail[0].rgstrDate).format('YYYY.MM.DD HH:mm')} 등록</div>
                            {boardDetail[0].updateDate && <div className="boardDetail-rgstrDate">{dayjs(boardDetail[0].updateDate).format('YYYY.MM.DD HH:mm')} 수정</div>}
                        </div>
                    </div>
                    <Line />

                    <div className="boardDetail-contentsContainer">
                        <Label text="내용" />
                        <Line />
                        <div className="boardDetail-contents" dangerouslySetInnerHTML={{ __html: boardDetail[0].contents }} />

                        {userInfo[0].userNo === boardDetail[0].userNo &&
                            <div className="boardDetail-deleteBtn">
                                <Button onClick={boardUpdateApi} text="수정" />
                                <Button onClick={boardDeleteApi} text="삭제" />
                            </div>
                        }
                        <Line />
                    </div>

                    {boardComment && <Label text={boardComment.length + "개의 댓글이 있어요"} />}
                    <textarea ref={textRef} value={boardCommentAdd} placeholder="댓글을 입력해주세요" disabled={commentBoolean}
                        onFocus={boardCommentLoginCheck} onInput={autoHeight} onChange={e => setBoardCommentAdd(e.target.value)} />
                    <div className="boardDetail-commentAddBtn">
                        <Button onClick={boardCommentAddApi} text="댓글 등록" />
                    </div>

                    {boardComment.length > 0 && <Paging
                        total={boardComment.length}
                        limit={limit}
                        page={currentPage}
                        setCurrentPage={setcurrentPage} />
                    }

                    {boardComment.slice(offset, offset + limit).map((boardC, j) => (
                        <div key={j} className="boardDetail-commentContainer">
                            <Line />
                            <div className="boardDetail-commentBlock">
                                <div className="boardDetail-commentLabel">
                                    <img src={`http://localhost:3690/images/${boardC.imgUrl}`} alt={boardC.imgUrl}
                                        onClick={() => userBoardHandeler(boardC.nickname)} />
                                    <div className="boardDetail-commentNickname" onClick={() => userBoardHandeler(boardC.nickname)}>{boardC.nickname}</div>
                                    <div className="boardDetail-date">
                                        <div className="boardDetail-commentRgstrDate">{dayjs(boardC.rgstrDate).format('YYYY.MM.DD HH:mm')} 등록</div>
                                        {boardC.updateDate &&
                                            <div className="boardDetail-commentRgstrDate">{dayjs(boardC.updateDate).format('YYYY.MM.DD HH:mm')} 수정</div>}
                                    </div>
                                </div>
                            </div>
                            {commentUpdateCheck === boardC.commentNo && userInfo[0].userNo !== 0
                                ? <textarea ref={textRef} value={boardCommentUpdate} placeholder="댓글을 입력해주세요"
                                    onInput={autoHeight} onChange={e => setBoardCommentUpdate(e.target.value)} />
                                : <div dangerouslySetInnerHTML={{ __html: boardC.contents.replaceAll(/(\n|\r\n)/g, '<br>') }} />}

                            <div className="boardDetail-commentDeleteBtn">
                                {userInfo[0].userNo === boardC.userNo &&
                                    <>
                                        {commentUpdateBoolean && commentUpdateCheck === boardC.commentNo &&
                                            <Button onClick={() => boardCommentUpdateApi(boardC.contents, boardC.commentNo)} text="수정 완료" />}
                                        {!commentUpdateBoolean && <Button onClick={() =>
                                            boardCommentUpdateCheckApi(boardC.contents, boardC.commentNo)} text="수정" />}

                                        <Button onClick={() => boardCommentDeleteApi(boardC.commentNo)} text="삭제" />
                                    </>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            }
        </>
    )
}

export default BoardDetail;