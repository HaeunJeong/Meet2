<template>
  <div>
    <vs-input
      v-validate="'required|email|min:3'"
      data-vv-validate-on="blur"
      name="email"
      icon-no-border
      icon="icon icon-user"
      icon-pack="feather"
      label-placeholder="Email"
      v-model="email"
      class="w-full"
    />
    <span class="text-danger text-sm">{{ errors.first("email") }}</span>

    <vs-input
      data-vv-validate-on="blur"
      v-validate="'required|min:6|max:16'"
      type="password"
      name="password"
      icon-no-border
      icon="icon icon-lock"
      icon-pack="feather"
      label-placeholder="Password"
      v-model="password"
      class="w-full mt-6"
    />
    <span class="text-danger text-sm">{{ errors.first("password") }}</span>

    <div class="flex flex-wrap justify-between my-5">
      <vs-checkbox v-model="checkbox_remember_me" class="mb-3"
        >로그인기억하기</vs-checkbox
      >
      <router-link to="/pages/forgot-password"
        >비밀번호를 잊으셨나요?</router-link
      >
    </div>
    <vs-button type="border" @click="registerUser">회원가입하기</vs-button>
    <vs-button class="float-right" :disabled="!validateForm" @click="login"
      >로그인</vs-button
    >

    <vs-divider>OR</vs-divider>

    <div
      class="social-login-buttons flex flex-wrap items-center mt-4"
      style="justify-content: center"
    >
      <!-- GOOGLE -->
      <!--       <div class="bg-google pt-3 pb-2 px-4 rounded-lg cursor-pointer mr-4" @click="loginWithGoogle">
        <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" class="text-white h-4 w-4 svg-inline--fa fa-google fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
      </div> -->
      <!-- KaKao -->
      <img src="@/assets/images/kakao_login.png" @click="nologinWithKakao()" />
    </div>
  </div>
</template>

<script>
import axios from "@/axios.js";
import firebase from "firebase";
//import { initializeApp } from 'firebase-admin/app';

//const firebaseAdmin = require('initializeApp');

const kakaoHeader = {
  Authorization: "51d891bc585a17f45eaf1b853dd0ce54",
  "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
};
export default {
  data() {
    return {
      email: "",
      password: "",
      checkbox_remember_me: true,
    };
  },
  computed: {
    validateForm() {
      return !this.errors.any() && this.email !== "" && this.password !== "";
    },
  },
  methods: {
    checkLogin() {
      // If user is already logged in notify
      if (this.$store.state.auth.isUserLoggedIn()) {
        // Close animation if passed as payload
        // this.$vs.loading.close()

        this.$vs.notify({
          title: "Login Attempt",
          text: "로그인 되었습니다!",
          iconPack: "feather",
          icon: "icon-alert-circle",
          color: "warning",
        });

        return false;
      }
      return true;
    },
    login() {
      // Loading
      this.$vs.loading();

      const payload = {
        checkbox_remember_me: this.checkbox_remember_me,
        userDetails: {
          email: this.email,
          password: this.password,
        },
        notify: this.$vs.notify,
        closeAnimation: this.$vs.loading.close,
      };
      this.$store.dispatch("auth/loginAttempt", payload);
    },

    nologinWithKakao(){
        this.$vs.notify({
              title: "warning",
              text: "개발중.. 곧 사용가능합니다!",
              color: "warning",
              iconPack: "feather",
              position: "top-center",
              icon: "icon-check-circle",
            });
    },

    loginWithKakao() {
      Kakao.Auth.login({
        scope: "profile_nickname, account_email, openid",
        success: (authObj) => {
          console.log("success", authObj);
          axios
            .get("https://kapi.kakao.com/v2/user/me?secure_resource=true", {
              headers: { Authorization: "Bearer " + authObj.access_token },
            })
            .then((response) => {
              console.log(response);
              //this.$store.dispatch("auth/kakaoTempLogin", authObj.access_token);

              this.$store.dispatch("auth/loginWithKakao2", response);
            })
            .catch((error) => {
              console.log(error);
            });
        },
      });
    },

//TEMP
    createFirebaseToken(kakaoAccessToken) {
      return this.requestMe(kakaoAccessToken)
        .then((response) => {
          const body = JSON.parse(response);
          console.log(body);
          const userId = `kakao:${body.id}`;
          if (!userId) {
            return res.status(404).send({
              message: "There was no user with the given access token.",
            });
          }
          let nickname = null;
          if (body.properties) {
            nickname = body.properties.nickname;
          }
          return this.updateOrCreateUser(userId, body.kaccount_email, nickname);
        })
        .then((userRecord) => {
          const userId = userRecord.uid;
          console.log(
            `creating a custom firebase token based on uid ${userId}`
          );
          return firebaseAdmin
            .auth()
            .createCustomToken(userId, { provider: "KAKAO" });
        });
    },

    updateOrCreateUser(userId, email, displayName) {
      console.log("updating or creating a firebase user");
      const updateParams = {
        provider: "KAKAO",
        displayName: displayName,
      };
      if (displayName) {
        updateParams["displayName"] = displayName;
      } else {
        updateParams["displayName"] = email;
      }
      /*         if (photoURL) {
                    updateParams['photoURL'] = photoURL;
                } */
      console.log(updateParams);
      return firebaseAdmin
        .auth()
        .updateUser(userId, updateParams)
        .catch((error) => {
          if (error.code === "auth/user-not-found") {
            updateParams["uid"] = userId;
            if (email) {
              updateParams["email"] = email;
            }
            return firebaseAdmin.auth().createUser(updateParams);
          }
          throw error;
        });
    },

    async getKakaoToken(code) {
      console.log("loginWithKakao");
      try {
        const data = {
          grant_type: "authorization_code",
          client_id: "7fb3e6fe9cbaebc845fba947299ddd23",
          redirect_uri: "http://localhost:8080/auth",
          code: code,
        };
        const queryString = Object.keys(data)
          .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
          .join("&");
        const result = await axios.post(
          "https://kauth.kakao.com/oauth/token",
          queryString,
          { headers: kakaoHeader }
        );
        console.log("카카오 토큰", queryString);
        return result;
      } catch (e) {
        return e;
      }
    },

    // Google login
    loginWithGoogle() {
      this.$store.dispatch("auth/loginWithGoogle", { notify: this.$vs.notify });
    },
    registerUser() {
      if (!this.checkLogin()) return;
      this.$router.push("/pages/register").catch(() => {});
    },
  },
};
</script>


<style lang="scss">
#page-login {
  .social-login-buttons {
    .bg-facebook {
      background-color: #1551b1;
    }
    .bg-twitter {
      background-color: #00aaff;
    }
    .bg-google {
      background-color: #4285f4;
    }
    .bg-github {
      background-color: #333;
    }
  }
}
</style>
