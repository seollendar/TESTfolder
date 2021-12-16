// Promise.all([func1]).then(() => {
//    console.log("message");
// });

// function func1() {
//    console.log("hello");
// }

// const promise1 = func1();
// const promise2 = 42;
// const promise3 = new Promise((resolve, reject) => {
//    setTimeout(resolve, 100, "foo");
// });

// // promise.all의 인자로 순회 가능한 요소를 배열 안에 담아 인자로 준다.
// Promise.all([promise1, promise2, promise3]).then((values) => {
//    // 추후 해당 비동기 결과 값들을 담은 배열을 then의 인자로 받을 수 있다.
//    console.log(values);
// });

Promise.all([func1()]).then(() => {
   console.log("log");
});

function func1() {
   console.log("hello");
}
