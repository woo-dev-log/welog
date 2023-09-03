import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { postUserCommentApi } from "../../api/board";
import { user } from "../../store/atoms";
import DayFormat from "../DayFormat";
import Paging from "../paging/Paging";
import { ToastError } from "../Toast";
import './UserComment.scss';

interface UserCommentType {
    boardNo: number;
    userNo: number;
    contents: string;
    rgstrDate: string;
    updateDate: string;
    userCommentCnt: number;
}

const UserComment = ({ userNo }: { userNo: number }) => {
    const [userCommentList, setUserCommentList] = useState<UserCommentType[]>([]);
    const [userProfile, setUserProfile] = useRecoilState(user);
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const ServerImgUrl = "https://d12uvkd7f5nrla.cloudfront.net/";
    const navigate = useNavigate();
    const page = searchParams.get("page");
    const limit = 5;

    const { data: userComment, isLoading: userCommentLoading }
        = useQuery<UserCommentType[]>(["userCommentList", page], async () => {
            try {
                const data = await postUserCommentApi(userNo, page ? page : "1");
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

    useEffect(() => {
        if (page) {
            setCurrentPage(Number(page));
        } else setCurrentPage(1);
    }, [page]);

    return (
        <>
            {userCommentLoading
                ? <div className="skeleton-userCommentArticle">
                    <div className="skeleton-userCommentBlock" />
                    <div className="skeleton-userCommentBlock" />
                    <div className="skeleton-userCommentBlock" />
                    <div className="skeleton-userCommentBlock" />
                    <div className="skeleton-userCommentBlock" />
                </div>
                :
                <section>
                    {userCommentList.map((userComment, i) => (
                        <article key={i} className="userComment-article"
                            onClick={() => navigate("/" + userComment.boardNo)}>
                            <div className="userComment-container">
                                <p className="userComment-contents">
                                    {userComment.contents.length < 60
                                        ? userComment.contents
                                        : userComment.contents.substring(0, 60) + " ..."}
                                </p>
                                <div className="userComment-block">
                                    <div className="userComment-blockDate">
                                        <p>{DayFormat(userComment.rgstrDate)} 작성</p>
                                        {userComment.updateDate && <p>{DayFormat(userComment.updateDate)} 수정</p>}
                                    </div>
                                    <div className="userComment-right">
                                        <img src={`${ServerImgUrl}${userProfile[0].imgUrl}`} alt="userProfileImg" loading="lazy" />
                                        <p>{userProfile[0].nickname}</p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}

                    <Paging
                        total={userProfile[0].userCommentCnt}
                        limit={limit}
                        page={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                </section>
            }
        </>
    )
}

export default UserComment;