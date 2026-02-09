import { useState, useEffect } from 'react';
import '../style/home.css';
import StockChart from '../componets/StockChart';
import { Link } from 'react-router-dom';
import StockItem from '../pages/StockItem';
import { db, auth } from '../firebase';
import { doc, getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';

function Home({ user, stocks, handleShowToast }) {
  //console.log('✅ [Home 컴포넌트 진입] stocks:', stocks);
  //console.log('✅ [Home 컴포넌트 진입] user:', user);

  const [randomStocks, setRandomStocks] = useState([]);
  const [tradeStocks, setTradeStocks] = useState();
  const showToast = handleShowToast;

  const ownedStocks = Object.entries(user?.stocks ?? {}).filter(([_, stock]) => stock.qty > 0);

  useEffect(() => {
    if (stocks.length > 0) {
      const shuffled = [...stocks].sort(() => 0.5 - Math.random());
      setRandomStocks(shuffled.slice(0, 6).map((s) => s.id));
    }
  }, []);

  useEffect(() => {
    console.log('스턱스 값:', stocks);
  }, [stocks]);

  const renderStockItem = (stock, changeClass, change) => (
    <>
      <div className="stock-info">
        {stock.name} -
        <StockItem stock={stock} change={change} changeClass={changeClass} />
      </div>
      <StockChart history={stock.history} />
    </>
  );

  //디비 연동
  useEffect(() => {
    if (!user?.uid) {
      setTradeStocks(null);
      return;
    }
    fetchTrades();

    //if (user?.uid) console.log('고정값 uid', user.uid);
    // console.log('user 값 ', user);
    // const aa = Object.values(user?.stocks);
    // console.log('벨류값', aa);
    // console.log('값', aa[0].totalCost);
    // const totalAA = aa.map((a) => {
    //   return a.totalCost;
    // });
    // console.log(totalAA);
    console.log('user값=', user);
  }, [user]);

  const investedAmount = Object.entries(user?.stocks ?? {}).reduce((acc, [, stock]) => {
    return acc + stock.totalCost;
  }, 0);

  const fetchTrades = async () => {
    try {
      const q = query(
        collection(db, 'users', user.uid, 'trades'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snap = await getDocs(q);
      const trade_list = snap.docs.map((aa) => ({
        stock: aa.data().stock,
        price: aa.data().price,
        quantity: aa.data().quantity,
        created: aa.data().createdAt?.toDate().toLocaleString('ko-KR', {
          year: '2-digit',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        }),
        //toDate로 js의 Date() 객체로 만들어도 형태는 object임
        //jsx에선 toLocaleString으로 문자열로 바꾸고 출력해야함
      }));

      setTradeStocks(trade_list);

      // ()한번더 감싸주는건 표현식으로 인식하고 자동 반환

      //getDocs로 가져온다고해서 바로 배열화가 되는건 아니다
      //querySnapshot 객체 구조로 가져오며 이 값들은 데이터 뿐만 아니라
      //메타 데이터도 가지고 있다, 따라서 배열을 가지고 있는
      // //docs를 가져와야하므로 sanp.docs 가 비로서 배열화 되는 것
      // console.log('작동중', tradeStocks);
    } catch (e) {
      console.log('에러발생: ', e);
    }
  };

  useEffect(() => {
    // console.log(tradeStocks, 'tradeStocks 값');
  }, [tradeStocks]);

  // useEffect(() => {
  //   const user_db = getDoc(db, 'users', userid);
  // }, []);

  // const randomStocks = useMemo(() => {
  //   const shuffled = [...stocks].sort(() => 0.5 - Math.random());

  //   return shuffled.slice(0, 6); // 슬라이스는 뒷 숫자 미만임 6이면 5까지만
  // }, [stocks]);

  //Math.random 은 0 이상 1 미만 숫자 반환
  // 최대값 => 0.5 + 0.999 = -0.5 , 최소값 => 0.5 -0 = 0.5
  // sort는 기본적으로 문자열 오른차순으로 정렬함
  // [3,2,4,1].sort((a,b)=> a-b )
  // sort는 수식이 음수면 a가 앞, 양수면 a가 뒤로 간다

  // 이전 주식 값에 비해 올랏는지 내렸는지 확인
  const getChangeRate = (stock) => {
    if (stock.prevClose == null) return null;
    //const history = stock.history;

    // if (history.length < 2) return null; //[3, 5] 2

    // const prev = history[history.length - 2]; //3
    // const curr = history[history.length - 1]; //5

    // const diff = curr - prev; // 현재가 5, 이전이 3이라는 가정하에
    const diff = stock.prevClose - stock.price;
    //const rate = ((diff / prev) * 100).toFixed(2); // 2/3*100 은 66.66에서
    // 소수점 2자리에서 반올림 => 66.67

    return {
      //자바스크립트에선 리터럴로 쓴다, jsx 는  return()
      diff,
      isUp: diff < 0,
      isSame: diff === 0,
    };

    //{} 리터럴로 속성과 키값들이 있는 경우가 객체 리터럴 이라 부름
  };

  // const handleShowToast = (msg) => {
  //   setToastMessage(msg);
  //   setShowToast(true);
  //   setTimeout(() => {
  //     setShowToast(false);
  //   }, 2000);
  // };

  //truthy 로 간주되는 값들 => "문자열("false" 도 됨)", [] , {} , function(){}, Infinity, -1 1 3.14 등 숫자
  //falsy 로 간주되는 값들 => false, 0, -0, On, "", null, undefined, NaN

  return (
    <div className="home-container">
      {/* <div className="home-header"> */}
      {/* 상단 헤더 */}
      {/* {user ? (
          <div className="home-header">
            <h1>환영합니다, {user.nickname}</h1>
            <Link to="/settings" className="settings-link">
              ⚙️
            </Link>
          </div>
        ) : (
          <div className="guest-header">
            <h2>ZooSik 거래소에 오신 것을 환영합니다!</h2>

            <p>로그인 후 매수/매도 및 자산 확인이 가능합니다.</p>
            <Link to="/login" className="login-button">
              로그인 하기
            </Link>
            <Link to="/signup" className="signup-button">
              회원가입 하기
            </Link>
          </div>
        )} */}
      {/* </div> */}

      {/* 보유 주식*/}

      {user && (
        <>
          {/* 프래그먼트는 엘리먼트에 실제로 나타나지 않음*/}
          <div className="list_type1">
            <h2>내 계좌 보기</h2>
            <div className="txt_type1">
              <span className="t1">
                <span className="txt_bold">원화:</span> {user.balance.toLocaleString()}원,
              </span>
              <span className="t1">
                <span className="txt_bold">투자:</span> {investedAmount.toLocaleString()}원
              </span>
            </div>
          </div>
          <div className="list_type1">
            <h2>내 종목 보기</h2>
            {/* {console.log('Object.entries=', Object.entries(user?.stocks ?? {}))} */}
            {ownedStocks.length > 0 ? (
              //user && user.stocks && Object.keys(user.stocks).length
              //Object.keys 는 객체에서 모든 키만 뽑아서 배열로 만드는 함수
              //stocks 는 [name] : 갯수 가 있는데
              //여기서 name 만 뽑아서 배열로 만듬
              // ["aaa", "bbb", "ccc"]
              // length는 배열에서만 사용가능하고 객체의 속성 수는 object.keys 를 이용해야함
              <ul>
                {Object.entries(user?.stocks ?? {})
                  // const userStocks = {
                  //   BearTech: {
                  //        qty: 2,
                  //        totalCost: 20000
                  //             }
                  //   KoalaSoft: 5,
                  //   TigerMotors: 1,
                  // };
                  //Object.entries는 객체를 키와 값 쌍을 배열로 바꿔주는 매서드
                  // [
                  //   ["BearTech",{totalCoast:20000, qty:2}]
                  //   ["BearTech", 2],
                  //   ["KoalaSoft", 5],
                  //   ["TigerMotors", 1],
                  // ]
                  .filter(([, position]) => position.qty > 0)
                  //.filter((eee) => eee[1] > 0) 비구조하면 이렇게 써도 됨
                  // 여기서  stockName , qunatity 로  구조분해 한 값을 써야하나
                  // stockName은 쓰이지 않으니까 실상, 스킵자리, 빈슬롯 등으로 불림
                  // 물론 [stockName, qunatity] 로 써도 상관은 없음

                  .map(([stockId, position]) => {
                    const found = stocks.find((s) => s.id === stockId);
                    //console.log('found=', found);
                    //find 는 조건에 맞는 첫번째 객체나 배열을 통째로 가져옴
                    const average_price = position.totalCost / position.qty; //평균단가
                    const currentValue = found.price * position.qty; //현재가 * 보유갯수
                    const profit = currentValue - position.totalCost; //평가 손익 원
                    const profitRate = (profit / position.totalCost) * 100; // 등락비율

                    // const prev_price = found?.price;

                    // const priceDiff = prev_price - average_price;
                    // const diffRate = (priceDiff / average_price) * 100;
                    // const changeAmount = (prev_price - average_price) * position.qty;
                    return (
                      <li key={stockId} className="txt_type1">
                        <Link to={`/stock/${stockId}`}>
                          <span className="t2 txt_bold">
                            {found?.name ?? stockId}: {position.qty}주 보유
                          </span>
                          <div className="txt_type1">
                            <span className="t3">평균단가:{average_price.toLocaleString()}원,</span>
                            <span className="t3">평가손익:{profit.toLocaleString()}원, </span>
                            <span className="txt_bold">
                              {profitRate.toFixed(1)}%{/*toFixed() */}
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p>보유한 주식이 없습니다.</p>
            )}
          </div>
        </>
      )}

      {/* 공통 주식 목록 */}
      {/* <h2 style={{ marginTop: '2rem' }}>ZooSik 주식 목록</h2>
      <ul>
        {randomStocks.map((stockName, index) => {
          const stock = stocks.find((s) => s.id === stockName);
          //stock 는 셔플된 배열을 stocks에서 찾음, name을 통해서

          if (!stock) return null;

          const change = getChangeRate(stock);

          let changeClass = '';
          if (change) {
            if (change.isSame) changeClass = 'stock-same';
            else if (change.isUp) changeClass = 'stock-up';
            else changeClass = 'stock-down';
          }

          return (
            <li key={stock.id}>
              {user ? (
                <Link to={`/stock/${stock.id}`}>
                  <div className="stock-item">{renderStockItem(stock, changeClass, change)}</div>
                </Link>
              ) : (
                <div
                  className="stock-item stock-disabled"
                  onClick={() => showToast('로그인 후 이용하세요')}
                >
                  {renderStockItem(stock, changeClass, change)}
                </div>
              )}
            </li>
          );
        })}
      </ul> */}
      {/* 
      <div className="more-button-wrapper">
        <Link to="/stocks" className="more-button">
          더보기
        </Link>
      </div> */}
      {/* {user && (
        <>
          <h2 style={{ marginTop: '2rem' }}>최근 거래 내역</h2>
          {tradeStocks ? (
            <ul>
              {tradeStocks?.map((aaa, idx) => (
                <li key={idx}>
                  {stocks.find((s) => s.id === aaa.stock)?.name} : {aaa.price}원 - {aaa.quantity}주
                  // ({aaa.created})
                </li>
              ))}
            </ul>
          ) : (
            <p>거래 내역이 없습니다.</p>
          )}
        </>
      )} */}
    </div>
  );
}

export default Home;
