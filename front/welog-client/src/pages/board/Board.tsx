import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { loginUser } from "../../components/atoms";
import Button from "../../components/button/Button";
import './Board.scss';

interface BoardType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    nickname: string;
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
            alert("글 조회 실패");
            console.error(e);
        }
    }

    useEffect(() => {
        getBoardApi();
    }, []);

    return (
        <>
            <div className="board-button">
                <Button onClick={() => { userInfo[0] ? navigate("/BoardAdd") : alert("로그인 해주세요")}} text="글쓰기" />
            </div>
            <div className="board-flexWrap">
                {boardInfo.map((board, i) => (
                    <div key={i} className="board-block" onClick={() => navigate("/" + board.boardNo)}>
                        <div>
                            <div className="board-nickname">{board.nickname}</div>
                            <div className="board-title">{board.title}</div>
                            <div className="board-contents">
                                {board.contents.replace(/<[^>]*>?/g, '').length < 95
                                    ? board.contents.replace(/<[^>]*>?/g, '')
                                    : board.contents.replace(/<[^>]*>?/g, '').substring(0, 95) + " ..."}
                            </div>
                        </div>
                        <div className="board-rgstrDate">{board.rgstrDate}</div>
                    </div>
                ))}
            </div>
        </>
    )
};

export default Board;