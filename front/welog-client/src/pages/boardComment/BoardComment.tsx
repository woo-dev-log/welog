import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { deleteBoardCommentApi, getBoardCommentApi, updateBoardCommentApi, writeBoardCommentApi } from "../../api/board";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import { loginUser } from "../../store/atoms";
import Line from "../../components/line/Line";
import Label from "../../components/label/Label";
import Button from "../../components/button/Button";
import Paging from "../../components/paging/Paging";
import "./BoardComment.scss";

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

const BoardComment = ({ IntBoardNo }: { IntBoardNo: number }) => {
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [boardCommentList, setBoardCommentList] = useState<BoardCommentType[]>([]);
    const [boardCommentWrite, setBoardCommentWrite] = useState("");
    const [boardCommentUpdate, setBoardCommentUpdate] = useState("");
    const [commentCheckLogin, setCommentCheckLogin] = useState(false);
    const [commentUpdateBoolean, setCommentUpdateBoolean] = useState(false);
    const [commentUpdateCheckNo, setCommentUpdateCheckNo] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const ServerImgUrl = "http://localhost:3690/images/";
    const textRef = useRef<HTMLTextAreaElement>(null);
    const limit = 5;
    const offset = (currentPage - 1) * limit;

    const autoHeightRef = () => {
        if (textRef.current) {
            return textRef.current.style.height = textRef.current.scrollHeight + "px";
        }
    };

    const userBoardOnClick = (nickname: string) => {
        navigate("/userBoard/" + nickname);
    };

    const deleteBoardCommentOnClick = useCallback(async (commentNo: number) => {
        try {
            await deleteBoardCommentApi(IntBoardNo, commentNo);
            ToastSuccess("댓글이 삭제되었어요!");
            getBoardComment();
        } catch (e) {
            ToastError("댓글 삭제를 실패했어요");
            console.error(e);
        }
    }, []);

    const updateBoardCommentOnClick = useCallback(async (commentContents: string, commentNo: number) => {
        if (boardCommentUpdate === "") {
            ToastWarn("댓글을 입력해주세요");
            return;
        } else if (commentContents === boardCommentUpdate) {
            ToastWarn("수정된 내용이 없어요");
            setBoardCommentWrite("");
            setBoardCommentUpdate("");
            setCommentUpdateCheckNo(0);
            setCommentUpdateBoolean(false);
            return;
        } else {
            try {
                await updateBoardCommentApi(IntBoardNo, boardCommentUpdate, userInfo[0].userNo, commentNo);
                setBoardCommentWrite("");
                setBoardCommentUpdate("");
                setCommentUpdateCheckNo(0);
                setCommentUpdateBoolean(false);
                ToastSuccess("댓글이 수정되었어요!");
                getBoardComment();
            } catch (e) {
                ToastError("댓글 수정을 실패했어요");
                console.error(e);
            }
        }
    }, [boardCommentUpdate, userInfo]);

    const updateCheckBoardCommentOnClick = (boardCContents: string, boardCNo: number) => {
        setBoardCommentUpdate(boardCContents);
        setCommentUpdateCheckNo(boardCNo);
        setCommentUpdateBoolean(true);
    }

    const writeBoardCommentOnClick = useCallback(async () => {
        if (boardCommentWrite === "") {
            ToastWarn("댓글을 입력해주세요");
            return;
        } else if (userInfo[0].userNo === 0) {
            ToastWarn("로그인을 해주세요");
            setCommentCheckLogin(true);
            return;
        } else {
            try {
                await writeBoardCommentApi(IntBoardNo, boardCommentWrite, userInfo[0].userNo);
                setBoardCommentWrite("");
                ToastSuccess("댓글이 등록되었어요!");
                getBoardComment();
            } catch (e) {
                ToastError("댓글 등록을 실패했어요");
                console.error(e);
            }
        }
    }, [boardCommentWrite, userInfo]);

    const checkLoginBoardCommentOnFocus = () => {
        if (userInfo[0].userNo === 0) {
            ToastWarn("로그인을 해주세요");
            setCommentCheckLogin(true);
            return;
        }
    }

    const getBoardComment = async () => {
        try {
            const data = await getBoardCommentApi(IntBoardNo);
            setBoardCommentList(data);
        } catch (e) {
            ToastError("댓글 조회를 실패했어요");
            console.error(e);
        }
    }

    useEffect(() => {
        getBoardComment();
    }, []);

    return (
        <>
            {boardCommentList && <Label text={boardCommentList.length + "개의 댓글이 있어요"} />}
            <textarea ref={textRef} value={boardCommentWrite} placeholder="댓글을 입력해주세요" disabled={commentCheckLogin}
                onFocus={checkLoginBoardCommentOnFocus} onInput={autoHeightRef} onChange={e => setBoardCommentWrite(e.target.value)} />
            <div className="boardComment-commentAddBtn">
                <Button onClick={writeBoardCommentOnClick} text="댓글 등록" />
            </div>

            {boardCommentList.length > 0 && <Paging
                total={boardCommentList.length}
                limit={limit}
                page={currentPage}
                setCurrentPage={setCurrentPage}
                type="boardCommentList" />
            }

            {boardCommentList.slice(offset, offset + limit).map((boardC, j) => (
                <article key={j} className="boardComment-commentContainer">
                    <Line />
                    <header className="boardComment-commentBlock">
                        <div className="boardComment-commentLabel">
                            <img src={`${ServerImgUrl}${boardC.imgUrl}`} alt={boardC.imgUrl}
                                onClick={() => userBoardOnClick(boardC.nickname)} />
                            <div className="boardComment-commentNickname" onClick={() => userBoardOnClick(boardC.nickname)}>{boardC.nickname}</div>
                            <div className="boardComment-date">
                                <div className="boardComment-commentRgstrDate">{dayjs(boardC.rgstrDate).format('YY.MM.DD HH:mm')} 등록</div>
                                {boardC.updateDate &&
                                    <div className="boardComment-commentRgstrDate">{dayjs(boardC.updateDate).format('YY.MM.DD HH:mm')} 수정</div>}
                            </div>
                        </div>
                    </header>
                    {commentUpdateCheckNo === boardC.commentNo && userInfo[0].userNo !== 0
                        ? <textarea ref={textRef} value={boardCommentUpdate} placeholder="댓글을 입력해주세요"
                            onInput={autoHeightRef} onChange={e => setBoardCommentUpdate(e.target.value)} />
                        : <div dangerouslySetInnerHTML={{ __html: boardC.contents.replaceAll(/(\n|\r\n)/g, '<br>') }} />}

                    <footer className="boardComment-commentDeleteBtn">
                        {userInfo[0].userNo === boardC.userNo &&
                            <>
                                {commentUpdateBoolean && commentUpdateCheckNo === boardC.commentNo &&
                                    <Button onClick={() => updateBoardCommentOnClick(boardC.contents, boardC.commentNo)} text="수정 완료" />}
                                {!commentUpdateBoolean &&
                                    <>
                                        <Button onClick={() => updateCheckBoardCommentOnClick(boardC.contents, boardC.commentNo)} text="수정" />
                                        <Button onClick={() => deleteBoardCommentOnClick(boardC.commentNo)} text="삭제" />
                                    </>}
                            </>
                        }
                    </footer>
                </article>
            ))}
        </>
    )
}

export default BoardComment;