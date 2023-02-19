import axios from "axios";

export const postBoardWriteApi = async (typeUrl: string, typeData: {}) => {
    try {
        const { data } = await axios.post(typeUrl, typeData);
        return data;
    } catch (e) {
        console.error(e);
    }
}

export const handleUpdateBoardViewsApi = async (boardNo: number, views: number) => {
    try {
        const { data } = await axios.post("/boardViews", { boardNo, views: views + 1 });
        return data;
    } catch (e) {
        console.error(e);
    }
};

export const getUserBoardApi = async (userNickname: string) => {
    try {
        const { data } = await axios.post("/userBoard", { userNickname });
        return data;
    } catch (e) {
        console.error(e);
    }
};

export const getBoardApi = async () => {
    try {
        const { data } = await axios.get("/board");
        return data;
    } catch (e) {
        console.error(e);
    }
};