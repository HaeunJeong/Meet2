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
      class="flex flex-wrap items-center mt-4"
      style="justify-content: space-around"
    >
      <!--      
      <div class="bg-google pt-3 pb-2 px-4 rounded-lg cursor-pointer mr-4" @click="loginWithGoogle">
        <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" class="text-white h-4 w-4 svg-inline--fa fa-google fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
      </div> -->

      <img
        src="@/assets/images/kakao_login.png"
        style="margin: 0 0 1rem 0"
        @click="loginWithKakao()"
      />
<!--   
  카카오 인앱에서 구글 인증 안열림(구글 정책. google login 403 disallowed_useragent )
  
      <img
        src="@/assets/images/btn_google_signin_light_normal_web.png"
        style="margin: 0 0 1rem 0"
        @click="loginWithGoogle()"
      /> -->
    </div>
  </div>
</template>

<script>
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

    nologinWithKakao() {
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
        scope: "profile_nickname, profile_image, account_email, openid",
        success: (authObj) => {
          console.log("success", authObj);

          this.$store.dispatch("auth/loginWithKakao", {
            notify: this.$vs.notify,
            id_token: authObj.id_token,
          });
        },
      });
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
  created() {
    console.log(this.$route);
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
