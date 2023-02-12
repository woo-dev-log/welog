import { useState } from 'react';

interface Props {
  total: number,
  limit: number
  page: number,
  setPage: number
}

const Paging = ({ total, limit, page }: Props) => {
  const [currentPage, setcurrentPage] = useState(1);
  const numPages = Math.ceil(total / limit);


  const totalPageArray = if(Array(numPages).fill().map((_, i) => i);

  return (
    <>
      <button onClick={() => setcurrentPage(page - 1)} disabled={page === 1}>&lt;</button>
      {Array(numPages).fill().map((_, i) => (
          <button key={i + 1} onClick={() => setcurrentPage(i + 1)} 
          aria-current={page === i + 1 ? "page" : null}>
            {i + 1}
          </button>
        ))}
      <button onClick={() => setcurrentPage(page + 1)} disabled={page === numPages}>
        &gt;
      </button>
    </>
  );

}

export default Paging;