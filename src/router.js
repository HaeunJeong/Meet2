/*=========================================================================================
  File Name: router.js
  Description: Routes for vue-router. Lazy loading is enabled.
  Object Strucutre:
                    path => router path
                    name => router name
                    component(lazy loading) => component to load
                    meta : {
                      rule => which user can have access (ACL)
                      breadcrumb => Add breadcrumb to specific page
                      pageTitle => Display title besides breadcrumb
                    }
  ----------------------------------------------------------------------------------------
  Item Name: Vuexy - Vuejs, HTML & Laravel Admin Dashboard Template
  Author: Pixinvent
  Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/


import Vue from 'vue'
import Router from 'vue-router'
import auth from '@/auth/authService'

import firebase from 'firebase/app'
import 'firebase/auth'

Vue.use(Router)

const router = new Router({
    enterUrl: '',
    mode: 'hash',
    base: process.env.BASE_URL,
    scrollBehavior() {
        return { x: 0, y: 0 }
    },
    routes: [{
            // =============================================================================
            // MAIN LAYOUT ROUTES
            // =============================================================================
            path: '',
            component: () =>
                import ('./layouts/main/Main.vue'),
            children: [
                // =============================================================================
                // Theme Routes
                // =============================================================================
                {
                    path: '/',
                    //redirect: '/dashboard/analytics'
                    redirect: '/calendar'
                },
                //---------DONE
                {
                    path: '/calendar',
                    name: 'personal-calendar',
                    component: () =>
                        import ('./views/apps/when-we-meet/PersonalCalendar.vue'),
                    meta: {
                        rule: 'editor',
                        authRequired: true
                    }
                },
                {
                    path: '/calendar/:meetingId',
                    name: 'personal-calendar',
                    component: () =>
                        import ('./views/apps/when-we-meet/PersonalCalendar.vue'),
                    meta: {
                        rule: 'editor',
                        authRequired: true
                    }
                },
                {
                    path: '/shared-calendar/:meetingId',
                    name: 'shared-calendar',
                    component: () =>
                        import ('./views/apps/when-we-meet/ShareCalendar.vue'),
                    meta: {
                        rule: 'editor',
                        //authRequired: true
                    }
                },
                {
                    path: '/meeting-create-form',
                    name: 'meeting-create-form',
                    component: () =>
                        import ('./views/apps/when-we-meet/MeetingCreateForm.vue'),
                    meta: {
                        rule: 'editor',
                        authRequired: true
                    }
                },

                {
                    path: '/meeting-list',
                    name: 'meeting-list',
                    component: () =>
                        import ('./views/apps/when-we-meet/MeetingList.vue'),
                    meta: {
                        rule: 'editor',
                        authRequired: true
                    }
                }
            ]

        },

        // =============================================================================
        // FULL PAGE LAYOUTS
        // =============================================================================
        {
            path: '',
            component: () =>
                import ('@/layouts/full-page/FullPage.vue'),
            children: [
                // =============================================================================
                // PAGES
                // =============================================================================
                {
                    path: '/callback',
                    name: 'auth-callback',
                    component: () =>
                        import ('@/views/Callback.vue'),
                    meta: {
                        rule: 'editor'
                    }
                },
                {
                    path: '/pages/login',
                    name: 'page-login',
                    component: () =>
                        import ('@/views/pages/login/Login.vue'),
                    meta: {
                        rule: 'editor'
                    }
                },
                {
                    path: '/pages/register',
                    name: 'page-register',
                    component: () =>
                        import ('@/views/pages/register/Register.vue'),
                    meta: {
                        rule: 'editor'
                    }
                },
                {
                    path: '/pages/forgot-password',
                    name: 'page-forgot-password',
                    component: () =>
                        import ('@/views/pages/ForgotPassword.vue'),
                    meta: {
                        rule: 'editor'
                    }
                },
                {
                    path: '/pages/reset-password',
                    name: 'page-reset-password',
                    component: () =>
                        import ('@/views/pages/ResetPassword.vue'),
                    meta: {
                        rule: 'editor'
                    }
                },
                {
                    path: '/pages/error-404',
                    name: 'page-error-404',
                    component: () =>
                        import ('@/views/pages/Error404.vue'),
                    meta: {
                        rule: 'editor'
                    }
                },
                {
                    path: '/pages/error-500',
                    name: 'page-error-500',
                    component: () =>
                        import ('@/views/pages/Error500.vue'),
                    meta: {
                        rule: 'editor'
                    }
                }
            ]
        },
        // Redirect to 404 page, if no match found
        {
            path: '*',
            redirect: '/pages/error-404'
        }
    ]
})

router.afterEach((from) => {
    // Remove initial loading
    const appLoading = document.getElementById('loading-bg')
    if (appLoading) {
        appLoading.style.display = 'none'
    }
})

router.beforeEach((to, from, next) => {

    if (router.options.enterUrl == '') {
        router.options.enterUrl = router.history.pending.fullPath;
    }

    firebase.auth().onAuthStateChanged(() => {

        // get firebase current user
        const firebaseCurrentUser = firebase.auth().currentUser

        // if (
        //     to.path === "/pages/login" ||
        //     to.path === "/pages/forgot-password" ||
        //     to.path === "/pages/error-404" ||
        //     to.path === "/pages/error-500" ||
        //     to.path === "/pages/register" ||
        //     to.path === "/callback" ||
        //     to.path === "/pages/comingsoon" ||
        //     (auth.isAuthenticated() || firebaseCurrentUser)
        // ) {
        //     return next();
        // }

        // If auth required, check login. If login fails redirect to login page
        if (to.meta.authRequired) {
            // localStorage.getItem('accessToken') <= will check for JWT login which stores acessToken in localStorage
            // NOTE: You might want to change checking logged in user. We are just checking it by existence of accessToken but you might prefer more reliable
            //       and suitable approach to your app
            if (!(auth.isAuthenticated() || firebaseCurrentUser || localStorage.getItem('accessToken'))) {
                router.push({ path: '/pages/login', query: { to: to.path } })
            }
        }

        return next()
            // Specify the current path as the customState parameter, meaning it
            // will be returned to the application after auth
            // auth.login({ target: to.path });

    })

})

export default router