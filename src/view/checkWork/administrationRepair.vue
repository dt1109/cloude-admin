<template>
  <div>
    <private-table class="m-t-35" :columnsList="tableColumns" :dataTable="dataTable"
                   :border="border" :pageHide=true></private-table>
    <Modal
      width="600"
      v-model="modal"
      title="修改补卡规则"
      @on-ok="changeAdd(formItem)"
      @on-cancel="cancelAdd(formItem)"
      :loading="modalLoading"
    >
      <Form
        :model="formItem"
        :ref="formItem"
        :label-width="120"
      >
        <FormItem label="允许补卡">
          <Checkbox v-model="formItem.supplementEnable">开启/关闭</Checkbox>
        </FormItem>
        <div v-if="formItem.supplementEnable">
          <FormItem label="限制补卡次数">
            <Checkbox v-model="monthNum" @on-change="monthNumFun">每月可提交</Checkbox>
            <Input :disabled="!monthNum" :maxlength='numberList' v-model="formItem.supplementMonthTimesLimit" style="width: 30px" size="small" />次补卡（按自然月计算）
          </FormItem>
          <FormItem label="限制补卡时间">
            <Checkbox v-model="timeNum" @on-change="timeNumFun">可申请过去</Checkbox>
            <Input :disabled="!timeNum" :maxlength='numberList' v-model="formItem.supplementPassDaysLimit" style="width: 30px" size="small" />天内补卡（填写0天则只能发起当天的补卡）
          </FormItem>
        </div>
      </Form>
    </Modal>
  </div>
</template>

<script>
import { supplementSave,getSupplement } from '@/api/data'
export default {
  name: 'administrationRepair',
  data () {
    return {
      border: true,
      modal: false,
      monthNum: false, // 限制补卡次数
      timeNum: false, // 限制补卡时间
      modalLoading: true,
      numberList: 2, // 输入框最大字数
      formItem: {
        supplementMonthTimesLimit: '',
        supplementPassDaysLimit: '',
        supplementEnable: false
      },
      tableColumns: [
        { title: '名称', key: 'name', align: 'center' },
        { title: '规则内容', key: 'content', align: 'center' },
        { title: '应用范围', key: 'range', align: 'center' },
        { title: '操作',
          key: '4',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('Button', { props: { type: 'primary', size: 'small' }, on: { click: () => { this.modal = true } } }, '编辑'
            )
          } }
      ],
      dataTable: {}
    }
  },
  mounted () {
    this.getList()
  },
  methods: {
    // 清空表单
    closeForm () {
      this.formItem.number = ''
      this.formItem.days = ''
      this.formItem.single = false
      this.formItem.single1 = false
      this.formItem.single1 = false
    },
    messageWarningFn (text) {
      this.$Message.warning(text)
      setTimeout(() => {
        this.modalLoading = false
        this.$nextTick(() => {
          this.modalLoading = true
        })
      }, 500)
    },
    monthNumFun (val) {
      if (!val) {
        this.formItem.supplementMonthTimesLimit = ''
      }
    },
    timeNumFun (val) {
      if (!val) {
        this.formItem.supplementPassDaysLimit = ''
      }
    },
    // 确定提交规则
    changeAdd (name) {
      let integerReg = /^[0-9]*[1-9][0-9]*$/
      let integerRegZhengzhengshu = /^([1-9]\d*|[0]{1,1})$/
      if (this.formItem.supplementEnable) {
        if (this.monthNum === true) {
          if (this.formItem.supplementMonthTimesLimit === '') {
            this.messageWarningFn('请填写每月可补卡次数！')
            return false
          }
          if (!integerReg.test(this.formItem.supplementMonthTimesLimit)) {
            this.messageWarningFn('每月可补卡次数必须为正整数！')
            return false
          }
        }
        if (this.timeNum === true) {
          if (this.formItem.supplementPassDaysLimit === '') {
            this.messageWarningFn('请填写可补卡天数！')
            return false
          }
          if (!integerRegZhengzhengshu.test(this.formItem.supplementPassDaysLimit)) {
            this.messageWarningFn('补卡天数必须为正整数！')
            return false
          }
        }
      }
      supplementSave({
        supplementEnable: this.formItem.supplementEnable,
        supplementMonthTimesLimit: this.formItem.supplementMonthTimesLimit,
        supplementPassDaysLimit: this.formItem.supplementPassDaysLimit
      }).then(res => {
        if (res.code === 200) {
          this.$Message.success(res.message)
          this.closeForm()
          this.modal = false
        }
      })
    },
    // 取消、清空表格
    cancelAdd (name) {
      this.closeForm()
    },
    getList () {
      getSupplement().then(res => {
        if (res.code === 200) {
          this.formItem = {
            supplementMonthTimesLimit: res.data.supplementMonthTimesLimit,
            supplementPassDaysLimit: res.data.supplementPassDaysLimit,
            supplementEnable: res.data.supplementEnable
          }
          if (res.data.supplementMonthTimesLimit !== null || res.data.supplementMonthTimesLimit !== '') {
            this.monthNum = true
          }
          if (res.data.supplementPassDaysLimit !== null || res.data.supplementPassDaysLimit !== '') {
            this.timeNum = true
          }
        }
      })
      this.dataTable = {
        list: [{ name: '默认规则', content: '允许补卡', range: '全公司' }],
        page: { totalCount: 100, pageSize: 10, currentPage: 1 }
      }
    }
  }
}
</script>

<style scoped>

</style>
