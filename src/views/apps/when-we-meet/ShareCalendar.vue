<template>
  <div id="simple-calendar-app">
    <div class="vx-card no-scroll-content">
      <vx-tour
        :steps="steps"
        :class="stepNoticeText"
      />
      <calendar-view
        ref="calendar"
        :displayPeriodUom="calendarView"
        :show-date="showDate"
        :date-classes="setResultDateClasses"
        :eventTop="windowWidth <= 400 ? '2rem' : '3rem'"
        eventBorderHeight="0px"
        eventContentHeight="1.65rem"
        class="theme-default"
        @click-date="showAvailableMembers"
      >
        <div slot="header" class="mb-4">
          <div class="vx-row no-gutter flex">
            <!-- Current Month -->
            <div class="vx-col items-center sm:flex">
              <div class="flex items-center">
                <feather-icon
                  :icon="$vs.rtl ? 'ChevronRightIcon' : 'ChevronLeftIcon'"
                  @click="updateMonth(-1)"
                  svgClasses="w-5 h-5 m-1"
                  class="cursor-pointer bg-primary text-white rounded-full"
                />

                <span class="mx-3 text-xl font-medium whitespace-no-wrap">{{
                  showDate | month
                }}</span>

                <feather-icon
                  :icon="$vs.rtl ? 'ChevronLeftIcon' : 'ChevronRightIcon'"
                  @click="updateMonth(1)"
                  svgClasses="w-5 h-5 m-1"
                  class="cursor-pointer bg-primary text-white rounded-full"
                />
              </div>
            </div>
            <div
              class="
                right-flex
                vx-col
                sm:flex
                my-3
                flex
                sm:justify-end
                justify-center
                order-last
              "
            >
              <vs-button
                id="updateMyScheduleToMeeting"
                icon-pack="feather"
                style="margin-left: 0px"
                :to="{
                  path: '/calendar/' + $route.params.meetingId,
                }"
                >내 일정 UPDATE</vs-button
              >
            </div>
          </div>

          <div class="vx-row sm:flex mt-4">
            <div class="vx-col w-full flex">
              <ul class="demo-alignment">
                <li>
                  <vs-radio
                    color="success"
                    v-model="showSelected"
                    vs-value="BEST"
                    >BEST추천일보기</vs-radio
                  >
                </li>
                <li>
                  <vs-radio
                    color="warning"
                    v-model="showSelected"
                    vs-value="ALL"
                    >가능한날 전체보기</vs-radio
                  >
                </li>
              </ul>
            </div>
          </div>

          <div :class="showNoticeText" style="margin: 1rem 0 0 1rem">
            <span>{{ resultText }}</span>
          </div>
        </div>
      </calendar-view>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
import { CalendarView, CalendarViewHeader } from "vue-simple-calendar";
import moduleCalendar from "@/store/calendar/moduleCalendar.js";
import dayjs from "dayjs";
require("vue-simple-calendar/static/css/default.css");

import Datepicker from "vuejs-datepicker";
import { en, he } from "vuejs-datepicker/src/locale";

const VxTour = () => import("@/components/VxTour.vue");

/** 전역변수로 연결 선언 (이게 문제가 될까??) */
const db = firebase.firestore();
const user = firebase.auth().currentUser;

//Date.prototype.toJSON = function(){ return moment(this).format(); }

