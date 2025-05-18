import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { board, boardType, boardUpdate, loginUser } from "../../store/atoms";
import { ToastError, ToastWarn } from "../../components/Toast";
import { debounce } from "lodash-es";
import SEO from "../../components/SEO";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import './Board.scss';
import Post from "../../components/post/Post";

const Board = () => {
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [boardList, setBoardList] = useRecoilState(board);
    const [updateValue, setUpdateValue] = useRecoilState(boardUpdate);
    const [searchParams, setSearchParams] = useSearchParams();
    const [boardTypeNum, setBoardTypeNum] = useRecoilState(boardType);
    const navigate = useNavigate();
    const boardCnt = boardList.length > 0 ? boardList[0].boardCnt : 0;

    const writeBoardOnclick = () => {
        if (userInfo[0].userNo !== 0) {
            setUpdateValue({
                titleValue: "",
                contentsValue: "",
                boardNo: 0
            })
            navigate("/BoardWrite");
        } else ToastWarn("로그인을 해주세요");
    }

    const searchBoardListOnChange = debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            setSearchParams({ "keyword": e.target.value });
        } else setSearchParams({ "boardType": String(boardTypeNum), "page": "1" });
    }, 500);

    return (
        <div className="board-postContainer">
            <SEO title="메인" contents="메인" />
            <div className="board-topBlock">
                <Input placeholder="제목, 내용, 태그, 닉네임을 입력해주세요" onChange={searchBoardListOnChange} />
                <div className="board-top">
                    {searchParams.get("keyword")
                        ? <p>{searchParams.get("keyword")} 검색 결과 총 {boardCnt}개의 글을 찾았어요</p>
                        : <p>총 {boardCnt}개의 글이 있어요</p>}
                    {userInfo[0].userNo !== 0 && <div className="board-button" onClick={writeBoardOnclick}>글쓰기</div>}
                </div>
            </div>
            <Post />
        </div>
    )
};

export default Board;