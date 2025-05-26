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
        <div className={`board-TypeBtn ${boardTypeNum === 1 ? "isActive" : ""}`} onClick={() => boardTypeOnClick(1)}>개발</div>
        <div className={`board-TypeBtn ${boardTypeNum === 2 ? "isActive" : ""}`} onClick={() => boardTypeOnClick(2)}>학습</div>
        <div className={`board-TypeBtn ${boardTypeNum === 3 ? "isActive" : ""}`} onClick={() => boardTypeOnClick(3)}>문의</div>
        <div className={`board-TypeBtn ${boardTypeNum === 0 ? "isActive" : ""}`} onClick={() => boardTypeOnClick(0)}>테스트</div>
    </div>
}

export default Category;