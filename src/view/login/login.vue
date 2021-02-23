<style lang="less">
@import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
          <p class="login-tip" v-show="false">输入任意用户名和密码即可</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
export default {
  components: {
    LoginForm
  },
  mounted() {
    this.getFacility()
  },
  methods: {
    ...mapActions(['handleLogin', 'getUserInfo', 'getFacility', 'getImgData']),
    handleSubmit({ username, password }) {
      this.handleLogin({ username, password }).then(res => {
        if (res) {
          let role = res.data.role
            this.getUserInfo().then(res => {
              if(role != 0){
                 this.getImgData()
              }
            this.$router.push({
              name: this.$config.homeName
            })
          })
        }
      })
    }
  }
}
</script>

<style>
</style>
