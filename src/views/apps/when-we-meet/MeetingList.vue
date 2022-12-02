<!-- =========================================================================================
  File Name: DataListListView.vue
  Description: Data List - List View
  ----------------------------------------------------------------------------------------
  Item Name: Vuexy - Vuejs, HTML & Laravel Admin Dashboard Template
  Author: Pixinvent
  Author URL: http://www.themeforest.net/user/pixinvent
========================================================================================== -->

<template>
  <vx-card title="참여중인 모임">
    <div id="data-list-list-view" class="data-list-container">
      <vs-table ref="table" v-model="selected" search :data="meetings">
        <template slot-scope="{ data }">
          <tbody>
            <div class="mt-5">
              <vs-collapse
                accordion
                :data="tr"
                :key="indextr"
                v-for="(tr, indextr) in data"
              >
                <vs-collapse-item>
                  <div slot="header">{{ tr.meetingNm }}</div>

                  <vs-list>
                    <!-- <vs-list-header title="Participants"></vs-list-header> -->
                    <vs-list-item title="참여인원" :subtitle="tr.meetingNmStr">
                    </vs-list-item>
                    <vs-list-item
                      title="Last update time"
                      :subtitle="tr.lastUpdated"
                    >
                    </vs-list-item>
                    <!--  <vs-list-item title="Info">
                        <div style="display: flex; flex-direction: column;">
                        <p style="font-size: 0.85rem;">안녕<br>안녕 <br></p>
                        </div>
                    </vs-list-item> -->

                    <vs-list-item
                      title=""
                      subtitle=""
                      style="display: flex; justify-content: center"
                    >
                      <vs-button
                        color="success"
                        :to="{
                          path: '/shared-calendar/' + tr.id,
                        }"
                        >일정매칭 결과보기</vs-button
                      >
                    </vs-list-item>

                    <vs-list-item
                      title=""
                      subtitle=""
                      style="display: flex; justify-content: center"
                    >
                      <vs-button
                        color="primary"
                        v-clipboard:copy="getUrl(tr.id)"
                        v-clipboard:success="onCopy"
                        v-clipboard:error="onError"
                        >Link Copy</vs-button
                      >
                    </vs-list-item>
                  </vs-list>
                </vs-collapse-item>
              </vs-collapse>
            </div>
          </tbody>
        </template>
      </vs-table>
    </div>
  </vx-card>
</template>

<script>
import DataViewSidebar from "@/views/ui-elements/data-list/DataViewSidebar.vue";
//import moduleDataList from '@/store/data-list/moduleDataList.js'
import moduleCalendar from "@/store/calendar/moduleCalendar.js";
import firebase from "firebase";
import dayjs from "dayjs";

export default {
  components: {
    DataViewSidebar,
  },
  data() {
    return {
      selected: [],
      isMounted: false,
      url: "http://whenwemeet-calendar.com/#/calendar/",
    };
  },
  computed: {
    currentPage() {
      if (this.isMounted) {
        return this.$refs.table.currentx;
      }
      return 0;
    },
    meetings() {
      console.log(this.$store.state.calendar.meetings);
      return this.$store.state.calendar.meetings;
    },
    queriedItems() {
      return this.$refs.table
        ? this.$refs.table.queriedResults.length
        : this.meetings.length;
    },
  },
  methods: {
    getUrl(meetingId) {
      return this.url + meetingId;
    },
    onCopy() {
      this.$vs.notify({
        title: "Success",
        text: "Url copied successfully",
        color: "success",
        iconPack: "feather",
        position: "top-center",
        icon: "icon-check-circle",
      });
    },
    onError() {
      this.$vs.notify({
        title: "Failed",
        text: "Error in copying url",
        color: "danger",
        iconPack: "feather",
        position: "top-center",
        icon: "icon-alert-circle",
      });
    },
  },
  async created() {
    this.$vs.loading();
    this.$store.registerModule("calendar", moduleCalendar);

    if (firebase.auth().currentUser.uid) {
/*       const callFirebase = await this.$store
        .dispatch("calendar/fetchMeetingList", firebase.auth().currentUser.uid)
        .then(() => this.$vs.loading.close());

      const wait = (timeToDelay) =>
        new Promise((resolve) => setTimeout(resolve, timeToDelay));

      await Promise.race([callFirebase, wait(2000)]); */

      /* 
     const wait = (timeToDelay) => new Promise((resolve) => setTimeout(resolve, timeToDelay));
      await this.$store
        .dispatch("calendar/fetchMeetingList", firebase.auth().currentUser.uid).then(() => this.$vs.loading.close());
        
     await wait(2000).then(()=>this.$vs.loading.close()) */

      await this.$store
        .dispatch("calendar/fetchMeetingList", firebase.auth().currentUser.uid)
        .then(() => this.$vs.loading.close());
    }
  },
  mounted() {
    this.isMounted = true;
  },
};
</script>

