<style scoped>
img {
  width: 100%;
}
.itemInfo {
  line-height: 30px;
  margin-left: 10px;
  font-size: 20px;
}
.titleInfo {
  font-size: 16px;
  color: #666;
}
</style>

<template>
  <div>
    <div style="padding:5px 3px" v-if="percentshow">
     <Progress :percent="percent" />
    </div>
    <Form inline>
      <FormItem>
        <DatePicker v-model="selectTime" type="daterange" placeholder="考勤时间"></DatePicker>
      </FormItem>
      <FormItem>
        <Cascader
          @on-change="teamChange"
          :data="departmentPeo"
          v-model="model1"
          placeholder="部门/人员"
        ></Cascader>
      </FormItem>
      <FormItem>
        <Button @click="_search" type="primary">搜索</Button>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleExport">
          <Icon type="ios-download-outline"></Icon>导出
        </Button>
      </FormItem>
    </Form>
    <private-table
      :border="border"
      @sizeChange="sizeChange"
      class="m-t-35"
      :columnsList="tableColumns"
      :dataTable="dataTable"
      @getPageData="getPageData"
    ></private-table>
    <Modal width="800" v-model="modal1" :title="modalData.title">
      <Row>
        <Col span="2">
          <img :src="modalData.imgUrl" alt />
        </Col>
        <Col span="4" class="itemInfo">
          <p class="name">{{modalData.name}}</p>
          <p class="titleInfo">{{modalData.titleInfo}}</p>
        </Col>
      </Row>
      <Row>
        <Col span="20">{{modalData.record}}</Col>
      </Row>
      <private-table
        @sizeChange="sizeChange"
        class="m-t-35"
        :columnsList="tableColumns"
        :dataTable="dataTable"
        @getPageData="getPageData"
      ></private-table>
    </Modal>

    <approvalModal :typeData="typeData" :modelType="modelType" @closeModal="closeModal"></approvalModal>
  </div>
</template>

