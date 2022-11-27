<template>
  <div class="vx-row">
    <!-- HORIZONTAL LAYOUT -->
    <div class="vx-col w-full mb-base">
      <vx-card title="Create Meeting">
        <div class="vx-row mb-6">
          <div class="vx-col sm:w-1/3 w-full">
            <span>모임명</span>
          </div>
          <div class="vx-col sm:w-2/3 w-full">
            <vs-input class="w-full" v-model="meetingNm" />
          </div>
        </div>
        <div class="vx-row mb-6">
          <div class="vx-col sm:w-1/3 w-full">
            <span>최소모임일자</span>
          </div>
          <div class="vx-col sm:w-2/3 w-full">
            <vs-input class="w-full" type="date" v-model="minDt" />
          </div>
        </div>
        <div class="vx-row mb-6">
          <div class="vx-col sm:w-1/3 w-full">
            <span>최대모임일자</span>
          </div>
          <div class="vx-col sm:w-2/3 w-full">
            <vs-input class="w-full" type="date" v-model="maxDt" />
          </div>
        </div>
        <div class="vx-row mb-6">
          <div class="vx-col sm:w-1/3 w-full">
            <span>가능 일정 공개 범위</span>
          </div>
          <div class="vx-col sm:w-2/3 w-full">
            <ul class="centerx">
              <li>
                <vs-radio v-model="openStatus" vs-value="ALL">멤버 전체 공개</vs-radio>
              </li>
              <li>
                <vs-radio v-model="openStatus" vs-value="OWNER">모임장에게만 공개</vs-radio>
              </li>
            </ul>
          </div>
        </div>
        <div class="vx-row">
          <div class="vx-col sm:w-2/3 w-full ml-auto">
            <vs-button class="mr-3 mb-2" @click="submit">Submit</vs-button>
            <vs-button
              color="warning"
              type="border"
              class="mb-2"
              @click="resetParam"
              >Reset</vs-button
            >
          </div>
        </div>
      </vx-card>

      <vs-alert :active.sync="resultActive" icon-pack="feather">
        <div class="vx-col mb-base">
          <vs-text class="inline-flex mb-2 mr-2"> Meeting Created </vs-text>

          <div class="vx-row mb-6">
            <vs-input v-model="url" class="vx-col w-full" />
          </div>
          <div class="vx-row mb-6">
            <div class="vx-col sm:w-2/3 w-full ml-auto">
              <vs-button
                class="mr-3 mb-2"
                v-clipboard:copy="url"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError"
              >
                URL Copy
              </vs-button>

              <vs-button
                class="mr-3 mb-2"
                color="warning"
                type="filled"
                :to="{ path: '/apps/when-we-meet/calendar/' + meetingId }"
                @click="closePopup"
                >내 일정 공유 바로가기</vs-button
              >
            </div>
          </div>
        </div>
      </vs-alert>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
import dayjs from "dayjs";

/** 전역변수로 연결 선언 (이게 문제가 될까??) */
const db = firebase.firestore();
const user = firebase.auth().currentUser;
//Date.prototype.toJSON = function(){ return moment(this).format(); }


export default {
  data() {
    return {
      meetingNm: "",
      minDt: "",
      maxDt: "",

      meetingId: "",
      url: "",

      openStatus:'ALL',
      resultActive: false,
    };
  },
  methods: {
    async submit() {
      //validation 넣어야함.
      //최대 2달 이상 기간 선택 못하도록. maxDt가 minDt보다 크도록. minDt는 오늘 이후여야 함.
      console.log("submit clicked");
      console.log(this.getAllDateList());

/**
 * meetingPeriod 도 yyyy-MM-dd 로 저장
 * calculatedDate 는 string으로 바꿔서 'yyyy-MM-dd' 로 저장
 */
       const ref = await db.collection("Meeting").add({
        meetingNm: this.meetingNm,
        meetingPeriod: {
          minDt: dayjs(this.minDt).format("YYYY-MM-DD"),
          maxDt: dayjs(this.maxDt).format("YYYY-MM-DD")
        },
        meetingOwnerId: user.uid,
        meetingStatus: 'WAITING',
        openStatus : this.openStatus, //공개범위,
        calculatedDate: this.getAllDateList(),
        memberList : []
      });

      this.meetingId = ref.id;
      this.resultActive = true;
      this.url =
        "http://localhost:8080/#/apps/when-we-meet/calendar/" + this.meetingId;
    },

/* 
      getAllDateList() {
      let minDt = new Date(this.minDt);
      let maxDt = new Date(this.maxDt);

      let dateList = [];
      for (
        let time = minDt.getTime();
        time <= maxDt.getTime();
        time += 1000 * 3600 * 24
      ) {
        dateList.push( { date: new Date(time), members: [] } );
      }  
      return dateList;
    },   
*/

     getAllDateList() {
      let minDt = dayjs(this.minDt);
      let maxDt = dayjs(this.maxDt);

      let dateList = [];
      for (let d = 0; d <= maxDt.diff(minDt, "d"); d++) {
        dateList.push({ date: minDt.add(d, "day").format("YYYY-MM-DD"), members: [] });
      }

      return dateList;
    },  

    resetParam() {
      this.openStatus = 'ALL';
      this.meetingNm = '';
      this.minDt = '';
      this.maxDt = '';
      this.resultActive = false;
    },

    onCopy() {
      this.$vs.notify({
        title: "Success",
        text: "Text copied successfully",
        color: "success",
        iconPack: "feather",
        position: "top-center",
        icon: "icon-check-circle",
      });
    },
    onError() {
      this.$vs.notify({
        title: "Failed",
        text: "Error in copying text",
        color: "danger",
        iconPack: "feather",
        position: "top-center",
        icon: "icon-alert-circle",
      });
    },
    closePopup() {
      this.resultActive = false;
    },
  },
};
</script>
