<template>
  <div>
    <Row :gutter="2">
      <Col :md="20" :lg="5" :xl="4" :xxl="3">
        <DatePicker v-model="searchData.selectTime" type="daterange" placeholder="设备绑定时间" class="maTop"></DatePicker>
      </Col>
      <Col :md="20" :lg="5" :xl="4" :xxl="3">
        <Input v-model="searchData.facilityNumber" clearable placeholder="设备编号" class="maTop" />
      </Col>
      <Col :md="5" :lg="2" :xl="2" :xxl="1">
        <Button @click="_search" type="primary" class="maTop">搜索</Button>
      </Col>
      <Col :md="5" :lg="2" :xl="2" :xxl="1">
        <Button @click="modalFacility = true" type="primary" class="maTop">新增</Button>
      </Col>
      <Col :md="5" :lg="2" :xl="2" :xxl="1">
        <Button type="primary" class="maTop" @click="handleExport"><Icon type="ios-download-outline"></Icon>导出</Button>
      </Col>
    </Row>

    <private-table  :exportHide="tableName"
                    :border=true @sizeChange="sizeChange" @getPageData="getPageData" class="m-t-35" :columnsList="tableColumns" :dataTable="dataTable"></private-table>
    <Modal
      title="新增设备"
      width="500"
      v-model="modalFacility"
      @on-cancel="facilityAddHide"
    >
      <Form
        :model="facilityForm"
        :label-width="100"
      >
        <FormItem label="设备编号"><Input v-model="facilityForm.facilityNumber" /></FormItem>
      </Form>
      <div slot="footer">
        <Button @click="facilityAddHide">取消</Button>
        <Button type="primary" :loading="modalLoading" @click="facilityAdd">确定</Button>
      </div>
    </Modal>
    <Modal
      title="密码修改"
      width="500"
      v-model="modalPassword"
    >
      <Form
        :ref="passwordForm"
        :model="passwordForm"
        :label-width="100"
        :rules="formVerify"
      >
        <FormItem label="原始密码">
          <Input :type="typePassword" disabled autocomplete="new-password" @on-click="changEye" :icon="mdEye" v-model="passwordForm.oldPassword" />
        </FormItem>
        <FormItem label="新密码" prop="newPassword">
          <Input type="password" autocomplete="new-password" v-model="passwordForm.newPassword" />
        </FormItem>
        <FormItem label="确认密码" prop="newPasswordRe">
          <Input type="password" autocomplete="new-password" v-model="passwordForm.newPasswordRe" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="passwordClose(passwordForm)">取消</Button>
        <Button type="primary" :loading="modalLoading" @click="passwordChange(passwordForm)">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { dateFormat } from '../../components/common_fun'
