exports.isObject = (obj) => {
	return obj?.constructor === {}.constructor || obj?.constructor.toString().includes("TextRow");
};
