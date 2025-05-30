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
import Button from "../../components/button/Button";
import BoardComment from "../boardComment/BoardComment";
import "./BoardDetail.scss";
import DayFormat from "../../components/DayFormat";
import ProgressBar from "../../components/progressBar/ProgressBar";

interface BoardDetailType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: Date;
    updateDate: Date;
    views: number;
    tags: string,
    boardImgUrl: string;
    nickname: string;
    imgUrl: string;
    boardType: number;
}

const BoardDetail = () => {
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [updateValue, setUpdateValue] = useRecoilState(boardUpdate);
    const [boardDetail, setBoardDetail] = useState<BoardDetailType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { boardNo } = useParams();
    const IntBoardNo = Number(boardNo);
    const navigate = useNavigate();
    const ServerImgUrl = import.meta.env.VITE_SERVER_IMG_URL;

    const boardTypeText = (type: number) => {
        switch (type) {
            case 1:
                return '개발';
            case 2:
                return '학습';
            case 3:
                return '문의';
            case 0:
                return '테스트';
        }
    };

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
                navigate(-1);
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
            setIsLoading(false);
            const data = await getBoardDetailApi(IntBoardNo);
            setBoardDetail(data);
            setIsLoading(true);
        } catch (e) {
            ToastError("상세 글 조회를 실패했어요");
            console.error(e);
        }
    }

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        getBoardDetail();
    }, [boardNo]);

    return (
        <>
            {isLoading
                ? boardDetail[0] &&
                <>
                    <ProgressBar />
                    <SEO title="상세 글" contents={boardDetail[0].title} />
                    <p className="boardDetail-backbutton" onClick={() => navigate(-1)}>&lt;&nbsp;&nbsp;이전으로</p>
                    <section className="boardDetail-section">
                        <div className="boardDetail-topContainer">
                            <div className="boardDetail-boardThumbnail">
                                <img
                                    src={`${ServerImgUrl}${boardDetail[0].boardImgUrl}`}
                                    alt="boardThumbnail"
                                    loading="lazy"
                                />
                            </div>

                            <div className="boardDetail-profileContainer">
                                <div className="boardDetail-writerContainer">
                                    <div className="boardDetail-userProfile">
                                        <img src={`${ServerImgUrl}${boardDetail[0].imgUrl}`} alt="userProfileImg" loading="lazy"
                                            onClick={() => userBoardOnClick(boardDetail[0].nickname)} />
                                        <p className="boardDetail-nickname" onClick={() => userBoardOnClick(boardDetail[0].nickname)}>
                                            {boardDetail[0].nickname}
                                        </p>
                                    </div>
                                    <div className="board-views">
                                        <img src="/views.svg" alt="click" />
                                        <p>{boardDetail[0].views}</p>
                                    </div>
                                </div>

                                <div className="boardDetail-subContainer">
                                    <div className="boardDetail-titleContainer">
                                        <div className="board-Type">{boardTypeText(boardDetail[0].boardType)}</div>
                                        <h2 className="boardDetail-title">{boardDetail[0].title}</h2>
                                    </div>

                                    <div className="boardDetail-tagContainer">
                                        {boardDetail[0].tags && boardDetail[0].tags.split(",").map((v, i) => (
                                            <p key={i}
                                                className="boardDetail-tagBox"
                                                onClick={() => {
                                                    navigate("/?keyword=" + v)
                                                }}
                                            >{v}</p>
                                        ))}
                                    </div>
                                </div>

                                <div className="boardDetail-date">
                                    <p className="boardDetail-rgstrDate">{DayFormat(boardDetail[0].rgstrDate, 1)} 작성</p>
                                    {boardDetail[0].updateDate && <p className="boardDetail-rgstrDate">{DayFormat(boardDetail[0].updateDate, 1)} 수정</p>}
                                </div>
                            </div>
                        </div>

                        <div className="boardDetail-container">
                            <Line />
                            <div className="boardDetail-contentsContainer">
                                <div className="boardDetail-contents" dangerouslySetInnerHTML={{ __html: boardDetail[0].contents }} />

                                {userInfo[0].userNo === boardDetail[0].userNo &&
                                    <div className="boardDetail-deleteBtn">
                                        <Button onClick={updateBoardOnClick} text="수정" />
                                        <Button onClick={deleteBoardOnClick} text="삭제" />
                                    </div>
                                }
                                <Line />
                            </div>
                            <BoardComment IntBoardNo={IntBoardNo} IntBoardUserNo={boardDetail[0].userNo} />
                        </div>
                    </section>
                </>
                : <>
                    <div className="skeleton-boardDetailBackBtn" />
                    <section className="skeleton-boardDetailSection" />
                    <article className="skeleton-boardCommentContainer" />
                    <article className="skeleton-boardCommentContainer" />
                    <article className="skeleton-boardCommentContainer" />
                </>
            }
        </>
    )
}

export default BoardDetail;