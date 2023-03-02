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
    commentCnt: number;
}

interface loginProps {
    userNo: number;
    nickname: string;
    id: string;
    imgUrl: string;
}

interface boardUpdateProps {
    titleValue: string,
    contentsValue: string,
    boardNo: number
}

export const board = atom<BoardType[]>({
    key: 'boardKey',
    default: []
});

export const loginCheckCnt = atom({
    key: 'loginCheckCntKey',
    default: 1
});

export const loginUser = atom<loginProps[]>({
    key: 'loginUserKey',
    default: [{ userNo: 0, nickname: "", id: "", imgUrl: "" }]
});

export const boardUpdate = atom<boardUpdateProps>({
    key: 'boardUpdateKey',
    default: {
        titleValue: "",
        contentsValue: "",
        boardNo: 0
    }
});