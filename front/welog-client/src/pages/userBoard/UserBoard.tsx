import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUserBoardApi } from "../../api/board";
import SEO from "../../components/SEO";
import { useRecoilState } from "recoil";
import { board, loginUser } from "../../store/atoms";
import './UserBoard.scss';
import Post from "../../components/post/Post";
import { useQuery } from "react-query";
import { ToastError } from "../../components/Toast";

const UserBoard = () => {
    const { userNickname } = useParams();
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [boardList, setBoardList] = useRecoilState(board);
    const ServerImgUrl = "http://localhost:3690/images/";

    const { data: userBoardList, isLoading } = useQuery("boardDailyList", async () => {
        try {
            const data = await getUserBoardApi(userNickname);
            return data;
        } catch (e) {
            ToastError("유저 글 조회를 실패했어요");
            console.error(e);
        }
    })

    useEffect(() => {
        setBoardList(userBoardList);
    }, [userBoardList, userNickname]);

    return (
        <>
            <SEO title="유저보드" contents="유저보드" />
            {isLoading
                ? <h2>유저 정보를 불러오는 중이에요</h2>
                : boardList === undefined
                    ? <h2>유저 정보가 없어요</h2>
                    : <>
                        <section className="userBoard-userContainer">
                            <div className="userBoard-userProfile">
                                <img src={`${ServerImgUrl}${boardList[0].imgUrl}`} />
                                <div className="userBoard-introduce">
                                    <h2>{boardList[0].nickname}</h2>
                                    <p>안녕하세요 저는 1년 경력의 개발자</p>
                                    <p>제 강점은 무엇일까요 궁금하시죠</p>
                                    <p>면접시에 알려드릴게요</p>
                                </div>
                            </div>
                            {userInfo[0].userNo === boardList[0].userNo &&
                                <div className="userBoard-updateProfileContainer">
                                    <button className="userBoard-updateProfileBtn"
                                        onClick={() => console.log("test")}>내 정보 수정</button>
                                </div>}
                        </section>

                        <section className="userBoard-userWriteContainer">
                            <button onClick={() => console.log("test")}>
                                <p>작성한 글</p>
                                <p style={{ fontWeight: "bold" }}>{boardList.length} 개</p>
                            </button>
                            <button onClick={() => console.log("test")}>
                                <p>작성한 댓글</p>
                                <p style={{ fontWeight: "bold" }}>비밀</p>
                            </button>
                        </section>

                        <Post />
                    </>
            }
        </>
    )
}

export default UserBoard;