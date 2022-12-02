<template>
  <div id="simple-calendar-app">
    <div class="vx-card no-scroll-content">
      <vx-tour :steps="steps" :class="{ hidden: !this.$route.params.meetingId }" />

      <calendar-view
        ref="calendar"
        :displayPeriodUom="calendarView"
        :show-date="showDate"
        :events="currentUserEvents"
        :eventTop="windowWidth <= 400 ? '1rem' : '1rem'"
        eventBorderHeight="0px"
        eventContentHeight="1.65rem"
        class="theme-default"
        :date-classes="setDateClasses"
        @click-date="dateClick"
        @click-event="openEditEvent"
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
              class="flex"
              style="margin-left: auto"
              :class="{ hidden: !this.$route.params.meetingId }"
            >
              <vs-chip
                class="text-white"
                :class="'bg-' + meetingLabelColor(meetingLabel)"
                >{{ meetingLabel }}
              </vs-chip>

              <vs-dropdown
                vs-custom-content
                vs-trigger-click
                class="ml-auto my-2 cursor-pointer"
              >
                <feather-icon
                  icon="TagIcon"
                  svgClasses="h-5 w-5"
                  @click.prevent
                ></feather-icon>

                <vs-dropdown-menu style="z-index: 200001">
                  <vs-dropdown-item
                    v-for="(label, index) in meetingLabels"
                    :key="index"
                    @click="meetingLabel = label.value"
                  >
                    <div
                      class="h-3 w-3 inline-block rounded-full mr-2"
                      :class="'bg-' + label.color"
                    ></div>
                    <span>{{ label.text }}</span>
                  </vs-dropdown-item>
                </vs-dropdown-menu>
              </vs-dropdown>
            </div>

            <div
              id="shareToMeeting"
              :class="{ hidden: !this.$route.params.meetingId }"
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
              <div
                class="flex items-center"
                :class="{ hidden: !this.$route.params.meetingId}"
              >
                <strong>{{ getMeetingNm }}</strong> 로
                <vs-button
                  :hidden="!this.$route.params.meetingId"
                  icon-pack="feather"
                  style="margin-left: 5px"
                  @click="meetingDateUpdate()"
                  >공유</vs-button
                >
              </div>
            </div>
          </div>
        </div>
      </calendar-view>
    </div>

    <!-- ADD EVENT -->
    <vs-prompt
      class="calendar-event-dialog"
      title="내 일정 등록하기"
      accept-text="Add Event"
      @accept="addEvent"
      :is-valid="validForm"
      :active.sync="activePromptAddEvent"
    >
      <div class="calendar__label-container flex">
        <vs-chip
          v-if="labelLocal != 'none'"
          class="text-white"
          :class="'bg-' + labelColor(labelLocal)"
          >{{ labelLocal }}</vs-chip
        >
        <vs-dropdown
          vs-custom-content
          vs-trigger-click
          class="ml-auto my-2 cursor-pointer"
        >
          <feather-icon
            icon="TagIcon"
            svgClasses="h-5 w-5"
            class="cursor-pointer"
            @click.prevent
          ></feather-icon>

          <vs-dropdown-menu style="z-index: 200001">
            <vs-dropdown-item
              v-for="(label, index) in calendarLabels"
              :key="index"
              @click="labelLocal = label.value"
            >
              <div
                class="h-3 w-3 inline-block rounded-full mr-2"
                :class="'bg-' + label.color"
              ></div>
              <span>{{ label.text }}</span>
            </vs-dropdown-item>

            <vs-dropdown-item @click="labelLocal = 'none'">
              <div
                class="h-3 w-3 mr-1 inline-block rounded-full mr-2 bg-primary"
              ></div>
              <span>None</span>
            </vs-dropdown-item>
          </vs-dropdown-menu>
        </vs-dropdown>
      </div>

      <vs-input
        name="event-name"
        v-validate="'required'"
        class="w-full"
        label-placeholder="Event Title"
        v-model="title"
      ></vs-input>
      <div class="my-4">
        <small class="date-label">Start Date</small>
        <datepicker
          :language="$vs.rtl ? langHe : langEn"
          name="start-date"
          v-model="startDate"
          :disabled="disabledFrom"
        ></datepicker>
      </div>
      <div class="my-4">
        <small class="date-label">End Date</small>
        <datepicker
          :language="$vs.rtl ? langHe : langEn"
          :disabledDates="disabledDatesTo"
          name="end-date"
          v-model="endDate"
        ></datepicker>
      </div>
      <vs-input
        name="event-url"
        v-validate="'url'"
        class="w-full mt-6"
        label-placeholder="Event URL"
        v-model="url"
        :color="!errors.has('event-url') ? 'success' : 'danger'"
      ></vs-input>
    </vs-prompt>

    <!-- EDIT EVENT -->
    <vs-prompt
      class="calendar-event-dialog"
      title="Edit Event"
      accept-text="Submit"
      cancel-text="Remove"
      button-cancel="border"
      @cancel="removeEvent"
      @accept="editEvent"
      :is-valid="validForm"
      :active.sync="activePromptEditEvent"
    >
      <div class="calendar__label-container flex">
        <vs-chip
          v-if="labelLocal != 'none'"
          class="text-white"
          :class="'bg-' + labelColor(labelLocal)"
          >{{ labelLocal }}
        </vs-chip>

        <vs-dropdown vs-custom-content class="ml-auto my-2 cursor-pointer">
          <feather-icon
            icon="TagIcon"
            svgClasses="h-5 w-5"
            @click.prevent
          ></feather-icon>

          <vs-dropdown-menu style="z-index: 200001">
            <vs-dropdown-item
              v-for="(label, index) in meetingLabels"
              :key="index"
              @click="labelLocal = label.value"
            >
              <div
                class="h-3 w-3 inline-block rounded-full mr-2"
                :class="'bg-' + label.color"
              ></div>
              <span>{{ label.text }}</span>
            </vs-dropdown-item>

            <vs-dropdown-item @click="labelLocal = 'none'">
              <div
                class="h-3 w-3 mr-1 inline-block rounded-full mr-2 bg-primary"
              ></div>
              <span>None</span>
            </vs-dropdown-item>
          </vs-dropdown-menu>
        </vs-dropdown>
      </div>

      <vs-input
        name="event-name"
        v-validate="'required'"
        class="w-full"
        label-placeholder="Event Title"
        v-model="title"
      ></vs-input>
      <div class="my-4">
        <small class="date-label">Start Date</small>
        <datepicker
          :language="$vs.rtl ? langHe : langEn"
          :disabledDates="disabledDatesFrom"
          name="start-date"
          v-model="startDate"
        ></datepicker>
      </div>
      <div class="my-4">
        <small class="date-label">End Date</small>
        <datepicker
          :language="$vs.rtl ? langHe : langEn"
          :disabledDates="disabledDatesTo"
          name="end-date"
          v-model="endDate"
        ></datepicker>
      </div>
      <vs-input
        name="event-url"
        v-validate="'url'"
        class="w-full mt-6"
        label-placeholder="Event URL"
        v-model="url"
        :color="!errors.has('event-url') ? 'success' : 'danger'"
      ></vs-input>
    </vs-prompt>
  </div>
