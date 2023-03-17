import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { postUserProfileApi, updateProfileContentsApi } from "../../api/board";
import SEO from "../../components/SEO";
import { useRecoilState } from "recoil";
import { loginUser, user } from "../../store/atoms";
import './UserBoard.scss';
import Post from "../../components/post/Post";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import UserComment from "../../components/userComment/UserComment";

const UserBoard = () => {
    const { userNickname } = useParams();
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [userProfile, setUserProfile] = useRecoilState(user);
    const [updateProfileBoolean, setUpdateProfileBoolean] = useState(false);
    const [updateProfileContents, setUpdateProfileContents] = useState("");
    const [searchParams, setSearchParams] = useSearchParams({ "type": "post" });
    const type = searchParams.get("type");
    const page = searchParams.get("page");
    const ServerImgUrl = "https://welog.fly.dev/images/";
    const textAreaCols = window.innerWidth < 1199 ? 30 : 50;

    const updateProfileContentsOnClick = async () => {
        if (updateProfileContents === "") {
            ToastWarn("본인 소개를 입력해주세요");
            return;
        } else if (updateProfileContents === userProfile[0].profileContents) {
            ToastWarn("수정된 내용이 없어요");
            setUpdateProfileBoolean(false);
            return;
        } else {
            try {
                await updateProfileContentsApi(updateProfileContents, userInfo[0].userNo);
                userProfileApi();
                setUpdateProfileBoolean(false);
                ToastSuccess("프로필이 수정되었어요!");
            } catch (e) {
                ToastError("프로필 수정을 실패했어요");
                console.error(e);
            }
        }
    };

    const userProfileApi = async () => {
        try {
            const data = await postUserProfileApi(userNickname ? userNickname : "");
            setUserProfile(data);
        } catch (e) {
            ToastError("유저 정보 조회를 실패했어요");
            console.error(e);
        }
    };

    useEffect(() => {
        userProfileApi();
    }, [userNickname]);

    return (
        <>
            <SEO title="유저보드" contents="유저보드" />
            {userProfile === undefined || userProfile.length === 0
                ? <h2>유저 정보가 없어요</h2>
                : <>
                    <section className="userBoard-userContainer">
                        <div className="userBoard-userProfile">
                            <img src={`${ServerImgUrl}${userProfile[0].imgUrl}`} alt="userProfileImg" />
                            <div className="userBoard-introduce">
                                <h2>{userProfile[0].nickname}</h2>
                                {updateProfileBoolean
                                    ? <textarea rows={3} cols={textAreaCols} placeholder="90자 이내로 본인을 소개해보세요!"
                                        value={updateProfileContents} onChange={e => {
                                            if (e.target.value.length > 90) {
                                                ToastWarn("100자 이내로 소개해주세요");
                                            } else setUpdateProfileContents(e.target.value)
                                        }
                                        } />
                                    : <div dangerouslySetInnerHTML={{
                                        __html: userProfile[0].profileContents
                                            ? userProfile[0].profileContents.replaceAll(/(\n|\r\n)/g, '<br>')
                                            : ""
                                    }} />}
                            </div>
                        </div>
                        {userInfo[0].userNo === userProfile[0].userNo &&
                            <div className="userBoard-updateProfileContainer">
                                {updateProfileBoolean
                                    ? <button className="userBoard-updateProfileBtn"
                                        onClick={updateProfileContentsOnClick}>수정하기</button>
                                    : <button className="userBoard-updateProfileBtn"
                                        onClick={() => {
                                            setUpdateProfileContents(userProfile[0].profileContents);
                                            setUpdateProfileBoolean(!updateProfileBoolean);
                                        }}>내 정보 수정</button>}
                            </div>}
                    </section>

                    <section className="userBoard-userWriteContainer">
                        <button className={`${type === "post" ? "userBoard-bgBlack" : "userBoard-bgWhite"}`}
                            onClick={() => setSearchParams({ "type": "post" })}>
                            <p>작성한 글</p>
                            <p><span>{userProfile[0].userBoardCnt}</span> 개</p>
                        </button>
                        <button className={`${type === "comment" ? "userBoard-bgBlack" : "userBoard-bgWhite"}`}
                            onClick={() => setSearchParams({ "type": "comment" })}>
                            <p>작성한 댓글</p>
                            <p><span>{userProfile[0].userCommentCnt}</span> 개</p>
                        </button>
                    </section>

                    {type === "post"
                        ? <Post />
                        : userProfile[0].userNo && <UserComment userNo={userProfile[0].userNo} />
                    }
                </>
            }
        </>
    )
}

export default UserBoard;