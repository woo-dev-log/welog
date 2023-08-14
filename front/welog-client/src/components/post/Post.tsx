import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { getBoardApi, getUserBoardApi, postBoardApi, updateBoardViewsApi } from "../../api/board";
import { board, boardType } from "../../store/atoms";
import DayFormat from "../DayFormat";
import Paging from "../paging/Paging";
import { ToastError } from "../Toast";
import './Post.scss';
import Category from "../category/Category";

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
    boardCnt?: number;
    commentCnt: number;
}

const Post = () => {
    const { userNickname } = useParams();
    const [cookies, setCookie, removeCookie] = useCookies(['viewPost']);
    const [boardList, setBoardList] = useRecoilState(board);
    const [boardTypeNum, setBoardTypeNum] = useRecoilState(boardType);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const [postLoading, setPostLoading] = useState(false);
    const navigate = useNavigate();
    const ServerImgUrl = "https://welog.fly.dev/images/";
    const keyword = searchParams.get("keyword");
    const page = searchParams.get("page");
    const limit = 5;
    const contentsWordLength = window.innerWidth < 1199 ? 38 : 58;

    const { data: post, isLoading } = useQuery<BoardType[]>(['boardList', page], async () => {
        try {
            const data = await getBoardApi(boardTypeNum, page ? page : "1");
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

    const searchBoardApi = async () => {
        try {
            if (keyword) {
                const boardTopBlock = document.querySelector(".board-topBlock") as HTMLElement;
                const boardArticle = document.querySelector(".board-article") as HTMLElement;
                if (boardTopBlock) {
                    const TopBlockOffsetTop = boardTopBlock.offsetTop;
                    window.scrollTo({ top: TopBlockOffsetTop - 80, behavior: "smooth" });
                } else if (boardArticle) {
                    const ArticleOffsetTop = boardArticle.offsetTop;
                    window.scrollTo({ top: ArticleOffsetTop - 80, behavior: "smooth" });
                }
                setPostLoading(false);
                const data = await postBoardApi(keyword, page ? page : "1");
                setBoardList(data);
                setPostLoading(true);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const userBoardApi = async () => {
        try {
            if (userNickname) {
                setPostLoading(false);
                const data = await getUserBoardApi(userNickname, page ? page : "1");
                setBoardList(data);
                setPostLoading(true);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const updateBoardViewsOnClick = useCallback(async (boardNo: number, views: number) => {
        try {
            if (cookies.viewPost) {
                if (!cookies.viewPost.includes(boardNo)) {
                    await updateBoardViewsApi(boardNo, views);
                    removeCookie("viewPost", { path: '/', sameSite: 'strict' });
                    setCookie("viewPost", [...cookies.viewPost, boardNo], { path: '/', sameSite: 'strict' });
                }
            } else {
                await updateBoardViewsApi(boardNo, views);
                removeCookie("viewPost", { path: '/', sameSite: 'strict' });
                setCookie("viewPost", [boardNo], { path: '/', sameSite: 'strict' });
            }
            navigate("/" + boardNo);
        } catch (e) {
            ToastError("조회수 업데이트를 실패했어요");
            console.error(e);
        }
    }, []);

    useEffect(() => {
        userBoardApi();
    }, [userNickname, page]);

    useEffect(() => {
        if (userNickname) return;

        if (keyword) {
            searchBoardApi();
        } else if (post) {
            setPostLoading(false);
            setBoardList(post);
            setPostLoading(true);
        }
    }, [post, keyword]);

    useEffect(() => {
        if (page) {
            setCurrentPage(Number(page));
        } else setCurrentPage(1);
    }, [page]);

    return (
        <section>
            {!postLoading
                ? <div className="skeleton-article">
                    <div className="skeleton-block" />
                    <div className="skeleton-block" />
                    <div className="skeleton-block" />
                    <div className="skeleton-block" />
                    <div className="skeleton-block" />
                </div>
                : boardList.length > 0 &&
                <article className="board-article">
                    {!keyword && !userNickname && <div className="board-Type">
                        <Category />
                    </div>}

                    {boardList.map((board, i) => (
                        <div key={i} className="board-block">
                            <aside className="board-asideBoardImg"
                                onClick={() => updateBoardViewsOnClick(board.boardNo, board.views)}>
                                <img src={`${ServerImgUrl}${board.boardImgUrl}`} alt="boardImgUrl" loading="lazy" />
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
                                    <div className="board-userBlock">
                                        <img src={`${ServerImgUrl}${board.imgUrl}`} alt="userImg" loading="lazy"
                                            className="board-userProfileImg" onClick={() => navigate("/userBoard/" + board.nickname)} />
                                        <p className="board-nickname" onClick={() => navigate("/userBoard/" + board.nickname)}>{board.nickname}</p>
                                    </div>
                                    <div className="board-footer">
                                        <p>{DayFormat(board.rgstrDate)}</p>
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

                                <div className="board-tagContainer">
                                    {board.tags && board.tags.split(",").map((v, i) => (
                                        <p key={i} className="board-tagBox">{v}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    <Paging
                        total={boardList[0].boardCnt ? boardList[0].boardCnt : 1}
                        limit={limit}
                        page={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                </article>}
        </section>
    )
}

export default Post;