</template>

<script>
import firebase from "firebase";
import { CalendarView, CalendarViewHeader } from "vue-simple-calendar";
import moduleCalendar from "@/store/calendar/moduleCalendar.js";
import dayjs from "dayjs";

import { getKakaoToken, getKakaoUserInfo, naverService } from "./kakaologin.js";
require("vue-simple-calendar/static/css/default.css");

import Datepicker from "vuejs-datepicker";
import { en, he } from "vuejs-datepicker/src/locale";

const VxTour = () => import("@/components/VxTour.vue");

/** 전역변수로 연결 선언 (이게 문제가 될까??) */
const db = firebase.firestore();

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
      userData: {},
      currentMeetingData: {},
      meetingNm: "",
      meetingMinDt: "",
      meetingMaxDt: "",
      meetingId: "",

      orgAvailableDateMap: [],
      orgBestDateMap: [],

      showDate: new Date(),
      disabledFrom: false,
      id: 0,
      title: "",
      startDate: "",
      endDate: "",

      langHe: he,
      langEn: en,

      url: "",
      calendarView: "month",

      activePromptAddEvent: false,
      activePromptEditEvent: false,

      bestDateList: [],
      okDateList: [],
      noDateList: [],

      meetingLabel: "BEST",
      labelLocal: "none",
      meetingLabelList: [
        {
          text: "BEST",
          value: "BEST",
          color: "success",
        },
        {
          text: "OK",
          value: "OK",
          color: "warning",
        },
        {
          text: "NO",
          value: "NO",
          color: "danger",
        },
      ],
    };
  },
  mounted() {
    console.log("mounted call");
  },
  computed: {
/*     isMeetingLoaded(){
      if(this.$route.params.meetingId !== undefined || this.$route.params.meetingId !== '' ){
        return true;   
      }else{
        return false;
      }
    }, */
    steps() {
      return [
        {
          target: "#shareToMeeting",
          content: this.meetingMinDt + " ~ " + this.meetingMaxDt + " 사이의 가능한 일정을 공유해주세요"
        },
      ];
    },
    setDateClasses() {
      const dateColor = {};
      for (let key of this.$store.state.calendar.bestDateList) {
        dateColor[key] = "bg-success";
      }
      for (let key of this.$store.state.calendar.okDateList) {
        dateColor[key] = "bg-warning";
      }
      for (let key of this.$store.state.calendar.noDateList) {
        dateColor[key] = "bg-danger";
      }
      return dateColor;
    },
    getMeetingNm() {
      if (this.$route.params.meetingId && this.meetingId == "") {
        this.meetingId = this.$route.params.meetingId;
        const meetingRef = db
          .collection("Meeting")
          .doc(this.$route.params.meetingId);
        meetingRef.get().then((doc) => {
          if (doc.exists) {
            this.currentMeetingData = doc.data();
            this.meetingNm = doc.data().meetingNm;
            this.isMeetingLoadedOld = true;

            this.orgAvailableDateMap = doc.data().availableDateMap;
            this.orgBestDateMap = doc.data().bestDateMap;

            this.meetingMinDt = doc.data().meetingPeriod.minDt;
            this.meetingMaxDt = doc.data().meetingPeriod.maxDt;
          } else {
            this.$vs.notify({
              title: "warning",
              text: "요청하신 모임이 없습니다.",
              color: "warning",
              iconPack: "feather",
              position: "top-center",
              icon: "icon-check-circle",
            });
            this.$router.push("/");
          }
        });
      }
      return this.meetingNm;
    },
    currentUserEvents() {
      console.log("currentUserEvents call");
      console.log(this.$store.state.calendar.events);
      //return this.$store.getters["calendar/getAllUserEvents"];
      return this.$store.state.calendar.events;
    },
    validForm() {
      return (
        this.title !== "" &&
        this.startDate !== "" &&
        this.endDate !== "" &&
        Date.parse(this.endDate) - Date.parse(this.startDate) >= 0 &&
        !this.errors.has("event-url")
      );
    },
    disabledDatesTo() {
      return { to: new Date(this.startDate) };
    },
    disabledDatesFrom() {
      return { from: new Date(this.endDate) };
    },
    meetingLabels() {
      return this.meetingLabelList;
    },
    calendarLabels() {
      return this.$store.state.calendar.eventLabels;
    },
    labelColor() {
      return (label) => {
        if (label === "business") return "success";
        else if (label === "work") return "warning";
        else if (label === "personal") return "danger";
        else if (label === "none") return "primary";
      };
    },
    meetingLabelColor() {
      return (label) => {
        if (label == "BEST") return "success";
        else if (label == "OK") return "warning";
        else if (label == "NO") return "danger";
      };
    },
    windowWidth() {
      return this.$store.state.windowWidth;
    },
  },
  methods: {
    isSameDay(d1, d2) {
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    },
    dateClick(date) {
      if (this.$route.params.meetingId) {
        this.dateCheck(date);
      } else {
        this.openAddNewEvent(date);
      }
    },
    dateCheck(date) {
      const selectedDate = dayjs(date).format("YYYY-MM-DD");

      const bestDateIndex = this.$store.state.calendar.bestDateList.findIndex(
        (d) => d == selectedDate
      );
      const okDateIndex = this.$store.state.calendar.okDateList.findIndex(
        (d) => d == selectedDate
      );
      const noDateIndex = this.$store.state.calendar.noDateList.findIndex(
        (d) => d == selectedDate
      );

      if (bestDateIndex + okDateIndex + noDateIndex > -3) {
        //제거
        if (bestDateIndex > -1) {
          this.$store.commit("calendar/REMOVE_BESTDATE", selectedDate);
        }
        if (okDateIndex > -1) {
          this.$store.commit("calendar/REMOVE_OKDATE", selectedDate);
        }
        if (noDateIndex > -1) {
          this.$store.commit("calendar/REMOVE_NODATE", selectedDate);
        }
      } else {
        //추가
        if (this.meetingLabel == "BEST") {
          this.$store.commit("calendar/ADD_BESTDATE", selectedDate);
        } else if (this.meetingLabel == "OK") {
          this.$store.commit("calendar/ADD_OKDATE", selectedDate);
        } else if (this.meetingLabel == "NO") {
          this.$store.commit("calendar/ADD_NODATE", selectedDate);
        }
      }
    },
    isDayInMeetingPeriod(day, minDt, maxDt) {
      return (
        dayjs(day).isSame(minDt, "day") ||
        dayjs(day).isSame(maxDt, "day") ||
        (dayjs(day).isAfter(minDt, "day") && dayjs(day).isBefore(maxDt, "day"))
      );
    },
    getDateListInMeetingPeriod(minDt, maxDt) {
      let emptyDateList = [];
      for (let date of this.orgAvailableDateMap) {
        emptyDateList.push(dayjs(date.date).toDate());
      }
      return emptyDateList;
    },

    findAllEmptyDateList() {
      //모임 예정 기간 내의 회원의 비는 일자 뽑아내기.
      console.log("this.meetingMinDt " + this.meetingMinDt);
      const minDt = new Date(this.meetingMinDt);
      const maxDt = new Date(this.meetingMaxDt);

      const emptyDateList = this.getDateListInMeetingPeriod(minDt, maxDt);

      const badDateList = [];
      this.$store.state.calendar.noDateList.forEach((d) =>
        badDateList.push(new Date(d))
      );

      const eventDateList = [];
      const events = [...this.$store.state.calendar.events];

      for (let event of events) {
        if (this.isDayInMeetingPeriod(event.startDate, minDt, maxDt)) {
          for (
            let diff = 0;
            diff <= dayjs(event.endDate).diff(event.startDate, "day");
            diff++
          ) {
            eventDateList.push(
              dayjs(event.startDate).add(diff, "day").toDate()
            );
          }
        }
      }
      return emptyDateList.filter(
        (date) =>
          !this.isInArray(eventDateList, date) &&
          !this.isInArray(badDateList, date)
      );
    },

    findAllBestDateList() {
      //모임 예정 기간 내의 회원의 Best 일자 뽑아내기
      let minDt = new Date(this.meetingMinDt);
      let maxDt = new Date(this.meetingMaxDt);

      const bestDateList = [];
      this.$store.state.calendar.bestDateList.forEach((d) =>
        bestDateList.push(new Date(d))
      );
      const bestDateInPeriod = [];

      for (let best of bestDateList) {
        if (this.isDayInMeetingPeriod(best, minDt, maxDt)) {
          bestDateInPeriod.push(best);
        }
      }
      return bestDateInPeriod;
    },

    isInArray(array, value) {
      return array.find((item) => {
        return this.isSameDay(item, value);
      });
    },
    /*     isUserAlreadyShare() {
      return this.currentMeetingData.memberList.find(
        (member) => Object.keys(member)[0] == this.userData.uid
      );
    }, */

    async meetingDateUpdate() {
      //불가능한 일정제외한 모든 일자. 뽑아내기.

      const emptyDateList = this.findAllEmptyDateList(
        this.meetingMinDt,
        this.meetingMaxDt
      );

      const bestDateList = this.findAllBestDateList(
        this.meetingMinDt,
        this.meetingMaxDt
      );

      console.log(bestDateList);
      const emptyDateCalculatedList = this.getUpatedListForDB(
        emptyDateList,
        this.orgAvailableDateMap
      );
      const bestDateCalculatedList = this.getUpatedListForDB(
        bestDateList,
        this.orgBestDateMap
      );

      this.meetingCalculatedDateUpdate(
        emptyDateCalculatedList,
        bestDateCalculatedList
      );

      this.userMeetingListUpdate();
      this.meetingUserSelectUpdate(); // 색깔 선택사항 저장하는 collection
    },

    getUpatedListForDB(targetDateList, orginDateList) {
      let newCalculatedDate = [];

      for (let date of orginDateList) {
        if (this.isInArray(targetDateList, dayjs(date.date).toDate())) {
          newCalculatedDate.push({
            date: JSON.parse(JSON.stringify(date.date)),
            members: [
              this.userData.uid,
              ...date.members.filter((member) => member !== this.userData.uid), //이미 일정공유된 멤버면 기존것 삭제.
            ],
          });
        } else {
          newCalculatedDate.push({
            date: JSON.parse(JSON.stringify(date.date)),
            members: [
              ...date.members.filter((member) => member !== this.userData.uid),
            ],
          });
        }
      }
      return newCalculatedDate;
    },

    meetingCalculatedDateUpdate(
      emptyDateCalculatedList,
      bestDateCalculatedList
    ) {
      const member = {};
      member[this.userData.uid] = this.userData.displayName;

      return new Promise((resolve, reject) => {
        db.collection("Meeting")
          .doc(this.meetingId)
          .update({
            availableDateMap: JSON.parse(
              JSON.stringify(emptyDateCalculatedList)
            ),
            bestDateMap: JSON.parse(JSON.stringify(bestDateCalculatedList)),
            memberList: firebase.firestore.FieldValue.arrayUnion(
              JSON.parse(JSON.stringify(member))
            ),
            lastUpdateDttm: new Date(),
          })
          .then((response) => {
            console.log("meeting update success");
            this.onSuccess();
            resolve(response);
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      });
    },
    userMeetingListUpdate() {
      return new Promise((resolve, reject) => {
        db.collection("User")
          .doc(this.userData.uid)
          .update({
            meetingList: firebase.firestore.FieldValue.arrayUnion(
              JSON.parse(JSON.stringify(this.meetingId))
            ),
          })
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      });
    },
    meetingUserSelectUpdate() {
      return new Promise((resolve, reject) => {
        db.collection("MeetingUserSelect")
          .doc(this.meetingId)
          .collection(this.userData.uid)
          .doc("selectDateList")
          .set({
            bestDateList: this.$store.state.calendar.bestDateList,
            okDateList: this.$store.state.calendar.okDateList,
            noDateList: this.$store.state.calendar.noDateList,
          })
          .then((response) => {
            console.log("성공?");
            resolve(response);
          })
          .catch((error) => {
            console.log(error);
            reject(error);
          });
      });
    },
    onSuccess() {
      this.$vs.notify({
        title: "Success",
        text: "일정이 성공적으로 공유되었습니다.",
        color: "success",
        iconPack: "feather",
        position: "top-center",
        icon: "icon-check-circle",
      });
    },

    addEvent() {
      //DONE
      console.log("startDate", this.startDate);
      const event = {
        id: new Date().getTime(),
        title: this.title,
        startDate: this.startDate,
        endDate: this.endDate,
        label: this.labelLocal,
        url: this.url,
      };
      console.log(event);
      event.classes = `event-${this.labelColor(this.labelLocal)}`;

      let payload = {
        event: event,
        userId: this.userData.uid,
      };

      this.$store.dispatch("calendar/addEvent", payload);
    },
    updateMonth(val) {
      this.showDate = this.$refs.calendar.getIncrementedPeriod(val);
    },
    clearFields() {
      this.title = this.endDate = this.url = "";
      this.id = 0;
      this.labelLocal = "none";
    },
    promptAddNewEvent(date) {
      this.disabledFrom = false;
      this.addNewEventDialog(date);
    },
    addNewEventDialog(date) {
      this.clearFields();
      this.startDate = date;
      this.endDate = date;
      this.activePromptAddEvent = true;
    },
    openAddNewEvent(date) {
      this.disabledFrom = true;
      this.addNewEventDialog(date);
    },

    openEditEvent(event) {
      const e = this.$store.getters["calendar/getEvent"](event.id);
      this.id = e.id;
      this.title = e.title;
      this.startDate = e.startDate;
      this.endDate = e.endDate;
      this.url = e.url;
      this.labelLocal = e.label;
      this.activePromptEditEvent = true;
    },

    editEvent() {
      const obj = {
        id: this.id,
        title: this.title,
        startDate: this.startDate,
        endDate: this.endDate,
        label: this.labelLocal,
        url: this.url,
      };
      obj.classes = `event-${this.labelColor(this.labelLocal)}`;

      const payload = {};
      payload.event = obj;
      payload.userId = this.userData.uid;

      this.$store.dispatch("calendar/editEvent", payload);
    },
    removeEvent() {
      const payload = {};
      payload.eventId = this.id;
      payload.userId = this.userData.uid;

      this.$store.dispatch("calendar/removeEvent", payload);
    },

    async setKakaoToken() {
      console.log("카카오 인증 코드", this.$route.query.code);
      const { data } = await getKakaoToken(this.$route.query.code);
      if (data.error) {
        alert("카카오톡 로그인 오류입니다.");
        this.$router.replace("/login");
        return;
      }
      window.Kakao.Auth.setAccessToken(data.access_token);
      this.$cookies.set("access-token", data.access_token, "1d");
      this.$cookies.set("refresh-token", data.refresh_token, "1d");
      await this.setUserInfo();
      this.$router.replace("/");
    },
    async setUserInfo() {
      const res = await getKakaoUserInfo();
      const userInfo = {
        name: res.kakao_account.profile.nickname,
        platform: "kakao",
      };
      this.$store.commit("setUser", userInfo);
    },
    getInfo() {
      naverService().getUserInfo();
    },
  },
  created() {
    console.log("PersonalCalendar.vue created() call");
    this.userData = firebase.auth().currentUser;
    this.$store.registerModule("calendar", moduleCalendar);
    this.$store.dispatch("calendar/fetchEvents", this.userData.uid);

    const payload = {};
    payload.uid = this.userData.uid;
    payload.meetingId = this.$route.params.meetingId;

    this.$store.dispatch("calendar/fetchUserSelectDate", payload);
    this.$store.dispatch("calendar/fetchEventLabels");
  },
  beforeDestroy() {
    this.$store.unregisterModule("calendar");
  },
};
</script>

<style lang="scss">
@import "@/assets/scss/vuexy/apps/simple-calendar.scss";
@import "@/assets/scss/vuexy/pages/sidebar.scss";

.v-step {
  transform: translate3d(160px, 94px, 0px) !important;
  max-width: 150px !important;
}
.right-flex {
  margin: auto 0 0 auto !important;
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

/* .best-day {
  background-color: rgba(var(--vs-success), 1)  !important;
  color: white !important;
  font-weight: 600;
}
.good-day {
  background-color: rgba(var(--vs-success), 1)  !important;
  color: white !important;
  font-weight: 600;
}
.ok-day {
  background-color: rgba(var(--vs-warning), 1)   !important;
  color: white !important;
  font-weight: 600;
}
.no-day {
  background-color: rgba(var(--vs-danger), 1)   !important;
  color: white !important;
  font-weight: 600;
} */

.vx-card__title {
  h4 + h6 {
    margin-top: 0.3rem;
  }

  h6 {
    font-weight: 400;
  }
}
</style>
