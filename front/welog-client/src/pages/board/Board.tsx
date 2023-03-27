import { useCallback, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { board, boardUpdate, loginUser } from "../../store/atoms";
import { getBoardDailyApi, updateBoardViewsApi } from "../../api/board";
import { ToastError, ToastWarn } from "../../components/Toast";
import { debounce } from "lodash-es";
import SEO from "../../components/SEO";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import './Board.scss';
import Post from "../../components/post/Post";
import DayFormat from "../../components/DayFormat";

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
    boardCnt: number;
    commentCnt: number;
    weekCommentCnt?: number;
}

const Board = () => {
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [boardList, setBoardList] = useRecoilState(board);
    const [updateValue, setUpdateValue] = useRecoilState(boardUpdate);
    const [cookies, setCookie, removeCookie] = useCookies(['viewPost']);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const ServerImgUrl = "https://welog.fly.dev/images/";
    const contentsWordLength = window.innerWidth < 1199 ? 38 : 38;
    const boardCnt = boardList.length > 0 ? boardList[0].boardCnt : 0;
    const [slideIndex, setSlideIndex] = useState(0);
    const boardDailyRef = useRef<HTMLDivElement>(null);
    const boardDailyWidth = boardDailyRef.current
        ? boardDailyRef.current.clientWidth + 10 : 600;

    const { data: boardDailyList, isLoading: boardDailyLoading } = useQuery<BoardType[]>("boardDailyList", async () => {
        try {
            const data = await getBoardDailyApi();
            return data;
        } catch (e) {
            ToastError("데일리 글 조회를 실패했어요");
            console.error(e);
        }
    },
        {
            keepPreviousData: true,
            cacheTime: 1000 * 60 * 10,
        }
    );

    const writeBoardOnclick = () => {
        if (userInfo[0].userNo !== 0) {
            setUpdateValue({
                titleValue: "",
                contentsValue: "",
                boardNo: 0
            })
            navigate("/BoardWrite");
        } else ToastWarn("로그인을 해주세요");
    }

    const searchBoardListOnChange = debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            setSearchParams({ "keyword": e.target.value });
        } else navigate("/");
    }, 500);

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

    return (
        <div className="board-postContainer">
            <SEO title="메인" contents="리스트" />
            {boardDailyLoading
                ? <>
                    <div className="skeleton-boardDailyText" />
                    <section className="skeleton-boardDailySection">
                        <div className="skeleton-boardDailyBlock" />
                        <div className="skeleton-boardDailyBlock" />
                        <div className="skeleton-boardDailyBlock" />
                    </section>
                    <div className="skeleton-boardInput" />
                    <div className="skeleton-boardTop">
                        <div className="skeleton-boardText" />
                        <div className="skeleton-boardBtn" />
                    </div>
                </>
                : boardDailyList === undefined
                    ? <h2>이번주에 댓글이 달린 글이 없어요</h2>
                    : <>
                        <h2>이번주 댓글 Top {boardDailyList.length}</h2>
                        <section className="boardDaily-section">
                            <article className="boardDaily-article"
                                style={{ transform: `translateX(-${slideIndex * boardDailyWidth}px)` }}>
                                {boardDailyList.map((boardDaily, i) => (
                                    <div key={i} ref={boardDailyRef} className="boardDaily-block">
                                        <aside className="board-asideBoardImg"
                                            onClick={() => updateBoardViewsOnClick(boardDaily.boardNo, boardDaily.views)}>
                                            <img src={`${ServerImgUrl}${boardDaily.boardImgUrl}`} alt="boardDailyImgUrl" loading="lazy" />
                                        </aside>
                                        <div className="board-contentsContainer">
                                            <header onClick={() => updateBoardViewsOnClick(boardDaily.boardNo, boardDaily.views)}>
                                                <div className="board-title">
                                                    <p>{boardDaily.title}</p>
                                                    <p className="boardDaily-weekComment">New {boardDaily.weekCommentCnt}</p>
                                                </div>
                                                <p className="board-contents">
                                                    {boardDaily.contents.replaceAll(/<[^>]*>?/g, "").length < contentsWordLength
                                                        ? boardDaily.contents.replaceAll(/<[^>]*>?/g, "")
                                                        : boardDaily.contents.replaceAll(/<[^>]*>?/g, "").substring(0, contentsWordLength) + " ..."}
                                                </p>
                                            </header>
                                            <footer>
                                                <div className="board-userBlock">
                                                    <img src={`${ServerImgUrl}${boardDaily.imgUrl}`} alt={boardDaily.imgUrl} loading="lazy"
                                                        className="board-userProfileImg" onClick={() => navigate("/userBoard/" + boardDaily.nickname)} />
                                                    <p className="board-nickname" onClick={() => navigate("/userBoard/" + boardDaily.nickname)}>{boardDaily.nickname}</p>
                                                </div>
                                                <div className="board-footer">
                                                    <p>{DayFormat(boardDaily.rgstrDate)}</p>
                                                    <div className="board-postInfo">
                                                        <div className="board-views">
                                                            <img src="/views.svg" alt="views" />
                                                            <p>{boardDaily.views}</p>
                                                        </div>
                                                        <div className="board-comment">
                                                            <img src="/comment.svg" alt="comment" />
                                                            <p>{boardDaily.commentCnt}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </footer>
                                            <div className="board-tagContainer">
                                                {boardDaily.tags && boardDaily.tags.split(",").map((v, i) => (
                                                    <p key={i} className="board-tagBox">{v}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </article>
                            {slideIndex > 0 && <button className="boardDaily-prevBtn"
                                onClick={() => setSlideIndex(slideIndex - 1)}>&lt;</button>}
                            {slideIndex !== boardDailyList.length - 1 && <button className="boardDaily-nextBtn"
                                onClick={() => setSlideIndex(slideIndex + 1)}>&gt;</button>}
                        </section>

                        <div className="board-topBlock">
                            <Input placeholder="제목, 내용, 닉네임을 입력해주세요" onChange={searchBoardListOnChange} />
                            <div className="board-top">
                                {searchParams.get("keyword")
                                    ? <p>{searchParams.get("keyword")} 검색 결과 총 {boardCnt}개의 글을 찾았어요</p>
                                    : <p>총 {boardCnt}개의 글이 있어요</p>}
                                <div className="board-button">
                                    <Button onClick={writeBoardOnclick} text="글쓰기" />
                                </div>
                            </div>
                        </div>
                    </>}
            <Post />
        </div>
    )
};

export default Board;