<script>
import { dateFormat } from '../../components/common_fun'
import approvalModal from '../../components/approval-modal'
import { downloadXlex } from '@/libs/tools'
import { checkingDayStatistics, departCascade, approveGet } from '@/api/data'
export default {
  name: 'administrationStatistics',
  components: {
    approvalModal
  },
  data() {
    if (this.$store.state.user.facilityNum === '') {
      this.facilityNum = ''
    } else {
      this.facilityNum = this.$store.state.user.facilityNum
    }
    return {
      percent: 0,
      percentshow:false,
      typeData: {},
      modelType: false,
      border: true,
      modal1: false,
      departmentPeo: [], // 部门、人员
      modalData: {
        title: '111',
        itemList: [],
        name: '张三',
        titleInfo: '考勤组',
        record: '今日打卡N次，共计N分钟',
        imgUrl:
          'https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png'
      },
      tableColumns: [],
      tableColumns1: [
        {
          title: '姓名',
          key: 'username',
          fixed: 'left',
          align: 'center',
          minWidth: 110
        },
        {
          title: '部门',
          key: 'departmentName',
          align: 'center',
          minWidth: 110
        },
        { title: '职位', key: 'positionName', align: 'center', minWidth: 110 },
        {
          title: '日期',
          key: 'checkingTime',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            let weekDay = [
              '星期天',
              '星期一',
              '星期二',
              '星期三',
              '星期四',
              '星期五',
              '星期六'
            ]
            let myDate = new Date(Date.parse(params.row.checkingTime))
            let t = params.row.checkingTime.substr(0, 10)
            return h('div', t + weekDay[myDate.getDay()])
          }
        },
        { title: '班次', key: 'classesName', align: 'center', minWidth: 110 },
        {
          title: '上班1',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'amcheckingTime1',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'amstatus1',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'amfacilityNum1',
          align: 'center',
          minWidth: 150
        },
        {
          title: '下班1',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'pmcheckingTime1',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'pmstatus1',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'pmfacilityNum1',
          align: 'center',
          minWidth: 150
        },
        {
          title: '关联审批',
          key: 'startList',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            let arr = []
            for (let i = 0; i < params.row.applyApproves.length; i++) {
              let num = parseInt(i) + 1
              arr.push(
                h(
                  'Button',
                  {
                    props: { type: 'primary', size: 'small' },
                    style: { marginLeft: '5px' },
                    on: {
                      click: () => {
                        this.approveIdStart(params, i)
                      }
                    }
                  },
                  '审批' + num
                )
              )
            }
            return h('div', arr)
          }
        }
      ],
      tableColumns2: [
        {
          title: '姓名',
          key: 'username',
          fixed: 'left',
          align: 'center',
          minWidth: 110
        },
        {
          title: '部门',
          key: 'departmentName',
          align: 'center',
          minWidth: 110
        },
        { title: '职位', key: 'positionName', align: 'center', minWidth: 110 },
        { title: '日期', key: 'checkingTime', align: 'center', minWidth: 160 },
        { title: '班次', key: 'classesName', align: 'center', minWidth: 110 },
        {
          title: '上班1',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'amcheckingTime1',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'amstatus1',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'amfacilityNum1',
          align: 'center',
          minWidth: 150
        },
        {
          title: '下班1',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'pmcheckingTime1',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'pmstatus1',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'pmfacilityNum1',
          align: 'center',
          minWidth: 150
        },
        {
          title: '上班2',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'amcheckingTime2',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'amstatus2',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'amfacilityNum2',
          align: 'center',
          minWidth: 150
        },
        {
          title: '下班2',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'pmcheckingTime2',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'pmstatus2',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'pmfacilityNum2',
          align: 'center',
          minWidth: 150
        },
        {
          title: '关联审批',
          key: '12',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            let arr = []
            for (let i = 0; i < params.row.applyApproves.length; i++) {
              let num = parseInt(i) + 1
              arr.push(
                h(
                  'Button',
                  {
                    props: { type: 'primary', size: 'small' },
                    style: { marginLeft: '5px' },
                    on: {
                      click: () => {
                        this.approveIdStart(params, i)
                      }
                    }
                  },
                  '审批' + num
                )
              )
            }
            return h('div', arr)
          }
        }
      ],
      tableColumns3: [
        {
          title: '姓名',
          key: 'username',
          fixed: 'left',
          align: 'center',
          minWidth: 110
        },
        {
          title: '部门',
          key: 'departmentName',
          align: 'center',
          minWidth: 110
        },
        { title: '职位', key: 'positionName', align: 'center', minWidth: 110 },
        { title: '日期', key: 'checkingTime', align: 'center', minWidth: 160 },
        { title: '班次', key: 'classesName', align: 'center', minWidth: 110 },
        {
          title: '上班1',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'amcheckingTime1',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'amstatus1',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'amfacilityNum1',
          align: 'center',
          minWidth: 150
        },
        {
          title: '下班1',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'pmcheckingTime1',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'pmstatus1',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'pmfacilityNum1',
          align: 'center',
          minWidth: 150
        },
        {
          title: '上班2',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'amcheckingTime2',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'amstatus2',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'amfacilityNum2',
          align: 'center',
          minWidth: 150
        },
        {
          title: '下班2',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'pmcheckingTime2',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'pmstatus2',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'pmfacilityNum2',
          align: 'center',
          minWidth: 150
        },
        {
          title: '上班3',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'amcheckingTime3',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'amstatus3',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'amfacilityNum3',
          align: 'center',
          minWidth: 150
        },
        {
          title: '下班3',
          align: 'center',
          children: [
            {
              title: '打卡时间',
              key: 'pmcheckingTime3',
              align: 'center',
              minWidth: 150
            },
            {
              title: '打卡结果',
              key: 'pmstatus3',
              align: 'center',
              minWidth: 110
            }
          ]
        },
        {
          title: '打卡设备',
          key: 'pmfacilityNum3',
          align: 'center',
          minWidth: 150
        },
        {
          title: '关联审批',
          key: '12',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            let arr = []
            for (let i = 0; i < params.row.applyApproves.length; i++) {
              let num = parseInt(i) + 1
              arr.push(
                h(
                  'Button',
                  {
                    props: { type: 'primary', size: 'small' },
                    style: { marginLeft: '5px' },
                    on: {
                      click: () => {
                        this.approveIdStart(params, i)
                      }
                    }
                  },
                  '审批' + num
                )
              )
            }
            return h('div', arr)
          }
        }
      ],
      dataTable: {},
      searchData: {
        startTime: '',
        endTime: '',
        departmentId: '',
        userId: ''
      },
      selectTime: [],
      model1: [],
      page: {
        totalCount: '',
        pageSize: 10,
        currentPage: 1
      },
      facilityNum: '',
      classNum: '', // 每日上下班次数
      key: [],
      arr: []
    }
  },
  watch: {
    $route: function(newVal, oldVal) {
      this.getList({ facilityNum: this.$store.state.user.facilityNum })
      this.$store.commit('facilityNum', '')
    }
  },
  mounted() {
    if (this.$store.state.user.facilityNum === '') {
      this.getList({})
    } else {
      this.getList({ facilityNum: this.$store.state.user.facilityNum })
      this.$store.commit('facilityNum', '')
    }
    this.labelList()
  },
  methods: {
    /**
     *  搜索
     */
    _search() {
      this.searchData.startTime = dateFormat(this.selectTime[0])
      this.searchData.endTime = dateFormat(this.selectTime[1])
      let data = this.searchData
      this.getList(data)
    },
    /**
     *  部门/成员 ID
     */
    teamChange(value, selectedData) {
      console.log(selectedData)
      if (selectedData.length > 0) {
        this.searchData.departmentId =
          selectedData[selectedData.length - 1].parentId
        this.searchData.userId = selectedData[selectedData.length - 1].value
      } else {
        this.searchData.departmentId = ''
        this.searchData.userId = ''
      }
    },
    getPageData(val) {
      this.page.currentPage = val
      this.searchData.startTime = dateFormat(this.selectTime[0])
      this.searchData.endTime = dateFormat(this.selectTime[1])
      let data = this.searchData
      this.getList(data)
    },
    sizeChange(val) {
      this.page.pageSize = val
      this.searchData.startTime = dateFormat(this.selectTime[0])
      this.searchData.endTime = dateFormat(this.selectTime[1])
      let data = this.searchData
      this.getList(data)
    },
    /**
     *  获取日报表列表
     */
    getList(dataPost) {
      checkingDayStatistics(
        this.page.currentPage,
        this.page.pageSize,
        dataPost
      ).then(res => {
        if (res.code === 200) {
          this.page.totalCount = res.data.total
          let data = res.data.records
          for (let i = 0; i < data.length; i++) {
            if (
              data[i].amRecord.length === 1 ||
              data[i].pmRecord.length === 1
            ) {
              this.classNum = 1
              this.tableColumns = this.tableColumns1
            }
            if (
              data[i].amRecord.length === 2 ||
              data[i].pmRecord.length === 2
            ) {
              this.classNum = 2
              this.tableColumns = this.tableColumns2
            }
            if (
              data[i].amRecord.length === 3 ||
              data[i].pmRecord.length === 3
            ) {
              this.classNum = 3
              this.tableColumns = this.tableColumns3
            }
            if (data[i].amRecord.length > 0) {
              for (let q = 0; q < data[i].amRecord.length; q++) {
                // 上班状态
                let time = data[i].amRecord[q].punchTime
                let rTime = data[i].amRecord[q].checkingTime
                let facility = data[i].amRecord[q].facilityNum
                let status = data[i].amRecord[q].status
                let adminName = data[i].amRecord[q].adminName
                if (time !== null) {
                  var userTime = time.split(' ')[time.split(' ').length - 1]
                } else {
                  userTime = ''
                }
                if (rTime !== null) {
                  var trueTime = rTime.split(' ')[rTime.split(' ').length - 1]
                } else {
                  trueTime = ''
                }
                let num =
                  '班次时间：' + trueTime + ' ' + '打卡时间：' + userTime
                let a = []
                let obj = {}
                obj['amcheckingTime' + (q + 1)] = num
                obj['amfacilityNum' + (q + 1)] = facility
                if (status === 11) {
                  obj['amstatus' + (q + 1)] =
                    adminName + this.toggleStatus(status)
                } else {
                  obj['amstatus' + (q + 1)] = this.toggleStatus(status)
                }

                a.push(obj)
                Object.assign(data[i], a[0], a[1], a[2])
              }
            }
            if (data[i].pmRecord.length > 0) {
              for (let p = 0; p < data[i].pmRecord.length; p++) {
                // 下班状态
                let ptime = data[i].pmRecord[p].punchTime
                let prTime = data[i].pmRecord[p].checkingTime
                let pfacility = data[i].pmRecord[p].facilityNum
                let pstatus = data[i].pmRecord[p].status
                let padminName = data[i].pmRecord[p].adminName
                if (ptime !== null) {
                  var puserTime = ptime.split(' ')[ptime.split(' ').length - 1]
                } else {
                  puserTime = ''
                }
                if (prTime !== null) {
                  var ptrueTime = prTime.split(' ')[
                    prTime.split(' ').length - 1
                  ]
                } else {
                  ptrueTime = ''
                }
                let pnum =
                  '班次时间：' + ptrueTime + ' ' + '打卡时间：' + puserTime
                let a = []
                let obj = {}
                obj['pmcheckingTime' + (p + 1)] = pnum
                obj['pmfacilityNum' + (p + 1)] = pfacility
                if (pstatus === 11) {
                  obj['pmstatus' + (p + 1)] =
                    padminName + this.toggleStatus(pstatus)
                } else {
                  obj['pmstatus' + (p + 1)] = this.toggleStatus(pstatus)
                }

                a.push(obj)
                Object.assign(data[i], a[0], a[1], a[2])
              }
            }
          }
          this.dataTable = {
            list: res.data.records,
            page: this.page
          }
        }
      })
    },
    /**
     *  审批
     */
    approveIdStart(data, num) {
      checkingDayStatistics(this.page.currentPage, this.page.pageSize, {}).then(
        res => {
          let id = res.data.records[data.index].applyApproves[num].id
          approveGet(id).then(res => {
            if (res.code === 200) {
              this.modelType = true
              this.typeData = res.data
            } else {
            }
          })
        }
      )
    },
    closeModal() {
      this.modelType = false
    },
    /**
     *  获取部门成员级联数据
     */
    labelList() {
      departCascade().then(res => {
        if (res.code === 200) {
          this.departmentPeo = res.data
        }
      })
    },
    /**
     * 导出报表
     */
    handleExport() {
    //   this.percentshow = true
    //  let timer = setInterval(() => {
    //      this.percent += 10
    //      if(this.percent == 90){
    //        this.percent = 99
    //        clearInterval(timer)
    //      }
    //   }, 1000);//导出进度条
       this.searchData.startTime = dateFormat(this.selectTime[0])
      this.searchData.endTime = dateFormat(this.selectTime[1])
      let data = this.searchData
      checkingDayStatistics(1, this.page.totalCount, data).then(res => {
        if (res.code === 200) {
          let data = res.data.records
          for (let i = 0; i < data.length; i++) {
            if (data[i].amRecord.length > 0) {
              for (let q = 0; q < data[i].amRecord.length; q++) {
                // 上班状态
                let time = data[i].amRecord[q].punchTime
                let rTime = data[i].amRecord[q].checkingTime
                let facility = data[i].amRecord[q].facilityNum
                let status = data[i].amRecord[q].status
                let adminName = data[i].amRecord[q].adminName
                if (time !== null) {
                  var userTime = time.split(' ')[time.split(' ').length - 1]
                } else {
                  userTime = ''
                }
                if (rTime !== null) {
                  var trueTime = rTime.split(' ')[rTime.split(' ').length - 1]
                } else {
                  trueTime = ''
                }
                let num =
                  '班次时间：' + trueTime + ' ' + '打卡时间：' + userTime
                let a = []
                let obj = {}
                obj['amcheckingTime' + (q + 1)] = num
                obj['amfacilityNum' + (q + 1)] = facility
                if (status === 11) {
                  obj['amstatus' + (q + 1)] =
                    adminName + this.toggleStatus(status)
                } else {
                  obj['amstatus' + (q + 1)] = this.toggleStatus(status)
                }

                a.push(obj)
                Object.assign(data[i], a[0], a[1], a[2])
              }
            }
            if (data[i].pmRecord.length > 0) {
              for (let p = 0; p < data[i].pmRecord.length; p++) {
                // 下班状态
                let ptime = data[i].pmRecord[p].punchTime
                let prTime = data[i].pmRecord[p].checkingTime
                let pfacility = data[i].pmRecord[p].facilityNum
                let pstatus = data[i].pmRecord[p].status
                let padminName = data[i].pmRecord[p].adminName
                if (ptime !== null) {
                  var puserTime = ptime.split(' ')[ptime.split(' ').length - 1]
                } else {
                  puserTime = ''
                }
                if (prTime !== null) {
                  var ptrueTime = prTime.split(' ')[
                    prTime.split(' ').length - 1
                  ]
                } else {
                  ptrueTime = ''
                }
                let pnum =
                  '班次时间：' + ptrueTime + ' ' + '打卡时间：' + puserTime
                let a = []
                let obj = {}
                obj['pmcheckingTime' + (p + 1)] = pnum
                obj['pmfacilityNum' + (p + 1)] = pfacility
                if (pstatus === 11) {
                  obj['pmstatus' + (p + 1)] =
                    padminName + this.toggleStatus(pstatus)
                } else {
                  obj['pmstatus' + (p + 1)] = this.toggleStatus(pstatus)
                }
                a.push(obj)
                Object.assign(data[i], a[0], a[1], a[2])
              }
            }
          }
          let arr = ['姓名', '部门', '职位', '日期', '班次']
          let key = [
            'username',
            'departmentName',
            'positionName',
            'checkingTime',
            'classesName'
          ]
          let arr1 = []
          let key1 = []
          if (this.classNum === 1) {
            for (let a = 1; a < 2; a++) {
              arr1 = [
                '上班' + a + '打卡时间',
                '上班' + a + '打卡结果',
                '打卡设备',
                '下班' + a + '打卡时间',
                '下班' + a + '打卡结果',
                '打卡设备'
              ]
              key1 = [
                'amcheckingTime' + a,
                'amstatus' + a,
                'amfacilityNum' + a,
                'pmcheckingTime' + a,
                'pmstatus' + a,
                'pmfacilityNum' + a
              ]
              Array.prototype.push.apply(arr, arr1)
              Array.prototype.push.apply(key, key1)
            }
          }
          if (this.classNum === 2) {
            for (let a = 1; a < 3; a++) {
              arr1 = [
                '上班' + a + '打卡时间',
                '上班' + a + '打卡结果',
                '打卡设备',
                '下班' + a + '打卡时间',
                '下班' + a + '打卡结果',
                '打卡设备'
              ]
              key1 = [
                'amcheckingTime' + a,
                'amstatus' + a,
                'amfacilityNum' + a,
                'pmcheckingTime' + a,
                'pmstatus' + a,
                'pmfacilityNum' + a
              ]
              Array.prototype.push.apply(arr, arr1)
              Array.prototype.push.apply(key, key1)
            }
          }
          if (this.classNum === 3) {
            for (let a = 1; a < 4; a++) {
              arr1 = [
                '上班' + a + '打卡时间',
                '上班' + a + '打卡结果',
                '打卡设备',
                '下班' + a + '打卡时间',
                '下班' + a + '打卡结果',
                '打卡设备'
              ]
              key1 = [
                'amcheckingTime' + a,
                'amstatus' + a,
                'amfacilityNum' + a,
                'pmcheckingTime' + a,
                'pmstatus' + a,
                'pmfacilityNum' + a
              ]
              Array.prototype.push.apply(arr, arr1)
              Array.prototype.push.apply(key, key1)
            }
          }
          console.log(data)
          this.handleExportData = {
            title: arr,
            key: key,
            data: data,
            autoWidth: true,
            filename: '考勤统计日报表列表'
          }
          downloadXlex(this.handleExportData)
          // this.$Message.success('导出成功!')
          // debugger
          // this.percentshow = false
        }
      })
    },
    toggleStatus(status) {
      let _status = parseInt(status)
      switch (_status) {
        case 0:
          return '正常打卡'
        case 1:
          return '迟到'
        case 2:
          return '严重迟到'
        case 3:
          return '旷工'
        case 4:
          return '早退'
        case 5:
          return '缺卡'
        case 6:
          return '管理员补卡'
        case 7:
          return '请假'
        case 8:
          return '外出'
        case 9:
          return '出差'
        case 10:
          return '加班'
        case 11:
          return '管理员修改为正常打卡'
        default:
          return 'error'
      }
    }
  }
}
</script>
