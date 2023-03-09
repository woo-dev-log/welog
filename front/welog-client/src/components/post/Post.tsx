import dayjs from "dayjs";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { getBoardApi, getUserBoardApi, updateBoardViewsApi } from "../../api/board";
import { board } from "../../store/atoms";
import Line from "../line/Line";
import Paging from "../paging/Paging";
import { ToastError } from "../Toast";
import './Post.scss';

interface BoardType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    views: number;
    tags: string;
    boardImgUrl: string;
    nickname: string;
    imgUrl: string;
    commentCnt: number;
    weekCommentCnt?: number;
}

const Post = () => {
    const { userNickname } = useParams();
    const [cookies, setCookie] = useCookies(['viewPost', 'boardCurrentPage']);
    const [boardList, setBoardList] = useRecoilState(board);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();
    const ServerImgUrl = "http://localhost:3690/images/";
    const limit = 5;
    const offset = (currentPage - 1) * limit;
    const contentsWordLength = window.innerWidth < 768 ? 25 : 58;

    const { data: post, isLoading } = useQuery<BoardType[]>(['userBoardList'], async () => {
        try {
            const data = await getBoardApi();
            return data;
        } catch (e) {
            ToastError("글 조회를 실패했어요");
            console.error(e);
        }
    },
        {
            keepPreviousData: true,
            cacheTime: 1000 * 60 * 10,
        }
    );

    const userBoardApi = async () => {
        const data = await getUserBoardApi(userNickname);
        setBoardList(data);
    }

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

    useEffect(() => {
        if (userNickname) {
            userBoardApi();
        } else if (post && !userNickname) {
            setBoardList(post);
        };
        setCookie("boardCurrentPage", 1);
    }, [post, userNickname]);

    return (
        <>
            {isLoading
                ? <h2>글을 불러오는 중이에요</h2>
                :
                <section className="board-section">
                    {boardList.slice(offset, offset + limit).map((board, i) => (
                        <article key={i}>
                            <div className="board-block">
                                <aside onClick={() => updateBoardViewsOnClick(board.boardNo, board.views)}>
                                    <img src={`${ServerImgUrl}${board.boardImgUrl}`} alt="boardImgUrl" />
                                </aside>
                                <div className="board-contentsContainer">
                                    <header onClick={() => updateBoardViewsOnClick(board.boardNo, board.views)}>
                                        <p className="board-title">{board.title}</p>
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
                                                    <p key={i} className="board-tagBox">{v}</p>
                                                ))}
                                            </div>
                                            <div className="board-userBlock" onClick={() => navigate("/userBoard/" + board.nickname)}>
                                                <img src={`${ServerImgUrl}${board.imgUrl}`} alt="userImg"
                                                    className="board-userProfileImg" />
                                                <p className="board-nickname">{board.nickname}</p>
                                            </div>
                                        </div>
                                        <div className="board-footer">
                                            <p>{dayjs(board.rgstrDate).format('YY.MM.DD HH:mm')}</p>
                                            <div className="board-postInfo">
                                                <div className="board-views">
                                                    <img src="/views.svg" alt="views" />
                                                    <p>{board.views}</p>
                                                </div>
                                                <div className="board-comment">
                                                    <img src="/comment.svg" alt="comment" />
                                                    <p>{board.commentCnt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </footer>
                                </div>
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
                </section>}
        </>
    )
}

export default Post;