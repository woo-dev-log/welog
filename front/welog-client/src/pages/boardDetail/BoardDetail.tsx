import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import Swal from "sweetalert2";
import { boardUpdate, loginUser } from "../../store/atoms";
import Button from "../../components/button/Button";
import Label from "../../components/label/Label";
import Line from "../../components/line/Line";
import SEO from "../../components/SEO";
import { ToastError, ToastSuccess } from "../../components/Toast";
import "./BoardDetail.scss";
import { deleteBoardApi, getBoardDetailApi } from "../../api/board";
import BoardComment from "../boardComment/BoardComment";

interface BoardDetailType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    updateDate: string;
    nickname: string;
    imgUrl: string;
}

const BoardDetail = () => {
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [updateValue, setUpdateValue] = useRecoilState(boardUpdate);
    const [boardDetail, setBoardDetail] = useState<BoardDetailType[]>([]);
    const { boardNo } = useParams();
    const IntBoardNo = Number(boardNo);
    const navigate = useNavigate();

    const userBoardOnClick = (nickname: string) => {
        navigate("/userBoard/" + nickname);
    };

    const deleteBoardOnClick = async () => {
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
                await deleteBoardApi(IntBoardNo);
                ToastSuccess("글이 삭제되었어요!");
                navigate("/");
            }

        } catch (e) {
            ToastError("글 삭제를 실패했어요");
            console.error(e);
        }
    }

    const updateBoardOnClick = () => {
        setUpdateValue({ titleValue: boardDetail[0].title, contentsValue: boardDetail[0].contents, boardNo: boardDetail[0].boardNo });
        navigate("/BoardWrite");
    }

    const getBoardDetail = async () => {
        try {
            const data = await getBoardDetailApi(IntBoardNo);
            setBoardDetail(data);
        } catch (e) {
            ToastError("상세 글 조회를 실패했어요");
            console.error(e);
        }
    }

    useEffect(() => {
        getBoardDetail();
    }, [boardNo]);

    return (
        <>
            <SEO title="상세 글" contents="상세 글" />
            <button className="boardDetail-backbutton" onClick={() => navigate(-1)}>&lt;&nbsp;&nbsp;이전으로</button>
            {boardDetail[0] &&
                <div className="boardDetail-container">
                    <div className="boardDetail-titleContainer">
                        <Label text="제목" />
                        <div className="boardDetail-title">{boardDetail[0].title}</div>
                    </div>
                    <Line />

                    <div className="boardDetail-writerContainer">
                        <img src={`http://localhost:3690/images/${boardDetail[0].imgUrl}`} alt={boardDetail[0].imgUrl}
                            onClick={() => userBoardOnClick(boardDetail[0].nickname)} />
                        <div className="boardDetail-nickname" onClick={() => userBoardOnClick(boardDetail[0].nickname)}>
                            {boardDetail[0].nickname}
                        </div>
                        <div className="boardDetail-date">
                            <div className="boardDetail-rgstrDate">{dayjs(boardDetail[0].rgstrDate).format('YYYY.MM.DD HH:mm')} 등록</div>
                            {boardDetail[0].updateDate && <div className="boardDetail-rgstrDate">{dayjs(boardDetail[0].updateDate).format('YYYY.MM.DD HH:mm')} 수정</div>}
                        </div>
                    </div>
                    <Line />

                    <div className="boardDetail-contentsContainer">
                        <Label text="내용" />
                        <Line />
                        <div className="boardDetail-contents" dangerouslySetInnerHTML={{ __html: boardDetail[0].contents }} />

                        {userInfo[0].userNo === boardDetail[0].userNo &&
                            <div className="boardDetail-deleteBtn">
                                <Button onClick={updateBoardOnClick} text="수정" />
                                <Button onClick={deleteBoardOnClick} text="삭제" />
                            </div>
                        }
                        <Line />
                    </div>
                    <BoardComment IntBoardNo={IntBoardNo} />
                </div>
            }
        </>
    )
}

export default BoardDetail;