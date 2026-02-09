import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import StockDetail from './pages/StockDetail';
import AllStocks from './pages/AllStocks';
import History from './pages/History';
import Explore from './pages/Explore';
import AppLayout from './layout/AppLayout';
import TestUserBanner from './componets/TestUserBanner';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  onSnapshot,
  writeBatch,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  deleteDoc,
  orderBy,
  limit,
  documentId,
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

import { auth, db } from './firebase';
// import { initUserPrices } from './initUserPrices';
// import './Promise2';

const TEST_EMAIL = 'test0208@gmail.com';
const TEST_PW = '1q2w3e4r';

function App() {
  const [user, setUser] = useState();
  const DEFAULT_STOCKS = [
    // { id: 'BearTech2', name: 'Bear Tech2', price: 1777, history: [111], prevClose: 0 },
    {
      id: 'BearTech',
      name: '비어테크',
      price: 2222,
      history: [{ price: 2222, time: Date.now() }],
      prevClose: 0,
    },
    { id: 'KoalaSoft', name: '코알라테크', price: 8930, history: [], prevClose: 0 },
    { id: 'HamsterCorp', name: '햄스터회사', price: 19542, history: [], prevClose: 0 },
    { id: 'TigerMotors', name: '타이거모터스', price: 18736, history: [], prevClose: 0 },
    { id: 'PenguinWorks', name: '펭귄웍스', price: 12900, history: [], prevClose: 0 },
    { id: 'ElephantInc', name: '코끼리INC', price: 20300, history: [], prevClose: 0 },
    { id: 'RabbitNetWorks', name: '토끼네트웍스', price: 9800, history: [], prevClose: 0 },
    { id: 'FoxSystems', name: '여우시스템', price: 11200, history: [], prevClose: 0 },
  ];

  const [stocks, setStocks] = useState(DEFAULT_STOCKS);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [booting, setBooting] = useState(true);

  const stock_volatility = {
    BearTech: 0.001, // ±0.1%
    KoalaSoft: 0.01, // ±1%
    HamsterCorp: 0.0005, // ±0.05%
    TigerMotors: 0.002, // ±0.2%
    PenguinWorks: 0.008, // ±0.8%
    ElephantInc: 0.0009, // ±0.09%
    RabbitNetWorks: 0.01, // ±1%
    FoxSystems: 0.0005, // ±0.05%
  };
  // //임시 데이터 넣기
  // const reseedAllStockHistory30 = async (uid, DEFAULT_STOCKS) => {
  //   const BASE_DATE = new Date('2026-02-08');

  //   for (const stock of DEFAULT_STOCKS) {
  //     const historyRef = collection(db, 'users', uid, 'prices', stock.id, 'history');

  //     // 🔥 1. 기존 history 전부 삭제
  //     const snapshot = await getDocs(historyRef);
  //     for (const docSnap of snapshot.docs) {
  //       await deleteDoc(docSnap.ref);
  //     }

  //     // 🔥 2. 가격 기준값
  //     let price = stock.price;

  //     // 🔥 3. 30개 생성 (과거 → 최신)
  //     for (let i = 29; i >= 0; i--) {
  //       const d = new Date(BASE_DATE);
  //       d.setDate(d.getDate() - i);

  //       // 밸런스 좋은 변동폭 (±1.5%)
  //       const changeRate = (Math.random() * 3 - 1.5) / 100;
  //       price = Math.max(100, Math.round(price * (1 + changeRate)));

  //       await addDoc(historyRef, {
  //         date: d.toISOString().slice(0, 10), // YYYY-MM-DD
  //         close: price,
  //       });
  //     }

  //     console.log(`${stock.id} history reseeded (30)`);
  //   }

  //   console.log('✅ ALL STOCK HISTORY RESEEDED');
  // };
  // useEffect(() => {
  //   if (!user?.uid) return;
  //   if (!DEFAULT_STOCKS?.length) return;

  //   reseedAllStockHistory30(user.uid, DEFAULT_STOCKS);
  // }, [user]);
  // //임시로 테스트 끗

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // 🔹 login.js와 동일한 패턴
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          setUser(userSnap.data());
        }

        setBooting(false);
      } else {
        // 🔹 로그인 안 되어 있으면 → 체험 계정 자동 로그인
        try {
          await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PW);
          alert('현재 체험용 계정으로 접속 중입니다');
        } catch (e) {
          console.error('체험 계정 자동 로그인 실패', e);
          setBooting(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  //날짜 관련 함수
  const getTodayStr = () => new Date().toISOString().slice(0, 10);
  //변수 안 넣는건 호출시 당시 시간을 찍어 재사용 가능하게

  //현재 날짜 구하기
  const getYesterdayStr = () => {
    const a = new Date();
    //Thu Nov 27 2025 15:56:14 GMT+0900 (한국 표준시) {}
    a.setDate(a.getDate() - 1);
    return a.toISOString().slice(0, 10);
    //toIOSString()은 국제 표준 형식(ISO8601) , 2025-11-24T08:12:30.123Z 로 출력됨
  };

  //전날 종가 가져오기
  async function getYesterdayClose(uid, stockName, yesterdayStr) {
    const docRef = doc(db, 'users', uid, 'prices', stockName, 'history', yesterdayStr);
    const snap = await getDoc(docRef);
    //   DocumentSnapshot {
    // exists(): boolean,
    // id: "문서ID",
    // data(): object,
    // ref: DocumentReference,
    // metadata: {...}

    if (snap.exists()) {
      //exists() 이건 getDoc 전용임
      return snap.data().close;
    }

    return null;
  }

  //전날이 없을 때 최근 종가 가져오기
  async function getMostRecentClose(uid, stockName) {
    const historyCol = collection(db, 'users', uid, 'prices', stockName, 'history');
    const q = query(historyCol, orderBy(documentId(), 'desc'), limit(1));
    // query (대상, 조건1, 조건2)
    const snap = await getDocs(q);

    //getDocs는 아래 처럼 반환을 해서 문서가 잇는지 확인하려면 empty 속성 값으로 구별
    // QuerySnapshot {
    // docs: [
    //     DocumentSnapshot {
    // id: "2025-11-23",
    // ref: DocumentReference(users/UID/prices/BearTech/history/2025-11-23),
    // metadata: { hasPendingWrites: false, fromCache: false },
    // exists: true,
    // data: function data() {
    //   return { close: 1123, date: "2025-11-23" };
    // }
    //     DocumentSnapshot,
    //     ...
    // ],
    // size: number,         // 전체 문서 수
    // empty: boolean,       // 문서가 0개면 true
    // query: Query,         // 어떤 쿼리인지
    // metadata: {...}       // 기타 정보
    if (!snap.empty) {
      //empty 값이 false 라면, 즉 비어잇지 않다면
      return snap.docs[0].data().close;
    }

    return null;
    //안써도 자동으로 undefined 반환하긴하는데 의도적으로 null을 줬다는걸 알리기 위함
  }

  // price 컬렉션 없는 경우 초기화 하는 함수
  async function ensureUserPrices(uid) {
    if (!uid) return;

    const pricesCol = collection(db, 'users', uid, 'prices');
    const snap = await getDocs(pricesCol);
    const todayStr = new Date().toISOString().slice(0, 10); // "2025-11-21" 이런 형식

    // 이미 한 번이라도 만들어진 유저라면 바로 종료
    if (!snap.empty) return;

    const batch = writeBatch(db);

    DEFAULT_STOCKS.forEach((s) => {
      const priceRef = doc(pricesCol, s.id);
      batch.set(
        priceRef,
        {
          price: s.price,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 2) 종목별 history 서브컬렉션에 "오늘" 종가 기록
      const historyRef = doc(priceRef, 'history', todayStr);
      batch.set(
        historyRef,
        {
          date: todayStr,
          close: s.price,
        },
        { merge: true }
      );
    });

    await batch.commit();
    console.log('초기 가격 세팅 완료:', uid);
  }

  //이전가를 가져오는 최종 함수
  async function getPreviousClose(uid, stockName) {
    const yesterday = getYesterdayStr();

    const close = await getYesterdayClose(uid, stockName, yesterday);
    return close != null ? close : await getMostRecentClose(uid, stockName);
  }
  // async function getYesterdayClose(uid, stockName, yesterdayStr) {
  //  async function getMostRecentClose(uid, stockName) {

  useEffect(() => {
    if (!user?.uid) return;

    // 신규 유저면 prices 서브컬렉션 만들어주고,
    // 기존 유저면 그냥 스킵됨
    ensureUserPrices(user.uid);
    // const test = async () => {
    //   const aa = await getYesterdayClose(user.uid, 'BearTech', getYesterdayStr());
    //   console.log('전날종가 테스트', aa);
    // };
    // test();
  }, [user?.uid]);

  //종목별 가격 디비에 저장하는 함수
  const savePricesToFirestore = async (uid, stocks) => {
    if (!uid || !stocks || stocks.length === 0) return;
    // const todayStr = new Date().toISOString().slice(0, 10); // "2025-11-21" 이런 형식
    //const todayStr = new Date();
    const todayStr = new Date().toLocaleDateString('sv-SE');
    console.log('저장 try 전', todayStr);

    try {
      for (const s of stocks) {
        //for(i=0,i<stocks.length,i++) 이랑 같음
        await setDoc(
          doc(db, 'users', uid, 'prices', s.id),
          {
            price: s.price,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        await setDoc(
          doc(db, 'users', uid, 'prices', s.id, 'history', todayStr),
          //문서 ID는 문자열로 되어야함 uid, s.id , todayStr 같은 것이 반환하는 값이
          {
            date: todayStr,
            close: s.price,
          },
          { merge: true }
        );
      }

      console.log('가격 저장 완료');
    } catch (e) {
      console.error('가격 저장 에러:', e);
    }
  };

  const current_stocks = useRef(stocks);
  // useRef는 리렌더가 되어도 초기화되지 않고 유지되는 저장공간(React Hook).
  // 이 안의 .current는 최신 값을 보관하지만, 변경되어도 React가 리렌더를 발생시키지 않는다.

  useEffect(() => {
    current_stocks.current = stocks;
  }, [stocks]);

  useEffect(() => {
    if (!user?.uid) return;

    const INTERVAL_MS = 10 * 1000;
    const id = setInterval(() => {
      // 현재 메모리에 있는 stocks를 그대로 저장
      savePricesToFirestore(user.uid, current_stocks.current);
    }, INTERVAL_MS);

    return () => clearInterval(id);
    //useEffect의 return은 useEffect 다시 실행하기 전에 수행됨
  }, [user?.uid]);
  //pdatePrice()이 8초마다 setStocks를 하기 때문에
  //의존성 배열에서  stocks를 빼는게 좋음
  //보통 useEffect는 안에서 사용하는 변수는 의존성 배열에 넣는게 원칙이라
  //넣어주는게 맞긴하나 interval 사용하는 변수는 빼야함

  // useEffect(() => {
  //   const savedUser = localStorage.getItem('zoosik-user');
  //   if (savedUser) {
  //     setUser(JSON.parse(savedUser));

  //     //JSON.parse 는 문자열을 객체로 변환
  //   }
  // }, []);
  // localstorage 에서 값 가져오기,  localStorage.get/setItem은 내장 함수

  useEffect(() => {
    // 로그아웃/미로그인이면 기본값으로

    if (!user?.uid) {
      console.log('[2] user 없음 → DEFAULT_STOCKS로 리셋됨');
      setStocks(DEFAULT_STOCKS);
      return;
    }

    //디비에서 가격 불러오는 함수
    const loadPrices = async () => {
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'prices'));
        //console.log('첫번째종목 ID', snap.docs[0].id);
        if (snap.empty) {
          // 아직 prices 없으면 그냥 기본값 유지
          return;
        }

        const priceMap = {};
        // QuerySnapshot {
        //   docs: [
        //     QueryDocumentSnapshot {
        //       id: "BearTech",
        //       ref: DocumentReference("users/uid/prices/BearTech"),
        //       metadata: { fromCache: false, hasPendingWrites: false },
        //       data: () => ({
        //         price: 21639,
        //         updatedAt: Timestamp(2025-01-01 12:00:00)
        //       })
        //     },

        //     QueryDocumentSnapshot {
        //       id: "TigerMotors",
        //       ref: DocumentReference("users/uid/prices/TigerMotors"),
        //       metadata: { fromCache: false, hasPendingWrites: false },
        //       data: () => ({
        //         price: 18736,
        //         updatedAt: Timestamp(2025-01-01 12:00:00)
        //       })
        //     }
        //   ],

        //   size: 2,
        //   empty: false,
        //   metadata: { fromCache: false },
        //   query: Query(...)
        // }

        snap.docs.forEach((aa) => {
          priceMap[aa.id] = aa.data();
        });

        // priceMap = {
        //   BearTech: { price: 111, updatedAt: Timestamp(...) },
        //   KoalaSoft: { price: 222, updatedAt: Timestamp(...) },
        //   ...
        // }
        // getPreviousClose(uid, stockName)

        const priceMaps = await Promise.all(
          Object.keys(priceMap).map(async (value) => {
            //Object.keys 는 객체의 키를 배열로 출력해줌
            const currentPrice = priceMap[value].price;
            const prev = await getPreviousClose(user.uid, value);
            const meta = DEFAULT_STOCKS.find((s) => s.id === value);

            return {
              id: value,
              name: meta?.name ?? '디비없음',
              price: priceMap[value].price,
              history: [{ preice: priceMap[value].price, time: Date.now() }],
              // 왜 value.price 가 안되냐면
              // value는 문자열로 가져옴, 즉 "종목명".키값 이 되므로
              //priceMap[BearTech].price 이런식으로 가져와야함
              prevClose: prev > 0 ? prev : currentPrice,
              // prev 값이 0 이거나 null 이면 추후 계산시 오류가 생김
            };
          })
        );

        //return { ...stock, price: newPrice, history: [...stock.history, newPrice] };

        console.log('[3] Firestore 로딩 완료 → setStocks(priceMaps) 실행');
        setStocks(priceMaps);
      } catch (e) {
        console.error('prices 불러오기 에러:', e);
      }
    };

    loadPrices();
    console.log('현재 유저의 스테이트 = ', user);
  }, [user?.uid]);

  useEffect(() => {
    let unsubUser = null;
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      //onAuthStateChanged 는 리스너 함수, api 함수라고 하지
      //유저 인증 상태 변경시 콜백 함수(" async (fbUser)") 실행 해줌
      // 페이지 처음 랜더시에도 실행됨.
      // 첫 번째 인자 auth는 인증 객체 , 두번째는 콜백할 매개변수
      //현재 로그인된 사용자 정보(auth)의 여부에 따라 { uid, email, displayName, ... }
      // null이 될 수도 있음 (로그아웃)
      const ak = fbUser ?? 'yes';
      console.log('auth 변화 감지됨=', ak);

      if (unsubUser) {
        unsubUser();

        unsubUser = null;
      }
      if (!fbUser) {
        //fbUser는 로그인 되었을 경우 유저정보, 로그아웃일 땐 null
        //auth의 객체는 있으면 user객체로 json 형태(emall,uid ~ 등 )을 리턴하지만
        //없다면 null 이라 exists() 같이 문서가 실제 존재하는지 확인할 필요가 없음
        //그리고 firebase auth에선 exists() 함수도 존재하지 않음
        setUser(null);
        return;
      }

      const userRef = doc(db, 'users', fbUser.uid);
      //doc는 firestore의 특정 문서를 참조하는 함수, sdk 헬퍼 함수라고 하지
      //db는 인스턴스로 firebase 디비에서 찾게다 범위
      //"users"는 컬렉션 (디비 테이블과 유사한 기능 firebase에서만)
      //fbUser.uid는 문서 ID

      unsubUser = onSnapshot(userRef, async (ss) => {
        if (ss.exists()) {
          //여기서 굳이 exists() 를 쓰는 이유는 firebase 에서 데이터가 없어도
          //snapshot 객체를 리턴함, 그래서 실제 데이터가 있는지 확인해야함
          //exists()는 firebase에만 잇는 메서드

          /*
        nickname: nickname.trim(),
        balance: 1000000,
        stocks: {},
        */
          setUser({ uid: fbUser.uid, ...ss.data() });
        } else {
          const once = await getDoc(userRef);
          if (once.exists()) setUser({ uid: fbUser.uid, ...once.data() });
          else setUser(null);
          //else로 데이터가 있는지 왜 또 확인을 하냐면
          //onSnapshot은 실시간 리스너라 연결 직후 첫 데이터를 받을 때
          //가끔 빈 상태로 보일 수도 잇다
          //특정 사항에서 실시간 리스너 규칙이나 권한 문제로 실패할 수 잇으나
          //geDoc는 성공하는 경우가 있어 한 번 더 써주는것
          //솔직히 포폴용으로는 else null 만 해도 충분
        }
      });
      //실시간 리스너 함수로 doc나 collect을 구독해서 해당 데이터가 바뀔 때
      //콜백 함수가 실행된다.
      // return () => unsubUser();
    });
    //unsubAuth
    return () => {
      console.log('유스이펙트 리턴 실행');
      if (unsubUser) unsubUser(); //  unsubUser 함수가 한 번도 실행 안되엇을 경우엔 null 이므로 에러가 날 수 잇어 if 조건
      unsubAuth();
    };
  }, []);

  // useEffect(() => {
  //   if (user?.uid) {
  //     initUserPrices(user.uid);
  //   }
  // }, [user?.uid]);

  useEffect(() => {
    //console.log('stock 변화 감지', stocks);
  }, [stocks]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('zoosik-user', JSON.stringify(user));
      //JSON.stringify 객체(object)를 다시 문자열(string)으로 변환
    }
    //localStorage.removeItem('zoosik-user'); //브라우저 id  삭제
    //console.log('브라우저 유저 상태', user);
  }, [user]);

  useEffect(() => {
    const interval = setInterval(updatePrices, 1000);
    // setInterval은 변수 지정만으로도 실행되고 첫 번째 인자는 함수명을 넣어야함
    // 함수명() 을 넣으면 해당 함수의 리턴값이 들어가버리지
    updatePrices();
    return () => clearInterval(interval);
    //함수에 담아서 나중에 리턴시 호출해야 바로 실행이 되지 않음
    //return clearInterval(interval) 은 마운트시 바로 실행됨
  }, []);

  const updatePrices = () => {
    //명시적 리턴 , 딱히 리턴할게 없을 때는 명시를 씀
    console.log('[4] updatePrices 실행 → 랜덤 변동 적용');
    // })

    const marketBias = (Math.random() * 0.6 - 0.3) / 100;
    // -0.3 ~ 0.3 / 100 => -0.003 ~ 0.003
    setStocks((prevStocks) =>
      // 암시적 리턴 , prevStocks 단순 매개변수
      //prevStocks 는 setStocks 값을 가져옴
      // prevStocks.map((stock) => {
      //   const fluctuation = Math.floor(Math.random() * 1000 - 500);
      //   // 0~ 0.999~ * 1000 = 0 ~999.999 나오고
      //   // -500 ~ 499.999 나오고 floor 로 -500 ~ 499
      //   let newPrice = stock.price + fluctuation;
      //   if (newPrice < 100) newPrice = 100;

      //   return {
      //     ...stock,
      //     price: newPrice,
      //     history: [...stock.history, { price: newPrice, time: Date.now() }],
      //   };

      prevStocks.map((stock) => {
        const volatility = stock_volatility[stock.id] ?? 0.01;
        // 0.0005 ~ 0.02
        const randomFactor = Math.random() * 2 - 1; // 랜덤 요인 -1 ~ +1 %

        const changeRate = volatility * (randomFactor + marketBias);
        //-1,1 * 0.0005 =  -0.0005 ~ 0.0005
        //-1,1 * 0.02 = -0.02 ~ 0.02
        let newPrice = Math.round(stock.price * (1 + changeRate));
        // stock * 0.9995 (-0.05% ~ +0.05%)
        // stock * 0.9800 (-2% ~ +2%)

        if (newPrice < 100) newPrice = 100;

        return {
          ...stock,
          price: newPrice,
          history: [
            ...stock.history,
            {
              price: newPrice,
              time: Date.now(),
            },
          ],
        };
      })
    );
  };
  //함수명(()=>{...}) => '명시적 리턴' 으로 return을 써야만 값이 변환된다.
  //함수면(()=> 표현식) => '암시적 리턴' 으로 자동으로 return이 된다

  const handleShowToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  return (
    <div>
      <TestUserBanner />
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                <Home
                  user={user}
                  stocks={stocks}
                  setUser={setUser}
                  handleShowToast={handleShowToast}
                />
              }
            />
            <Route path="/login" element={<Login setUser={setUser} />} />
            {/* "setUser2: setUser" 객체 형태로 보냄 */}
            <Route path="/signup" element={<Signup setUser={setUser} />} />
            <Route path="/settings" element={<Settings user={user} setUser={setUser} />} />
            <Route path="/explore" element={<Explore stocks={stocks} />} />
            <Route path="/history" element={<History user={user} />} />
            <Route
              path="/stock/:id"
              element={<StockDetail user={user} setUser={setUser} stocks={stocks} />}
            />
            <Route
              path="/stocks"
              element={<AllStocks user={user} stocks={stocks} handleShowToast={handleShowToast} />}
            />
          </Route>
        </Routes>
        {showToast === true && ( // 단순 showToast && 하면 truthy 도 적용 됨
          <div className="toast">
            {/* {toastMessage} */}
            <div style={{ marginTop: '0.5rem' }}>
              👉 <Link to="/login">로그인</Link> 또는 <Link to="/signup">회원가입</Link>
            </div>
          </div>
        )}
      </Router>
    </div>
  );
}

export default App;
