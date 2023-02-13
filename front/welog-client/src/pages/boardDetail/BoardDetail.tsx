import axios from "axios";
import dayjs from "dayjs";
import { ButtonHTMLAttributes, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import Swal from "sweetalert2";
import { loginUser } from "../../components/atoms";
import Button from "../../components/button/Button";
import Label from "../../components/label/Label";
import Line from "../../components/line/Line";
import Paging from "../../components/paging/Paging";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
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
    const [currentPage, setcurrentPage] = useState(1);
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const { boardNo } = useParams();
    const textRef = useRef<HTMLTextAreaElement>(null);
    const navigate = useNavigate();
    const limit = 5;
    const offset = (currentPage - 1) * limit;

    const autoHeight = () => {
        if (textRef.current) {
            textRef.current.style.height = textRef.current.scrollHeight + "px";
            return;
        }
    };

    const boardCommentDeleteApi = useCallback(async (boardNo: number, commentNo: number) => {
        try {
            await axios.post("/boardCommentDelete", { boardNo, commentNo });
            ToastSuccess("댓글이 삭제되었어요!");
            boardCommentApi();
        } catch (e) {
            ToastError("댓글 삭제를 실패했어요");
            console.error(e);
        }
    }, []);

    const boardCommentAddApi = useCallback(async () => {
        if (userInfo[0].userNo === 0) {
            ToastWarn("로그인을 해주세요");
            return;
        } else if (boardCommentAdd === "") {
            ToastWarn("댓글을 입력해주세요");
            return;
        } else {
            try {
                await axios.post("/boardCommentAdd", { boardNo, boardCommentAdd, userNo: userInfo[0].userNo });
                setBoardCommentAdd("");
                ToastSuccess("댓글이 등록되었어요!");
                boardCommentApi();
            } catch (e) {
                ToastError("댓글 등록을 실패했어요");
                console.error(e);
            }
        }
    }, []);

    const boardCommentApi = async () => {
        try {
            const { data } = await axios.post("/boardComment", { boardNo });
            setBoardComment(data);
        } catch (e) {
            ToastError("댓글 조회를 실패했어요");
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
                ToastSuccess("글이 삭제되었어요!");
                navigate("/");
            }

        } catch (e) {
            ToastError("글 삭제를 실패했어요");
            console.error(e);
        }
    }

    const boardDetailApi = async () => {
        try {
            const { data } = await axios.post("/boardDetail", { boardNo });
            setBoardDetail(data);
        } catch (e) {
            ToastError("상세 글 조회를 실패했어요");
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
                    <textarea ref={textRef} value={boardCommentAdd} placeholder="댓글을 입력해주세요"
                        onInput={autoHeight} onChange={e => setBoardCommentAdd(e.target.value)} />
                    <div className="boardDetail-commentAddBtn">
                        <Button onClick={boardCommentAddApi} text="댓글 등록" />
                    </div>
                </div>
            ))}
            <Paging
                total={boardComment.length}
                limit={limit}
                page={currentPage}
                setCurrentPage={setcurrentPage}
            />
            {boardComment.slice(offset, offset + limit).map((boardC, j) => (
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
                                <Button onClick={() =>
                                    boardCommentDeleteApi(boardC.boardNo, boardC.commentNo)} text="댓글 삭제" />
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