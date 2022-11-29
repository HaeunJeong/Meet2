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
    /*     SET_MEETINGS(state, meetings) {
            state.meetings = meetings;
        }, */
    SET_MEETINGS(state, meeting) {
        if (!state.meetings.find(m => m.id === meeting.id)) {
            console.log(state.meetings);
            state.meetings.push(meeting)
        }
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
    }
}