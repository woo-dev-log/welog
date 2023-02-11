import axios from "axios";
import dayjs from "dayjs";
import { ButtonHTMLAttributes, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import Swal from "sweetalert2";
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
    imgUrl: string;
}

interface BoardCommentType {
    commentNo: number;
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
    const textRef = useRef<HTMLTextAreaElement>(null);
    const navigate = useNavigate();

    const autoHeight = () => {
        if (textRef.current) {
            textRef.current.style.height = textRef.current.scrollHeight + "px";
            return;
        }
    };

    // const boardCommentDeleteApi = async (commentNo: number) => {
    const boardCommentDeleteApi = async (e) => {
        console.log(e);
        // try {
        //     await axios.post("/boardCommentDelete", { commentNo });
        //     boardCommentApi();
        // } catch (e) {
        //     alert("글 삭제 실패");
        //     console.error(e);
        // }
    }

    const boardCommentAddApi = async () => {
        if (userInfo[0].userNo === 0) {
            alert("로그인 해주세요");
            return;
        } else if (boardCommentAdd === "") {
            alert("댓글을 입력해주세요");
            return;
        } else {
            try {
                await axios.post("/boardCommentAdd", { boardNo, boardCommentAdd, userNo: userInfo[0].userNo });
                boardCommentApi();
            } catch (e) {
                alert("댓글 등록 실패");
                console.error(e);
            }
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

    const boardDeleteApi = async () => {
        try {
            const result = await Swal.fire({
                title: '글을 삭제하시겠어요?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'black',
                cancelButtonColor: 'red',
                confirmButtonText: '네',
                cancelButtonText: '아니요'
            })

            if (result.isConfirmed) {                
                await axios.post("/boardDelete", { boardNo });
                navigate("/");
            }
    
        } catch (e) {
            alert("글 삭제 실패");
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
                    <div className="boardDetail-titleContainer">
                        <Label text="제목" />
                        <div className="boardDetail-title">{board.title}</div>
                    </div>
                    <Line />

                    <div className="boardDetail-writerContainer">
                        <img src={`http://localhost:3690/images/${board.imgUrl}`} />
                        <div className="boardDetail-nickname">{board.nickname}</div>
                        <div className="boardDetail-rgstrDate">{dayjs(board.rgstrDate).format('YYYY.MM.DD HH:mm')}</div>
                    </div>
                    <Line />

                    <div className="boardDetail-contentsContainer">
                        <Label text="내용" />
                        <Line />
                        <div dangerouslySetInnerHTML={{ __html: board.contents }} />
                    </div>

                    {userInfo[0].userNo === board.userNo &&
                        <div className="boardDetail-deleteBtn">
                            <Button onClick={boardDeleteApi} text="수정" />
                            <Button onClick={boardDeleteApi} text="삭제" />
                        </div>
                    }

                    {boardComment && <Label text={boardComment.length + "개의 댓글이 있어요"} />}
                    <Line />
                    <textarea ref={textRef} onInput={autoHeight} placeholder="댓글을 입력해주세요" onChange={e => setBoardCommentAdd(e.target.value)} />
                    <div className="boardDetail-commentAddBtn">
                        <Button onClick={boardCommentAddApi} text="댓글 등록" />
                    </div>
                </div>
            ))}
            {boardComment.map((boardC, j) => (
                <div key={j} className="boardDetail-commentContainer">
                    <Line />
                    <div className="boardDetail-commentBlock">
                        <div className="boardDetail-commentLabel">
                            <img src={`http://localhost:3690/images/${boardC.imgUrl}`} />
                            <div className="boardDetail-commentNickname">{boardC.nickname}</div>
                            <div className="boardDetail-commentRgstrDate">{dayjs(boardC.rgstrDate).format('YYYY.MM.DD HH:mm')}</div>
                        </div>

                        <div className="boardDetail-commentDeleteBtn">
                            {userInfo[0].userNo === boardC.userNo &&
                                <Button onClick={boardCommentDeleteApi} text="댓글 삭제" />
                            }
                        </div>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: boardC.contents.replaceAll(/(\n|\r\n)/g, '<br>') }} />
                </div>
            ))}
        </div>
    )
}

export default BoardDetail;