/*=========================================================================================
  File Name: moduleAuthActions.js
  Description: Auth Module Actions
  ----------------------------------------------------------------------------------------
  Item Name: Vuexy - Vuejs, HTML & Laravel Admin Dashboard Template
  Author: Pixinvent
  Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

import jwt from '../../http/requests/auth/jwt/index.js'


import firebase from 'firebase/app'
import 'firebase/auth'
import router from '@/router'

export default {
    loginAttempt({ dispatch }, payload) {

        // New payload for login action
        const newPayload = {
            userDetails: payload.userDetails,
            notify: payload.notify,
            closeAnimation: payload.closeAnimation
        }

        // If remember_me is enabled change firebase Persistence
        if (!payload.checkbox_remember_me) {

            // Change firebase Persistence
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)

            // If success try to login
            .then(function() {
                dispatch('login', newPayload)
            })

            // If error notify
            .catch(function(err) {

                // Close animation if passed as payload
                if (payload.closeAnimation) payload.closeAnimation()

                payload.notify({
                    time: 2500,
                    title: 'Error',
                    text: err.message,
                    iconPack: 'feather',
                    icon: 'icon-alert-circle',
                    color: 'danger'
                })
            })
        } else {
            // Try to login
            dispatch('login', newPayload)
        }
    },
    loginTemp({ commit, state, dispatch }, payload) {

        // If user is already logged in notify and exit
        if (state.isUserLoggedIn()) {
            // Close animation if passed as payload
            if (payload.closeAnimation) payload.closeAnimation()

            payload.notify({
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            })

            return false
        }

        // Try to sigin
        firebase.auth().signInWithEmailAndPassword(payload.userDetails.email, payload.userDetails.password)

        .then((result) => {

            // Set FLAG username update required for updating username
            let isUsernameUpdateRequired = false

            // if username is provided and updateUsername FLAG is true
            // set local username update FLAG to true
            // try to update username
            if (payload.updateUsername && payload.userDetails.displayName) {

                isUsernameUpdateRequired = true

                dispatch('updateUsername', {
                    user: result.user,
                    username: payload.userDetails.displayName,
                    notify: payload.notify,
                    isReloadRequired: true
                })
            }

            // Close animation if passed as payload
            if (payload.closeAnimation) payload.closeAnimation()

            // if username update is not required
            // just reload the page to get fresh data
            // set new user data in localstorage
            if (!isUsernameUpdateRequired) {
                router.push(router.currentRoute.query.to || '/')
                commit('UPDATE_USER_INFO', result.user.providerData[0], { root: true })
            }
        }, (err) => {
            // Close animation if passed as payload
            if (payload.closeAnimation) payload.closeAnimation()
            if (payload.provider == 'kakao') {
                dispatch('registerUserWithKakaoEmail', payload);
            }

            payload.notify({
                time: 2500,
                title: 'Error',
                text: err.message,
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'danger'
            })
        })
    },


    login({ commit, state, dispatch }, payload) {

        // If user is already logged in notify and exit
        if (state.isUserLoggedIn()) {
            // Close animation if passed as payload
            if (payload.closeAnimation) payload.closeAnimation()

            payload.notify({
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            })

            console.log('router', router);
            //router.push(router.currentRoute.query.to || '/')
            if (router.options.enterUrl !== router.currentRoute.fullPath) {
                router.push(router.options.enterUrl || '/')
            } else {
                router.push(router.currentRoute.query.to || '/')
            }

            return false
        }

        // Try to sigin
        firebase.auth().signInWithEmailAndPassword(payload.userDetails.email, payload.userDetails.password)

        .then((result) => {

            // Set FLAG username update required for updating username
            let isUsernameUpdateRequired = false

            // if username is provided and updateUsername FLAG is true
            // set local username update FLAG to true
            // try to update username
            if (payload.updateUsername && payload.userDetails.displayName) {

                isUsernameUpdateRequired = true

                dispatch('updateUsername', {
                    user: result.user,
                    username: payload.userDetails.displayName,
                    notify: payload.notify,
                    isReloadRequired: true
                })
            }

            // Close animation if passed as payload
            if (payload.closeAnimation) payload.closeAnimation()

            // if username update is not required
            // just reload the page to get fresh data
            // set new user data in localstorage
            if (!isUsernameUpdateRequired) {
                console.log('router', router);
                //router.push(router.currentRoute.query.to || '/')
                if (router.options.enterUrl !== router.currentRoute.fullPath) {
                    router.push(router.options.enterUrl || '/')
                } else {
                    router.push(router.currentRoute.query.to || '/')
                }
                commit('UPDATE_USER_INFO', result.user.providerData[0], { root: true })
            }

        }, (err) => {

            // Close animation if passed as payload
            if (payload.closeAnimation) payload.closeAnimation()

            payload.notify({
                time: 2500,
                title: 'Error',
                text: err.message,
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'danger'
            })
        })
    },

    kakaoTempLogin({}, payload) {
        // Set accessToken


        localStorage.setItem('accessToken', payload);
        router.push(router.currentRoute.query.to || '/');
    },




    async loginWithKakao({ commit, state }, payload) {

        if (state.isUserLoggedIn()) {
            payload.notify({
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            })
            return false
        }

        const provider = new firebase.auth.OAuthProvider('kauth.kakao.com');
        console.log('loginWithKakao');

        //firebase.auth().signInWithRedirect(provider);

        firebase.auth().signInWithPopup(provider)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;
                console.log('user', user);
                // ...
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                // ...
            });

        /* const auth = payload.access_token;
        console.log(auth);
        firebase.auth().getRedirectResult().then((res) => {
            console.log(res);
        }) */
    },

    async loginWithKakao2({ commit, state, dispatch }, payload) {
        //이메일 + 키값으로 가입하게 하기 

        if (state.isUserLoggedIn()) {
            payload.notify({
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            })
            return false
        }

        const email = payload.data.kakao_account.email;
        const password = payload.data.id + '';
        const newPayload = {
            userDetails: {
                displayName: payload.data.kakao_account.profile.nickname,
                email: email,
                password: password
            },
            notify: {
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            },
            updateUsername: true,
            provider: 'kakao'
        }

        dispatch('login', newPayload);

        //registerUserWithKakaoEmail(payload);
    },

    registerUserWithKakaoEmail({ commit, state, dispatch }, payload) {

        firebase.auth().createUserWithEmailAndPassword(payload.userDetails.email, payload.userDetails.password)
            .then((response) => {
                console.log(response);
                /* self.$vs.notify({
                    title: 'Account Created',
                    text: 'You are successfully registered!',
                    iconPack: 'feather',
                    icon: 'icon-check',
                    color: 'success'
                }) */
                /*                 const newPayload = {
                                    userDetails: {
                                        displayName: payload.data.kakao_account.profile.nickname,
                                        email: email,
                                        password: password
                                    },
                                    notify: {
                                        title: 'Login Attempt',
                                        text: 'You are already logged in!',
                                        iconPack: 'feather',
                                        icon: 'icon-alert-circle',
                                        color: 'warning'
                                    },
                                    updateUsername: true
                                } */

                dispatch('createUser', response.user.uid);
                dispatch('login', payload);

                return response.user.updateProfile({
                    displayName: payload.data.kakao_account.profile.nickname,
                });
            }, (error) => {
                console.log(error);
            })
    },

    // Google Login
    loginWithGoogle({ commit, state }, payload) {
        if (state.isUserLoggedIn()) {
            payload.notify({
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            })
            return false
        }
        const provider = new firebase.auth.GoogleAuthProvider()

        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                router.push(router.currentRoute.query.to || '/')
                commit('UPDATE_USER_INFO', result.user.providerData[0], { root: true })
            }).catch((err) => {
                payload.notify({
                    time: 2500,
                    title: 'Error',
                    text: err.message,
                    iconPack: 'feather',
                    icon: 'icon-alert-circle',
                    color: 'danger'
                })
            })
    },


    registerUser({ dispatch }, payload) {

        // create user using firebase
        firebase.auth().createUserWithEmailAndPassword(payload.userDetails.email, payload.userDetails.password)
            .then((response) => {
                payload.notify({
                    title: 'Account Created',
                    text: 'You are successfully registered!',
                    iconPack: 'feather',
                    icon: 'icon-check',
                    color: 'success'
                })

                const newPayload = {
                    userDetails: payload.userDetails,
                    notify: payload.notify,
                    updateUsername: true
                }

                dispatch('createUser', response.user.uid)
                dispatch('login', newPayload)

                return response.user.updateProfile({
                    displayName: payload.userDetails.displayName
                });
            }, (error) => {
                payload.notify({
                    title: 'Error',
                    text: error.message,
                    iconPack: 'feather',
                    icon: 'icon-alert-circle',
                    color: 'danger'
                })
            })
    },
    updateUsername({ commit }, payload) {
        payload.user.updateProfile({
            displayName: payload.displayName
        }).then(() => {

            // If username update is success
            // update in localstorage
            const newUserData = Object.assign({}, payload.user.providerData[0])
            newUserData.displayName = payload.displayName
            commit('UPDATE_USER_INFO', newUserData, { root: true })

            // If reload is required to get fresh data after update
            // Reload current page
            if (payload.isReloadRequired) {
                console.log('router', router);
                //router.push(router.currentRoute.query.to || '/')
                if (router.options.enterUrl !== router.currentRoute.fullPath) {
                    router.push(router.options.enterUrl || '/')
                } else {
                    router.push(router.currentRoute.query.to || '/')
                }
            }
        }).catch((err) => {
            payload.notify({
                time: 8800,
                title: 'Error',
                text: err.message,
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'danger'
            })
        })
    },


    // JWT
    loginJWT({ commit }, payload) {

        return new Promise((resolve, reject) => {
            jwt.login(payload.userDetails.email, payload.userDetails.password)
                .then(response => {

                    // If there's user data in response
                    if (response.data.userData) {

                        // Set accessToken
                        localStorage.setItem('accessToken', response.data.accessToken)

                        // Update user details
                        commit('UPDATE_USER_INFO', response.data.userData, { root: true })

                        // Set bearer token in axios
                        commit('SET_BEARER', response.data.accessToken)

                        // Navigate User to homepage
                        router.push(router.currentRoute.query.to || '/')

                        resolve(response)
                    } else {
                        reject({ message: 'Wrong Email or Password' })
                    }

                })
                .catch(error => { reject(error) })
        })
    },
    registerUserJWT({ commit }, payload) {

        const { displayName, email, password, confirmPassword } = payload.userDetails

        return new Promise((resolve, reject) => {

            // Check confirm password
            if (password !== confirmPassword) {
                reject({ message: 'Password doesn\'t match. Please try again.' })
            }

            jwt.registerUser(displayName, email, password)
                .then(response => {
                    // Redirect User
                    router.push(router.currentRoute.query.to || '/')

                    // Update data in localStorage
                    localStorage.setItem('accessToken', response.data.accessToken)
                    commit('UPDATE_USER_INFO', response.data.userData, { root: true })

                    resolve(response)
                })
                .catch(error => { reject(error) })
        })
    },
    fetchAccessToken() {
        return new Promise((resolve) => {
            jwt.refreshToken().then(response => { resolve(response) })
        })
    },


    //==========================================================
    createUser({}, uid) {
        return new Promise((resolve, reject) => {
            firebase.firestore().collection("User")
                .doc(uid)
                .set({
                    meetingList: [],
                    events: []
                })
                .then((response) => {
                    console.log("user created");
                    resolve(response);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    },
}