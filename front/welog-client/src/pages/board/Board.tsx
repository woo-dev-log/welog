import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { loginUser } from "../../components/atoms";
import Button from "../../components/button/Button";
import Line from "../../components/line/Line";
import Paging from "../../components/paging/Paging";
import SEO from "../../components/SEO";
import { ToastError, ToastWarn } from "../../components/Toast";
import './Board.scss';

interface BoardType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    views: number;
    nickname: string;
    imgUrl: string;
    commentCnt: number;
}

const Board = () => {
    const [boardInfo, setBoardInfo] = useState<BoardType[]>([]);
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [currentPage, setcurrentPage] = useState(1);
    const [cookies, setCookie] = useCookies(['viewPost']);
    const navigate = useNavigate();
    const limit = 6;
    const offset = (currentPage - 1) * limit;

    const onClickHandeler = async (boardNo: number, views: number) => {
        if (Array.isArray(cookies.viewPost) && !cookies.viewPost.includes(boardNo)) {
            console.log(cookies.viewPost);
            try {
                await axios.post("/boardViews", { boardNo, views: views + 1 });
            }
            catch (e) {
                console.error(e);
            }
        }

        setCookie("viewPost", [cookies.viewPost, boardNo], { sameSite: 'strict' });
        navigate("/" + boardNo);
    }

    const getUserBoardApi = useCallback(async () => {
        try {
            const { data } = await axios.post("/userBoard", { userNickname: userInfo[0].nickname });
            setBoardInfo(data);
            setcurrentPage(1);
        } catch (e) {
            ToastError("글 조회를 실패했어요");
            console.error(e);
        }
    }, [userInfo]);

    const getBoardApi = useCallback(async () => {
        try {
            const { data } = await axios.get("/board");
            setBoardInfo(data);
            setcurrentPage(1);
        } catch (e) {
            ToastError("글 조회를 실패했어요");
            console.error(e);
        }
    }, []);

    useEffect(() => {
        getBoardApi();
    }, []);

    return (
        <>
            <SEO title="메인" contents="리스트" />
            {boardInfo.length === 0 ? <h1>작성한 글이 없어요</h1> :
                <div className="board-container">
                    <div className="board-top">
                        <div className="board-boardList">
                            <Button onClick={getBoardApi} text="전체 글" />
                            {userInfo[0].userNo !== 0 && <Button onClick={getUserBoardApi} text="내 글" />}
                        </div>
                        <Paging
                            total={boardInfo.length}
                            limit={limit}
                            page={currentPage}
                            setCurrentPage={setcurrentPage}
                        />
                    </div>
                    <div className="board-flexWrap">
                        {boardInfo.slice(offset, offset + limit).map((board, i) => (
                            <div key={i} className="board-block" onClick={() => onClickHandeler(board.boardNo, board.views)}>
                                <div>
                                    <div className="board-userBlock">
                                        <img src={`http://localhost:3690/images/${board.imgUrl}`} alt={board.imgUrl} />
                                        <div className="board-nickname">{board.nickname}</div>
                                    </div>
                                    <Line />
                                    <div className="board-title">{board.title}</div>
                                    <div className="board-contents">
                                        {board.contents.replaceAll(/<[^>]*>?/g, "").length < 60
                                            ? board.contents.replaceAll(/<[^>]*>?/g, "")
                                            : board.contents.replaceAll(/<[^>]*>?/g, "").substring(0, 60) + " ..."}
                                    </div>
                                </div>
                                <div className="board-footer">
                                    <div>{dayjs(board.rgstrDate).format('YYYY.MM.DD HH:mm')}</div>
                                    <div className="board-click">
                                        <img src="./public/click.svg" alt="click" />
                                        <div>{board.views}</div>
                                    </div>
                                    <div className="board-comment">
                                        <img src="./public/comment.svg" alt="comment" />
                                        <div>{board.commentCnt}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="board-button">
                        <Button onClick={() => { userInfo[0].userNo !== 0 ? navigate("/BoardAdd") : ToastWarn("로그인을 해주세요") }} text="글쓰기" />
                    </div>
                </div>}
        </>
    )
};

export default Board;