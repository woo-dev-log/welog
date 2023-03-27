import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { deleteBoardCommentApi, getBoardCommentApi, updateBoardCommentApi, writeBoardCommentApi, writeBoardSubCommentApi } from "../../api/board";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import { loginUser } from "../../store/atoms";
import Line from "../../components/line/Line";
import Label from "../../components/label/Label";
import Button from "../../components/button/Button";
import Paging from "../../components/paging/Paging";
import "./BoardComment.scss";
import Swal from "sweetalert2";
import DayFormat from "../../components/DayFormat";

interface BoardCommentType {
    boardCommentCnt: number;
    commentRows: CommentType[];
    subCommentRows: CommentType[];
}

interface CommentType {
    commentNo: number;
    boardNo: number;
    parentCommentNo: number;
    userNo: number;
    contents: string;
    rgstrDate: string;
    updateDate: string;
    nickname: string;
    imgUrl: string;
    boardCommentCnt: number;
}

const BoardComment = ({ IntBoardNo, IntBoardUserNo }: { IntBoardNo: number, IntBoardUserNo: number }) => {
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [boardCommentList, setBoardCommentList] = useState<BoardCommentType>();
    const [boardCommentWrite, setBoardCommentWrite] = useState("");
    const [boardSubCommentWrite, setBoardSubCommentWrite] = useState("");
    const [boardCommentUpdate, setBoardCommentUpdate] = useState("");
    const [commentCheckLogin, setCommentCheckLogin] = useState(false);
    const [subCommentCheckNo, setSubCommentCheckNo] = useState(0);
    const [commentUpdateCheckNo, setCommentUpdateCheckNo] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const ServerImgUrl = "https://welog.fly.dev/images/";
    const page = searchParams.get("page");
    const textRef = useRef<HTMLTextAreaElement>(null);
    const limit = 5;

    const autoHeightRef = () => {
        if (textRef.current) {
            return textRef.current.style.height = textRef.current.scrollHeight + "px";
        }
    };

    const userBoardOnClick = (nickname: string) => {
        navigate("/userBoard/" + nickname);
    };

    const writeBoardSubCommentOnClick = useCallback(async (IntCommentNo: number) => {
        if (boardSubCommentWrite === "") {
            ToastWarn("대댓글을 입력해주세요");
            return;
        }
        if (userInfo[0].userNo === 0) {
            ToastWarn("로그인을 해주세요");
            setCommentCheckLogin(true);
            return;
        }

        try {
            await writeBoardSubCommentApi(IntBoardNo, IntCommentNo, boardSubCommentWrite, userInfo[0].userNo);
            setBoardSubCommentWrite("");
            setSubCommentCheckNo(0);
            ToastSuccess("대댓글이 작성되었어요!");
            getBoardComment();
        } catch (e) {
            ToastError("대댓글 작성을 실패했어요");
            console.error(e);
        }
    }, [boardSubCommentWrite, userInfo]);

    const deleteBoardCommentOnClick = useCallback(async (commentNo: number) => {
        try {
            const result = await Swal.fire({
                title: '댓글을 삭제하시겠어요?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: 'black',
                cancelButtonColor: 'red',
                confirmButtonText: '네',
                cancelButtonText: '아니요'
            })

            if (result.isConfirmed) {
                await deleteBoardCommentApi(IntBoardNo, commentNo);
                ToastSuccess("댓글이 삭제되었어요!");
                getBoardComment();
            }
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
            setBoardCommentUpdate("");
            setCommentUpdateCheckNo(0);
            return;
        } else {
            try {
                await updateBoardCommentApi(IntBoardNo, boardCommentUpdate, userInfo[0].userNo, commentNo);
                setBoardCommentUpdate("");
                setCommentUpdateCheckNo(0);
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
    }

    const writeBoardCommentOnClick = useCallback(async () => {
        if (boardCommentWrite === "") {
            ToastWarn("댓글을 입력해주세요");
            return;
        }
        if (userInfo[0].userNo === 0) {
            ToastWarn("로그인을 해주세요");
            setCommentCheckLogin(true);
            return;
        }

        try {
            await writeBoardCommentApi(IntBoardNo, boardCommentWrite, userInfo[0].userNo);
            setBoardCommentWrite("");
            ToastSuccess("댓글이 작성되었어요!");
            getBoardComment();
        } catch (e) {
            ToastError("댓글 작성을 실패했어요");
            console.error(e);
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
            setIsLoading(false);
            const data = await getBoardCommentApi(IntBoardNo, page ? page : "1");
            let cnt = 0;
            if (data.commentRows[0]) cnt += data.commentRows[0].boardCommentCnt;
            if (data.subCommentRows[0]) cnt += data.subCommentRows[0].boardCommentCnt;
            data.boardCommentCnt = cnt;
            setBoardCommentList(data);
            setIsLoading(true);
        } catch (e) {
            ToastError("댓글 조회를 실패했어요");
            console.error(e);
        }
    }

    useEffect(() => {
        if (page) {
            setCurrentPage(Number(page));
        } else setCurrentPage(1);

        getBoardComment();
    }, [page]);

    return (
        <>
            {isLoading
                ? boardCommentList &&
                <>
                    {boardCommentList.boardCommentCnt > 0 && <Label text={boardCommentList.boardCommentCnt + "개의 댓글이 있어요"} />}
                    <textarea ref={textRef} value={boardCommentWrite} placeholder="댓글을 입력해주세요" disabled={commentCheckLogin}
                        onFocus={checkLoginBoardCommentOnFocus} onInput={autoHeightRef} onChange={e => setBoardCommentWrite(e.target.value)} />
                    <div className="boardComment-commentAddBtn">
                        <Button onClick={writeBoardCommentOnClick} text="댓글 작성" />
                    </div>

                    {boardCommentList.boardCommentCnt > 0 && <Paging
                        total={boardCommentList.commentRows[0].boardCommentCnt}
                        limit={limit}
                        page={currentPage}
                        setCurrentPage={setCurrentPage} />
                    }

                    {boardCommentList.commentRows.map((boardC, i) => (
                        <article key={i} className="boardComment-commentContainer">
                            {boardC.parentCommentNo === 0 &&
                                <div className="boardComment-commentContainer">
                                    <Line />
                                    <header className="boardComment-commentBlock">
                                        <div className="boardComment-commentLabel">
                                            <img src={`${ServerImgUrl}${boardC.imgUrl}`} alt={boardC.imgUrl}
                                                onClick={() => userBoardOnClick(boardC.nickname)} />
                                            <p className="boardComment-commentNickname" onClick={() => userBoardOnClick(boardC.nickname)}>
                                                <span className={IntBoardUserNo === boardC.userNo ? "coral" : ""}>{boardC.nickname}</span>
                                            </p>
                                        </div>
                                        <div className="boardComment-date">
                                            <p className="boardComment-commentRgstrDate">{DayFormat(boardC.rgstrDate)} 작성</p>
                                            {boardC.updateDate &&
                                                <p className="boardComment-commentRgstrDate">{DayFormat(boardC.updateDate)} 수정</p>}
                                        </div>
                                    </header>
                                    {commentUpdateCheckNo === boardC.commentNo && userInfo[0].userNo !== 0
                                        ? <textarea ref={textRef} value={boardCommentUpdate} placeholder="댓글을 입력해주세요"
                                            onInput={autoHeightRef} onChange={e => setBoardCommentUpdate(e.target.value)} />
                                        : <p dangerouslySetInnerHTML={{ __html: boardC.contents.replaceAll(/(\n|\r\n)/g, '<br>') }} />}

                                    <footer className="boardComment-footer">
                                        {subCommentCheckNo !== boardC.commentNo
                                            ? <div className="boardComment-subCommentText" onClick={() => setSubCommentCheckNo(boardC.commentNo)}>+ 대댓글 쓰기</div>
                                            : <div className="boardComment-subCommentText" onClick={() => setSubCommentCheckNo(0)}>- 대댓글 취소</div>}

                                        {userInfo[0].userNo === boardC.userNo &&
                                            <div className="boardcomment-btn">
                                                {commentUpdateCheckNo === boardC.commentNo
                                                    ? <Button onClick={() => updateBoardCommentOnClick(boardC.contents, boardC.commentNo)} text="수정 완료" />
                                                    : <>
                                                        <Button onClick={() => updateCheckBoardCommentOnClick(boardC.contents, boardC.commentNo)} text="수정" />
                                                        <Button onClick={() => deleteBoardCommentOnClick(boardC.commentNo)} text="삭제" />
                                                    </>}
                                            </div>
                                        }
                                    </footer>

                                    {subCommentCheckNo === boardC.commentNo &&
                                        <div className="boardComment-subCommentTextArea">
                                            <textarea ref={textRef} value={boardSubCommentWrite} placeholder="대댓글을 입력해주세요"
                                                onInput={autoHeightRef} onChange={e => setBoardSubCommentWrite(e.target.value)} />
                                            <Button onClick={() => writeBoardSubCommentOnClick(boardC.commentNo)} text="대댓글 작성" />
                                        </div>}
                                </div>}

                            {boardCommentList.subCommentRows.map((subComment, j) => (
                                boardC.commentNo === subComment.parentCommentNo &&
                                <div key={j} className="boardComment-subCommentBlock">
                                    <Line />
                                    <header className="boardComment-commentBlock">
                                        <div className="boardComment-commentLabel">
                                            <img src={`${ServerImgUrl}${subComment.imgUrl}`} alt={subComment.imgUrl}
                                                onClick={() => userBoardOnClick(subComment.nickname)} />
                                            <p className="boardComment-commentNickname" onClick={() => userBoardOnClick(subComment.nickname)}>
                                                <span className={IntBoardUserNo === subComment.userNo ? "coral" : ""}>{subComment.nickname}</span>
                                            </p>
                                        </div>
                                        <div className="boardComment-date">
                                            <p className="boardComment-commentRgstrDate">{DayFormat(subComment.rgstrDate)} 작성</p>
                                            {subComment.updateDate &&
                                                <p className="boardComment-commentRgstrDate">{DayFormat(subComment.updateDate)} 수정</p>}
                                        </div>
                                    </header>

                                    {commentUpdateCheckNo === subComment.commentNo && userInfo[0].userNo !== 0
                                        ? <textarea ref={textRef} value={boardCommentUpdate} placeholder="댓글을 입력해주세요"
                                            onInput={autoHeightRef} onChange={e => setBoardCommentUpdate(e.target.value)} />
                                        : <p dangerouslySetInnerHTML={{ __html: subComment.contents.replaceAll(/(\n|\r\n)/g, '<br>') }} />}

                                    <footer className="boardComment-footer" style={{ justifyContent: "end" }}>
                                        {userInfo[0].userNo === subComment.userNo &&
                                            <div className="boardcomment-btn">
                                                {commentUpdateCheckNo === subComment.commentNo
                                                    ? <Button onClick={() => updateBoardCommentOnClick(subComment.contents, subComment.commentNo)} text="수정 완료" />
                                                    : <>
                                                        <Button onClick={() => updateCheckBoardCommentOnClick(subComment.contents, subComment.commentNo)} text="수정" />
                                                        <Button onClick={() => deleteBoardCommentOnClick(subComment.commentNo)} text="삭제" />
                                                    </>}
                                            </div>}
                                    </footer>
                                </div>))}
                        </article>))}
                </>
                : <>
                    <div className="skeleton-boardCommentLabel" />
                    <div className="skeleton-boardCommentText" />
                    <div className="skeleton-boardCommentBtnBlock">
                        <div className="skeleton-boardCommentBtn" />
                    </div>
                    <div className="skeleton-boardComment" />
                    <div className="skeleton-boardComment" />
                    <div className="skeleton-boardComment" />
                    <div className="skeleton-boardComment" />
                </>}
        </>
    )
}

export default BoardComment;