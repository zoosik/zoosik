import { Link } from 'react-router-dom';
import StockChart from '../componets/StockChart';
import '../style/allstocks.css';

function AllStocks({ user, stocks, handleShowToast }) {
  console.log('✅ [Home 컴포넌트 진입] stocks:', stocks);
  console.log('✅ [Home 컴포넌트 진입] user:', user);
  const showToast = handleShowToast;
  const getChangeRate = (stock) => {
    const history = stock.history;

    if (history.length < 2) return null; //[3, 5] 2

    const prev = history[history.length - 2]; //3
    const curr = history[history.length - 1]; //5

    const diff = curr - prev; // 현재가 5, 이전이 3이라는 가정하에
    const rate = ((diff / prev) * 100).toFixed(2); // 2/3*100 은 66.66에서
    // 소수점 2자리에서 반올림 => 66.67

    return {
      //자바스크립트에선 리터럴로 쓴다, jsx 는  return()
      diff,
      rate,
      isUp: diff > 0,
      isSame: diff === 0,
    };
  };

  return (
    <div className="allstocks-container">
      <h2 className="allstocks-title">📊 전체 주식 목록</h2>
      <ul className="stock-list">
        {stocks.map((stock, index) => {
          const change = getChangeRate(stock);
          let changeClass = '';
          if (change) {
            if (change.isSame) changeClass = 'stock-same';
            else if (change.isUp) changeClass = 'stock-up';
            else changeClass = 'stock-down';
          }

          const renderStockItem = () => (
            <>
              <div className="stock-info">
                {stock.name} - <strong>{stock.price.toLocaleString()}원</strong>
                {change && (
                  <span className={`stock-change ${changeClass}`}>
                    {change.isSame ? (
                      '-0%'
                    ) : change.isUp ? (
                      <>
                        <i className="fa-solid fa-arrow-up">{stock.rate}</i>%
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-arrow-down">{stock.rate}</i>%
                      </>
                    )}
                  </span>
                )}
              </div>
              <StockChart history={stock.history} />
            </>
          );

          return (
            <li key={index}>
              {user ? (
                <Link to={`/stock/${stock.name.replace(/[^a-zA-Z]/g, '')}`}>
                  <div className="stock-item">{renderStockItem()}</div>
                </Link>
              ) : (
                <div
                  className="stock-item stock-disabled"
                  onClick={() => showToast('로그인 후 이용하세요')}
                >
                  {renderStockItem()}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default AllStocks;
