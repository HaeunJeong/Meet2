/*=========================================================================================
  File Name: moduleAuthActions.js
  Description: Auth Module Actions
  ----------------------------------------------------------------------------------------
  Item Name: Vuexy - Vuejs, HTML & Laravel Admin Dashboard Template
  Author: Pixinvent
  Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

import jwt from '../../http/requests/auth/jwt/index.js'


/* import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth' */
import router from '@/router'

import firebase from 'firebase/app'
import 'firebase/auth'

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

    async loginWithKakao3({ commit, state, dispatch }, payload) {
        //이메일 + 키값으로 User로 접근

        if (state.isUserLoggedIn()) {
            if (payload.closeAnimation) payload.closeAnimation();
            payload.notify({
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            })

            if (router.options.enterUrl !== router.currentRoute.fullPath) {
                router.push(router.options.enterUrl || '/')
            } else {
                router.push(router.currentRoute.query.to || '/')
            }

            return false
        }

        const kakaoUid = 'kakao_' + payload.data.id;
        const displayName = payload.data.kakao_account.profile.nickname;


        dispatch('createUser', kakaoUid);

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

    },

    async loginWithKakao({ commit, state, dispatch }, payload) {
        if (state.isUserLoggedIn()) {
            if (router.options.enterUrl !== router.currentRoute.fullPath) {
                router.push(router.options.enterUrl || '/')
            } else {
                router.push(router.currentRoute.query.to || '/')
            }
            return false
        }

        console.log('payload.id_token', payload.id_token);
        const credential = new firebase.auth.OAuthProvider('oidc.kauth.kakao.com').credential(
            payload.id_token
        );

        firebase.auth().signInWithCredential(credential).then((response) => {

            if (response.additionalUserInfo.isNewUser) {
                //UserData 만들기
                dispatch('createUser', response.user.uid)
            }

            if (router.options.enterUrl !== router.currentRoute.fullPath) {
                router.push(router.options.enterUrl || '/')
            } else {
                router.push(router.currentRoute.query.to || '/')
            }
            commit('UPDATE_USER_INFO', response.user.providerData[0], { root: true })

            console.log('signInWithCredential', response);

            return response.user.updateProfile({
                displayName: response.additionalUserInfo.profile.picture
            });
        })


        /*  Kakao.Auth.authorize({
             redirectUri: 'http://localhost:8080/',
         }).then((authObj) => {
             console.log("success", authObj);
             axios
                 .get("https://kapi.kakao.com/v2/user/me?secure_resource=true", {
                     headers: { Authorization: "Bearer " + authObj.access_token },
                 })
                 .then((response) => {
                     console.log(response);
                     //this.$store.dispatch("auth/kakaoTempLogin", authObj.access_token);
                 })
                 .catch((error) => {
                     console.log(error);
                 });
         }).catch(error => { console.log(error);
             reject(error); }); */

        /*                 firebase.auth().fetchSignInMethodsForEmail('nicehe74@gmail.com').then((result) => {
                            console.log(result);
                        });  */
        /* 

        이거처럼하자!!!!!!

                        const credential = firebase.auth.GoogleAuthProvider.credential(
                            googleUser.getAuthResponse().id_token);
                        const result = await firebase.auth().signInWithCredential(credential); */

        /*         const credential = new firebase.auth.OAuthProvider('oidc.kauth.kakao.com').credential(
                    payload.id_token
                );
                const result = await firebase.auth().signInWithCredential(credential);
                console.log('result', result); */

        /*         const provider = new firebase.auth.OAuthProvider('oidc.kauth.kakao.com');
                provider.addScope('profile_nickname');
                provider.addScope('account_email'); */
        //provider.addScope('openid');


        //provider.setCustomParameters({ 'identifier': 'nicehe74@gmail.com' });

        /*         firebase.auth().signInWithCustomToken(payload.id_token).then((result) => {
                    console.log(result);
                }) */

        //client secrect key를 oidc 설정이랑, kakao 발급에서 제거하니까 갑자기 안되넹?? KOE201 에러뜸
        //다시 살려두면 KOE010 에러가 뜨는데 response type 설정 잘못이라는데,. 이게 signInWithPopup에서 호출하는건데 어케 바꾸냐?? customparameter 로 바꾸는게 있으려나??

        /**
         * 근데 provider 제대로 넣어도 
         * https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyAssertion?key=AIzaSyBGwysosWeMLx13VF1DJhmKRFyD-1R4cPQ 같이 api 내부에서 호출할때 400 이 나옴..
         */

        /*         firebase.auth().signInWithPopup(provider)
                    .then((result) => {
                        router.push(router.currentRoute.query.to || '/')
                        commit('UPDATE_USER_INFO', result.user.providerData[0], { root: true })
                    }).catch((err) => {
                        router.push(router.currentRoute.query.to || '/')
                            //commit('UPDATE_USER_INFO', result.user.providerData[0], { root: true })

                        if (router.options.enterUrl !== router.currentRoute.fullPath) {
                            router.push(router.options.enterUrl || '/')
                        } else {
                            router.push(router.currentRoute.query.to || '/')
                        }

                        console.log(err);
                        payload.notify({
                            time: 25000,
                            title: 'Error',
                            text: err.message,
                            iconPack: 'feather',
                            icon: 'icon-alert-circle',
                            color: 'danger'
                        })
                    }); */


        /*         firebase.auth().signInWithRedirect(provider);


                firebase.auth().getRedirectResult()
                    .then((result) => {
                        // IdP data available in result.additionalUserInfo.profile.
                        // ...

                        console.log(result);
                        if (router.options.enterUrl !== router.currentRoute.fullPath) {
                            router.push(router.options.enterUrl || '/calendar')
                        } else {
                            router.push(router.currentRoute.query.to || '/calendar')
                        }


                        var credential = result.credential;

                        // OAuth access and id tokens can also be retrieved:
                        var accessToken = credential.accessToken;
                        var idToken = credential.idToken;
                    })
                    .catch((error) => {
                        // Handle error.
                    }); */



    },

    // Google Login
    loginWithGoogle({ commit, state }, payload) {
        if (state.isUserLoggedIn()) {
            if (router.options.enterUrl !== router.currentRoute.fullPath) {
                router.push(router.options.enterUrl || '/')
            } else {
                router.push(router.currentRoute.query.to || '/')
            }
            return false
        }
        const provider = new firebase.auth.GoogleAuthProvider()

        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                if (router.options.enterUrl !== router.currentRoute.fullPath) {
                    router.push(router.options.enterUrl || '/')
                } else {
                    router.push(router.currentRoute.query.to || '/')
                }
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

            console.log('createUser call', uid);
            const usersRef = firebase.firestore().collection("User").doc(uid);

            usersRef.get()
                .then((docSnapshot) => {
                    if (!docSnapshot.exists) {
                        usersRef.set({
                                meetingList: [],
                                events: []
                            }).then((response) => {
                                console.log("user created");
                                resolve(response);
                            })
                            .catch((error) => {
                                console.log(error);
                                reject(error);
                            });
                    }
                });
        });
    },
}