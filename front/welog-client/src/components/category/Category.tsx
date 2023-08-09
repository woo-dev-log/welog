import { useState } from "react";
import { board } from "../../store/atoms";
import { useRecoilState } from "recoil";
import { useSearchParams } from "react-router-dom";
import { getBoardApi } from "../../api/board";
import './Category.scss';

interface CategoryProps {
    boardTypeNum: number;
}

const Category = ({ boardTypeNum }: CategoryProps) => {
    const [boardList, setBoardList] = useRecoilState(board);
    const [boardType, setBoardType] = useState(boardTypeNum);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = searchParams.get("page");

    const boardTypeOnClick = async (boardType: number) => {
        setSearchParams({ "page": "1" })
        const boardTopBlock = document.querySelector(".board-topBlock") as HTMLElement;
        const boardArticle = document.querySelector(".board-article") as HTMLElement;
        if (boardTopBlock) {
            const TopBlockOffsetTop = boardTopBlock.offsetTop;
            window.scrollTo({ top: TopBlockOffsetTop - 80, behavior: "smooth" });
        } else if (boardArticle) {
            const ArticleOffsetTop = boardArticle.offsetTop;
            window.scrollTo({ top: ArticleOffsetTop - 80, behavior: "smooth" });
        }

        setBoardType(boardType);
        const data = await getBoardApi(boardType, page ? page : "1");
        setBoardList(data);
    }

    return <>
        <button className={boardType === 2 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(2)}>하루</button>
        <button className={boardType === 1 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(1)}>개발</button>
        <button className={boardType === 3 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(3)}>문의</button>
        <button className={boardType === 0 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(0)}>테스트</button>
    </>
}

export default Category;