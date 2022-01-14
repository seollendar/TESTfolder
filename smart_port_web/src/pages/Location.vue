<template>
  <div class="row">
    <div class="input-area">
      <div class="input-group mx-auto">
        <div class="input-group-prepend">
          <span class="input-group-text">Device Name</span>
        </div>
        <b-form-input class="form-control" type="text" v-model="deviceName"></b-form-input>
      </div>
      <div class="input-group mx-auto">
        <div class="input-group-prepend">
          <span class="input-group-text">Container Name</span>
        </div>
        <b-form-input class="form-control" type="text" v-model="containerName"></b-form-input>
      </div>
      <div class="input-group mx-auto">
        <div class="input-group-prepend">
          <span class="input-group-text">Radius</span>
        </div>
        <b-form-input class="form-control" type="number" placeholder="단위 : m" v-model="radius"></b-form-input>
      </div>
      <div class="input-group mx-auto">
        <div class="input-group-prepend">
          <span class="input-group-text">Term</span>
        </div>
        <b-form-input class="form-control" type="number" placeholder="단위 : s" v-model="term"></b-form-input>
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
export default {
  components: {Maps},
  data(){
    return {
      deviceName: '',
      containerName: '',
      radius: '',
      term: '',
      alert : {
        message: "Alert Message",
        dismissSecs: 20,
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
      if(this.radius === null || this.radius === undefined || this.radius === ""){
        this.alert.message = "Please enter radius"
        this.showAlert();
        return;
      }else{
        // check Time format
        if(!this.checkFormat(this.radius)){
          this.alert.message = "You can only enter numbers greater than 0."
          this.showAlert();
          return;
        }
      }
      if(this.term === null || this.term === undefined || this.term === ""){
        this.alert.message = "Please enter term"
        this.showAlert();
        return;
      }else{
        // check Time format
        if(!this.checkFormat(this.term)){
          this.alert.message = "You can only enter numbers greater than 0."
          this.showAlert();
          return;
        }
      }
      this.sendData();
    },
    checkFormat: function(intdata){
      const time_regExp= /^[1-9][0-9]*$/;
      return time_regExp.test(intdata);
    },
    sendData: function(){
      //send data to API Server 
      // localhost:7979/location/deviceID/containerName/around?radius={중심 반경 거리(단위:m)}&term={조회 기간 (단위:s)}
      let parameter = {
        "radius":this.radius,
        "term":this.term
      }
      // Maps.methods.markerMap()
      this.$http.get(`/location/${this.deviceName}/${this.containerName}/around`, {params: parameter})
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
        Maps.methods.markerMap(gpsPoints)
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
<style >
</style>