import { downloadXlex } from '@/libs/tools'
import { facilityList, facilityAdd, facilityChangePassword } from '@/api/data'
export default {
  name: 'administrationEquipment',
  data () {
    var ref = this
    const pwdValidate = (rule, value, callback) => {
      if (ref.passwordForm.newPassword === '') {
        callback(new Error('确认密码不能为空'))
      }
      callback()
    }
    const pwdCheckValidate = (rule, value, callback) => {
      if (ref.passwordForm.newPassword !== '' && value === '') {
        callback(new Error('确认密码不能为空'))
      } else if (ref.passwordForm.newPassword !== value) {
        callback(new Error('新密码和确认密码应相同'))
      } else {
        callback()
      }
    }
    return {
      modalLoading: false,
      tableName: '考勤设备', // 导出
      typePassword: 'text', // 原始密码显示状态
      modalFacility: false, // 添加设备 框
      modalPassword: false, // 修改密码 框
      passwordForm: { // 密码修改内容
        id: '',
        oldPassword: '',
        newPassword: '',
        newPasswordRe: ''
      },
      formVerify: { // 忘记密码验证
        newPassword: [
          { required: false, validator: pwdValidate, trigger: 'blur' }
        ],
        newPasswordRe: [
          { required: false, validator: pwdCheckValidate, trigger: 'blur' }
        ]
      },
      facilityForm: { // 设备编号
        facilityNumber: ''
      },
      mdEye: 'md-eye', // 密码输入框 icon状态
      searchData: { // 搜索框
        selectTime: '',
        facilityNumber: '',
        endTime: '',
        startTime: ''
      },
      tableColumns: [
        { title: '编号', key: 'id', align: 'center' },
        { title: '设备编号', key: 'facilityNum', align: 'center' },
        { title: '绑定时间', key: 'createTime', align: 'center' },
        { title: '操作',
          key: '4',
          width: 250,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', { props: { type: 'primary', size: 'small' },
                on: { click: () => {
                  this.goUsers(params.row)
                } } }, '查看打卡人员'),
              h('span', {
                style: {
                  marginRight: '10px',
                  marginLeft: '10px',
                  fontSize: '18px',
                  color: '#ccc',
                  verticalAlign: 'middle'
                }
              }, '|'),
              h('Button', { props: { type: 'primary', size: 'small' },
                on: { click: () => {
                  this.modalPassword = true
                  this.passwordForm.id = params.row.id
                  this.passwordForm.oldPassword = params.row.password
                } } }, '修改设备管理密码')
            ])
          } }
      ],
      dataTable: {},
      page: {
        totalCount: '', // 总页数
        pageSize: 20, // 每页条数
        currentPage: 1 // 分页页数
      }
    }
  },
  mounted () {
    this.getList({})
  },
  methods: {
    // 搜索
    _search () {
      let startTime = dateFormat(this.searchData.selectTime[0])
      let endTime = dateFormat(this.searchData.selectTime[1])
      let facilityNum = this.searchData.facilityNumber
      let data = { startTime: startTime, endTime: endTime, facilityNum: facilityNum }
      this.getList(data)
    },
    changEye () { // 改变密码输入框 icon
      if (this.mdEye === 'md-eye') {
        this.mdEye = 'md-eye-off'
        this.typePassword = 'password'
      } else {
        this.mdEye = 'md-eye'
        this.typePassword = 'text'
      }
    },
    // 获取列表
    getList (data) {
      facilityList(this.page.currentPage, this.page.pageSize, data).then(res => {
        this.page.totalCount = res.data.total
        this.dataTable = {
          list: res.data.records,
          page: this.page
        }
      })
    },
    // 添加设备
    facilityAdd () {
      if (this.facilityForm.facilityNumber === '') {
        this.$Message.warning('设备编号不能为空！')
        return false
      }
      this.modalLoading = true
      facilityAdd({ facilityNum: this.facilityForm.facilityNumber }).then(res => {
        if (res.code === 200) {
          this.facilityForm.facilityNumber = ''
          this.modalLoading = false
          this.modalFacility = false
          this.getList({})
          this.$Message.success(res.message)
        } else {
          this.modalLoading = false
        }
      })
    },
    /**
     * 查看打卡人员
     */
    goUsers (data) {
      this.$store.commit('facilityNum', data.facilityNum)
      this.$router.push({ name: 'administrationStatistics' })
    },
    facilityAddHide () {
      this.modalFacility = false
      this.facilityForm.facilityNumber = ''
    },
    // 密码修改提交
    passwordChange (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.modalLoading = true
          let data = this.passwordForm
          facilityChangePassword(data).then(res => {
            if (res.code === 200) {
              this.$Message.success(res.message)
              this.modalPassword = false
              this.modalLoading = false
              this.$refs[name].resetFields()
            } else {
              this.modalLoading = false
            }
          })
        } else {}
      })
    },
    // 取消密码修改
    passwordClose (name) {
      this.modalPassword = false
      this.$refs[name].resetFields()
      Object.keys(this.passwordForm).map(key => this.passwordForm[key] = '')
    },
    /**
     * 每页条数
     */
    sizeChange (val) {
      this.page.pageSize = val
      let startTime = dateFormat(this.searchData.selectTime[0])
      let endTime = dateFormat(this.searchData.selectTime[1])
      let facilityNum = this.searchData.facilityNumber
      let data = { startTime: startTime, endTime: endTime, facilityNum: facilityNum }
      this.getList(data)
    },
    /**
     * 分页页数
     */
    getPageData (val) {
      this.page.currentPage = val
      let startTime = dateFormat(this.searchData.selectTime[0])
      let endTime = dateFormat(this.searchData.selectTime[1])
      let facilityNum = this.searchData.facilityNumber
      let data = { startTime: startTime, endTime: endTime, facilityNum: facilityNum }
      this.getList(data)
    },
    /**
     * 导出
     */
    handleExport () {
      facilityList(1, this.page.totalCount, {}).then(res => {
        if (res.code === 200) {
          this.handleExportData = {
            title: ['编号', '设备编号', '绑定时间'],
            key: ['id', 'facilityNum', 'createTime'],
            data: res.data.records,
            autoWidth: true,
            filename: '考勤设备列表'
          }
          downloadXlex(this.handleExportData)
        }
      })
    }
  }
}
</script>

<style scoped>
  .maTop{
    margin-top: 10px;
    margin-left: 10px;
  }
</style>
