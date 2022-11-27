/*=========================================================================================
  File Name: moduleCalendarActions.js
  Description: Calendar Module Actions
  ----------------------------------------------------------------------------------------
  Item Name: Vuexy - Vuejs, HTML & Laravel Admin Dashboard Template
  Author: Pixinvent
  Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

import axios from '@/axios.js'
import firebase from "firebase";
import dayjs from "dayjs";

const db = firebase.firestore();
const user = firebase.auth().currentUser;

/*
org : db에서 읽어온 결과
return component에서 보는 포맷.
*/
function eventMapper(org) {
    let result = {};
    result.title = org.title;

    //timestamp 타입으로 읽어져서 바꿔야함.
    result.startDate = new Date(org.startDate.seconds * 1000 + org.startDate.nanoseconds / 1000000);
    result.endDate = new Date(org.endDate.seconds * 1000 + org.endDate.nanoseconds / 1000000);

    result.url = org.url;
    result.classes = org.classes;
    result.label = org.label;

    return result;
};
export default {

    updateSchedule() {
        //개인 일정 업데이트

    },

    updateMeetingSchedule() {
        //모임 가능일자 재계산

    },
    getMeetingDetail() {
        //특정 모임의 상세 데이터 가져오기(계산된 결과)
    },

    getMeetingList() {
        //개인 속해있는 미팅 리스트 조회

    },


    createMeeting({ commit }, payload) {
        console.log("createMeeting call");
        //신규 미팅 생성
        //DONE
        return new Promise((resolve, reject) => {
            db.collection("Meeting")
                .add({
                    meetingNm: payload.meetingNm,
                    meetingPeriod: {
                        minDt: payload.minDt,
                        maxDt: payload.maxDt
                    }
                })
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        })
    },


    async addEvent({ commit }, payload) {
        console.log("addEvent call");
        console.log('userId : ' + payload.userId);
        return new Promise((resolve, reject) => {
            db.collection("User")
                .doc(payload.userId)
                .update({ events: firebase.firestore.FieldValue.arrayUnion(payload.event) })
                .then((response) => {

                    commit('ADD_EVENT', payload.event);
                    resolve(response);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error)
                })

            /* else {
                db.collection("User")
                    .doc(payload.userId)
                    .set({ events: [payload.event] })
                    .then((response) => {
                        console.log('addEvent success');
                        commit('ADD_EVENT', payload.event);
                        resolve(response);
                    })
                    .catch((error) => {
                        console.log(error);
                        reject(error)
                    })
            } */
        })
    },


    fetchEvents({ commit }, userId) {
        console.log("fetchEvents call " + userId);
        //DONE
        return new Promise((resolve, reject) => {
            db.collection("User").doc(userId)
                .get()
                .then((response) => {
                    let userData = response.data();
                    let scheduleDataList = [];

                    if (userData) {
                        userData.events
                            .forEach(event => {
                                scheduleDataList.push(eventMapper(event))
                            });
                        commit('SET_EVENTS', scheduleDataList)
                        resolve(response)
                    }
                })
                .catch((error) => { reject(error) })
        })

        /* return new Promise((resolve, reject) => {
            axios.get('/api/apps/calendar/events')
                .then((response) => {
                    commit('SET_EVENTS', response.data)
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        }) */
    },
    fetchEventLabels({ commit }) {
        return new Promise((resolve, reject) => {
            axios.get('/api/apps/calendar/labels')
                .then((response) => {
                    commit('SET_LABELS', response.data)
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        })
    },
    editEvent({ commit }, event) {
        return new Promise((resolve, reject) => {
            axios.post(`/api/apps/calendar/event/${event.id}`, { event })
                .then((response) => {

                    // Convert Date String to Date Object
                    const event = response.data
                    event.startDate = new Date(event.startDate)
                    event.endDate = new Date(event.endDate)

                    commit('UPDATE_EVENT', event)
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        })
    },
    removeEvent({ commit }, eventId) {
        return new Promise((resolve, reject) => {
            axios.delete(`/api/apps/calendar/event/${eventId}`)
                .then((response) => {
                    commit('REMOVE_EVENT', response.data)
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        })
    },
    eventDragged({ commit }, payload) {
        return new Promise((resolve, reject) => {
            axios.post(`/api/apps/calendar/event/dragged/${payload.event.id}`, { payload })
                .then((response) => {

                    // Convert Date String to Date Object
                    const event = response.data
                    event.startDate = new Date(event.startDate)
                    event.endDate = new Date(event.endDate)

                    commit('UPDATE_EVENT', event)
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        })
    }


    /**
     * 
         addEvent({ commit }, event) {
        return new Promise((resolve, reject) => {
            axios.post('/api/apps/calendar/events/', { event })
                .then((response) => {
                    commit('ADD_EVENT', Object.assign(event, { id: response.data.id }))
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        })
    },

    fetchEvents({ commit }, userId) {

        return new Promise((resolve, reject) => {
            axios.get('/api/apps/calendar/events')
                .then((response) => {
                    commit('SET_EVENTS', response.data)
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        })
    },
    fetchEventLabels({ commit }) {
        return new Promise((resolve, reject) => {
            axios.get('/api/apps/calendar/labels')
                .then((response) => {
                    commit('SET_LABELS', response.data)
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        })
    },
    editEvent({ commit }, event) {
        return new Promise((resolve, reject) => {
            axios.post(`/api/apps/calendar/event/${event.id}`, { event })
                .then((response) => {

                    // Convert Date String to Date Object
                    const event = response.data
                    event.startDate = new Date(event.startDate)
                    event.endDate = new Date(event.endDate)

                    commit('UPDATE_EVENT', event)
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        })
    },
    removeEvent({ commit }, eventId) {
        return new Promise((resolve, reject) => {
            axios.delete(`/api/apps/calendar/event/${eventId}`)
                .then((response) => {
                    commit('REMOVE_EVENT', response.data)
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        })
    },
    eventDragged({ commit }, payload) {
        return new Promise((resolve, reject) => {
            axios.post(`/api/apps/calendar/event/dragged/${payload.event.id}`, { payload })
                .then((response) => {

                    // Convert Date String to Date Object
                    const event = response.data
                    event.startDate = new Date(event.startDate)
                    event.endDate = new Date(event.endDate)

                    commit('UPDATE_EVENT', event)
                    resolve(response)
                })
                .catch((error) => { reject(error) })
        })
    }
     */
}