function momentTEST(){
	// var now = moment().utcOffset('+09:00').format('YYYYMMDDHHmm');
	var now = moment().utcOffset('+09:00');
	var now_string = now.format("YYYY-MM-DD HH:mm:ss");
	var range = now - 300000;
	var range_string = moment(range).format("YYYY-MM-DD HH:mm:ss");
	
	console.log(now);
	console.log(now_string);
	
	console.log(range);
	console.log(range_string);
}

momentTEST();