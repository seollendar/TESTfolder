<template>
  <div>
    <!--Stats cards-->
    <div class="row">
      <div class="title">
        <h1>Welcome to Smart Port Platform</h1>
        <h5>  항만 IoT 빅데이터 관리 및 분석 프레임워크 서비스</h5>
      </div>
      <div class="description">
        <p> <a href="#/search-by-period" ><img src="@/assets/img/search_by_period.png"/> 기간별 센서 데이터 조회 </a></p>
        <p><img src="@/assets/img/right-arrow.png"/>특정 디바이스가 일정 기간 내 생성한 센서 데이터 조회</p>
        <p> <a href="#/search-by-location"> <img src="@/assets/img/search_by_location.png"/>주변 디바이스 조회</a></p>
        <p><img src="@/assets/img/right-arrow.png"/>특정 디바이스의 아이디를 통해 해당 디바이스 주변에 위치하는 다른 디바이스 조회</p>
      </div>
    </div>

  </div>
</template>
<script>
export default {
  components: {},
  /**
   * Chart data used to render stats, charts. Should be replaced with server data
   */
  // data() {},
};
</script>
<style lang="scss">
.row{
  width: 100%;
  min-height: 900px;
  text-align: center;
}
.title{
  text-align: center;
  margin: auto;
  width: 100%;
}
.description{
  display: inline-block;
  margin: auto;
  text-align: center;
  width: 100%;

  p{
    font-size: 25px;
    line-height: 40px;
    img{
      margin-right: 5px;
      height: 30px;
      vertical-align: text-bottom;
    }
    &:nth-child(2n){
      font-size: 20px;
      margin-bottom: 40px;
      img{
        margin-right: 10px;
        height: 15px;
        margin-bottom: 5px;
        vertical-align:middle;
      }
    }
  }
}

</style>
