import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { getBoardApi, getUserBoardApi, postBoardApi, updateBoardViewsApi } from "../../api/board";
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
    boardCnt?: number;
    commentCnt: number;
}

const Post = () => {
    const { userNickname } = useParams();
    const [cookies, setCookie] = useCookies(['viewPost', 'boardCurrentPage']);
    const [boardList, setBoardList] = useRecoilState(board);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const ServerImgUrl = "http://localhost:3690/images/";
    const keyword = searchParams.get("keyword");
    const page = searchParams.get("page");
    const limit = 5;
    const contentsWordLength = window.innerWidth < 1199 ? 35 : 58;

    const { data: post, isLoading } = useQuery<BoardType[]>(['boardList', page], async () => {
        try {
            const data = await getBoardApi(page ? page : "1");
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
                const data = await postBoardApi(keyword, page ? page : "1");
                setBoardList(data);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const userBoardApi = async () => {
        try {
            if (userNickname) {
                const data = await getUserBoardApi(userNickname, page ? page : "1");
                setBoardList(data);
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
        if (userNickname) {
            userBoardApi();
        } else if (post) {
            if (keyword) {
                searchBoardApi();
            } else setBoardList(post);
        };
    }, [post, userNickname, keyword]);

    useEffect(() => {
        if(page) {
            setCurrentPage(Number(page));
        } else setCurrentPage(1);
    }, [page]);

    return (
        <>
            {isLoading
                ? <h2>글을 불러오는 중이에요</h2>
                :
                boardList.length > 0 &&
                <section>
                    {boardList.map((board, i) => (
                        <article key={i} className="board-article">
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
                                        <div className="board-userBlock">
                                            <img src={`${ServerImgUrl}${board.imgUrl}`} alt="userImg"
                                                className="board-userProfileImg" onClick={() => navigate("/userBoard/" + board.nickname)} />
                                            <p className="board-nickname" onClick={() => navigate("/userBoard/" + board.nickname)}>{board.nickname}</p>
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
                            <div className="board-tagContainer">
                                {board.tags && board.tags.split(",").map((v, i) => (
                                    <p key={i} className="board-tagBox">{v}</p>
                                ))}
                            </div>
                            <Line />
                        </article>
                    ))}

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