import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { board, loginUser } from "../../store/atoms";
import { getBoardApi, postBoardAPi, updateBoardViewsApi } from "../../api/board";
import { ToastError, ToastWarn } from "../../components/Toast";
import SEO from "../../components/SEO";
import Line from "../../components/line/Line";
import Paging from "../../components/paging/Paging";
import Button from "../../components/button/Button";
import './Board.scss';
import Input from "../../components/input/Input";
import { debounce } from "lodash-es";

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
    const [boardList, setBoardList] = useRecoilState(board);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchWord, setSearchWord] = useState("");
    const [cookies, setCookie] = useCookies(['viewPost', 'boardCurrentPage']);
    const { keyword } = useParams();
    const navigate = useNavigate();
    const limit = 6;
    const offset = (currentPage - 1) * limit;

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
            keepPreviousData: true, // 이전 데이터를 유지하여 페이지 이동 시 로딩이 빠르게 됨
            cacheTime: 1000 * 60 * 10, // 캐시 유지 시간 10분
        }
    );

    const searchBoardListOnChange = debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.value === "") navigate("/");
        if(e.target.value === searchWord) return;
        try {
            setSearchWord(e.target.value);
            const data = await postBoardAPi(e.target.value);
            setBoardList(data);
            navigate("/search/" + e.target.value);
            setCurrentPage(1);
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
        if (post) {
            setBoardList(post);
        }
    }, [post]);

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
                : <>
                    <Input placeholder="제목, 내용, 닉네임을 입력해주세요" onChange={searchBoardListOnChange} />
                    <div className="board-top">
                        {searchWord
                            ? <p>{searchWord} 검색 결과 총 {boardList.length}개의 포스트를 찾았어요</p>
                            : <p>총 {boardList.length}개의 포스트가 있어요</p>}
                        <Paging
                            total={boardList.length}
                            limit={limit}
                            page={currentPage}
                            setCurrentPage={setCurrentPage}
                            type="board"
                        />
                    </div>
                    {boardList.length === 0
                        ? <h2>작성한 글이 없어요</h2>
                        : <div className="board-container">
                            <div className="board-flexWrap">
                                {boardList.slice(offset, offset + limit).map((board, i) => (
                                    <div key={i} className="board-block" onClick={() => updateBoardViewsOnClick(board.boardNo, board.views)}>
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
                                <Button onClick={() => { userInfo[0].userNo !== 0 ? navigate("/BoardWrite") : ToastWarn("로그인을 해주세요") }} text="글쓰기" />
                            </div>
                        </div>}
                </>
            }
        </>
    )
};

export default Board;