<style lang="scss">
.vs-list--slot {
  margin-left: 0px;
}
.vs-con-table .vs-con-tbody {
  background: transparent;
  border: none;
}
.vs-collapse-item {
  border-collapse: separate;
  border-spacing: 0 0.1rem;
  padding: 1rem 1rem;
  box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.05);
  border-top-left-radius: 0.1rem;
  border-bottom-left-radius: 0.1rem;
}
.vs-list--title {
  font-weight: 500;
}
.vs-list--item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 10px 5px;
}
.vs-collapse-item--header {
  font-size: 1rem;
  font-weight: 600;
  padding: 0.2rem;
}
.vs-con-table .vs-table--header .vs-table--search {
  padding: 0rem 0;
}
.vs-collapse.default .open-item .con-content--item {
  padding: 0rem;
}
.vs-collapse.shadow .open-item .con-content--item {
  padding: 0rem;
}
.vs-collapse.border .open-item .con-content--item {
  padding: 0rem;
}
.vs-collapse.margin .open-item .con-content--item {
  padding: 0rem;
}
#data-list-list-view {
  .vs-con-table {
    /*
      Below media-queries is fix for responsiveness of action buttons
      Note: If you change action buttons or layout of this page, Please remove below style
    */
    @media (max-width: 689px) {
      .vs-table--search {
        margin-left: 0;
        max-width: unset;
        width: 100%;

        .vs-table--search-input {
          width: 100%;
        }
      }
    }

    @media (max-width: 461px) {
      .items-per-page-handler {
        display: none;
      }
    }

    @media (max-width: 341px) {
      .data-list-btn-container {
        width: 100%;

        .dd-actions,
        .btn-add-new {
          width: 100%;
          margin-right: 0 !important;
        }
      }
    }

    .product-name {
      max-width: 23rem;
    }

    .vs-table--header {
      display: flex;
      flex-wrap: wrap;
      margin-left: 1.5rem;
      margin-right: 1.5rem;
      > span {
        display: flex;
        flex-grow: 1;
      }

      .vs-table--search {
        padding-top: 0;

        .vs-table--search-input {
          padding: 0.9rem 2rem;
          font-size: 1rem;

          & + i {
            left: 1rem;
          }

          &:focus + i {
            left: 1rem;
          }
        }
      }
    }

    .vs-table {
      border-collapse: separate;
      border-spacing: 0 0.2rem;
      padding: 0 0.2rem;
      max-width: 100% !important;
      min-width: 0 !important;

      tr {
        box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
        td {
          padding: 20px;
          &:first-child {
            border-top-left-radius: 0.5rem;
            border-bottom-left-radius: 0.5rem;
          }
          &:last-child {
            border-top-right-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
          }
        }
        td.td-check {
          padding: 20px !important;
        }
      }
    }

    .vs-table--thead {
      th {
        padding-top: 0;
        padding-bottom: 0;

        .vs-table-text {
          text-transform: uppercase;
          font-weight: 600;
        }
      }
      th.td-check {
        padding: 0 15px !important;
      }
      tr {
        background: none;
        box-shadow: none;
      }
    }

    .vs-table--pagination {
      justify-content: center;
    }
  }
}
</style>
