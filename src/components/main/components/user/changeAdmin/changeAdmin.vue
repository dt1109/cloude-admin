<style lang="less" scoped>
.spanSize {
  font-size: 20px;
}
.title {
  width: 650px;
  height: 60px;
  margin: 20px auto 0;
  display: flex;
  justify-content: space-between;
  .box {
    p {
      text-align: center;
    }
    p:nth-child(1) {
      font-size: 17px;
      color: #272727;
    }
    p:nth-child(2) {
      font-size: 14px;
      color: #8d8d8d;
      text-align: left;
      text-indent: 37px;
      padding-top: 4px;
    }
    .wire:after {
      content: '';
      width: 160px;
      border-top: 1px solid #e8e8e8;
      display: inline-block;
      vertical-align: middle;
    }
    .wire:after {
      margin-left: 15px;
    }
    span {
      display: inline-block;
      text-align: center;
      line-height: 28px;
      border: 1px solid #333;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      font-size: 17px;
      color: #333;
    }
  }
}
.active {
  background-color: #1890ff !important;
  border: #1890ff !important;
  color: #fff !important;
}
.inputWidth {
  width: 240px;
}
.butStyle {
  width: 100px;
  margin-left: 10px;
}
.formBox {
  padding: 40px 0 60px;
  .right {
    width: 80px;
    height: 80px;
    display: block;
    margin: 0 auto 20px;
  }
  .right-p1 {
    text-align: center;
    font-size: 25px;
    font-weight: 700;
    padding-bottom: 10px;
  }
  .right-p2 {
    text-align: center;
    font-size: 14px;
    color: #8d8d8d;
    span {
      color: #8d8dff;
    }
  }
}
.next {
  width: 260px;
  display: block;
  margin: 30px auto 0;
}
.lastButStyle {
  width: 280px;
  height: 45px;
  display: block;
  margin: 30px auto 0;
  font-size: 20px;
}
</style>
<template>
  <div>
    <Modal v-model="changeAdmin"
           width="700"
           :mask-closable="false"
           footer-hide>
      <div slot="close"><span class="spanSize"
              @click="handleCancel()">×</span></div>
      <div class="title">
        <div class="box">
          <p class="wire"><span :class="active === 1 ? 'active' : '' ">1</span>&nbsp;&nbsp;步骤一</p>
          <p>验证负责人</p>
        </div>
        <div class="box">
          <p class="wire"><span :class="active === 2 ? 'active' : '' ">2</span>&nbsp;&nbsp;步骤二</p>
          <p>填写新负责人信息</p>
        </div>
        <div class="box">
          <p><span :class="active === 3 ? 'active' : '' ">3</span>&nbsp;&nbsp;步骤三</p>
          <p>更换完成</p>
        </div>
      </div>

      <div class="formBox"
           v-show="formNum === 1">
        <Form :label-width="190"
              :model="oldUse"
              ref="oldUse"
              :rules="oldPhone">
          <FormItem label="当前负责人：">
            {{this.$store.state.user.data.username}}
          </FormItem>
          <FormItem label="手机号："
                    prop="phone">
            <Input class="inputWidth"
                   v-model="oldUse.phone"
                   placeholder="请输入当前负责人的手机号！"></Input>
            <Button class='butStyle'
                    type="primary"
                    :disabled="!canClick"
                    @click="getCode">获取验证码</Button>
          </FormItem>
          <FormItem label="验证码："
                    prop="code">
            <Input class="inputWidth"
                   v-model="oldUse.code"
                   placeholder="请输入验证码！！！！"></Input>
            <Button class='butStyle'>{{timeText}}</Button>
          </FormItem>
          <Button class="next"
                  type="primary"
                  @click="next">下一步</Button>
        </Form>
      </div>

      <div class="formBox"
           v-show="formNum === 2">
        <Form :label-width="190"
              :model="newUse"
              ref="newUse"
              :rules="newPhone">
          <FormItem label="手机号："
                    prop="phone">
            <Input class="inputWidth"
                   v-model="newUse.phone"
                   @on-blur="getUserRight"
                   placeholder="请输入新负责人的手机号码！"></Input>
            <Button class='butStyle'
                    type="primary"
                    :disabled="!canNewClick"
                    @click="getNewCode">获取验证码</Button>
          </FormItem>
          <FormItem label="验证码："
                    prop="code">
            <Input class="inputWidth"
                   v-model="newUse.code"
                   placeholder="请输入验证码！"></Input>
            <Button class='butStyle'>{{timesText}}</Button>
          </FormItem>
          <Button class="next"
                  type="primary"
                  @click="confirm">确定</Button>
        </Form>
      </div>

      <div class="formBox"
           v-show="formNum === 3">
        <img class="right"
             :src="rightImg"
             alt="">
        <p class="right-p1">成功更换负责人</p>
        <p class="right-p2">负责人更换成功，点击确认后将退回登录界面，请使用新的负责人信息登录，<br><span>初始密码：为新负责人手机号码。</span></p>
        <Button class='lastButStyle'
                type="primary"
                @click="goLogin">确定</Button>
      </div>

    </Modal>
  </div>
