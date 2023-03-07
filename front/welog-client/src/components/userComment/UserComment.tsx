import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { postUserCommentApi } from "../../api/board";
import { ToastError } from "../Toast";

interface UserCommentType {
    boardNo: number;
    userNo: number;
    contents: string;
    rgstrDate: string;
    updateDate: string;
}

const UserComment = ({ userNo }: { userNo: number }) => {
    const [userCommentList, setUserCommentList] = useState<UserCommentType[]>([]);

    const { data: userComment, isLoading: userCommentLoading }
        = useQuery<UserCommentType[]>("userCommentList", async () => {
            try {
                const data = await postUserCommentApi(userNo);
                return data;
            } catch (e) {
                ToastError("유저 댓글 조회를 실패했어요");
                console.error(e);
            }
        })

    useEffect(() => {
        if (userComment) setUserCommentList(userComment);
    }, [userComment, userNo]);

    return (
        <>
            {userCommentLoading
                ? <h2>유저 댓글을 조회중이에요</h2>
                : userCommentList.map((userComment, i) => (
                    <div key={i}>{userComment.contents}</div>
                ))
            }
        </>
    )
}

export default UserComment;