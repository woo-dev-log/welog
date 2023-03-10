import { atom } from "recoil";

interface BoardType {
    boardNo: number;
    userNo: number;
    title: string;
    contents: string;
    rgstrDate: string;
    views: number;
    tags: string;
    boardImgUrl: string;
    nickname: string;
    imgUrl: string;
    profileContents?: string;
    boardCnt?: number;
    commentCnt: number;
}

interface LoginProps {
    userNo: number;
    nickname: string;
    id: string;
    imgUrl: string;
}

interface BoardUpdateProps {
    titleValue: string,
    contentsValue: string,
    boardNo: number,
    tags?: string,
    boardImgUrl?: string
}

interface UserProfileType {
    userNo: number;
    nickname: string;
    imgUrl: string;
    profileContents: string;
    userBoardCnt: number;
    userCommentCnt: number;
}

export const board = atom<BoardType[]>({
    key: 'boardKey',
    default: []
});

export const loginCheckCnt = atom({
    key: 'loginCheckCntKey',
    default: 1
});

export const loginUser = atom<LoginProps[]>({
    key: 'loginUserKey',
    default: [{ userNo: 0, nickname: "", id: "", imgUrl: "" }]
});

export const boardUpdate = atom<BoardUpdateProps>({
    key: 'boardUpdateKey',
    default: {
        titleValue: "",
        contentsValue: "",
        boardNo: 0,
        tags: "",
        boardImgUrl: ""
    }
});

export const user = atom<UserProfileType[]>({
    key: 'userKey',
    default: []
});