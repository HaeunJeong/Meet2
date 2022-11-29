<template>
  <div id="simple-calendar-app">
    <div class="vx-card no-scroll-content">
      <calendar-view
        ref="calendar"
        :displayPeriodUom="calendarView"
        :show-date="showDate"
        :events="currentUserEvents"
        enableDragDrop
        :date-classes="setResultDateClasses"
        :eventTop="windowWidth <= 400 ? '2rem' : '3rem'"
        eventBorderHeight="0px"
        eventContentHeight="1.65rem"
        class="theme-default"
        @click-date="showAvailableMembers"
      >
        <div slot="header" class="mb-4">
          <div class="vx-row no-gutter">
            <!-- Current Month -->
            <div class="vx-col w-1/3 items-center sm:flex">
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
            <div class="right-flex vx-col sm:flex my-3 flex sm:justify-end
                justify-center">
              <router-link
                  :to="{
                    path:
                      '/apps/when-we-meet/calendar/' + $route.params.meetingId,
                  }"
                  >재공유하기</router-link
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
              <!-- Labels -->
              <div class="flex flex-wrap sm:justify-start justify-center">
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
              </div>
            </div>
          </div>
        </div>
      </calendar-view>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
import { getAuth } from "firebase/auth";
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
      orgCalculatedDate: [],
      dateCount: [],

      first: 0,
      second: 0,
      third: 0,

      memberName: {},
      dateMemberMap: {},

      showDate: new Date(),
      id: 0,
      title: "",
      startDate: "",
      endDate: "",
      labelLocal: "none",

      url: "",
      calendarView: "month",

      calendarViewTypes: [],
      labels: [
        {
          text: "1순위",
          value: "business",
          color: "success",
        },
        {
          text: "2순위",
          value: "work",
          color: "warning",
        },
        {
          text: "3순위",
          value: "personal",
          color: "danger",
        },
      ],
    };
  },
  mounted() {
    this.uid = user.uid;
    // 가장 유력한 날짜에 best-day 클래스 달아주기.
  },
  computed: {
    setResultDateClasses() {
      const dateColor = {};
      for (let key of Object.keys(this.dateCount)) {
        if (this.dateCount[key] == this.first) {
          dateColor[key] = "bg-success";
        } else if (this.dateCount[key] == this.second) {
          dateColor[key] = "bg-warning";
        } else if (this.dateCount[key] == this.third) {
          dateColor[key] = "bg-danger";
        }
      }
      return dateColor;
    },
    currentUserEvents() {},
    calendarLabels() {
      return this.labels;
    },
    windowWidth() {
      return this.$store.state.windowWidth;
    },
  },
  methods: {
    showAvailableMembers(date) {
      let memberText = "";
      const selectedDate = dayjs(date).format("YYYY-MM-DD");
      for (let memberId of this.dateMemberMap[selectedDate]) {
        memberText += this.memberName[memberId] + "\n";
      }

      //const memberText = "하은이\n민우\n지인이";
      this.$vs.dialog({
        color: "primary",
        title: "참여중인 멤버",
        text: memberText,
      });
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
    onLoadMeetingData() {
      let self = this;
      this.meetingData = this.$store.state.calendar.meetings.find(
        (meeting) => meeting.id == self.$route.params.meetingId
      );

      this.orgCalculatedDate = this.meetingData.calculatedDate;

      //this.dateCount = {'2022-11-22' : 3...}
      this.dateCount = this.orgCalculatedDate.reduce((newObj, obj) => {
        newObj[obj.date] = obj.members.length;
        return newObj;
      }, {});

      //this.dateMemberMap = {'2022-11-22' : ['id1', 'id2']...}
      this.dateMemberMap = this.orgCalculatedDate.reduce((newObj, obj) => {
        newObj[obj.date] = obj.members;
        return newObj;
      }, {});

      //{ 'id1' : '하은이' ...}
      this.memberName = Object.assign({}, ...this.meetingData.memberList);

      this.getBestMeetingDate(this.dateCount);
    },
  },
  created() {
    this.$store.registerModule("calendar", moduleCalendar);
    this.onLoadMeetingData();
  },
  beforeDestroy() {
    this.$store.unregisterModule("calendar");
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/vuexy/apps/simple-calendar.scss";
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
