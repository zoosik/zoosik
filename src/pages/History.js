// pages/History.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import '../style/history.css';

export default function History({ user }) {
  const [trades, setTrades] = useState([]);
  const TRADE_TYPE_LABEL = {
    buy: '매수',
    sell: '매도',
  };

  useEffect(() => {
    if (!user?.uid) return;

    const fetchTrades = async () => {
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'trades'));

      const list = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

      setTrades(list);
    };

    fetchTrades();
  }, [user]);

  if (!trades.length) {
    return <p className="empty-history">거래 내역이 없습니다.</p>;
  }

  return (
    <div>
      <h2>거래 내역</h2>
      <ul className="card_list">
        {trades.map((t) => (
          <li key={t.id}>
            <strong>{t.stock}</strong> ({TRADE_TYPE_LABEL[t.type] ?? t.type})
            <p>수량: {t.quantity ?? '-'}주</p>
            <p>가격: {t.price ? t.price.toLocaleString() : '-'}원</p>
            {t.createdAt?.toDate && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                {t.createdAt.toDate().toLocaleString('ko-KR')}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
