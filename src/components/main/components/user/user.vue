<style scoped>
.userSpan {
  font-size: 13px;
  padding: 0 13px;
}
</style>
<template>
  <div class="user-avatar-dropdown">
    <Dropdown @on-click="handleClick">
      <span class="userSpan">{{ this.$store.state.user.data.teamName }}</span>
      <Badge :dot="!!messageUnreadCount">
        <Avatar :src="userAvatar" />
      </Badge>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <span class="userSpan">{{ this.$store.state.user.data.username }} </span>
      <DropdownMenu slot="list">
        <DropdownItem name="change-password">修改密码</DropdownItem>
        <!--<DropdownItem name="replace-principal">修改个人信息</DropdownItem>-->
        <!--<DropdownItem name="replace-admin">更换负责人</DropdownItem>-->
        <!--<DropdownItem name="team-message">团队信息</DropdownItem>-->
        <!--<DropdownItem name="tab-team">切换团队</DropdownItem>-->
        <DropdownItem v-if="viewAccessSuper" name="replace-principal"
          >修改个人信息</DropdownItem
        >
        <DropdownItem v-if="viewAccessSuper" name="replace-admin"
          >更换负责人</DropdownItem
        >
        <DropdownItem v-if="viewAccessSuper" name="team-message"
          >团队信息</DropdownItem
        >
        <DropdownItem v-if="viewAccessSuper" name="tab-team"
          >切换团队</DropdownItem
        >
        <!-- <DropdownItem name="message">
          消息中心<Badge style="margin-left: 10px" :count="messageUnreadCount"></Badge>
        </DropdownItem> -->
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <passWord
      v-if="showModel.psw"
      @submit="changePsw"
      @closeModel="closeModel"
    ></passWord>
    <principal-modal
      v-if="showModel.adminMessage"
      @changeUser="userMessage"
      @closeModel="closeModel"
    ></principal-modal>
    <teamMessage
      v-if="showModel.showTeamMessage"
      @teamMessage="teamMessage"
      @closeTeam="closeTeam"
      @closeModel="closeModel"
    ></teamMessage>
    <changeAdmin
      v-if="showModel.principal"
      @closeModel="closeModel"
    ></changeAdmin>
  </div>
</template>

<script>
import './user.less'
import { hasOneOf } from '@/libs/tools'
import passWord from './password'
import principalModal from './principal'
import teamMessage from './teamMessage/teamMessage'
import changeAdmin from './changeAdmin/changeAdmin'
import { mapActions } from 'vuex'
import {
  adminUpdatePassword,
  teamUpdateUser,
  teamAddOrEdit,
  teamDissolve
} from '@/api/data'
export default {
  name: 'User',
  props: {
    userAvatar: {
      type: String,
      default: ''
    },
    messageUnreadCount: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      teamList: [], // 部门级联数据
      userTeamList: [], // 所属部门级联数据
      showModel: {
        psw: false, // 是否显示密码框
        adminMessage: false, // 是否显示修改个人信息
        principal: false, // 是否显示负责人
        showTeamMessage: false // 是否显示团队信息
      }
    }
  },
  components: {
    passWord,
    principalModal,
    teamMessage,
    changeAdmin
  },
  mounted () {},
  computed: {
    access () {
      return this.$store.state.user.access
    },
    viewAccessSuper () {
      return hasOneOf([1], this.access)
    }
  },
  methods: {
    ...mapActions(['handleLogOut']),
    logout () {
      this.handleLogOut().then(() => {
        this.$router.push({
          name: 'login'
        })
      })
    },
    /**
     * 关闭model
     * @param {String} -val psw: 密码框 principal：负责人 teamMessage: 团队信息 team: 切换团队
     * */
    closeModel (val) {
      this.showModel[val] = false
    },
    changePsw (val) {
      // 更改密码
      adminUpdatePassword(val.oldPsw, val.newPsw).then(res => {
        if (res.code === 200) {
          this.logout()
          this.$Message.success(res.message)
        }
      })
    },
    /**
     * 更改个人信息
     */
    userMessage (val) {
      val.dpId = val.dpId[val.dpId.length - 1]
      val.dpIds = val.dpIds[val.dpIds.length - 1]
      val.userId = this.$store.state.user.data.userId
      teamUpdateUser(val).then(res => {
        if (res.code === 200) {
          this.$Message.success(res.message)
        }
      })
    },
    /**
     * 团队信息修改
     * @param data
     */
    teamMessage (data) {
      // 团队信息
      let obj = { id: this.$store.state.user.data.teamId }
      let form = Object.assign({}, data, obj)
      delete form.cityAddress
      teamAddOrEdit(form).then(res => {
        if (res.code === 200) {
          this.$Message.success(res.message)
        }
      })
    },
    /**
     * 解散团队
     */
    closeTeam () {
      let data = this.$store.state.user.data
      data.teamName = ''
      data.positionType = 3
      this.$store.commit('data', data)
      this.$store.commit('setAccess', [3])
      this.$router.push({ name: 'management' })
      this.$Message.info({
        content: '进入任意后台管理进行操作',
        duration: 4,
        closable: true
      })
      teamDissolve(this.$store.state.user.data.teamId).then(res => {
        if (res.code === 200) {
          window.location.reload()
          this.$Message.success(res.message)
        }
      })
    },
    tabTeam () {
      // 切换团队
      this.$router.push({ name: 'management' })
    },
    message () {
      this.$router.push({
        name: 'message_page'
      })
    },
    handleClick (name) {
      switch (name) {
        case 'change-password':
          this.showModel.psw = true
          break
        case 'replace-principal':
          this.showModel.adminMessage = true
          break
        case 'replace-admin':
          this.showModel.principal = true
          break
        case 'team-message':
          this.showModel.showTeamMessage = true
          break
        case 'tab-team':
          this.tabTeam()
          break
        case 'logout':
          this.logout()
          break
      }
    }
  }
}
</script>