</template>

<script>
import { isPhone } from '@/libs/tools'
import rightImg from '@/assets/images/right.png'
import { mapActions, mapMutations } from 'vuex'
import { teamSendMsgCode, teamChangePrincipal, memberJudge } from '@/api/data'
export default {
  name: 'changeAdmin',
  data() {
    let verify = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入手机号'))
      } else if (!isPhone(value)) {
        callback(new Error('手机号格式错误'))
      } else if (value !== this.$store.state.user.data.phone) {
        callback(new Error('当前负责人手机号有误'))
      } else {
        this.canClick = true
        callback()
      }
    }
    let newVerify = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入手机号'))
      } else if (!isPhone(value)) {
        callback(new Error('手机号格式错误'))
      } else if (this.newUse.phone === this.oldUse.phone) {
        callback(new Error('新负责人不能与旧负责人相同'))
      } else {
        callback()
      }
    }
    return {
      rightImg,
      changeAdmin: true,
      time: 60, // 老倒计时
      timeText: '有效时间',
      times: 60, // 新倒计时
      timesText: '有效时间', // 新倒计时
      active: 1,
      formNum: 1,
      oldUse: {
        phone: '',
        code: ''
      },
      newUse: {
        phone: '',
        code: ''
      },
      oldPhone: {
        phone: [{ required: true, validator: verify, trigger: 'blur' }],
        code: [{ required: true, message: '请输入验证码！', trigger: 'blur' }]
      },
      newPhone: {
        phone: [{ required: true, validator: newVerify, trigger: 'blur' }],
        code: [{ required: true, message: '请输入验证码！', trigger: 'blur' }]
      },
      codeNum: '', // 验证码
      canClick: false, // 获取验证码按钮状态
      canNewClick: false, // 获取验证码按钮状态
      userRight: ''
    }
  },
  mounted() {
    console.log(this.$store.state.user.data)
  },
  methods: {
    ...mapActions(['handleLogOut']),
    ...mapMutations(['setAccess', 'setToken']),
    /**
     * 老负责人获取验证码
     */
    getCode() {
      teamSendMsgCode(this.oldUse.phone).then(res => {
        if (res.code === 200) {
          this.codeNum = res.data
        } else {
        }
      })
      window.setInterval(() => {
        this.time--
        if (this.time <= 0) {
          this.canClick = true
          this.timeText = '再次获取'
        } else {
          // debugger
          this.canClick = false
          this.timeText = this.time + 's后重新发送'
        }
      }, 1000)
    },
    /**
     * 新负责人获取验证码
     */
    getNewCode() {
      teamSendMsgCode(this.newUse.phone).then(res => {
        if (res.code === 200) {
          this.codeNum = res.data
        } else {
        }
      })
      window.setInterval(() => {
        this.times--
        if (this.times <= 0) {
          this.canNewClick = true
          this.timesText = '再次获取'
        } else {
          this.canNewClick = false
          this.timesText = this.times + 's后重新发送'
        }
      }, 1000)
    },
    /**
     * 下一步
     */
    next() {
      if (this.canClick === true) {
       if (this.oldUse.phone == '') {
          this.$Message.warning('请输入手机号')
          return false
        } else {
          this.$Message.warning('请先获取验证码！')
          return false
        }
      }
      this.$refs.oldUse.validate(valid => {
        if (valid) {
          if (parseInt(this.oldUse.code) === parseInt(this.codeNum)) {
            this.active = this.formNum = 2
          } else {
            this.$Message.warning('验证码有误！')
          }
        }
      })
    },
    /**
     * 确定
     */
    confirm() {
      if (this.canNewClick === true) {
        if (this.newUse.phone == '') {
          this.$Message.warning('请输入手机号')
          return false
        } else {
          this.$Message.warning('请先获取验证码！')
          return false
        }
      }
      this.$refs.newUse.validate(valid => {
        if (valid) {
          if (parseInt(this.newUse.code) === parseInt(this.codeNum)) {
            teamChangePrincipal(this.newUse.phone, this.newUse.code).then(
              res => {
                if (res.code === 200) {
                  this.active = this.formNum = 3
                } else {
                }
              }
            )
          }
        }
      })
    },
    /**
     * 负责人修改成功 退回登录页
     */
    goLogin() {
      this.$emit('closeModel', 'principal')
      // this.$store.commit('setToken', '')
      // this.$store.commit('setAccess', [])
      this.setAccess([])
      this.setToken('')
      this.$router.push({
        name: 'login'
      })
      // this.handleLogOut().then(() => {
      //   this.$router.push({
      //     name: 'login'
      //   })
      // })
    },
    /**
     * 校验用户与负责人是否为同一团队
     */
    getUserRight() {
      if (this.newUse.phone !== '') {
        memberJudge(this.newUse.phone).then(res => {
          if (res.code === 200) {
            this.userRight = 200
            this.canNewClick = true
          } else {
            this.userRight = 500
          }
        })
      }
    },
    /**
     * 取消,清空输入框
     */
    handleCancel() {
      this.$emit('closeModel', 'principal')
    }
  }
}
</script>
