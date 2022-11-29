<template>
  <div id="simple-calendar-app">
    <div class="vx-card no-scroll-content">
      <calendar-view
        ref="calendar"
        :displayPeriodUom="calendarView"
        :show-date="showDate"
        :events="currentUserEvents"
        enableDragDrop
        :eventTop="windowWidth <= 400 ? '2rem' : '3rem'"
        eventBorderHeight="0px"
        eventContentHeight="1.65rem"
        class="theme-default"
        @click-date="dateClick"
        @click-event="openEditEvent"
        @drop-on-date="eventDragged"
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
              :class="{ hidden: $route.params.meetingId == null }"
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
              <div class="flex items-center">
                <strong>{{ getMeetingNm }}</strong> 로
                <vs-button
                  :hidden="$route.params.meetingId == null"
                  icon-pack="feather"
                  style="margin-left: 5px"
                  @click="meetingDateUpdate()"
                  >공유</vs-button
                >
              </div>
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
        </div>
      </calendar-view>
    </div>

    <!-- ADD EVENT -->
    <vs-prompt
      class="calendar-event-dialog"
      title="Add Event"
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
require("vue-simple-calendar/static/css/default.css");

import Datepicker from "vuejs-datepicker";
import { en, he } from "vuejs-datepicker/src/locale";

/** 전역변수로 연결 선언 (이게 문제가 될까??) */
const db = firebase.firestore();

//Date.prototype.toJSON = function(){ return moment(this).format(); }

