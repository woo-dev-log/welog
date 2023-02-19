import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import Button from '../button/Button';
import './Paging.scss';

interface Props {
  total: number,
  limit: number
  page: number,
  setCurrentPage: (setCurrentPage: number) => void;
  type : string
}

const Paging = ({ total, limit, page, setCurrentPage, type }: Props) => {
  const [cookies, setCookie] = useCookies(['boardCurrentPage', 'boardCommentCurrentPage']);
  const [totalPageArray, setTotalPageArray] = useState<number[][]>([]);
  const [currentPageArray, setCurrentPageArray] = useState<number[]>([]);
  const numPages = Math.ceil(total / limit);

  // useEffect(() => {
  //   const totalPageArray = Array(total).fill(undefined).map((_, i) => i);
  //   const slicePageArray = Array(numPages).fill(undefined).map(() => totalPageArray.splice(0, 5));
  //   setTotalPageArray(slicePageArray);
  //   setCurrentPageArray(slicePageArray[0]);
  // }, [total])

  // useEffect(() => {
  //   if (page % limit === 1) {
  //     setCurrentPageArray(totalPageArray[Math.floor(page / limit)]);
  //   } else if (page % limit === 0) {
  //     setCurrentPageArray(totalPageArray[Math.floor(page / limit) - 1]);
  //   }
  // }, [page])

  const handleOnClickPageChange = (page: number) => {
    setCurrentPage(page);
    if(type === "board") {
      setCookie("boardCurrentPage", page);
    }
  };

  return (
    <div className='paging-container'>
      <Button text={"<"} onClick={() => setCurrentPage(page - 1)} disabled={page === 1} />
      {/* {totalPageArray && totalPageArray.map((d, i) => ( */}
      {Array(numPages).fill(undefined).map((_, i) => (
        <div key={i} className={page === i + 1 ? "paging-currentpageNum" : ""}>
          <Button text={String(i + 1)} onClick={() => handleOnClickPageChange(i + 1)} />
          {/* aria-current={page === i + 1 ? "page" : null} /> */}
        </div>
      ))}
      <Button text={">"} onClick={() => setCurrentPage(page + 1)} disabled={page === numPages} />
    </div>
  );

}

export default Paging;