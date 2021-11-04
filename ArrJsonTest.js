    var arrStandardPoint = [];
    var arrPreData = [];

	let cinContentsData = {
      "ae": "yt0",
      "container": "location",
      "lat": 28,
      "lng": 128,
      "time": 1596471030000
    }

    arrPreData.push(cinContentsData)
	
    if(arrStandardPoint == ""){
      arrStandardPoint.push(cinContentsData)
	}
	
	console.log("St:", arrStandardPoint)
	console.log("Pre:", arrPreData)
	
	arrPreData.filter(x => x.ae === 'yt0');