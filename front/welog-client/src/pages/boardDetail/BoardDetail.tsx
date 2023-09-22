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
    const ServerImgUrl = "https://d12uvkd7f5nrla.cloudfront.net/";

    const boardTypeText = (type: number) => {
        switch (type) {
            case 1:
                return '개발';
            case 2:
                return '하루';
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
                    <SEO title="상세 글" contents={boardDetail[0].title} />
                    <button className="boardDetail-backbutton" onClick={() => navigate(-1)}>&lt;&nbsp;&nbsp;이전으로</button>
                    <section className="boardDetail-section">
                        <aside className="boarDetail-boardThumbnail">
                            <img src={`${ServerImgUrl}${boardDetail[0].boardImgUrl}`} alt="boardThumbnail" loading="lazy" />
                        </aside>

                        <div className="boardDetail-container">
                            <div className="boardDetail-titleContainer">
                                <div className="board-Type">{boardTypeText(boardDetail[0].boardType)}</div>
                                <div className="boardDetail-titleBox">
                                    <h2 className="boardDetail-title">{boardDetail[0].title}</h2>
                                    <div className="board-views">
                                        <img src="/views.svg" alt="click" />
                                        <p>{boardDetail[0].views}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="boardDetail-writerContainer">
                                <div className="boardDetail-date">
                                    <p className="boardDetail-rgstrDate">{dayjs(boardDetail[0].rgstrDate).subtract(9, "hour").format('YY.MM.DD HH:mm')} 작성</p>
                                    {boardDetail[0].updateDate && <p className="boardDetail-rgstrDate">{dayjs(boardDetail[0].updateDate).subtract(9, "hour").format('YY.MM.DD HH:mm')} 수정</p>}
                                </div>
                                <div className="boardDetail-userProfile">
                                    <img src={`${ServerImgUrl}${boardDetail[0].imgUrl}`} alt="userProfileImg" loading="lazy"
                                        onClick={() => userBoardOnClick(boardDetail[0].nickname)} />
                                    <p className="boardDetail-nickname" onClick={() => userBoardOnClick(boardDetail[0].nickname)}>
                                        {boardDetail[0].nickname}
                                    </p>
                                </div>
                            </div>

                            <div className="boardDetail-tagContainer">
                                {boardDetail[0].tags && boardDetail[0].tags.split(",").map((v, i) => (
                                    <p key={i} className="boardDetail-tagBox">{v}</p>
                                ))}
                            </div>

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