import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { postUserCommentApi } from "../../api/board";
import { user } from "../../store/atoms";
import Line from "../line/Line";
import { ToastError } from "../Toast";
import './UserComment.scss';

interface UserCommentType {
    boardNo: number;
    userNo: number;
    contents: string;
    rgstrDate: string;
    updateDate: string;
}

const UserComment = ({ userNo }: { userNo: number }) => {
    const [userCommentList, setUserCommentList] = useState<UserCommentType[]>([]);
    const [userProfile, setUserProfile] = useRecoilState(user);
    const ServerImgUrl = "http://localhost:3690/images/";
    const navigate = useNavigate();

    const { data: userComment, isLoading: userCommentLoading }
        = useQuery<UserCommentType[]>("userCommentList", async () => {
            try {
                const data = await postUserCommentApi(userNo);
                return data;
            } catch (e) {
                ToastError("유저 댓글 조회를 실패했어요");
                console.error(e);
            }
        },
            {
                keepPreviousData: true,
                cacheTime: 1000 * 60 * 10,
            }
        );

    useEffect(() => {
        if (userComment) setUserCommentList(userComment);
    }, [userComment, userNo]);

    return (
        <section>
            {userCommentLoading
                ? <h2>유저 댓글을 조회중이에요</h2>
                : userCommentList.map((userComment, i) => (
                    <article key={i} className="userComment-article"
                        onClick={() => navigate("/" + userComment.boardNo)}>
                        <div className="userComment-container">
                            <p className="userComment-contents">{userComment.contents}</p>
                            <div className="userComment-block">
                                <div className="userComment-blockDate">
                                    <p>{dayjs(userComment.rgstrDate).format('YY.MM.DD HH:mm')} 등록</p>
                                    {userComment.updateDate && <p>{dayjs(userComment.updateDate).format('YY.MM.DD HH:mm')} 수정</p>}
                                </div>
                                <div className="userComment-right">
                                    <img src={`${ServerImgUrl}${userProfile[0].imgUrl}`} alt="userProfileImg" />
                                    <p>{userProfile[0].nickname}</p>
                                </div>
                            </div>
                        </div>
                        <Line />
                    </article>
                ))
            }
        </section>
    )
}

export default UserComment;