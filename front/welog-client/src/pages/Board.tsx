import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Board.scss';

interface BoardType {
    no: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    nickname: string;
}

const Board = () => {
    const [boardInfo, setBoardInfo] = useState<BoardType[]>([]);
    const navigate = useNavigate();

    const getBoardApi = async () => {
        const { data } = await axios.get("/board");
        setBoardInfo(data);
    }

    useEffect(() => {
        getBoardApi();
    }, []);

    return (
        <div className="board-container">
            <button onClick={() => navigate("/BoardAdd")}>글쓰기</button>
            {boardInfo.map((board, i) => (
                <div key={i} className="board-block">
                    <div>
                        <div className="board-nickname">{board.nickname}</div>
                        <div className="board-title">{board.title}</div>
                        <div className="board-contents">{board.contents}</div>
                    </div>
                    <div className="board-rgstrDate">{board.rgstrDate}</div>
                </div>
            ))}
        </div>
    )
};

export default Board;