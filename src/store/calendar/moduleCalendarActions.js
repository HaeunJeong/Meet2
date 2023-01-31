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
    result.id = org.id;

    //timestamp 타입으로 읽어져서 바꿔야함.
    result.startDate = new Date(org.startDate.seconds * 1000 + org.startDate.nanoseconds / 1000000);
    result.endDate = new Date(org.endDate.seconds * 1000 + org.endDate.nanoseconds / 1000000);

    result.url = org.url;
    result.classes = org.classes;
    result.label = org.label;

    return result;
};
export default {

    async fetchMeetingList({ commit }, userId) {

        const userRef = await db.collection("User").doc(userId).get();

        const userData = userRef.data();

        if (userData && userData.meetingList.length > 0) {

            const fetchedMeeting = {};

            for await (const meetingId of userData.meetingList) {
                const meetingData = await db.collection("Meeting").doc(meetingId).get();
                fetchedMeeting[meetingId] = meetingData.data();
            }

            for (let id in fetchedMeeting) {
                commit('SET_MEETING', { id: id, ...fetchedMeeting[id] });
            }
        }
    },

    async addEvent({ commit }, payload) {
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
        })
    },

    fetchUserSelectDate({ commit }, payload) {
        const userId = payload.uid;
        const meetingId = payload.meetingId;

        console.log("fetchUserSelectDate call " + userId);

        //DONE
        return new Promise((resolve, reject) => {
            db.collection("MeetingUserSelect").doc(meetingId).collection(userId).doc("selectDateList")
                .get()
                .then((response) => {
                    const dateList = response.data();
                    commit('SET_BESTDATES', dateList.bestDateList);
                    commit('SET_OKDATES', dateList.okDateList);
                    commit('SET_NODATES', dateList.noDateList);
                    resolve(response);
                })
                .catch((error) => { reject(error) })
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
    async editEvent({ commit }, payload) {
        let readEvents = await db.collection("User").doc(payload.userId).get();

        let newEvents = [];
        newEvents = [...readEvents.data().events.filter(e => e.id !== payload.event.id), payload.event];

        return new Promise((resolve, reject) => {
            db.collection("User").doc(payload.userId)
                .update({ events: newEvents })
                .then((response) => {
                    commit('UPDATE_EVENT', payload.event)
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error);
                    reject(error)
                })

        });
    },
    async removeEvent({ commit }, payload) {
        let readEvents = await db.collection("User").doc(payload.userId).get();

        let removedEvents = [...readEvents.data().events.filter(e => e.id !== payload.eventId)];

        return new Promise((resolve, reject) => {
            db.collection("User").doc(payload.userId)
                .update({ events: removedEvents })
                .then((response) => {
                    commit('REMOVE_EVENT', payload.eventId)
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error);
                    reject(error)
                })

        });
    }
}