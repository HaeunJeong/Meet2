<template>
  <div id="simple-calendar-app">
    <div class="vx-card no-scroll-content">
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
                icon-pack="feather"
                style="margin-left: 0px"
                :to="{
                  path: '/calendar/' + $route.params.meetingId,
                }"
                >내 일정 UPDATE</vs-button
              >
            </div>

            <div class="vx-col sm:w-1/3 w-full flex justify-center">
              <template v-for="(view, index) in calendarViewTypes">
                <vs-button
                  v-if="calendarView === view.val"
                  :key="String(view.val) + 'filled'"
                  type="filled"
                  class="p-3 md:px-8 md:py-3"
                  :class="{
                    'border-l-0 rounded-l-none': index,
                    'rounded-r-none': calendarViewTypes.length !== index + 1,
                  }"
                  @click="calendarView = view.val"
                  >{{ view.label }}</vs-button
                >
                <vs-button
                  v-else
                  :key="String(view.val) + 'border'"
                  type="border"
                  class="p-3 md:px-8 md:py-3"
                  :class="{
                    'border-l-0 rounded-l-none': index,
                    'rounded-r-none': calendarViewTypes.length !== index + 1,
                  }"
                  @click="calendarView = view.val"
                  >{{ view.label }}</vs-button
                >
              </template>
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
                    >Best 일자보기</vs-radio
                  >
                </li>
                <li>
                  <vs-radio
                    color="warning"
                    v-model="showSelected"
                    vs-value="ALL"
                    >가능한 날 전체보기</vs-radio
                  >
                </li>
              </ul>
              <!-- Labels -->
              <!--               <div class="flex flex-wrap sm:justify-start justify-center">
                <div
                  v-for="(label, index) in calendarLabels"
                  :key="index"
                  class="flex items-center mr-4 mb-2"
                >
                  <div
                    class="h-3 w-3 inline-block rounded-full mr-2"
                    :class="'bg-' + label.color"
                  ></div>
                  <span>{{ label.text }}</span>
                </div>
              </div> -->
            </div>
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

/** 전역변수로 연결 선언 (이게 문제가 될까??) */
const db = firebase.firestore();
const user = firebase.auth().currentUser;

//Date.prototype.toJSON = function(){ return moment(this).format(); }

export default {
  components: {
    CalendarView,
    CalendarViewHeader,
    Datepicker,
  },
  data() {
    return {
      uid: "",
      auth: {},
      userData: {},

      meetingData: {},
      meetingNm: "",
      meetingMinDt: "",
      meetingMaxDt: "",
      meetingId: "",

      bestDateResult: [],
      allAvailableDateResult: [],

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

      calendarViewTypes: []
    };
  },
  mounted() {},
  computed: {
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
          title: "참여중인 멤버",
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

    calculatedAllAvailableDate(){
      //this.allAvailableDateResult
        this.allAvailableDateResult = Object.keys(this.availableDateCount)
                .filter(date=>this.availableDateCount[date]==this.memberCount);
    },

    calculatedBestDate(){
        //this.bestDateResult
        this.bestDateResult = Object.keys(this.bestDateCount)
                .filter(date=>this.bestDateCount[date]==this.memberCount);
    },

    onLoadMeetingData() {
      let self = this;
      this.meetingData = this.$store.state.calendar.meetings.find(
        (meeting) => meeting.id == self.$route.params.meetingId
      );

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
    this.$store
      .dispatch("calendar/fetchMeetingList", this.userData.uid)
      .then(() => this.onLoadMeetingData());
  },

  beforeDestroy() {
    this.$store.unregisterModule("calendar");
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/vuexy/apps/simple-calendar.scss";

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
</style>
