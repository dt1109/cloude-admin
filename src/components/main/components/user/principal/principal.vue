<style lang="less" scoped>
.icon {
  cursor: pointer;
  font-size: 21px;
}
</style>
<template>
  <div>
    <Modal
      v-model="adminMessage"
      title="修改个人信息"
      :loading="modalLoding"
      @on-ok="handleSubmit(formData)"
      @on-cancel="handleCancel(formData)"
    >
      <Form :ref="formData" :model="formData" :rules="rules" :label-width="80">
        <FormItem label="姓名" prop="username">
          <Input style="width:90%" v-model="formData.username" placeholder="请输入姓名"></Input>
        </FormItem>
        <FormItem label="联系电话" prop="phone">
          <Input style="width:90%" v-model="formData.phone" placeholder="请输入联系电话" disabled></Input>
        </FormItem>
        <FormItem label="邮箱">
          <Input style="width:90%" v-model="formData.email" placeholder="请输入邮箱"></Input>
        </FormItem>
        <FormItem label="职务" prop="positionName">
          <Input style="width:90%" disabled v-model="formData.positionName" placeholder="请输入职务"></Input>
        </FormItem>
        <FormItem label="所属部门">
          <Cascader
            style="width:90%"
            :data="userTeamList"
            change-on-select
            v-model="formData.dpId"
            placeholder="请选择所属部门"
          ></Cascader>
        </FormItem>
        <FormItem label="管理权限" prop="dpIds">
          <Cascader
            style="width:90%"
            :data="teamList"
            change-on-select
            v-model="formData.dpIds"
            placeholder="请选择管理部门"
            disabled
          ></Cascader>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import { isPhone } from '@/libs/tools'
import { departMenu, managerEdit } from '@/api/data'
import { mapActions } from 'vuex'
export default {
  name: 'password',
  props: [],
  data() {
    let verify = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入手机号'))
      } else if (!isPhone(value)) {
        callback(new Error('手机号格式错误'))
      } else {
        callback()
      }
    }
    return {
      teamList: [],
      userTeamList: [],
      dpArrAdmin: [], // 选择的所属部门
      adminTeam: [], // 选择的管理部门
      select: {
        department: [],
        role: []
      },
      model: {
        // form数据
        username: '',
        phone: '',
        email: '',
        positionName: '',
        dpId: '',
        dpIds: ''
      },
      formData: {
        username: '',
        phone: '',
        email: '',
        positionName: '',
        dpId: [],
        dpIds: []
      },
      rules: {
        username: [
          { required: true, message: '请输入姓名！', trigger: 'blur' }
        ],
        phone: [{ required: true, validator: verify, trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱！', trigger: 'blur' }],
        positionName: [
          { required: true, message: '请输入职务！', trigger: 'blur' }
        ],
        dpId: [
          {
            type: 'array',
            min: 1,
            required: true,
            message: '请选择管理员！',
            trigger: 'change'
          }
        ],
        dpIds: [
          {
            type: 'array',
            min: 1,
            required: true,
            message: '请选择管理员！',
            trigger: 'change'
          }
        ]
      },
      adminMessage: true,
      modalLoding: true
    }
  },
  mounted() {
    this.getGarp()
    this.getUser()
  },
  methods: {
    ...mapActions(['getUserInfo']),
    handleCancel() {
      // 取消,清空输入框
      this.$emit('closeModel', 'adminMessage')
    },
    changeLoading() {
      // 更改modal的loding状态
      this.modalLoding = false
      this.$nextTick(() => {
        this.modalLoding = true
      })
    },
    handleSubmit(name) {
      // 提交
      this.$refs[name].validate(valid => {
        if (valid) {
          JSON.parse(JSON.stringify(this.formData.dpId))
          this.formData.dpId.toString()
          this.$emit('changeUser', this.formData)
          this.$emit('closeModel', 'adminMessage')
        } else {
          this.changeLoading('请刷新重试！')
        }
      })
    },
    handleChange(val) {
      // 切换表单type属性
      this.formType[val] =
        this.formType[val] === 'password' ? 'text' : 'password'
      this.formIcon[val] =
        this.formIcon[val] === 'ios-eye' ? 'ios-eye-off' : 'ios-eye'
    },
    /**
     * 回显用户个人信息
     */
    getUser() {
      this.getUserInfo().then(res => {
        console.log(res)

        // console.log(this.$store.state.user.data)
        let data = res
        this.formData.username = data.username
        this.formData.phone = data.phone
        this.formData.email = data.email
        this.formData.positionName = data.positionName
        managerEdit({ dpId: data.dpId, dpIds: data.dpIds }).then(res => {
          if (res.code === 200) {
            let arr = []
            if (res.data.memberList.length > 0) {
              for (let i = 0; i < res.data.memberList.length; i++) {
                if (res.data.memberList[i] === null) {
                  arr.push(res.data.memberList[i])
                } else {
                  arr.push(res.data.memberList[i].toString())
                }
              }
            }
            console.log(arr)
            console.log(res.data.managerList)
            this.formData.dpId = arr
            this.formData.dpIds = res.data.managerList
          }
        })
      })
    },
    /**
     * 获取部门下拉
     */
    getGarp() {
      departMenu({}).then(res => {
        this.teamList = JSON.parse(JSON.stringify(res.data)) // 深复制
        this.teamList.push({ value: 'all', label: '全部' })
        this.userTeamList = JSON.parse(JSON.stringify(res.data)) // 深复制
      })
    }
  }
}
</script>
