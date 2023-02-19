import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { getBoardApi, getUserBoardApi, handleUpdateBoardViewsApi } from "../../api/board";
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
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [currentPage, setCurrentPage] = useState(1);
    const [cookies, setCookie] = useCookies(['viewPost', 'boardCurrentPage']);
    const navigate = useNavigate();
    const limit = 6;
    const offset = (currentPage - 1) * limit;

    const { data: boardInfo, isLoading } = useQuery<BoardType[]>(['boardInfo'], async () => {
        try{
             return await getBoardApi();
        } catch (e) {
            ToastError("글 조회를 실패했어요");
            console.error(e);
        }}, 
        {
            keepPreviousData: true, // 이전 데이터를 유지하여 페이지 이동 시 로딩이 빠르게 됨
            cacheTime: 1000 * 60 * 10, // 캐시 유지 시간 10분
        }
    );

    const handleOnClickUpdateBoardViews = useCallback(async (boardNo: number, views: number) => {
        try {
            if (cookies.viewPost) {
                if (!cookies.viewPost.includes(boardNo)) {
                    await handleUpdateBoardViewsApi(boardNo, views);
                    setCookie("viewPost", [...cookies.viewPost, boardNo], { sameSite: 'strict' });
                }
            } else {
                handleUpdateBoardViewsApi(boardNo, views);
                setCookie("viewPost", [boardNo], { sameSite: 'strict' });
            }
            navigate("/" + boardNo);
        } catch (e) {
            ToastError("조회수 업데이트를 실패했어요");
            console.error(e);
        }
    }, []);

    const handleOnClickGetUserBoard = () => {
        useQuery(['userBoard', userInfo[0].nickname], async () => {
        try{
            return await getUserBoardApi(userInfo[0].nickname);
            // boardInfo 저장해야함 or useState를 생성
        } catch (e) {
            ToastError("유저글 조회를 실패했어요");
            console.error(e);
        }});
        setCurrentPage(1);
    }

    useEffect(() => {
        if (cookies.boardCurrentPage) {
            setCurrentPage(Number(cookies.boardCurrentPage));
        }
    }, [setCurrentPage]);

    return (
        <>
            <SEO title="메인" contents="리스트" />
            {isLoading
                ? <h1>글을 불러오는 중입니다!</h1>
                : boardInfo === undefined
                    ? <h1>작성한 글이 없어요</h1>
                    : <div className="board-container">
                        <div className="board-top">
                            <div className="board-boardList">
                                <Button onClick={() => setCurrentPage(1)} text="전체 글" />
                                {userInfo[0].userNo !== 0 && <Button onClick={handleOnClickGetUserBoard} text="내 글" />}
                            </div>
                            <Paging
                                total={boardInfo.length}
                                limit={limit}
                                page={currentPage}
                                setCurrentPage={setCurrentPage}
                                type="board"
                            />
                        </div>
                        <div className="board-flexWrap">
                            {boardInfo.slice(offset, offset + limit).map((board, i) => (
                                <div key={i} className="board-block" onClick={() => handleOnClickUpdateBoardViews(board.boardNo, board.views)}>
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
                                        <div className="board-postInfo">
                                            <div className="board-click">
                                                <img src="/click.svg" alt="click" />
                                                <div>{board.views}</div>
                                            </div>
                                            <div className="board-comment">
                                                <img src="/comment.svg" alt="comment" />
                                                <div>{board.commentCnt}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="board-button">
                            <Button onClick={() => { userInfo[0].userNo !== 0 ? navigate("/BoardAdd") : ToastWarn("로그인을 해주세요") }} text="글쓰기" />
                        </div>
                    </div>
            }
        </>
    )
};

export default Board;