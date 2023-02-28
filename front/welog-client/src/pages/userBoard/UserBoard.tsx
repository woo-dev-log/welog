import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserBoardApi } from "../../api/board";
import SEO from "../../components/SEO";
import Paging from "../../components/paging/Paging";
import './UserBoard.scss';

interface BoardType {
    boardNo: number;
    userNo: number;
    title: string;
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
    // const ServerImgUrl = "http://localhost:3690/images/";
    const ServerImgUrl = "https://we-log.herokuapp.com/images/";
    const limit = 10;
    const offset = (currentPage - 1) * limit;

    const getUserBoard = async () => {
        try {
            const data = await getUserBoardApi(userNickname);
            setUserBoardList(data);
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        getUserBoard();
    }, [userNickname])

    return (
        <>
            <SEO title="유저보드" contents="유저보드" />
            {userBoardList.length === 0 ? <h1>작성한 글이 없어요</h1> :
                <>
                    <Paging
                        total={userBoardList.length}
                        limit={limit}
                        page={currentPage}
                        setCurrentPage={setcurrentPage}
                        type="userBoard"
                    />

                    {userBoardList.slice(offset, offset + limit).map((boardList, i) => (
                        <div key={i} className="userBoard-block" onClick={() => navigate("/" + boardList.boardNo)}>
                            <div className="userBoard-left">
                                <img src={`${ServerImgUrl}${boardList.imgUrl}`} />
                                <div className="userBoard-nickname">{boardList.nickname}</div>
                            </div>
                            <div className="userBoard-title">{boardList.title}</div>
                            <div className="userBoard-right">
                                <div>{dayjs(boardList.rgstrDate).format('YYYY.MM.DD')}</div>
                                <div>댓글 {boardList.commentCnt}</div>
                            </div>
                        </div>
                    ))}
                </>}
        </>
    )
}

export default UserBoard;