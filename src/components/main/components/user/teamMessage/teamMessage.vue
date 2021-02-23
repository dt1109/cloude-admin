<template>
  <div>
    <Modal title="团队信息"
           v-model="showTeamMessage"
           :loading="modalLoding"
           :mask-closable="false"
           footer-hide>
      <div slot="close">
        <span class="closeSize"
              @click="handleCancel(formData)">×</span>
      </div>
      <Form :label-width="90"
            :model="formData"
            :ref="formData"
            :rules="rules">
        <FormItem label="团队名称："
                  prop="teamName">
          <Input style="width: 90%"
                 v-model="formData.teamName"
                 placeholder="请输入团队名称"></Input>
        </FormItem>
        <FormItem label="所在行业："
                  prop="profession">
          <Input style="width: 90%"
                 v-model="formData.profession"
                 placeholder="请输入所在行业"></Input>
        </FormItem>
        <FormItem label="公司规模："
                  prop="teamScale">
          <Select style="width:90%"
                  v-model="formData.teamScale"
                  placeholder="请选择公司规模"
                  v-if="this.formData.teamScale">
            <Option v-for="item in scale"
                    :value="item.value"
                    :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="所在地区："
                  prop="cityAddress">
          <Cascader style="width:90%"
                    :render-format="format"
                    :data="departmentPeo"
                    v-model="formData.cityAddress"
                    placeholder="请选择所在地区"></Cascader>
        </FormItem>
      </Form>
      <Button class="btnSize"
              type="primary"
              @click="handleSubmit(formData)">编辑保存</Button>
      <Button class="btnSize"
              @click="closeTeam">解散团队</Button>
    </Modal>
  </div>
</template>

<script>
import { getCityList, teamGetTeamInfo } from '@/api/data'
export default {
  name: 'teamMessage',
  data () {
    return {
      modalLoding: true,
      showTeamMessage: true, // 弹窗显示
      departmentPeo: [], // 城市级联数据
      formData: {
        teamName: '',
        profession: '',
        teamScale: '',
        address: '',
        cityAddress: []
      },
      rules: {
        teamName: [
          { required: true, message: '请输入团队名称！', trigger: 'blur' }
        ],
        profession: [
          { required: true, message: '请输入所在行业！', trigger: 'blur' }
        ],
        teamScale: [{ required: true, message: '请选择团队规模！' }],
        cityAddress: [
          {
            type: 'array',
            min: 1,
            required: true,
            message: '请选择所在地区！',
            trigger: 'change'
          }
        ]
      },
      scale: [
        {
          label: '0-50',
          value: 1
        },
        {
          label: '51-100',
          value: 2
        },
        {
          label: '101-200',
          value: 3
        },
        {
          label: '201-500',
          value: 4
        },
        {
          label: '500以上',
          value: 5
        }
      ]
    }
  },

  mounted () {
    this.cityList()
  },
  methods: {
    /**
     * 确定、验证表单
     */
    handleSubmit (name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.formData.address = this.formData.cityAddress[
            this.formData.cityAddress.length - 1
          ]
          delete this.formData.cityAddress
          this.$emit('teamMessage', this.formData)
          this.$emit('closeModel', 'showTeamMessage')
        } else {
          this.changeLoading('请刷新重试！')
        }
      })
    },
    /**
     * 解散团队
     */
    closeTeam () {
      this.$Modal.confirm({
        title: '您是否确认解散团队:',
        content: this.$store.state.user.data.teamName,
        onOk: () => {
          this.$emit('closeTeam')
          this.$emit('closeModel', 'showTeamMessage')
        }
      })
    },
    /**
     * 取消,清空输入框
     */
    handleCancel () {
      this.$emit('closeModel', 'showTeamMessage')
    },
    /**
     * 更改modal的loding状态
     */
    changeLoading () {
      this.modalLoding = false
      this.$nextTick(() => {
        this.modalLoding = true
      })
    },
    /**
     * 获取城市级联
     */
    cityList () {
      getCityList().then(res => {
        var obj = res.data
        var arr = []
        for (let i in obj) {
          var city = { value: i, label: i, children: [] }
          for (let o in obj[i]) {
            city.children.push({
              value: obj[i][o].name,
              label: obj[i][o].name
            })
          }
          arr.push(city)
          teamGetTeamInfo().then(res => {
            this.formData.teamName = res.data.teamName
            this.formData.profession = res.data.profession
            this.formData.teamScale = res.data.teamScale
            let city = res.data.address
            for (let w = 0; w < arr.length; w++) {
              for (let q = 0; q < arr[w].children.length; q++) {
                if (arr[w].children[q].value === city) {
                  this.formData.cityAddress = [
                    arr[w].value,
                    arr[w].children[q].value
                  ]
                }
              }
            }
          })
        }
        this.departmentPeo = arr
      })
    },
    /**
     * 自定义城市显示
     * @param labels
     * @param selectedData
     * @returns {*}
     */
    format (labels, selectedData) {
      if (selectedData.length > 0) {
        return selectedData[selectedData.length - 1].label
      }
    }
  }
}
</script>

<style scoped>
.closeSize {
  font-size: 20px;
}
.btnSize {
  display: block;
  width: 200px;
  margin: 15px auto;
}
</style>
