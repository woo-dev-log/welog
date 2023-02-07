import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/button/Button";
import Label from "../../components/label/Label";
import Line from "../../components/line/Line";
import "./BoardDetail.scss";

interface BoardDetailType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    nickname: string;
}

interface BoardCommentType {
    boardNo: number;
    userNo: number;
    contents: string;
    rgstrDate: string;
    nickname: string;
}

const BoardDetail = () => {
    const [boardDetail, setBoardDetail] = useState<BoardDetailType[]>([]);
    const [boardComment, setBoardComment] = useState<BoardCommentType[]>([]);
    const [boardCommentAdd, setBoardCommentAdd] = useState("");
    const { boardNo } = useParams();

    const boardCommentAddApi = async () => {
        try {
            const { data, status } = await axios.post("/boardCommentAdd", { boardNo, boardCommentAdd });
            
            if (status == 200) {
                boardCommentApi();
            } else {
                alert("댓글 등록 실패");
            }
        } catch (e) {
            console.error(e);
        }
    }

    const boardCommentApi = async () => {
        try {
            const { data, status } = await axios.post("/boardComment", { boardNo });

            if (status == 200) {
                setBoardComment(data);
            } else {
                alert("댓글 조회 실패");
            }
        } catch (e) {
            console.error(e);
        }
    }

    const boardDetailApi = async () => {
        try {
            const { data, status } = await axios.post("/boardDetail", { boardNo });
            
            if (status == 200) {
                setBoardDetail(data);
            } else {
                alert("상세 글 조회 실패");
            }
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        boardDetailApi();
        boardCommentApi();
    }, []);

    return (
        <div className="boardDetail-container">
            {boardDetail.map((board, i) => (
                <div key={i}>
                    <div className="boardDetail-titleBlock">
                        <Label text="제목" />
                        <div className="boardDetail-title">{board.title}</div>
                    </div>
                    <Line />

                    <div className="boardDetail-contentsBlock">
                        <Label text="내용" />
                        <Line />
                        <div className="boardDetail-contents" dangerouslySetInnerHTML={{ __html: board.contents }} />
                    </div>

                    <Label text="댓글" />
                    <Line />
                    <textarea placeholder="댓글을 입력하세요" onChange={e => setBoardCommentAdd(e.target.value)} />
                    <div className="boardDetail-button">
                        <Button onClick={boardCommentAddApi} text="댓글 등록" />
                    </div>
                </div>
            ))}
            {boardComment.map((boardC, j) => (
                <div key={j} className="boardDetail-commentContainer">
                    <div className="boardDetail-commentBlock">
                        <div className="boardDetail-commentNickname">{boardC.nickname}</div>
                        <div className="boardDetail-commentRgstrDate">{boardC.rgstrDate}</div>
                    </div>
                    <div>{boardC.contents}</div>
                    <Line />
                </div>
            ))}
        </div>
    )
}

export default BoardDetail;