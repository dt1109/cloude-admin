
<style lang="less" scoped>
  .icon {
    cursor: pointer;
    font-size: 21px
  }
</style>
<template>
  <div>
    <Modal
        v-model="isShowModel"
        title="修改密码"
        :loading="modalLoding"
        @on-ok="handleSubmit"
        @on-cancel="handleCancel">
        <Form ref="addForm" :model="model" :rules="rules" :label-width="80">
          <FormItem label="原始密码" prop="oldPsw">
            <Input :type="formType.oldPsw" style="width:90%" v-model="model.oldPsw" placeholder="原始密码">
              <Icon @click="handleChange('oldPsw')" style="cursor: pointer;font-size: 21px" clss="icon" :type="formIcon.oldPsw" slot="suffix" />
            </Input>
          </FormItem>
          <FormItem label="新密码" prop="newPsw">
            <Input :type="formType.newPsw" style="width:90%" v-model="model.newPsw" placeholder="新密码">
              <Icon @click="handleChange('newPsw')" style="cursor: pointer;font-size: 21px" clss="icon" :type="formIcon.newPsw" slot="suffix" />
            </Input>
          </FormItem>
          <FormItem label="确认密码" prop="confirmPsw">
            <Input :type="formType.confirmPsw" style="width:90%" v-model="model.confirmPsw" placeholder="确认密码">
              <Icon @click="handleChange('confirmPsw')" style="cursor: pointer;font-size: 21px" clss="icon" :type="formIcon.confirmPsw" slot="suffix" />
            </Input>
          </FormItem>
        </Form>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'password',
  data () {
    let verify = (rule, value, callback) => {
      let verifyForm = e => {
        if (value === '') {
          callback(new Error(e))
        } else if (rule.field === 'confirmPsw' && value !== this.model.newPsw) {
          callback(new Error('新密码和确认密码不匹配'))
        } else {
          callback()
        }
      }
      switch (rule.field) {
        case 'oldPsw':
          verifyForm('请输入旧密码')
          break
        case 'newPsw':
          verifyForm('请输入新密码')
          break
        case 'confirmPsw':
          verifyForm('请输入确认密码')
          break
      }
    }
    return {
      isShowModel: true,
      modalLoding: true,
      model: {
        oldPsw: '', // 老密码
        newPsw: '', // 新密码
        confirmPsw: '' // 确认密码
      },
      formType: {
        oldPsw: 'password', // 老密码
        newPsw: 'password', // 新密码
        confirmPsw: 'password' // 确认密码
      },
      formIcon: {
        oldPsw: 'ios-eye-off', // 老密码
        newPsw: 'ios-eye-off', // 新密码
        confirmPsw: 'ios-eye-off' // 确认密码
      },
      rules: {
        oldPsw: [
          { required: true, validator: verify, trigger: 'blur' }
        ],
        newPsw: [
          { required: true, validator: verify, trigger: 'blur' }
        ],
        confirmPsw: [
          { required: true, validator: verify, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleCancel () { // 取消,清空输入框
      this.$emit('closeModel', 'psw')
    },
    changeLoading () { // 更改modal的loding状态
      this.modalLoding = false
      this.$nextTick(() => {
        this.modalLoding = true
      })
    },
    handleSubmit () { // 提交
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          this.$emit('submit', this.model)
          this.$emit('closeModel', 'psw')
        } else {
          this.changeLoading()
        }
      })
    },
    handleChange (val) { // 切换表单type属性
      this.formType[val] = this.formType[val] === 'password' ? 'text' : 'password'
      this.formIcon[val] = this.formIcon[val] === 'ios-eye' ? 'ios-eye-off' : 'ios-eye'
    }
  }
}
</script>
