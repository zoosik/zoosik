// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // 로그인/회원가입용
import { getFirestore } from 'firebase/firestore'; // DB (잔고, 주식 저장용)
// import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDQjIUipS2kGXnRKJPoGZqJNcMBSf0vI9A',
  authDomain: 'zoosik.firebaseapp.com',
  projectId: 'zoosik',
  storageBucket: 'zoosik.firebasestorage.app',
  messagingSenderId: '518384027205',
  appId: '1:518384027205:web:c561834936af00589c852c',
  measurementId: 'G-H39G3LLHNM',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// 모듈 export
export const auth = getAuth(app);
export const db = getFirestore(app);
