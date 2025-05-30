import Swal from "sweetalert2";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useBlocker } from "react-router-dom";
import { useRecoilState } from "recoil";
import { boardType, boardUpdate, loginUser } from "../../store/atoms";
import { ToastError, ToastSuccess, ToastWarn } from "../../components/Toast";
import { writeBoardApi, writeBoardImgApi } from "../../api/board";
import SEO from "../../components/SEO";
import Line from "../../components/line/Line";
import Label from "../../components/label/Label";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import Category from "../../components/category/Category";
import "./BoardWrite.scss"
import Scroll from "../../components/Scroll";
import Spinner from "../../components/Spinner/Spinner";
const ReactQuill = lazy(() => import('../../components/ReactQuill'));
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import 'highlight.js/styles/github-dark.css';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('scss', scss);

const BoardWrite = () => {
    const [title, setTitle] = useState("");
    const [contents, setContents] = useState("");
    const [userInfo, setUserInfo] = useRecoilState(loginUser);
    const [updateValue, setUpdateValue] = useRecoilState(boardUpdate);
    const [boardTypeNum, setBoardTypeNum] = useRecoilState(boardType);
    const [boardBoolean, setBoardBoolean] = useState(false);
    const [tagName, setTagName] = useState("");
    const [tags, setTags] = useState<String[]>([]);
    const [image, setImage] = useState<File>();
    const [blobImg, setBlobImg] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const ServerImgUrl = import.meta.env.VITE_SERVER_IMG_URL;
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
                    setIsUploading(true);
                    const data = await writeBoardImgApi(formData);

                    // @ts-ignore getEditor() 타입 오류가 생기지만 문제 없음. 
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', ServerImgUrl + data.fileName);
                    quill.setSelection(range.index + 1);
                } catch (error) {
                    console.error(error);
                    ToastError("이미지 업로드에 실패했어요");
                } finally {
                    setIsUploading(false);
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
                    ['bold', 'italic', 'underline', 'strike', 'code'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    [{ 'indent': '-1' }, { 'indent': '+1' }],
                    ['image', 'video'],
                    ['link']
                ],
                handlers: {
                    image: imageHandler
                },
                clipboard: {
                    matchVisual: false
                },
            },
            syntax: {
                highlight: (text: string) => hljs.highlightAuto(text).value
            },
            ImageResize: {
                modules: ['Resize', 'DisplaySize']
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
                ToastWarn("태그는 6개까지 작성할 수 있어요");
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
            let typeTitle = "글을 작성하시겠어요?";
            let typeUrl = "/writeBoard";
            let typeData = { title, contents, userNo: userInfo[0].userNo, boardNo: 0, tags, boardTypeNum };

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
                    setIsEditing(false);
                    setIsUploading(true);
                    let formData = new FormData();
                    formData.append('title', typeData.title);
                    formData.append('contents', typeData.contents);
                    formData.append('boardNo', String(typeData.boardNo));
                    formData.append('userNo', String(typeData.userNo));
                    formData.append('tags', String(typeData.tags));
                    formData.append('boardType', String(typeData.boardTypeNum));
                    image && formData.append('thumbnail', image);
                    type === 1 && formData.append('boardImgUrl', String(updateValue.boardImgUrl));

                    await writeBoardApi(typeUrl, formData);

                    if (type === 1) {
                        ToastSuccess("글이 수정되었어요!");
                    } else ToastSuccess("글이 작성되었어요!");

                    URL.revokeObjectURL(blobImg);
                    setUpdateValue({ titleValue: "", contentsValue: "", boardNo: 0 });
                    navigate(`/?boardType=${boardTypeNum}`);
                } catch (e) {
                    if (type === 1) {
                        ToastError("수정을 실패했어요");
                    } else ToastError("작성을 실패했어요");
                    console.error(e);
                } finally {
                    setIsUploading(false);
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
        setImage(e.target.files[0]);
        setBlobImg(URL.createObjectURL(e.target.files[0]));
    };

    const handleChange = (value: string) => {
        setContents(value);
        setIsEditing(true);
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
            setTags(updateValue.tags.split(","));
        } else setTags([]);
    }, [updateValue.titleValue, updateValue.contentsValue, updateValue.tags]);

    useEffect(() => {
        Scroll();

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            return '페이지를 나가시겠습니까?';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useBlocker(({ currentLocation, nextLocation }) => {
        if (isEditing) {
            return !window.confirm('페이지를 나가시겠습니까?');
        }

        return false;
    });

    return (
        <>
            <Spinner isLoading={isUploading} />
            <button className="boardWrite-backbutton" onClick={() => navigate(-1)}>&lt;&nbsp;&nbsp;이전으로</button>
            <SEO title="글쓰기" contents="글쓰기" />
            <section className="boardWrite-container">
                <article className="boardWrite-titleContainer">
                    <Label text="카테고리" />
                    <div className="boardWrite-CategoryBlock">
                        <Category />
                    </div>
                    <div className="boardWrite-titleBlock">
                        <Label text="제목" />
                        <Input placeholder="제목을 입력해주세요" disabled={boardBoolean}
                            onFocus={CheckBoardLoginOnFocus} onChange={e => setTitle(e.target.value)} value={title} />
                    </div>
                    <Label text="내용" />
                    <Line />
                    <Suspense fallback={<div>Loading...</div>}>
                        <ReactQuill modules={modules} onChange={handleChange} value={contents}
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
                            : <Button onClick={() => WriteBoardOnClick(0)} text="글 작성" />}
                    </div>
                </aside>
            </section>
        </>
    )
}

export default BoardWrite;