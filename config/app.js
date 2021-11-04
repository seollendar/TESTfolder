const Config = require('./config.json');
const containerClass = Config.containerClass;
const container = "taco";
const cinContent = {  start_time: 'string',
end_time: 'string',
fuel_used: 'double',
driving_time: 'double',
driving_distance: 'double',
dev_id: 'string'};

if(containerClass.Location.hasOwnProperty(container)){
    console.log("preprocessing")
}else{
    //console.log(containerClass.TimeSeries[container]);
    let cinContentsData = {...cinContent};
    console.log(cinContentsData);
}

