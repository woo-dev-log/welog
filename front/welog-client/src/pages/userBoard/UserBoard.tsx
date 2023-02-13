import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface BoardType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    nickname: string;
    imgUrl: string;
    commentCnt: number;
}

const UserBoard = () => {
    const { userNickname } = useParams();
    const [userBoardList, setUserBoardList] = useState<BoardType[]>([]);

    const userBoardApi = async () => {
        const { data } = await axios.post("/userBoard", { userNickname: userNickname });
        setUserBoardList(data);
    }

    useEffect(() => {
        userBoardApi();
    }, [])

    return (
        <div>
            {userBoardList.map((boardList, i) => (
                <div key={i}>
                    {/* <img src={`http://localhost:3690/images/${boardList.imgUrl}`} /> */}
                    <div>{boardList.nickname}</div>
                    <div>{boardList.title}</div>
                    <div>{boardList.contents}</div>
                    <div>{boardList.rgstrDate}</div>
                    <div>{boardList.commentCnt}</div>
                </div>
            ))}
        </div>
    )
}

export default UserBoard;