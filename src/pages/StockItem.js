import { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StockItem = ({ stock, change, changeClass }) => {
  const diff = stock.price - stock.prevClose;
  const diff_rate = (diff / stock.prevClose) * 100;

  return (
    <>
      <strong>{stock.price.toLocaleString()}원</strong>
      <span>
        {diff.toLocaleString()}원({diff_rate.toFixed(1)}%)
      </span>
      {change && (
        <span className={`stock-change ${changeClass}`}>
          {change.isSame ? (
            '-0%'
          ) : change.isUp ? (
            <>
              {' '}
              <i className="fa-solid fa-arrow-up">{stock.rate}</i>
            </>
          ) : (
            <>
              <i className="fa-solid fa-arrow-down">{stock.rate}</i>
            </>
            //요소가 두개인 경우는 fragment로 감싸줘야함
          )}
        </span>
      )}
    </>
  );
};

function areEqual(prevProps, nextProps) {
  return (
    prevProps.stock.price === nextProps.stock.price &&
    prevProps.changeClass === nextProps.changeClass &&
    JSON.stringify(prevProps.change) === JSON.stringify(nextProps.change)
  );
}

export default memo(StockItem, areEqual);
