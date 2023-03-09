import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { board, boardUpdate, loginUser } from "../../store/atoms";
import { getBoardDailyApi, postBoardApi, updateBoardViewsApi } from "../../api/board";
import { ToastError, ToastWarn } from "../../components/Toast";
import { debounce } from "lodash-es";
import SEO from "../../components/SEO";
import Line from "../../components/line/Line";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import './Board.scss';
import Post from "../../components/post/Post";

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

const Board = () => {
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [boardList, setBoardList] = useRecoilState(board);
    const [updateValue, setUpdateValue] = useRecoilState(boardUpdate);
    const [currentPage, setCurrentPage] = useState(1);
    const [cookies, setCookie] = useCookies(['viewPost', 'boardCurrentPage']);
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();
    const ServerImgUrl = "http://localhost:3690/images/";
    const contentsWordLength = window.innerWidth < 768 ? 25 : 48;

    const { data: boardDailyList, isLoading: boardDailyLoading } = useQuery<BoardType[]>("boardDailyList", async () => {
        try {
            const data = await getBoardDailyApi();
            return data;
        } catch (e) {
            ToastError("데일리 글 조회를 실패했어요");
            console.error(e);
        }
    })

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
        if (e.target.value === keyword) return;

        try {
            const data = await postBoardApi(e.target.value);
            setCurrentPage(1);
            setKeyword(e.target.value);
            setBoardList(data);
        } catch (e) {
            console.error(e);
        }
    }, 500);

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
        <div className="board-postContainer">
            <SEO title="메인" contents="리스트" />
            {boardDailyLoading
                ? <h2>이번주에 댓글이 많이 달린 글을 불러오는 중이에요</h2>
                : boardDailyList === undefined
                    ? <h2>이번주에 댓글이 많이 달린 글이 없어요</h2>
                    : <>
                        <h2>이번주에 댓글이 많이 달린 글이에요</h2>
                        <section className="boardDaily-section">
                            {boardDailyList.map((boardDaily, i) => (
                                <article key={i} className="boardDaily-block">
                                    <aside onClick={() => updateBoardViewsOnClick(boardDaily.boardNo, boardDaily.views)}>
                                        <img src={`${ServerImgUrl}${boardDaily.boardImgUrl}`} alt="boardDailyImgUrl" />
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
                                            <div className="board-footerTop">
                                                <div className="board-tagContainer">
                                                    {boardDaily.tags && boardDaily.tags.split(",").map((v, i) => (
                                                        <p key={i} className="board-tagBox">{v}</p>
                                                    ))}
                                                </div>
                                                <div className="board-userBlock" onClick={() => navigate("/userBoard/" + boardDaily.nickname)}>
                                                    <img src={`${ServerImgUrl}${boardDaily.imgUrl}`} alt={boardDaily.imgUrl}
                                                        className="board-userProfileImg" />
                                                    <p className="board-nickname">{boardDaily.nickname}</p>
                                                </div>
                                            </div>
                                            <div className="board-footer">
                                                <p>{dayjs(boardDaily.rgstrDate).format('YY.MM.DD HH:mm')}</p>
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
                                    </div>
                                    <Line />
                                </article>
                            ))}
                        </section>
                    </>
            }

            <>
                <Input placeholder="제목, 내용, 닉네임을 입력해주세요" onChange={searchBoardListOnChange} />
                <div className="board-top">
                    {keyword
                        ? <p>{keyword} 검색 결과 총 {boardList.length}개의 글을 찾았어요</p>
                        : <p>총 {boardList.length}개의 글이 있어요</p>}
                    <div className="board-button">
                        <Button onClick={writeBoardOnclick} text="글쓰기" />
                    </div>
                </div>
                <Post />
            </>
        </div>
    )
};

export default Board;