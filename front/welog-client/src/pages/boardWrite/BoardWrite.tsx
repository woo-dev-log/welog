import Swal from "sweetalert2";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { boardUpdate, loginUser } from "../../store/atoms";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import { writeBoardApi } from "../../api/board";
import SEO from "../../components/SEO";
import Line from "../../components/line/Line";
import Label from "../../components/label/Label";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import "./BoardWrite.scss"
import 'react-quill/dist/quill.snow.css';
const ReactQuill = lazy(() => import('react-quill'));

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        [{ 'color': [] }, { 'background': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [], [], [], [], [], [], [],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [ 'image', 'video' ],
        [ 'link' ]
    ]
};

const BoardWrite = () => {
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [updateValue, setUpdateValue] = useRecoilState(boardUpdate);
    const [boardBoolean, setBoardBoolean] = useState(false);
    const [tagName, setTagName] = useState("");
    const [tags, setTags] = useState<String[]>([]);
    const [image, setImage] = useState<File>();
    const [blobImg, setBlobImg] = useState("");
    const navigate = useNavigate();
    const ServerImgUrl = "http://localhost:3690/images/";
    console.log(contents);

    const tagOnClick = (index: number) => {
        tags.splice(index, 1);
        setTags([...tags]);
    }

    const tagNameOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.includes(",")) return;

        if (e.target.value.length > 8) {
            ToastWarn("????????? 8?????? ????????? ??????????????????");
            return;
        }

        setTagName(e.target.value);
    };

    const tagNameOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (tagName === "") return;

        if (e.key === "Enter" || e.key === ",") {
            if (tags.length > 5) {
                ToastWarn("????????? 6????????? ????????? ??? ?????????");
                return;
            }

            setTags([...tags, tagName]);
            setTagName("");
        }
    };

    const WriteBoardOnClick = async (type: number) => {
        if (title === "" || contents === "") {
            ToastWarn("?????? ??????????????????");
            return;
        } else if (title.length > 30) {
            ToastWarn("????????? 30??? ????????? ??????????????????");
            return;
        } else {
            let typeTitle = "?????? ??????????????????????";
            let typeUrl = "/writeBoard";
            let typeData = { title, contents, userNo: userInfo[0].userNo, boardNo: 0, tags };

            if (type === 1) {
                typeTitle = "?????? ??????????????????????"
                typeUrl = "/updateBoard";
                typeData.boardNo = updateValue.boardNo;
            }

            const result = await Swal.fire({
                title: typeTitle,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: 'black',
                cancelButtonColor: 'red',
                confirmButtonText: '???',
                cancelButtonText: '?????????'
            })

            if (result.isConfirmed) {
                try {
                    let formData = new FormData();
                    formData.append('title', typeData.title);
                    formData.append('contents', typeData.contents);
                    formData.append('boardNo', String(typeData.boardNo));
                    formData.append('userNo', String(typeData.userNo));
                    formData.append('tags', String(typeData.tags));
                    image && formData.append('thumbnail', image);
                    type === 1 && formData.append('boardImgUrl', String(updateValue.boardImgUrl));

                    await writeBoardApi(typeUrl, formData);

                    if (type === 1) {
                        ToastSuccess("?????? ??????????????????!");
                    } else ToastSuccess("?????? ??????????????????!");

                    URL.revokeObjectURL(blobImg);
                    setUpdateValue({ titleValue: "", contentsValue: "", boardNo: 0 });
                    navigate(-1);
                } catch (e) {
                    if (type === 1) {
                        ToastError("????????? ???????????????");
                    } else ToastError("????????? ???????????????");
                    console.error(e);
                }
            }
        }
    };

    const CheckBoardLoginOnFocus = () => {
        if (userInfo[0].userNo === 0) {
            ToastWarn("???????????? ????????????");
            setBoardBoolean(true);
            return;
        }
    };

    const uploadImageOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return;
        }
        setImage(e.target.files[0]);
        setBlobImg(URL.createObjectURL(e.target.files[0]));
    };

    // ?????????
    useEffect(() => {
        if (updateValue.titleValue) {
            setTitle(updateValue.titleValue);
        } else setTitle("");

        if (updateValue.contentsValue) {
            setContents(updateValue.contentsValue);
        } else setContents("");

        if (updateValue.tags) {
            let tagsValue: string[] = []
            updateValue.tags.split(",").map((v, i) => tagsValue.push(v));
            setTags([...tagsValue]);
        } else setTags([]);
    }, [updateValue.titleValue, updateValue.contentsValue, updateValue.tags]);

    return (
        <>
            <button className="boardWrite-backbutton" onClick={() => navigate(-1)}>&lt;&nbsp;&nbsp;????????????</button>
            <SEO title="?????????" contents="?????????" />
            <section className="boardWrite-container">
                <article className="boardWrite-titleContainer">
                    <div className="boardWrite-titleBlock">
                        <Label text="??????" />
                        <Input placeholder="????????? ??????????????????" disabled={boardBoolean}
                            onFocus={CheckBoardLoginOnFocus} onChange={e => setTitle(e.target.value)} value={title} />
                    </div>
                    <Label text="??????" />
                    <Line />
                    <Suspense fallback={<div>Loading...</div>}>
                        <ReactQuill modules={modules} onChange={setContents} value={contents} placeholder="????????? ??????????????????" />
                    </Suspense>
                </article>
                <aside>
                    <p style={{ marginTop: "0" }}>?????????</p>
                    <div className="boardWrite-thumbnail">
                        {image ? <img src={blobImg} /> :
                            updateValue.titleValue
                                ? <img src={`${ServerImgUrl}${updateValue.boardImgUrl}`} />
                                : <img src={`${ServerImgUrl}React.png`} />}
                        <label className="boardWrite-imgSelect" htmlFor="boardWriteImg">?????? ??????</label>
                        <input type="file" accept="image/*" onChange={uploadImageOnChange} id="boardWriteImg" />
                    </div>

                    <p>??????</p>
                    <input className="boardWrite-tagInput" value={tagName} placeholder="????????? ???????????????"
                        onChange={tagNameOnChange} onKeyUp={tagNameOnKeyUp} />
                    <h5 style={{ margin: "10px 0 20px 0" }}>Enter ?????? ????????? ????????? ????????????</h5>
                    <div className="boardWrite-tagContainer">
                        {tags.map((v, i) => (
                            <div key={i} className="boardWrite-tagBox" onClick={() => tagOnClick(i)}>
                                {v}&nbsp;&nbsp;&nbsp;x
                            </div>
                        ))}
                    </div>

                    <div className="boardWrite-button">
                        {updateValue.titleValue ? <Button onClick={() => WriteBoardOnClick(1)} text="??? ??????" />
                            : <Button onClick={() => WriteBoardOnClick(0)} text="??? ??????" />}
                    </div>
                </aside>
            </section>
        </>
    )
}

export default BoardWrite;