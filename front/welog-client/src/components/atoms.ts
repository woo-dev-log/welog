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

export const loginUser = atom<loginProps[]>({
    // export const loginUser = atom({
    key: 'loginUser',
    default: [{ userNo: 0, nickname: "", id: "", imgUrl: "" }]
});

export const boardUpdate = atom<boardUpdateProps>({
    key: 'boardUpdate',
    default: {
        titleValue: "",
        contentsValue: "",
        boardNo: 0
    }
});