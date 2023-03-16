import { useCookies } from 'react-cookie';
import { useSearchParams } from 'react-router-dom';
import Button from '../button/Button';
import './Paging.scss';

interface Props {
  total: number,
  limit: number
  page: number,
  setCurrentPage: (setCurrentPage: number) => void;
}

const Paging = ({ total, limit, page, setCurrentPage }: Props) => {
  const [cookies, setCookie] = useCookies(['boardCurrentPage', 'boardCommentCurrentPage']);
  const [searchParams, setSearchParams] = useSearchParams();
  // const [totalPageArray, setTotalPageArray] = useState<number[][]>([]);
  // const [currentPageArray, setCurrentPageArray] = useState<number[]>([]);
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

    const keyword = searchParams.get("keyword");
    const type = searchParams.get("type");

    if (keyword) {
      setSearchParams({ "keyword": keyword, "page": String(page) })
    } else if (type) {
      setSearchParams({ "type": type, "page": String(page) })
    } else setSearchParams({ "page": String(page) });
  };

  return (
    <div className='paging-container'>
      <Button text={"<"} onClick={() => handleOnClickPageChange(page - 1)} disabled={page === 1} />
      {/* {totalPageArray && totalPageArray.map((d, i) => ( */}
      {Array(numPages).fill(undefined).map((_, i) => (
        <div key={i} className={page === i + 1 ? "paging-currentpageNum" : ""}>
          <Button text={String(i + 1)} onClick={() => handleOnClickPageChange(i + 1)} />
          {/* aria-current={page === i + 1 ? "page" : null} /> */}
        </div>
      ))}
      <Button text={">"} onClick={() => handleOnClickPageChange(page + 1)} disabled={page === numPages} />
    </div>
  );

}

export default Paging;