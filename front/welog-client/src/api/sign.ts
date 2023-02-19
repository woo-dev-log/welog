import axios from "axios";


export const postSignInApi = async(id: string, pw: string) => {
    const { data } = await axios.post("/signIn", { id, pw });
    return data;
}

export const checkSignUpNicknameApi = async(nickname: String) => {
    const { data } = await axios.post("/checkSignUpNickname", { nickname });
    return data;
}

export const checkSignUpIdApi = async(id: String) => {
    const { data } = await axios.post("/checkSignUpId", { id })
    return data;
}

export const postSignUpApi = async (formData: FormData) => {
    const { data, status } = await axios.post("/signUp", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return {data, status};
}