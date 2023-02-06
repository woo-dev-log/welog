import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/button/Button";
import Input from "../components/input/Input";
import Label from "../components/label/Label";
import Line from "../components/line/Line";
import "./BoardDetail.scss";

interface BoardDetailType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    nickname: string;
}

const BoardDetail = () => {
    const [boardDetail, setBoardDetail] = useState<BoardDetailType[]>([]);
    const [boardComment, setBoardComment] = useState("");
    const { boardNo } = useParams();

    const boardCommentApi = async () => {
        console.log("클릭");
    }

    const boardDetailApi = async () => {
        try {
            const { data } = await axios.post("/boardDetail", { boardNo });
            setBoardDetail(data);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        boardDetailApi();
    }, [])

    return (
        <>
            {boardDetail.map((board, i) => (
                <div key={i} className="boardDetail-container">
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
                    <Input placeholder="댓글을 입력하세요" onChange={e => setBoardComment(e.target.value)} />
                    <Button onClick={boardCommentApi} text="댓글 등록"/>
                </div>
            ))}
        </>
    )
}

export default BoardDetail;