export default {
  components: {
    CalendarView,
    CalendarViewHeader,
    Datepicker,
  },
  data() {
    return {
      userData: {},

      isChecked: false,
      checkedDateList: [],
      sameDateList: [],

      currentMeetingData: {},
      meetingNm: "",
      meetingMinDt: "",
      meetingMaxDt: "",
      meetingId: "",
      orgCalculatedDate: [],

      showDate: new Date(),
      disabledFrom: false,
      id: 0,
      title: "",
      startDate: "",
      endDate: "",
      labelLocal: "none",

      langHe: he,
      langEn: en,

      url: "",
      calendarView: "month",

      activePromptAddEvent: false,
      activePromptEditEvent: false,

      calendarViewTypes: [],
    };
  },
  mounted() {
    console.log("mounted call");
  },
  computed: {
    getMeetingNm() {
      if (this.$route.params.meetingId && this.meetingId == "") {
        this.meetingId = this.$route.params.meetingId;
        const meetingRef = db
          .collection("Meeting")
          .doc(this.$route.params.meetingId);
        meetingRef.get().then((doc) => {
          if (doc.exists) {
            console.log(JSON.stringify(doc));
            this.currentMeetingData = doc.data();
            this.meetingNm = doc.data().meetingNm;
            this.orgCalculatedDate = doc.data().calculatedDate;
            this.meetingMinDt = doc.data().meetingPeriod.minDt;
            this.meetingMaxDt = doc.data().meetingPeriod.maxDt;
          } else {
            alert("요청하신 모임이 없습니다.");
            //Redirect
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
    dateClick(date, event) {
      if (this.$route.params.meetingId) {
        this.dateCheck(date, event);
      } else {
        this.openAddNewEvent(date);
      }
    },
    dateCheck(date, event) {
      console.log(event);

      if (event.target.className == "cv-day-number") {
        if (this.checkedDateList.indexOf(date) > -1) {
          let idx = this.checkedDateList.indexOf(date);
          this.checkedDateList.splice(idx, idx + 1);
          this.isChecked = false;

          console.log(event.path[1]);
          event.path[1].className = event.path[1].className.replace(
            " best-day",
            ""
          );
        } else {
          this.checkedDateList.push(date);
          this.isChecked = true;
          event.path[1].className = event.path[1].className.replace(
            " best-day",
            ""
          ); //방어로직.
          event.path[1].className += " best-day";
        }
      } else {
        if (this.checkedDateList.indexOf(date) > -1) {
          let idx = this.checkedDateList.indexOf(date);
          this.checkedDateList.splice(idx, idx + 1);
          this.isChecked = false;

          event.target.className = event.target.className.replace(
            " best-day",
            ""
          );
        } else {
          this.checkedDateList.push(date);
          this.isChecked = true;
          event.target.className = event.target.className.replace(
            " best-day",
            ""
          ); //방어로직.
          event.target.className += " best-day";
        }
      }

      console.log(this.checkedDateList);
    },
    isDayInMeetingPeriod(day, minDt, maxDt) {
      return (
        dayjs(day).isSame(minDt, "day") ||
        dayjs(day).isSame(maxDt, "day") ||
        (dayjs(day).isAfter(minDt, "day") && dayjs(day).isBefore(maxDt, "day"))
      );
    },
    getDateListInMeetingPeriod(minDt, maxDt) {
      /*       for (
        let time = minDt.getTime();
        time <= maxDt.getTime();
        time += 1000 * 3600 * 24
      ) {
        emptyDateList.push(new Date(time));
      } 
      return emptyDateList;
      */
      let emptyDateList = [];
      for (let date of this.orgCalculatedDate) {
        emptyDateList.push(dayjs(date.date).toDate());
      }
      return emptyDateList;
    },

    findAllEmptyDateList() {
      //모임 예정 기간 내의 회원의 비는 일자 뽑아내기.
      console.log("this.meetingMinDt " + this.meetingMinDt);
      let minDt = new Date(this.meetingMinDt);
      let maxDt = new Date(this.meetingMaxDt);

      let emptyDateList = this.getDateListInMeetingPeriod(minDt, maxDt);

      let eventDateList = [];
      let events = [...this.$store.state.calendar.events];

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
        (date) => !this.isInArray(eventDateList, date)
      );
    },

    isInArray(array, value) {
      return array.find((item) => {
        return this.isSameDay(item, value);
      });
    },
    isUserAlreadyShare() {
      return this.currentMeetingData.memberList.find(
        (member) => Object.keys(member)[0] == this.userData.uid
      );
    },

    async meetingDateUpdate() {
      //checkedDateList = 가중치 일정.
      //불가능한 일정제외한 모든 일자. 뽑아내기.

      let emptyDateList = this.findAllEmptyDateList(
        this.meetingMinDt,
        this.meetingMaxDt
      );
      console.log("emptyDateList");
      console.log(emptyDateList);

      let newCalculatedDate = [];

      for (let date of this.orgCalculatedDate) {
        if (this.isInArray(emptyDateList, dayjs(date.date).toDate())) {
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

      console.log("newCalculatedDate", newCalculatedDate);

      this.meetingCalculatedDateUpdate(newCalculatedDate);
      this.userMeetingListUpdate();
    },

    meetingCalculatedDateUpdate(newCalculatedDate) {
      const member = {};
      member[this.userData.uid] = this.userData.displayName;

      return new Promise((resolve, reject) => {
        db.collection("Meeting")
          .doc(this.meetingId)
          .update({
            calculatedDate: JSON.parse(JSON.stringify(newCalculatedDate)),
            //firebase.firestore.FieldValue.arrayUnion(JSON.parse(JSON.stringify(...userEmptyDateList)))
            memberList: firebase.firestore.FieldValue.arrayUnion(
              JSON.parse(JSON.stringify(member))
            ),
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

    onLoadData() {
      let db = firebase.firestore();
      let self = this;
      db.collection("bbs")
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            self.data.push(doc.data());
          });
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
      //const e = this.$store.getters["calendar/getSchedules"](event.id);
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
      this.$store.dispatch("calendar/editEvent", obj);
    },
    removeEvent() {
      this.$store.dispatch("calendar/removeEvent", this.id);
    },
    eventDragged(event, date) {
      this.$store.dispatch("calendar/eventDragged", { event, date });
    },
  },
  created() {
    console.log("cretaed call");
    this.userData = firebase.auth().currentUser;
    this.$store.registerModule("calendar", moduleCalendar);
    this.$store.dispatch("calendar/fetchEvents", this.userData.uid);
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
</style>
