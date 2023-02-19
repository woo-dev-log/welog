import { atom } from "recoil";

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

export const loginCheckCnt = atom({
    key: 'loginCheckCntKey',
    default: 0
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