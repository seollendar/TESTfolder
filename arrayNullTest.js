const arrayIf = () => {
	const arr = [0, 1.345, -0.2133245, null, undefined];

	const nested = (arr) => {
		// 하나의 값이라도 null일 경우 처리 안함
		if (
			arr.some((index) => {
				console.log(index);
				if (index === null || index === undefined) return 1;
			})
		) {
			console.log("배열에 있는 값 중 하나가 null 이야!");
		} else {
			console.log("all values clear!");
		}
	};

	nested(arr);
};
arrayIf();