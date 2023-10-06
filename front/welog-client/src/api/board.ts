import axios from "axios";

export const updateUserProfileApi = async (formData: FormData) => {
    const { data } = await axios.post("/updateUserProfile", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
}

export const postUserCommentApi = async (userNo: number, page: string) => {
    const { data } = await axios.post("/userComment", { userNo, page });
    return data;
}

export const postUserProfileApi = async (userNickname: string) => {
    const { data } = await axios.post("/userProfile", { userNickname });
    return data;
}

export const writeBoardSubCommentApi = async (boardNo: number, commentNo: number, boardSubCommentAdd: string, userNo: number, lockState: number) => {
    const { data } = await axios.post("/writeBoardSubComment", { boardNo, commentNo, boardSubCommentAdd, userNo, lockState });
    return data;
}

export const deleteBoardCommentApi = async (boardNo: number, commentNo: number) => {
    const { data } = await axios.post("/deleteBoardComment", { boardNo, commentNo });
    return data;
}

export const updateBoardCommentApi = async (boardNo: number, boardCommentUpdate: string, userNo: number, commentNo: number) => {
    const { data } = await axios.post("/updateBoardComment", { boardNo, boardCommentUpdate, userNo, commentNo });
    return data;
}

export const writeBoardCommentApi = async (boardNo: number, boardCommentAdd: string, userNo: number, lockState: number) => {
    const { data } = await axios.post("/writeBoardComment", { boardNo, boardCommentAdd, userNo, lockState });
    return data;
}

export const getBoardCommentApi = async (boardNo: number, page: string) => {
    const { data } = await axios.post("/boardComment", { boardNo, page });
    return data;
};

export const deleteBoardApi = async (boardNo: number) => {
    const { data } = await axios.post("/deleteBoard", { boardNo });
    return data;
}

export const writeBoardImgApi = async (formData: FormData) => {
    const { data } = await axios.post("/writeBoardImg", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
}

export const writeBoardApi = async (typeUrl: string, formData: FormData) => {
    const { data } = await axios.post(typeUrl, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
}

export const updateBoardViewsApi = async (boardNo: number, views: number) => {
    const { data } = await axios.post("/boardViews", { boardNo, views: views + 1 });
    return data;
};

export const getUserBoardApi = async (userNickname: string, page: string, sortBy: string) => {
    const { data } = await axios.post("/userBoard", { userNickname, page, sortBy });
    return data;
};

export const getBoardDailyApi = async () => {
    const { data } = await axios.get("/boardDaily");
    return data;
}

export const postBoardApi = async (search: string, page: string, sortBy: string) => {
    const { data } = await axios.post("/boardSearch", { search, page, sortBy });
    return data;
}

export const getBoardDetailApi = async (boardNo: number) => {
    const { data } = await axios.post("/boardDetail", { boardNo });
    return data;
}

export const getBoardApi = async (boardType: number, page: string, sortBy: string) => {
    const { data } = await axios.post("/board", { boardType, page, sortBy });
    return data;
};