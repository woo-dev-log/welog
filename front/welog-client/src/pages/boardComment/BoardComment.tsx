import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
    boardCommentCnt: number;
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
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const ServerImgUrl = "http://localhost:3690/images/";
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

    const deleteBoardCommentOnClick = useCallback(async (commentNo: number) => {
        try {
            await deleteBoardCommentApi(IntBoardNo, commentNo);
            ToastSuccess("????????? ??????????????????!");
            getBoardComment();
        } catch (e) {
            ToastError("?????? ????????? ???????????????");
            console.error(e);
        }
    }, []);

    const updateBoardCommentOnClick = useCallback(async (commentContents: string, commentNo: number) => {
        if (boardCommentUpdate === "") {
            ToastWarn("????????? ??????????????????");
            return;
        } else if (commentContents === boardCommentUpdate) {
            ToastWarn("????????? ????????? ?????????");
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
                ToastSuccess("????????? ??????????????????!");
                getBoardComment();
            } catch (e) {
                ToastError("?????? ????????? ???????????????");
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
            ToastWarn("????????? ??????????????????");
            return;
        } else if (userInfo[0].userNo === 0) {
            ToastWarn("???????????? ????????????");
            setCommentCheckLogin(true);
            return;
        } else {
            try {
                await writeBoardCommentApi(IntBoardNo, boardCommentWrite, userInfo[0].userNo);
                setBoardCommentWrite("");
                ToastSuccess("????????? ??????????????????!");
                getBoardComment();
            } catch (e) {
                ToastError("?????? ????????? ???????????????");
                console.error(e);
            }
        }
    }, [boardCommentWrite, userInfo]);

    const checkLoginBoardCommentOnFocus = () => {
        if (userInfo[0].userNo === 0) {
            ToastWarn("???????????? ????????????");
            setCommentCheckLogin(true);
            return;
        }
    }

    const getBoardComment = async () => {
        try {
            const data = await getBoardCommentApi(IntBoardNo, page ? page : "1");
            setBoardCommentList(data);
        } catch (e) {
            ToastError("?????? ????????? ???????????????");
            console.error(e);
        }
    }

    useEffect(() => {
        if(page) {
            setCurrentPage(Number(page));
        } else setCurrentPage(1);

        getBoardComment();
    }, [page]);

    return (
        <>
            {boardCommentList.length > 0 && <Label text={boardCommentList[0].boardCommentCnt + "?????? ????????? ?????????"} />}
            <textarea ref={textRef} value={boardCommentWrite} placeholder="????????? ??????????????????" disabled={commentCheckLogin}
                onFocus={checkLoginBoardCommentOnFocus} onInput={autoHeightRef} onChange={e => setBoardCommentWrite(e.target.value)} />
            <div className="boardComment-commentAddBtn">
                <Button onClick={writeBoardCommentOnClick} text="?????? ??????" />
            </div>

            {boardCommentList.length > 0 && <Paging
                total={boardCommentList[0].boardCommentCnt}
                limit={limit}
                page={currentPage}
                setCurrentPage={setCurrentPage} />
            }

            {boardCommentList.map((boardC, j) => (
                <article key={j} className="boardComment-commentContainer">
                    <Line />
                    <header className="boardComment-commentBlock">
                        <div className="boardComment-commentLabel">
                            <img src={`${ServerImgUrl}${boardC.imgUrl}`} alt={boardC.imgUrl}
                                onClick={() => userBoardOnClick(boardC.nickname)} />
                            <p className="boardComment-commentNickname" onClick={() => userBoardOnClick(boardC.nickname)}>{boardC.nickname}</p>
                            <div className="boardComment-date">
                                <p className="boardComment-commentRgstrDate">{dayjs(boardC.rgstrDate).format('YY.MM.DD HH:mm')} ??????</p>
                                {boardC.updateDate &&
                                    <p className="boardComment-commentRgstrDate">{dayjs(boardC.updateDate).format('YY.MM.DD HH:mm')} ??????</p>}
                            </div>
                        </div>
                    </header>
                    {commentUpdateCheckNo === boardC.commentNo && userInfo[0].userNo !== 0
                        ? <textarea ref={textRef} value={boardCommentUpdate} placeholder="????????? ??????????????????"
                            onInput={autoHeightRef} onChange={e => setBoardCommentUpdate(e.target.value)} />
                        : <p dangerouslySetInnerHTML={{ __html: boardC.contents.replaceAll(/(\n|\r\n)/g, '<br>') }} />}

                    <footer className="boardComment-commentDeleteBtn">
                        {userInfo[0].userNo === boardC.userNo &&
                            <>
                                {commentUpdateBoolean && commentUpdateCheckNo === boardC.commentNo &&
                                    <Button onClick={() => updateBoardCommentOnClick(boardC.contents, boardC.commentNo)} text="?????? ??????" />}
                                {!commentUpdateBoolean &&
                                    <>
                                        <Button onClick={() => updateCheckBoardCommentOnClick(boardC.contents, boardC.commentNo)} text="??????" />
                                        <Button onClick={() => deleteBoardCommentOnClick(boardC.commentNo)} text="??????" />
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