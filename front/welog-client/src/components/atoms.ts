import { atom } from "recoil";

export interface Props {
    userNo: number;
    nickname: string;
    id: string;
    imgUrl: string;
}

export const loginUser = atom<Props[]>({
// export const loginUser = atom({
    key: 'loginUser',
    default: [{ userNo: 0, nickname: "", id: "", imgUrl: ""}]
});