import { board, boardType } from "../../store/atoms";
import { useRecoilState } from "recoil";
import { useLocation, useSearchParams } from "react-router-dom";
import { getBoardApi } from "../../api/board";
import './Category.scss';
import { useCallback } from "react";

const Category = () => {
    const [boardList, setBoardList] = useRecoilState(board);
    const [boardTypeNum, setBoardTypeNum] = useRecoilState(boardType);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = searchParams.get("page");
    const pathname = useLocation().pathname;

    const boardTypeOnClick = useCallback(async (boardType: number) => {
        setBoardTypeNum(boardType);

        if (pathname === "/BoardWrite") return;
        setSearchParams({ "page": "1" })
        const data = await getBoardApi(boardType, page ? page : "1");
        setBoardList(data);

        const boardTopBlock = document.querySelector(".board-topBlock") as HTMLElement;
        const boardArticle = document.querySelector(".board-article") as HTMLElement;
        if (boardTopBlock) {
            const TopBlockOffsetTop = boardTopBlock.offsetTop;
            window.scrollTo({ top: TopBlockOffsetTop - 80, behavior: "smooth" });
        } else if (boardArticle) {
            const ArticleOffsetTop = boardArticle.offsetTop;
            window.scrollTo({ top: ArticleOffsetTop - 80, behavior: "smooth" });
        }
    }, [page]);

    return <div className="board-Type">
        <button className={boardTypeNum === 1 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(1)}>개발</button>
        <button className={boardTypeNum === 2 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(2)}>하루</button>
        <button className={boardTypeNum === 3 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(3)}>문의</button>
        <button className={boardTypeNum === 0 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(0)}>테스트</button>
    </div>
}

export default Category;