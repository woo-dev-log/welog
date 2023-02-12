import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { loginUser } from "../../components/atoms";
import Button from "../../components/button/Button";
import Line from "../../components/line/Line";
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
    const navigate = useNavigate();

    const getBoardApi = async () => {
        try {
            const { data } = await axios.get("/board");
            setBoardInfo(data);
        } catch (e) {
            ToastError("글 조회를 실패했어요");
            console.error(e);
        }
    }

    useEffect(() => {
        getBoardApi();
    }, []);

    return (
        <>
            <div className="board-button">
                <Button onClick={() => { userInfo[0].userNo !== 0 ? navigate("/BoardAdd") : ToastWarn("로그인을 해주세요")}} text="글쓰기" />
            </div>
            <div className="board-flexWrap">
                {boardInfo.map((board, i) => (
                    <div key={i} className="board-block" onClick={() => navigate("/" + board.boardNo)}>
                        <div>
                            <div className="board-userBlock">
                                <img src={`http://localhost:3690/images/${board.imgUrl}`} />
                                <div className="board-nickname">{board.nickname}</div>
                            </div>
                            <Line />
                            <div className="board-title">{board.title}</div>
                            <div className="board-contents">
                                {board.contents.replace(/<[^>]*>?/g, "").length < 60
                                    ? board.contents.replace(/<[^>]*>?/g, "")
                                    : board.contents.replace(/<[^>]*>?/g, "").substring(0, 60) + " ..."}
                            </div>
                        </div>
                        <div className="board-rgstrDate">{dayjs(board.rgstrDate).format('YYYY.MM.DD HH:mm') }</div>
                    </div>
                ))}
            </div>
        </>
    )
};

export default Board;