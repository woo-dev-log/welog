import axios from "axios";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { loginUser } from "../../components/atoms";
import Button from "../../components/button/Button";
import Line from "../../components/line/Line";
import Paging from "../../components/paging/Paging";
import { ToastError, ToastWarn } from "../../components/Toast";
import './Board.scss';

interface BoardType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    nickname: string;
    imgUrl: string;
    commentCnt: number;
}

const Board = () => {
    const [boardInfo, setBoardInfo] = useState<BoardType[]>([]);
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [currentPage, setcurrentPage] = useState(1);
    const navigate = useNavigate();
    const limit = 6;
    const offset = (currentPage - 1) * limit;

    const getUserBoardApi = useCallback(async () => {
        try {
            const { data } = await axios.post("/userBoard", { userNickname: userInfo[0].nickname });
            setBoardInfo(data);
            setcurrentPage(1);
        } catch (e) {
            ToastError("글 조회를 실패했어요");
            console.error(e);
        }
    }, [userInfo]);

    const getBoardApi = useCallback(async () => {
        try {
            const { data } = await axios.get("/board");
            setBoardInfo(data);
            setcurrentPage(1);
        } catch (e) {
            ToastError("글 조회를 실패했어요");
            console.error(e);
        }
    }, []);

    useEffect(() => {
        getBoardApi();
    }, []);

    return (
        <>
            {boardInfo.length === 0 ? <h1>작성한 글이 없어요</h1> :
                <div className="board-container">
                    <div className="board-top">
                        <div className="board-boardList">
                            <Button onClick={getBoardApi} text="전체 글" />
                            {userInfo[0].userNo !== 0 && <Button onClick={getUserBoardApi} text="내 글" />}
                        </div>
                        <Paging
                            total={boardInfo.length}
                            limit={limit}
                            page={currentPage}
                            setCurrentPage={setcurrentPage}
                        />
                    </div>
                    <div className="board-flexWrap">
                        {boardInfo.slice(offset, offset + limit).map((board, i) => (
                            <div key={i} className="board-block" onClick={() => navigate("/" + board.boardNo)}>
                                <div>
                                    <div className="board-userBlock">
                                        <img src={`http://localhost:3690/images/${board.imgUrl}`} />
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
                                    <div>댓글 {board.commentCnt}개</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="board-button">
                        <Button onClick={() => { userInfo[0].userNo !== 0 ? navigate("/BoardAdd") : ToastWarn("로그인을 해주세요") }} text="글쓰기" />
                    </div>
                </div>}
        </>
    )
};

export default Board;