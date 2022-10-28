// NOTE
// Please use your own firebase details below. For more details visit: https://pixinvent.com/demo/vuexy-vuejs-admin-dashboard-template/documentation/development/firebaseIntegration.html


import firebase from 'firebase/app'

// Initialize Firebase
const config = {
    apiKey: "AIzaSyBGwysosWeMLx13VF1DJhmKRFyD-1R4cPQ",
    authDomain: "whenwemeet-2756a.firebaseapp.com",
    databaseURL: "https://whenwemeet-2756a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "whenwemeet-2756a",
    storageBucket: "whenwemeet-2756a.appspot.com",
    messagingSenderId: "879327032175",
    appId: "1:879327032175:web:9902c6a2b26305b36aae9a",
    measurementId: "G-ZC84BJ4XTJ"
}

firebase.initializeApp(config)