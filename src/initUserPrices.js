// src/utils/initUserPrices.js
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const initialPrices = [
  { name: 'BearTech', price: 17307 },
  { name: 'KoalaSoft', price: 8930 },
  { name: 'HamsterCorp', price: 19542 },
  { name: 'TigerMotors', price: 18736 },
  { name: 'PenguinWorks', price: 12900 },
  { name: 'ElephantInc', price: 20300 },
  { name: 'RabbitNet', price: 9800 },
  { name: 'FoxSystems', price: 11200 },
];

export async function initUserPrices(uid) {
  for (const item of initialPrices) {
    await setDoc(
      doc(db, 'users', uid, 'prices', item.name),
      {
        price: item.price,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}
