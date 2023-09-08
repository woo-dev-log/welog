import { useEffect } from "react";
import { boardType } from "../../store/atoms";
import { useRecoilState } from "recoil";
import { useLocation, useSearchParams } from "react-router-dom";
import './Category.scss';

const Category = () => {
    const [boardTypeNum, setBoardTypeNum] = useRecoilState(boardType);
    const [searchParams, setSearchParams] = useSearchParams();
    const pathname = useLocation().pathname;
    const type = searchParams.get("boardType");

    const boardTypeOnClick = async (boardType: number) => {
        setBoardTypeNum(boardType);

        if (pathname === "/BoardWrite") return;
        setSearchParams({ "boardType": String(boardType), "page": "1" })
    };

    useEffect(() => {
        if(type) setBoardTypeNum(Number(type));
    }, [type]);

    return <div className="board-Type">
        <button className={boardTypeNum === 1 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(1)}>개발</button>
        <button className={boardTypeNum === 2 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(2)}>하루</button>
        <button className={boardTypeNum === 3 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(3)}>문의</button>
        <button className={boardTypeNum === 0 ? "board-TypeBtnOn" : "board-TypeBtnOff"} onClick={() => boardTypeOnClick(0)}>테스트</button>
    </div>
}

export default Category;