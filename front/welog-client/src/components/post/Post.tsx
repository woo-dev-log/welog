import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { getBoardApi, getUserBoardApi, postBoardApi, updateBoardViewsApi } from "../../api/board";
import { board, boardSort, boardType } from "../../store/atoms";
import DayFormat from "../DayFormat";
import Paging from "../paging/Paging";
import { ToastError } from "../Toast";
import './Post.scss';
import Category from "../category/Category";
import Scroll from "../Scroll";

interface BoardType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: Date;
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
    const [cookies, setCookie, removeCookie] = useCookies(['viewPost', 'isWrap']);
    const [boardList, setBoardList] = useRecoilState(board);
    const [currentPage, setCurrentPage] = useState(1);
    const [boardTypeNum, setBoardTypeNum] = useRecoilState(boardType);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const ServerImgUrl = import.meta.env.VITE_SERVER_IMG_URL;
    const keyword = searchParams.get("keyword");
    const page = searchParams.get("page");
    const boardTypeParam = searchParams.get("boardType");
    const limit = 6;
    const contentsWordLength = window.innerWidth < 1024 ? 38 : 58;
    const [isWrap, setIsWrap] = useState(true);
    const [sortBy, setSortBy] = useRecoilState(boardSort);
    const [filterIsOpen, setFilterIsOpen] = useState(false);

    const { data: post, isLoading } = useQuery<BoardType[]>(['boardList', { boardTypeParam, page, sortBy }],
        () => getBoardApi(boardTypeParam ? Number(boardTypeParam) : 1, page ? page : "1", sortBy),
        {
            keepPreviousData: true,
            cacheTime: 1000 * 60 * 10,
            onError: (error) => {
                ToastError("글 조회를 실패했어요");
                console.error(error);
            }
        }
    );

    const { data: searchPost } = useQuery<BoardType[]>(['boardList', { keyword, page, sortBy }],
        () => postBoardApi(keyword ? keyword : "", page ? page : "1", sortBy),
        {
            keepPreviousData: true,
            cacheTime: 1000 * 60 * 10,
            onError: (error) => {
                ToastError("글 검색을 실패했어요");
                console.error(error);
            }
        }
    );

    const { data: userBoardPost } = useQuery<BoardType[]>(['boardList', { userNickname, page, sortBy }],
        () => getUserBoardApi(userNickname ? userNickname : "", page ? page : "1", sortBy),
        {
            keepPreviousData: true,
            cacheTime: 1000 * 60 * 10,
            onError: (error) => {
                ToastError("유저 조회를 실패했어요");
                console.error(error);
            }
        }
    );

    const updateBoardViewsOnClick = useCallback(async (boardNo: number, views: number) => {
        try {
            if (!cookies.viewPost || !cookies.viewPost.includes(boardNo)) {
                await updateBoardViewsApi(boardNo, views);
                const newViewPosts = cookies.viewPost ? [...cookies.viewPost, boardNo] : [boardNo];
                removeCookie("viewPost", { path: '/', sameSite: 'strict' });
                setCookie("viewPost", newViewPosts, { path: '/', sameSite: 'strict' });
            }
            navigate("/" + boardNo);
        } catch (e) {
            ToastError("조회수 업데이트를 실패했어요");
            console.error(e);
        }
    }, []);

    const openFilter = (filter: string) => {
        if (filterIsOpen) {
            setSortBy(filter);
            setFilterIsOpen(false);
        } else {
            setFilterIsOpen(true);
        }
    }

    useEffect(() => {
        if (userNickname && userBoardPost) {
            setBoardList(userBoardPost);
        } else if (keyword && searchPost) {
            setBoardList(searchPost);
            Scroll();
        } else if (post) {
            setBoardList(post);
        }
    }, [userNickname, userBoardPost, post, keyword, searchPost]);

    useEffect(() => {
        if (page) {
            setCurrentPage(Number(page));
        } else setCurrentPage(1);

        if (boardTypeParam) {
            setBoardTypeNum(Number(boardTypeParam));
        }
    }, [page, boardTypeParam]);

    return (
        <>
            {isLoading
                ? <section className="skeleton-section">
                    <div className="skeleton-block" />
                    <div className="skeleton-block" />
                    <div className="skeleton-block" />
                    <div className="skeleton-block" />
                    <div className="skeleton-block" />
                </section>
                : boardList.length > 0 &&
                <section>
                    <div className="category-container">
                        {!keyword && !userNickname
                            ? <Category />
                            : <div />}
                        <div className="template-container">
                            <div className="filter-button"
                                onClick={() => setFilterIsOpen(!filterIsOpen)}>필터</div>
                            {filterIsOpen && <div className="filter-container">
                                <div className={`filter-option ${sortBy === "rgstrDate" ? "active" : ""}`}
                                    onClick={() => openFilter("rgstrDate")}>최신순</div>
                                <div className={`filter-option ${sortBy === "commentCnt" ? "active" : ""}`}
                                    onClick={() => openFilter("commentCnt")}>댓글순</div>
                                <div className={`filter-option ${sortBy === "views" ? "active" : ""}`}
                                    onClick={() => openFilter("views")}>조회순</div>
                            </div>}
                            <button className={`template-button-wrap ${!isWrap ? "" : "disabled"}`}
                                onClick={() => setIsWrap(true)} disabled={isWrap}>
                                <img src="/wrap.svg" alt="wrap" />
                            </button>
                            <button className={`template-button-column ${!isWrap ? "disabled" : ""}`}
                                onClick={() => setIsWrap(false)} disabled={!isWrap}>
                                <img src="/column.svg" alt="column" />
                            </button>
                        </div>
                    </div>

                    <article className={`board-article ${isWrap ? 'wrap' : 'column'}`}>
                        {boardList.map((board, i) => (
                            <div key={i} className={`board-block ${isWrap ? 'wrap' : 'column'}`}>
                                <div className={`board-asideBlock ${isWrap ? 'wrap' : 'column'}`}>
                                    <div className="board-userBlock">
                                        <img src={`${ServerImgUrl}${board.imgUrl}`} alt="userImg" loading="lazy"
                                            className="board-userProfileImg" onClick={() => navigate("/userBoard/" + board.nickname)} />
                                        <p className="board-nickname" onClick={() => navigate("/userBoard/" + board.nickname)}>{board.nickname}</p>
                                    </div>
                                    <aside className={`board-asideBoardImg ${isWrap ? 'wrap' : 'column'}`}
                                        onClick={() => updateBoardViewsOnClick(board.boardNo, board.views)}>
                                        <img src={`${ServerImgUrl}${board.boardImgUrl}`} alt="boardImgUrl" loading="lazy" />
                                    </aside>
                                </div>
                                <div className={`board-contentsContainer ${isWrap ? 'wrap' : 'column'}`}>
                                    <header onClick={() => updateBoardViewsOnClick(board.boardNo, board.views)}>
                                        <p className="board-title">{board.title}</p>
                                        <p className="board-contents">
                                            {board.contents.replaceAll(/<[^>]*>?/g, "").length < contentsWordLength
                                                ? board.contents.replaceAll(/<[^>]*>?/g, "")
                                                : board.contents.replaceAll(/<[^>]*>?/g, "").substring(0, contentsWordLength) + " ..."}
                                        </p>
                                    </header>
                                    <footer>
                                        {board.tags &&
                                            <div className="board-tagContainer">
                                                {board.tags && board.tags.split(",").map((v, i) => (
                                                    <p key={i} className="board-tagBox"
                                                        onClick={() => setSearchParams({ "keyword": v })}>{v}</p>
                                                ))}
                                            </div>
                                        }
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

                                </div>
                            </div>
                        ))}
                    </article>

                    <Paging
                        total={boardList[0].boardCnt ? boardList[0].boardCnt : 1}
                        limit={limit}
                        page={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                </section >}
        </>
    )
}

export default Post;