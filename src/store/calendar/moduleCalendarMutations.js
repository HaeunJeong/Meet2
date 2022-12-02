/*=========================================================================================
  File Name: moduleCalendarMutations.js
  Description: Calendar Module Mutations
  ----------------------------------------------------------------------------------------
  Item Name: Vuexy - Vuejs, HTML & Laravel Admin Dashboard Template
  Author: Pixinvent
  Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/


export default {
    ADD_EVENT(state, event) {
        console.log("mutations ADD_EVENT");
        state.events.push(event)
    },
    SET_EVENTS(state, events) {
        state.events = events
    },

    SET_MEETING(state, meeting) {

        if (meeting.memberList !== undefined && meeting.memberList.length > 0) {
            const memerNmList = Object.values(Object.assign({}, ...meeting.memberList));
            meeting.meetingNmStr = memerNmList.join(", ");

            const dttm = new Date(
                meeting.lastUpdateDttm.seconds * 1000 +
                meeting.lastUpdateDttm.nanoseconds / 1000000
            );
            meeting.lastUpdated = dttm.toLocaleDateString() + dttm.toLocaleTimeString();
        }

        const meetingIndex = state.meetings.findIndex((m) => m.id === meeting.id);

        if (meetingIndex > -1) {
            state.meetings.splice(meetingIndex, 1);
            console.log(state.meetings);
        }
        state.meetings.push(meeting);
        console.log(state.meetings);
    },
    SET_LABELS(state, labels) {
        state.eventLabels = labels
    },
    UPDATE_EVENT(state, event) {
        const eventIndex = state.events.findIndex((e) => e.id === event.id)
        Object.assign(state.events[eventIndex], event)
    },
    REMOVE_EVENT(state, eventId) {
        const eventIndex = state.events.findIndex((e) => e.id === eventId)
        state.events.splice(eventIndex, 1)
    },

    SET_BESTDATES(state, dates) {
        state.bestDateList = dates
    },
    SET_OKDATES(state, dates) {
        state.okDateList = dates
    },
    SET_NODATES(state, dates) {
        state.noDateList = dates
    },

    REMOVE_BESTDATE(state, date) {
        const dIndex = state.bestDateList.findIndex((d) => d === date)
        if (dIndex > -1) {
            state.bestDateList.splice(dIndex, 1)
        }
    },
    ADD_BESTDATE(state, date) {
        state.bestDateList.push(date);
    },


    REMOVE_OKDATE(state, date) {
        const dIndex = state.okDateList.findIndex((d) => d === date)
        if (dIndex > -1) {
            state.okDateList.splice(dIndex, 1)
        }
    },
    ADD_OKDATE(state, date) {
        state.okDateList.push(date);
    },


    REMOVE_NODATE(state, date) {
        const dIndex = state.noDateList.findIndex((d) => d === date)
        if (dIndex > -1) {
            state.noDateList.splice(dIndex, 1)
        }
    },
    ADD_NODATE(state, date) {
        state.noDateList.push(date);
    }

}