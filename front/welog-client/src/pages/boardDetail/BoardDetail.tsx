import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { loginUser } from "../../components/atoms";
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
    imgUrl: string;
}

const BoardDetail = () => {
    const [boardDetail, setBoardDetail] = useState<BoardDetailType[]>([]);
    const [boardComment, setBoardComment] = useState<BoardCommentType[]>([]);
    const [boardCommentAdd, setBoardCommentAdd] = useState("");
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const { boardNo } = useParams();

    const boardCommentAddApi = async () => {
        if (!userInfo[0]) {
            alert("로그인 해주세요");
            return;
        }
        try {
            await axios.post("/boardCommentAdd", { boardNo, boardCommentAdd, userNo: userInfo[0].userNo });
            boardCommentApi();
        } catch (e) {
            alert("댓글 등록 실패");
            console.error(e);
        }
    }

    const boardCommentApi = async () => {
        try {
            const { data } = await axios.post("/boardComment", { boardNo });
            setBoardComment(data);
        } catch (e) {
            alert("댓글 조회 실패");
            console.error(e);
        }
    }

    const boardDetailApi = async () => {
        try {
            const { data } = await axios.post("/boardDetail", { boardNo });
            setBoardDetail(data);
        } catch (e) {
            alert("상세 글 조회 실패");
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
                        <img src={`http://localhost:3690/images/${boardC.imgUrl}`} />
                        <div className="boardDetail-commentLabel">
                            <div className="boardDetail-commentNickname">{boardC.nickname}</div>
                            <div className="boardDetail-commentRgstrDate">{boardC.rgstrDate}</div>
                        </div>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: boardC.contents.replaceAll(/(\n|\r\n)/g, '<br>') }} />
                    <Line />
                </div>
            ))}
        </div>
    )
}

export default BoardDetail;