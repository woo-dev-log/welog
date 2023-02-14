import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Paging from "../../components/paging/Paging";
import './UserBoard.scss';

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
    const [currentPage, setcurrentPage] = useState(1);
    const navigate = useNavigate();
    const limit = 10;
    const offset = (currentPage - 1) * limit;

    const userBoardApi = async () => {
        const { data } = await axios.post("/userBoard", { userNickname: userNickname });
        setUserBoardList(data);
    }

    useEffect(() => {
        userBoardApi();
    }, [userNickname])

    return (
        <>
            {userBoardList.length > 0 && <Paging
                total={userBoardList.length}
                limit={limit}
                page={currentPage}
                setCurrentPage={setcurrentPage} />
            }
            {userBoardList.slice(offset, offset + limit).map((boardList, i) => (
                <div key={i} className="userBoard-block" onClick={() => navigate("/" + boardList.boardNo)}>
                    <div className="userBoard-left">
                        <img src={`http://localhost:3690/images/${boardList.imgUrl}`} />
                        <div className="userBoard-nickname">{boardList.nickname}</div>
                    </div>
                    <div className="userBoard-title">{boardList.title}</div>
                    {/* <div>내용
                        {boardList.contents.replaceAll(/<[^>]*>?/g, "").length < 30
                            ? boardList.contents.replaceAll(/<[^>]*>?/g, "")
                            : boardList.contents.replaceAll(/<[^>]*>?/g, "").substring(0, 30) + " ..."}
                    </div> */}
                    <div className="userBoard-right">
                        <div>{dayjs(boardList.rgstrDate).format('YYYY.MM.DD')}</div>
                        <div>댓글 {boardList.commentCnt}</div>
                    </div>
                </div>
            ))}
        </>
    )
}

export default UserBoard;