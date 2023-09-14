import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { getBoardApi, getUserBoardApi, postBoardApi, updateBoardViewsApi } from "../../api/board";
import { board } from "../../store/atoms";
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
    const [searchParams, setSearchParams] = useSearchParams();
    const [postLoading, setPostLoading] = useState(false);
    const navigate = useNavigate();
    const ServerImgUrl = "https://d12uvkd7f5nrla.cloudfront.net/";
    const keyword = searchParams.get("keyword");
    const page = searchParams.get("page");
    const boardType = searchParams.get("boardType");
    const limit = 5;
    const contentsWordLength = window.innerWidth < 1199 ? 38 : 58;
    const [isWrap, setIsWrap] = useState(true);

    const { data: post, isLoading } = useQuery<BoardType[]>(['boardList', { boardType, page }],
        () => getBoardApi(boardType ? Number(boardType) : 1, page ? page : "1"),
        {
            keepPreviousData: true,
            cacheTime: 1000 * 60 * 10,
            onError: (error) => {
                ToastError("글 조회를 실패했어요");
                console.error(error);
            }
        }
    );

    const searchBoardApi = async () => {
        try {
            if (keyword) {
                setPostLoading(false);
                const data = await postBoardApi(keyword, page ? page : "1");
                setBoardList(data);
                setPostLoading(true);
                Scroll();
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
                Scroll();
            }
        } catch (e) {
            console.error(e);
        }
    }

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
        <>
            {!postLoading
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
                        {!keyword && !userNickname && <Category />}
                        <div className="template-container">
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
                                <aside className={`board-asideBoardImg ${isWrap ? 'wrap' : 'column'}`}
                                    onClick={() => updateBoardViewsOnClick(board.boardNo, board.views)}>
                                    <img src={`${ServerImgUrl}${board.boardImgUrl}`} alt="boardImgUrl" loading="lazy" />
                                </aside>
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

                                    {board.tags &&
                                        <div className="board-tagContainer">
                                            {board.tags && board.tags.split(",").map((v, i) => (
                                                <p key={i} className="board-tagBox"
                                                    onClick={() => setSearchParams({ "keyword": v })}>{v}</p>
                                            ))}
                                        </div>}
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
                </section>}
        </>
    )
}

export default Post;