import Swal from "sweetalert2";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { boardUpdate, loginUser } from "../../store/atoms";
import { ToastError, ToastSuccess } from "../../components/Toast";
import { deleteBoardApi, getBoardDetailApi } from "../../api/board";
import SEO from "../../components/SEO";
import Line from "../../components/line/Line";
import Label from "../../components/label/Label";
import Button from "../../components/button/Button";
import BoardComment from "../boardComment/BoardComment";
import "./BoardDetail.scss";

interface BoardDetailType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    updateDate: string;
    views: number;
    tags: string,
    boardImgUrl: string;
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
    const ServerImgUrl = "http://localhost:3690/images/";

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
        setUpdateValue({
            titleValue: boardDetail[0].title,
            contentsValue: boardDetail[0].contents,
            boardNo: boardDetail[0].boardNo,
            tags: boardDetail[0].tags,
            boardImgUrl: boardDetail[0].boardImgUrl
        });
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
                <section className="boardDetail-container">
                    <div className="boarDetail-boardThumbnail">
                        <img src={`${ServerImgUrl}${boardDetail[0].boardImgUrl}`} alt="boardThumbnail" />
                    </div>

                    <article className="boardDetail-titleContainer">
                        <h2 className="boardDetail-title">{boardDetail[0].title}</h2>
                        <div className="board-views">
                            <img src="/views.svg" alt="click" />
                            <p>{boardDetail[0].views}</p>
                        </div>
                    </article>

                    <article className="boardDetail-writerContainer">
                        <div className="boardDetail-date">
                            <p className="boardDetail-rgstrDate">{dayjs(boardDetail[0].rgstrDate).format('YY.MM.DD HH:mm')} 등록</p>
                            {boardDetail[0].updateDate && <p className="boardDetail-rgstrDate">{dayjs(boardDetail[0].updateDate).format('YY.MM.DD HH:mm')} 수정</p>}
                        </div>
                        <div className="boardDetail-userProfile">
                            <img src={`${ServerImgUrl}${boardDetail[0].imgUrl}`} alt="userProfileImg"
                                onClick={() => userBoardOnClick(boardDetail[0].nickname)} />
                            <p className="boardDetail-nickname" onClick={() => userBoardOnClick(boardDetail[0].nickname)}>
                                {boardDetail[0].nickname}
                            </p>
                        </div>
                    </article>

                    <article className="boardDetail-tagContainer">
                        {boardDetail[0].tags && boardDetail[0].tags.split(",").map((v, i) => (
                            <p key={i} className="boardDetail-tagBox">{v}</p>
                        ))}
                    </article>

                    <Line />

                    <article className="boardDetail-contentsContainer">
                        <p className="boardDetail-contents" dangerouslySetInnerHTML={{ __html: boardDetail[0].contents }} />

                        {userInfo[0].userNo === boardDetail[0].userNo &&
                            <div className="boardDetail-deleteBtn">
                                <Button onClick={updateBoardOnClick} text="수정" />
                                <Button onClick={deleteBoardOnClick} text="삭제" />
                            </div>
                        }
                        <Line />
                    </article>
                    <BoardComment IntBoardNo={IntBoardNo} />
                </section>
            }
        </>
    )
}

export default BoardDetail;