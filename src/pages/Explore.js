import { useEffect, useMemo, useState } from 'react';
import '../style/explore.css';
import { Link } from 'react-router-dom';
import { loadRecentViewed, removeRecentViewed, clearRecentViewed } from '../utils/recentViewed';

export default function Explore({ stocks = [] }) {
  // function abc(ab = '바보') {
  //   console.log(ab);
  // }
  // abc() => 기본값인 바보 출력, abc(11)=> 인자값인 11 출력
  const [query, setQuery] = useState('');
  //스테이트 값을 안넣게 되면 query.includes('a') 매서드는 초기 값일 때
  //undefined로 넘어가서 에러가 뜸

  const visibieStocks = useMemo(() => {
    //useMemo는 랜더링하는 과정에서 실행이 되며
    //의존성 배열에 있는 값이 변경되지 않는 한 실행이 되지 않는다
    //첫번째 인자로 받는 콜백 함수는 실행하고 있지 않다가 위 랜더링 되는 시점에 실행되고
    //그 함수가 return 한 값을 useMemo의 반환값으로 사용함
    const q = query.trim().toLowerCase();
    //trim()= 문자 앞,끝 "공백, 탭, 줄바꿈" 제거 메소드, toLowerCase()= 소문자로 변경해줌

    if (!q) return stocks;

    return stocks.filter((s) => {
      //filter(조건) , 조건에 맞는 요소만 찾아서 다시 배열을 리턴
      const name = (s.name || '').toLowerCase();
      const id = (s.id || '').toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [stocks, query]);
  //name=비어테크, id=beartech, q='bear'혹은'비어'등
  //리턴은 비어테크 or beartech

  return (
    <div className="explore">
      <h2 className="explore_title">종목</h2>
      <div className="explore_search">
        <input
          className="explore_input"
          type="search"
          placeholder="주식명 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="explore_clear" type="button" onClick={() => setQuery('')}>
            지우기
          </button>
        )}
        {/* A가 truthy면 A를 반환 => or
        A가 truthy면 B를 반환 => and */}
      </div>
      <ul className="stock-list">
        {visibieStocks.map((s) => (
          <li key={s.id} className="stock-row">
            <Link className="stock-row_link" to={`/stock/${s.id}`}>
              <div className="stock-row_left ">
                <p className="stock-row_name">{s.name}</p>
                <p className="stock-row_id">{s.id}</p>
              </div>
              <div className="stock-row_right">
                <p className="stock-row_price">
                  {typeof s.price === 'number' ? `${s.price.toLocaleString('ko-kr')}원` : '-'}
                  {/* typeof 연산자는 항상 string을 반환해서 "number" 이라고 해야함 */}
                  {/* == 는 값만 비교 === 는 값+타입 비교 */}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {visibieStocks.length === 0 && <p className="explore_empty">검색 결과가 없습니다.</p>}
    </div>
  );
}
