import Swal from "sweetalert2";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { boardUpdate, loginUser } from "../../store/atoms";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import { writeBoardApi, writeBoardImgApi } from "../../api/board";
import SEO from "../../components/SEO";
import Line from "../../components/line/Line";
import Label from "../../components/label/Label";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import "./BoardWrite.scss"
import 'react-quill/dist/quill.snow.css';
const ReactQuill = lazy(() => import('react-quill'));

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
    const quillRef = useRef(null);

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (input.files && quillRef.current) {
                const file = input.files[0];
                const formData = new FormData();
                formData.append('boardImg', file);

                try {
                    const data = await writeBoardImgApi(formData);

                    // @ts-ignore getEditor() 타입 오류가 생기지만 문제 없음. 
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', ServerImgUrl + "boardImg/" + data.fileName);
                    quill.setSelection(range.index + 1);
                } catch (error) {
                    console.error(error);
                }
            }
        };
    };

    const modules = useMemo(() => {
        return {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, 3, false] }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    [{ 'indent': '-1' }, { 'indent': '+1' }],
                    ['image', 'video'],
                    ['link']
                ],
                handlers: {
                    image: imageHandler
                }
            }
        }
    }, []);

    const tagOnClick = (index: number) => {
        tags.splice(index, 1);
        setTags([...tags]);
    }

    const tagNameOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.includes(",")) return;

        if (e.target.value.length > 8) {
            ToastWarn("태그는 8글자 이내로 입력해주세요");
            return;
        }

        setTagName(e.target.value);
    };

    const tagNameOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (tagName === "") return;

        if (e.key === "Enter" || e.key === ",") {
            if (tags.length > 5) {
                ToastWarn("태그는 6개까지 등록할 수 있어요");
                return;
            }

            setTags([...tags, tagName]);
            setTagName("");
        }
    };

    const WriteBoardOnClick = async (type: number) => {
        if (title === "" || contents === "") {
            ToastWarn("모두 입력해주세요");
            return;
        } else if (title.length > 30) {
            ToastWarn("제목을 30자 이내로 작성해주세요");
            return;
        } else {
            let typeTitle = "글을 등록하시겠어요?";
            let typeUrl = "/writeBoard";
            let typeData = { title, contents, userNo: userInfo[0].userNo, boardNo: 0, tags };

            if (type === 1) {
                typeTitle = "글을 수정하시겠어요?"
                typeUrl = "/updateBoard";
                typeData.boardNo = updateValue.boardNo;
            }

            const result = await Swal.fire({
                title: typeTitle,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: 'black',
                cancelButtonColor: 'red',
                confirmButtonText: '네',
                cancelButtonText: '아니요'
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
                        ToastSuccess("글이 수정되었어요!");
                    } else ToastSuccess("글이 등록되었어요!");

                    URL.revokeObjectURL(blobImg);
                    setUpdateValue({ titleValue: "", contentsValue: "", boardNo: 0 });
                    navigate(-1);
                } catch (e) {
                    if (type === 1) {
                        ToastError("수정을 실패했어요");
                    } else ToastError("등록을 실패했어요");
                    console.error(e);
                }
            }
        }
    };

    const CheckBoardLoginOnFocus = () => {
        if (userInfo[0].userNo === 0) {
            ToastWarn("로그인을 해주세요");
            setBoardBoolean(true);
            return;
        }
    };

    const uploadImageOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) {
            return;
        }
        console.log(e.target.files[0]);
        setImage(e.target.files[0]);
        setBlobImg(URL.createObjectURL(e.target.files[0]));
    };

    // 수정시
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
            <button className="boardWrite-backbutton" onClick={() => navigate(-1)}>&lt;&nbsp;&nbsp;이전으로</button>
            <SEO title="글쓰기" contents="글쓰기" />
            <section className="boardWrite-container">
                <article className="boardWrite-titleContainer">
                    <div className="boardWrite-titleBlock">
                        <Label text="제목" />
                        <Input placeholder="제목을 입력해주세요" disabled={boardBoolean}
                            onFocus={CheckBoardLoginOnFocus} onChange={e => setTitle(e.target.value)} value={title} />
                    </div>
                    <Label text="내용" />
                    <Line />
                    <Suspense fallback={<div>Loading...</div>}>
                        <ReactQuill modules={modules} onChange={setContents} value={contents}
                            ref={quillRef} placeholder="내용을 입력해주세요" />
                    </Suspense>
                </article>
                <aside>
                    <p style={{ marginTop: "0" }}>썸네일</p>
                    <div className="boardWrite-thumbnail">
                        {image ? <img src={blobImg} alt="board-thumbnail" /> :
                            updateValue.titleValue
                                ? <img src={`${ServerImgUrl}${updateValue.boardImgUrl}`} alt="board-thumbnail" />
                                : <img src={`${ServerImgUrl}React.png`} alt="board-thumbnail" />}
                        <label className="boardWrite-imgSelect" htmlFor="boardWriteImg">사진 선택</label>
                        <input type="file" accept="image/*" onChange={uploadImageOnChange} id="boardWriteImg" />
                    </div>

                    <p>태그</p>
                    <input className="boardWrite-tagInput" value={tagName} placeholder="태그를 입력하세요"
                        onChange={tagNameOnChange} onKeyUp={tagNameOnKeyUp} />
                    <h5 style={{ margin: "10px 0 20px 0" }}>Enter 혹은 쉼표를 누르면 입력돼요</h5>
                    <div className="boardWrite-tagContainer">
                        {tags.map((v, i) => (
                            <div key={i} className="boardWrite-tagBox" onClick={() => tagOnClick(i)}>
                                {v}&nbsp;&nbsp;&nbsp;x
                            </div>
                        ))}
                    </div>

                    <div className="boardWrite-button">
                        {updateValue.titleValue ? <Button onClick={() => WriteBoardOnClick(1)} text="글 수정" />
                            : <Button onClick={() => WriteBoardOnClick(0)} text="글 등록" />}
                    </div>
                </aside>
            </section>
        </>
    )
}

export default BoardWrite;