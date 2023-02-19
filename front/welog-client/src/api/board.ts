import axios from "axios";

export const deleteBoardCommentApi = async (boardNo: number, commentNo: number) => {
    const { data } = await axios.post("/deleteBoardComment", { boardNo, commentNo });
    return data;
}

export const updateBoardCommentApi = async (boardNo: number, boardCommentUpdate: string, userNo: number, commentNo: number) => {
    const { data } = await axios.post("/updateBoardComment", { boardNo, boardCommentUpdate, userNo, commentNo });
    return data;
}

export const writeBoardCommentApi = async (boardNo: number, boardCommentAdd: string, userNo: number) => {
    const { data } = await axios.post("/writeBoardComment", { boardNo, boardCommentAdd, userNo });
    return data;
}

export const getBoardCommentApi = async (boardNo: number) => {
    const { data } = await axios.post("/boardComment", { boardNo });
    return data;
};

export const deleteBoardApi = async (boardNo: number) => {
    const { data } = await axios.post("/deleteBoard", { boardNo });
    return data;
}

export const writeBoardApi = async (typeUrl: string, typeData: {}) => {
    const { data } = await axios.post(typeUrl, typeData);
    return data;
}

export const updateBoardViewsApi = async (boardNo: number, views: number) => {
    const { data } = await axios.post("/boardViews", { boardNo, views: views + 1 });
    return data;
};

export const getUserBoardApi = async (userNickname: string | undefined) => {
    const { data } = await axios.post("/userBoard", { userNickname });
    return data;
};

export const getBoardDetailApi = async (boardNo: number) => {
    const { data } = await axios.post("/boardDetail", { boardNo });
    return data;
}

export const getBoardApi = async () => {
    const { data } = await axios.get("/board");
    return data;
};