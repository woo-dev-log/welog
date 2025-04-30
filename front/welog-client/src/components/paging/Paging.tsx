import { useSearchParams } from 'react-router-dom';
import Button from '../button/Button';
import './Paging.scss';
import Scroll from '../Scroll';

interface Props {
  total: number,
  limit: number
  page: number,
  setCurrentPage: (setCurrentPage: number) => void;
}

const Paging = ({ total, limit, page, setCurrentPage }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const numPages = Math.ceil(total / limit);
  const maxVisiblePages = 5;
  const halfVisiblePages = Math.floor(maxVisiblePages / 2);

  const getVisiblePages = () => {
    let startPage = Math.max(1, page - halfVisiblePages);
    let endPage = Math.min(numPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const handleOnClickPageChange = (page: number) => {
    if (page < 1 || page > numPages) return;
    
    setCurrentPage(page);

    const keyword = searchParams.get("keyword");
    const type = searchParams.get("type");
    const boardType = searchParams.get("boardType");
    
    const params: Record<string, string> = { page: String(page) };
    if (keyword) params.keyword = keyword;
    if (type) params.type = type;
    if (boardType) params.boardType = boardType;
    
    setSearchParams(params);
    Scroll();
  };

  const visiblePages = getVisiblePages();

  return (
    <div className='paging-container'>
      <Button 
        text={"<"} 
        onClick={() => handleOnClickPageChange(page - 1)} 
        disabled={page === 1} 
      />
      {visiblePages.map((pageNum) => (
        <div key={pageNum} className={page === pageNum ? "paging-currentpageNum" : ""}>
          <Button 
            text={String(pageNum)} 
            onClick={() => handleOnClickPageChange(pageNum)} 
          />
        </div>
      ))}
      <Button 
        text={">"} 
        onClick={() => handleOnClickPageChange(page + 1)} 
        disabled={page === numPages} 
      />
    </div>
  );
}

export default Paging;