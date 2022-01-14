<template>
  <div class="row">
    <div class="input-area">
      <div class="input-group mx-auto">
        <div class="input-group-prepend">
          <span class="input-group-text">Device Name</span>
        </div>
        <b-form-input class="form-control" type="text" v-model="deviceName"></b-form-input>
        <!-- <b-form-input class="form-control" v-model="text" placeholder="Enter your name"></b-form-input> -->
      </div>
      <div class="input-group mx-auto">
        <div class="input-group-prepend">
          <span class="input-group-text">Container Name</span>
        </div>
        <b-form-input class="form-control" type="text" v-model="containerName"></b-form-input>
      </div>
      <div class="input-group mx-auto">
        <div class="input-group-prepend">
          <span class="input-group-text">Start Time</span>
        </div>
        <date-picker class="form-control" type='datetime' v-model="startDateTime" placeholder="select start time" value-type="YYYYMMDDTHHmmss"></date-picker>
      </div>
      <div class="input-group mx-auto">
        <div class="input-group-prepend">
          <span class="input-group-text">End Time</span>
        </div>
        <date-picker class="form-control" type='datetime' v-model="endDateTime" placeholder="select end time" value-type="YYYYMMDDTHHmmss"></date-picker>
      </div>
      <div class="button-area">
        <button type="button" class="btn btn-secondary" v-on:click="checkValue">Submit</button>
      </div>
    </div>

    <div class="alert-area">
      <b-alert
      :show="alert.dismissCountDown"
      dismissible
      variant="danger"
      @dismissed="alert.dismissCountDown=0"
      @dismiss-count-down="countDownChanged">
        {{alert.message}}
      </b-alert>
    </div>

    <div class="map-area">
      <maps></maps>
    </div>
  </div>
</template>
<script>
import Maps from './Maps.vue';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
export default {
  components: {Maps , DatePicker},
  data(){
    return {
      deviceName: '',
      containerName: '',
      startDateTime: '',
      endDateTime: '',
      alert : {
        message: "Alert Message",
        dismissSecs: 2,
        dismissCountDown: 0,
        showDismissibleAlert: false,
      }
    }
  },
  methods:{
    checkValue: function() {
      if(this.deviceName === null || this.deviceName === undefined || this.deviceName === ""){
        this.alert.message = "Please enter Device Name"
        this.showAlert();
        return;
      }
      if(this.containerName === null || this.containerName === undefined || this.containerName === ""){
        this.alert.message = "Please enter Container Name"
        this.showAlert();
        return;
      }
      if(this.startDateTime === null || this.startDateTime === undefined || this.startDateTime === ""){
        this.alert.message = "Please enter startTime"
        this.showAlert();
        return;
      }
      if(this.endDateTime === null || this.endDateTime === undefined || this.endDateTime === ""){
        this.alert.message = "Please enter endTime"
        this.showAlert();
        return;
      }
      if(!this.checkDate(this.startDateTime, this.endDateTime)){
          this.alert.message = "End Time should always be later than start Time."
          this.showAlert();
          return;
      }
      this.sendData();
    },
    // checkFormat: function(timedata){
    //   //Tue Jan 04 2022 03:03:03 GMT+0900 (한국 표준시)
    //   const time_regExp= /^\d{4}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3])([0-5][0-9])([0-5][0-9])$/;
    //   return time_regExp.test(timedata);
    // },
    checkDate: function(starttime, endtime){
      let start = starttime.split('T');
      let end = endtime.split('T');
      if(parseInt(start[0]) > parseInt(end[0])){
        return false;
      }else if(parseInt(start[0]) === parseInt(end[0])){
        if(parseInt(start[1]) > parseInt(end[1])){
          return false;
        }
      }
      return true;
    },
    sendData: function(){
      //send data to API Server 
      //localhost:7979/timeseries/:deviceID/:containerName/period?from={startDateTime}&to={endDateTime}
      // Maps.methods.polylineMap()
      let parameter = {
        "from":this.startDateTime,
        "to":this.endDateTime
      }
      this.$http.get(`/timeseries/${this.deviceName}/${this.containerName}/period`, {params: parameter})
      .then((result) =>{
        console.log(result)
        let gpsPoints = [];
        const values = result.data.values;
         if (values.length > 0) {
            gpsPoints= values.map((index) => ({
               lat: index.value.latitude,
               lng: index.value.longitude,
            }));
         } else {
            gpsPoints = undefined;
         }
        Maps.methods.polylineMap(gpsPoints)
      })
    },
    countDownChanged(dismissCountDown) {
      this.alert.dismissCountDown = dismissCountDown
    },
    showAlert() {
      this.alert.dismissCountDown = this.alert.dismissSecs
    }
  }
};
</script>
<style>
</style>
