const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('성공');
  }, 1000);
});

// p.then((res) => {
//   console.log(res);
// }).catch((rej) => {
//   console.log(rej);
// });

// async function test() {
//   try {
//     const res = await p;
//     console.log(res);
//   } catch (tt) {
//     console.error(tt);
//   }
// }
// test();

const helloPromise = new Promise((resolve) => {
  setTimeout(() => resolve('hello'), 1000);
});

helloPromise.then((s) => console.log('then', s));

(async () => {
  const v = await helloPromise;
  console.log('await', v);
})();