export default {
  components: {
    CalendarView,
    CalendarViewHeader,
    Datepicker,
    VxTour,
  },
  data() {
    return {
      showNoticeText: "hidden",
      stepNoticeText: "hidden",
      uid: "",
      auth: {},
      userData: {},

      meetingData: {},
      meetingNm: "",
      meetingMinDt: "",
      meetingMaxDt: "",
      meetingId: "",
      memberList: [],

      bestDateResult: [],
      allAvailableDateResult: [],
      resultText: "",

      orgAvailableDateMap: [],
      orgBestDateMap: [],

      availableDateCount: {},
      bestDateCount: {},

      availableDateMember: {},
      bestDateMember: {},

      showSelected: "BEST",

      memberName: {},
      dateMemberMap: {},

      memberCount: 0,

      showDate: new Date(),
      id: 0,
      title: "",
      startDate: "",
      endDate: "",

      url: "",
      calendarView: "month",

      contentText : "내 일정을 공유하고, 서로 날짜를 맞춰보아요!"
    };
  },
  mounted() {},
  computed: {
    steps() {
      return [
        {
          target: "#updateMyScheduleToMeeting",
          content: this.contentText,
          //content: `${this.contentText}`,
        },
      ];
    },
    setResultDateClasses() {
      const dateColor = {};
      if (this.showSelected == "BEST") {
        for (let key of this.bestDateResult) {
          dateColor[key] = "bg-success";
        }
      } else if (this.showSelected == "ALL") {
        for (let key of this.allAvailableDateResult) {
          dateColor[key] = "bg-warning";
        }
      }
      return dateColor;
    },
    calendarLabels() {
      return this.labels;
    },
    windowWidth() {
      return this.$store.state.windowWidth;
    },
  },
  methods: {
    isDayInMeetingPeriod(day, minDt, maxDt) {
      return (
        dayjs(day).isSame(minDt, "day") ||
        dayjs(day).isSame(maxDt, "day") ||
        (dayjs(day).isAfter(minDt, "day") && dayjs(day).isBefore(maxDt, "day"))
      );
    },

    showAvailableMembers(date) {
      const minDt = this.meetingData.meetingPeriod.minDt;
      const maxDt = this.meetingData.meetingPeriod.maxDt;

      if (this.isDayInMeetingPeriod(date, minDt, maxDt)) {
        let memberText = "";
        const selectedDate = dayjs(date).format("YYYY-MM-DD");
        for (let memberId of this.dateMemberMap[selectedDate]) {
          memberText += this.memberName[memberId] + "\n";
        }

        this.$vs.dialog({
          color: "primary",
          title: "가능한 멤버",
          text: memberText,
        });
      } else {
        this.$vs.dialog({
          color: "danger",
          title: "계산된 모임기간이 아닙니다!",
          text:
            "모임기간 : " +
            dayjs(minDt).format("YYYY-MM-DD") +
            " ~ " +
            dayjs(maxDt).format("YYYY-MM-DD"),
        });
      }
    },

    getBestMeetingDate() {
      const allMemberCount = this.meetingData.memberList.length;
      this.first = allMemberCount;
      this.second = allMemberCount - 1;
      this.third = allMemberCount - 2;
    },

    updateMonth(val) {
      this.showDate = this.$refs.calendar.getIncrementedPeriod(val);
    },

    listToMemberCountMap(list) {
      return list.reduce((newObj, obj) => {
        newObj[obj.date] = obj.members.length;
        return newObj;
      }, {});
    },

    listToMemberListMap(list) {
      return list.reduce((newObj, obj) => {
        newObj[obj.date] = obj.members;
        return newObj;
      }, {});
    },

    calculatedAllAvailableDate() {
      //this.allAvailableDateResult
      this.allAvailableDateResult = Object.keys(this.availableDateCount).filter(
        (date) => this.availableDateCount[date] == this.memberCount
      );
    },

    calculatedBestDate() {
      //this.bestDateResult
      //bestDateCount : '2022-11-22' : 3, '2022-11-23' : 4...

      let sortedDateList = []; // [['2022-11-22', 3], ['2022-11-23', 4]...]
      for (let date in this.bestDateCount) {
        sortedDateList.push([date, this.bestDateCount[date]]);
      }
      sortedDateList.sort((a, b) => b[1] - a[1]);

      if (sortedDateList.length > 0) {
        let maxBestCount = sortedDateList[0];

        if (maxBestCount == this.memberCount) {
          //모든 멤버가 best로 꼽은 날이 있을때,
          this.bestDateResult = Object.keys(this.bestDateCount).filter(
            (date) => {
              return this.bestDateCount[date] == this.memberCount;
            }
          );
        } else {
          //가장 많은 인원이 best로 꼽은 날이면서, 모든 멤버가 가능한 날.
          let bestCount = 0;
          for (let i = 0; i < sortedDateList.length; i++) {
            let orderdDate = sortedDateList[i];
            if (
              this.bestDateCount[orderdDate[0]] >= bestCount &&
              this.availableDateCount[orderdDate[0]] == this.memberCount
            ) {
              this.bestDateResult.push(orderdDate[0]);
              bestCount = this.bestDateCount[orderdDate[0]];
            }
          }
        }
      }

      if (this.bestDateResult.length == 0) {
        this.resultText = "모두가 가능한 날짜가 없어요ㅠㅠ";
        this.showNoticeText = "";
      } else {
        this.resultText = "";
        this.showNoticeText = "hidden";
      }
    },

    onLoadMeetingData() {
      if (this.meetingData) {
        
        if (Object.assign({}, ...this.meetingData.memberList)[this.userData.uid]) {
          this.contentText = "";
          this.stepNoticeText = "hidden";
          
        }else{
          this.stepNoticeText = ""; //show
        }
      }

      this.orgAvailableDateMap = this.meetingData.availableDateMap;
      this.orgBestDateMap = this.meetingData.bestDateMap;

      //this.dateCount = {'2022-11-22' : 3...}
      this.availableDateCount = this.listToMemberCountMap(
        this.orgAvailableDateMap
      );
      this.bestDateCount = this.listToMemberCountMap(this.orgBestDateMap);

      //this.dateMemberMap = {'2022-11-22' : ['id1', 'id2']...}
      this.dateMemberMap = this.listToMemberListMap(this.orgAvailableDateMap);

      //{ 'id1' : '하은이' ...}
      this.memberName = Object.assign({}, ...this.meetingData.memberList);

      this.memberCount = this.meetingData.memberList.length;
      this.calculatedAllAvailableDate();
      this.calculatedBestDate();
    },
  },

  async created() {
    console.log("ShareCalendar.vue created() call");
    this.$store.registerModule("calendar", moduleCalendar);
    this.userData = firebase.auth().currentUser;

    if (!this.userData) {
      this.stepNoticeText = ""; //show
    }

    console.log(this.$route.params.meetingId);
    db.collection("Meeting")
      .doc(this.$route.params.meetingId)
      .get()
      .then((response) => {
        this.meetingData = response.data();
        if(this.meetingData){
          this.onLoadMeetingData();
        }else{
            this.$vs.notify({
              title: "warning",
              text: "요청하신 모임이 없습니다.",
              color: "warning",
              iconPack: "feather",
              position: "top-center",
              icon: "icon-check-circle",
            });
        }
      }).catch(err => {
        console.log(err);
      })
  },

  beforeDestroy() {
    this.$store.unregisterModule("calendar");
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/vuexy/apps/simple-calendar.scss";

.v-step {
  transform: translate3d(180px, 70px, 0px) !important;
  max-width: 150px !important;
}
.right-flex {
  margin: auto 0 0 auto !important;
}
.best-day {
  background-color: blue !important;
  color: white !important;
  font-weight: 600;
}

.theme-default .cv-day.bg-success {
  color: white !important;
  font-weight: 600;
}
.theme-default .cv-day.bg-warning {
  color: white !important;
  font-weight: 600;
}
.theme-default .cv-day.bg-danger {
  color: white !important;
  font-weight: 600;
}
.ides .cv-day-number::before {
  //content: "\271D";
}
.hidden {
  display: none;
}
</style>
