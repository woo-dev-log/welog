import { useQuery } from "react-query";
import { getBoardDailyApi } from "../../api/board";
import { ToastError } from "../../components/Toast";
import './boardDaily.scss';

interface BoardType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    views: number;
    nickname: string;
    imgUrl: string;
    commentCnt: number;
}

const BoardDaily = () => {
    const { data: boardDailyList, isLoading } = useQuery<BoardType[]>("boardDailyList", async () => {
        try {
            const data = await getBoardDailyApi();
            return data;
        } catch (e) {
            ToastError("데일리 글 조회를 실패했어요");
            console.error(e);
        }
    })

    return (
        <>
            {isLoading
                ? <h1>글을 불러오는 중입니다!</h1>
                : <>
                    {boardDailyList === undefined
                        ? <h2>작성한 글이 없어요</h2>
                        : boardDailyList.map((boardDaily, i) => {
                            <div key={i}>
                                {boardDaily.title}asdasd
                            </div>
                        })
                    }
                </>
            }
        </>
    )
}

export default BoardDaily;