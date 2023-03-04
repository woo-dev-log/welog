import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { updateBoardViewsApi } from "../../api/board";
import { board } from "../../store/atoms";
import Line from "../line/Line";
import Paging from "../paging/Paging";
import { ToastError } from "../Toast";
import './Post.scss';

const Post = () => {
    const [cookies, setCookie] = useCookies(['viewPost', 'boardCurrentPage']);
    const [boardList, setBoardList] = useRecoilState(board);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const ServerImgUrl = "http://localhost:3690/images/";
    const limit = 5;
    const offset = (currentPage - 1) * limit;
    const titleWordLength = window.innerWidth < 768 ? 15 : 60;
    const contentsWordLength = window.innerWidth < 768 ? 25 : 60;

    const updateBoardViewsOnClick = useCallback(async (boardNo: number, views: number) => {
        try {
            if (cookies.viewPost) {
                if (!cookies.viewPost.includes(boardNo)) {
                    await updateBoardViewsApi(boardNo, views);
                    setCookie("viewPost", [...cookies.viewPost, boardNo], { sameSite: 'strict' });
                }
            } else {
                await updateBoardViewsApi(boardNo, views);
                setCookie("viewPost", [boardNo], { sameSite: 'strict' });
            }
            navigate("/" + boardNo);
        } catch (e) {
            ToastError("조회수 업데이트를 실패했어요");
            console.error(e);
        }
    }, []);

    useEffect(() => {
        if (cookies.boardCurrentPage) {
            setCurrentPage(Number(cookies.boardCurrentPage));
        }
    }, [setCurrentPage, cookies.boardCurrentPage]);

    return (
        <section>
            {boardList.slice(offset, offset + limit).map((board, i) => (
                <article key={i}>
                    <div className="board-block" onClick={() => updateBoardViewsOnClick(board.boardNo, board.views)}>
                        <div className="board-contentsContainer">
                            <header>
                                <h1 className="board-title">
                                    {board.title.length < titleWordLength
                                        ? board.title
                                        : board.title.substring(0, titleWordLength) + " ..."}
                                </h1>
                                <p className="board-contents">
                                    {board.contents.replaceAll(/<[^>]*>?/g, "").length < contentsWordLength
                                        ? board.contents.replaceAll(/<[^>]*>?/g, "")
                                        : board.contents.replaceAll(/<[^>]*>?/g, "").substring(0, contentsWordLength) + " ..."}
                                </p>
                            </header>
                            <footer>
                                <div className="board-footerTop">
                                    <div className="board-tagContainer">
                                        {board.tags && board.tags.split(",").map((v, i) => (
                                            <div key={i} className="board-tagBox">{v}</div>
                                        ))}
                                    </div>
                                    <div className="board-userBlock">
                                        <img src={`${ServerImgUrl}${board.imgUrl}`} alt="userImg"
                                            className="board-userProfileImg" />
                                        <div className="board-nickname">{board.nickname}</div>
                                    </div>
                                </div>
                                <div className="board-footer">
                                    <div>{dayjs(board.rgstrDate).format('YY.MM.DD HH:mm')}</div>
                                    <div className="board-postInfo">
                                        <div className="board-views">
                                            <img src="/views.svg" alt="views" />
                                            <div>{board.views}</div>
                                        </div>
                                        <div className="board-comment">
                                            <img src="/comment.svg" alt="comment" />
                                            <div>{board.commentCnt}</div>
                                        </div>
                                    </div>
                                </div>
                            </footer>
                        </div>
                        <aside>
                            <img src={`${ServerImgUrl}${board.boardImgUrl}`} alt="boardImgUrl" />
                        </aside>
                    </div>
                    <Line />
                </article>
            ))}

            <Paging
                total={boardList.length}
                limit={limit}
                page={currentPage}
                setCurrentPage={setCurrentPage}
                type="board"
            />
        </section>
    )
}

export default Post;