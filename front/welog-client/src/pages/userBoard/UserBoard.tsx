import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserBoardApi, updateProfileContentsApi } from "../../api/board";
import SEO from "../../components/SEO";
import { useRecoilState } from "recoil";
import { board, loginUser } from "../../store/atoms";
import './UserBoard.scss';
import Post from "../../components/post/Post";
import { useQuery } from "react-query";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import { useCookies } from "react-cookie";

const UserBoard = () => {
    const { userNickname } = useParams();
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [boardList, setBoardList] = useRecoilState(board);
    const [updateProfileBoolean, setUpdateProfileBoolean] = useState(false);
    const [updateProfileContents, setUpdateProfileContents] = useState("");
    const [cookies, setCookie] = useCookies(['boardCurrentPage']);
    const ServerImgUrl = "http://localhost:3690/images/";
    const textAreaCols = window.innerWidth < 1199 ? 30 : 50;

    const { data: userBoardList, isLoading } = useQuery("boardDailyList", async () => {
        try {
            const data = await getUserBoardApi(userNickname);
            return data;
        } catch (e) {
            ToastError("유저 글 조회를 실패했어요");
            console.error(e);
        }
    })

    const updateProfileContentsOnClick = async () => {
        if (updateProfileContents === "") {
            ToastWarn("본인 소개를 입력해주세요");
            return;
        } else if (updateProfileContents === boardList[0].profileContents) {
            ToastWarn("수정된 내용이 없어요");
            setUpdateProfileBoolean(false);
            return;
        } else {
            try {
                await updateProfileContentsApi(updateProfileContents, userInfo[0].userNo);
                setUpdateProfileBoolean(false);
                ToastSuccess("프로필이 수정되었어요!");
            } catch (e) {
                ToastError("프로필 수정을 실패했어요");
                console.error(e);
            }
        }
    };

    useEffect(() => {
        setBoardList(userBoardList);
        setCookie("boardCurrentPage", 1);
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
                                    {updateProfileBoolean
                                        ? <textarea rows={3} cols={textAreaCols} placeholder="90자 이내로 본인을 소개해보세요!"
                                            value={updateProfileContents} onChange={e => {
                                                if (e.target.value.length > 90) {
                                                    ToastWarn("100자 이내로 소개해주세요");
                                                } else setUpdateProfileContents(e.target.value)
                                            }
                                            } />
                                        : <div dangerouslySetInnerHTML={{
                                            __html: boardList[0].profileContents
                                                ? boardList[0].profileContents.replaceAll(/(\n|\r\n)/g, '<br>')
                                                : ""
                                        }} />}
                                </div>
                            </div>
                            {userInfo[0].userNo === boardList[0].userNo &&
                                <div className="userBoard-updateProfileContainer">
                                    {updateProfileBoolean
                                        ? <button className="userBoard-updateProfileBtn"
                                            onClick={updateProfileContentsOnClick}>수정하기</button>
                                        : <button className="userBoard-updateProfileBtn"
                                            onClick={() => {
                                                setUpdateProfileContents(boardList[0].profileContents ? boardList[0].profileContents : "");
                                                setUpdateProfileBoolean(!updateProfileBoolean);
                                            }}>내 정보 수정</button>}
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