import { atom } from "recoil";

export interface Props {
    nickname: string;
    id: string;
}

export const loginUser = atom<Props[]>({
// export const loginUser = atom({
    key: 'loginUser',
    default: []
});