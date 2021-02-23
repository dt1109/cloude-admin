<style lang="less" scoped>
.modelBox {
  padding: 0 20px;
  font-size: 15px;
  .modelBox-tile {
    font-size: 22px;
    text-align: center;
  }
  p {
    line-height: 1.5;
  }
  .startPlan {
    padding: 5px 0 8px;
  }
}
.marginLeft {
  margin-left: 100px;
}
</style>

<template>
  <div>
    <Form ref="searchData"
          :model="searchData"
          inline>
      <FormItem prop="numbering"
                style="width:336px">
        <Col span="5">
        <span>审批类型：</span>
        </Col>
        <Col span="9">
        <Select :clearable="true"
                v-model="searchData.applyType"
                placeholder="请选择审批类型">
          <Option v-for="item in leaves"
                  :value="item.value"
                  :label="item.label"
                  :key="item.value"></Option>
        </Select>
        </Col>
        <Col span="9"
             style="margin-left: 10px">
        <Select :clearable="true"
                v-model="searchData.status"
                placeholder="请选择审批状态">
          <Option v-for="item in leavesType"
                  :value="item.value"
                  :label="item.label"
                  :key="item.value"></Option>
        </Select>
        </Col>
      </FormItem>
      <FormItem style="width: 300px">
        <Col span="6">
        <span>发起时间：</span>
        </Col>
        <Col span="18">
        <DatePicker type="daterange"
                    placeholder="选择日期"
                    v-model="time1"
                    style="width: 200px"></DatePicker>
        </Col>
      </FormItem>
      <FormItem style="width: 300px">
        <Col span="6">
        <span>完成时间：</span>
        </Col>
        <Col span="18">
        <DatePicker type="daterange"
                    placeholder="选择日期"
                    v-model="time2"
                    style="width: 200px"></DatePicker>
        </Col>
      </FormItem>
      <FormItem>
        <Col span="7">
        <span>发起人：</span>
        </Col>
        <Col span="17">
        <Cascader @on-change="teamChange"
                  :data="departmentPeo"
                  v-model="userName"></Cascader>
        </Col>
      </FormItem>
      <FormItem>
        <Button type="primary"
                @click="search">查询</Button>
      </FormItem>
      <FormItem>
        <Button type="primary"
                @click="handleExport">
          <Icon type="ios-download-outline"></Icon>导出
        </Button>
      </FormItem>
    </Form>

    <private-table :border="border"
                   :exportHide="tableName"
                   :export="handleExportData"
                   @sizeChange="sizeChange"
                   class="m-t-35"
                   :columnsList="tableColumns"
                   :dataTable="dataTable"
                   @getPageData="getPageData"></private-table>

    <approvalModal :typeData="typeData"
                   :modelType="modelType"
                   @closeModal="closeModal"></approvalModal>
  </div>
</template>

<script>
import { dateFormat } from '../../components/common_fun'
import approvalModal from '../../components/approval-modal'
import { downloadXlex } from '@/libs/tools'
import {
  approveList,
  departCascade,
  approveGet,
  approveDelete
} from '@/api/data'
export default {
  name: 'approval',
  props: {},
  components: {
    approvalModal
  },
  data () {
    return {
      border: true,
      tableName: '审批记录',
      searchData: {
        // 搜索内容
        username: null,
        status: null,
        applyType: null,
        startTime: null,
        endTime: null,
        startTime1: null,
        endTime1: null
      },
      time1: [],
      time2: [],
      userName: [],
      leaves: [
        // 请假
        { value: '1', label: '补卡' },
        { value: '2', label: '请假' },
        { value: '3', label: '外出' },
        { value: '4', label: '出差' },
        { value: '5', label: '加班' }
      ],
      leavesType: [
        // 请假类型
        { value: '0', label: '审核中' },
        { value: '1', label: '已撤销' },
        { value: '2', label: '审批通过' },
        { value: '3', label: '审批未通过' }
      ],
      departmentPeo: [], // 部门、人员
      tableColumns: [
        // 表单行
        { title: '编号', key: 'id', align: 'center', minWidth: 120 },
        { title: '发起人', key: 'username', align: 'center', minWidth: 120 },
        {
          title: '发起时间',
          key: 'createTime',
          align: 'center',
          minWidth: 120
        },
        {
          title: '完成时间',
          key: 'approvedTime',
          align: 'center',
          minWidth: 120
        },
        {
          title: '当前审批人',
          key: 'currentApprover',
          align: 'center',
          minWidth: 120
        },
        {
          title: '历史审批人',
          key: 'historyApprover',
          align: 'center',
          minWidth: 120
        },
        {
          title: '操作',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: { type: 'primary', size: 'small' },
                  style: {
                    marginRight: '10px'
                  },
                  on: {
                    click: () => {
                      this.getApprove(params.row.id)
                    }
                  }
                },
                '查看'
              ),
              h(
                'span',
                {
                  style: {
                    marginRight: '10px',
                    fontSize: '18px',
                    color: '#ccc',
                    verticalAlign: 'middle'
                  }
                },
                '|'
              ),
              h(
                'Poptip',
                {
                  props: {
                    title: `确认删除${params.row.username}`,
                    confirm: true
                  },
                  style: {
                    textAlign: 'left'
                  },
                  on: {
                    'on-ok': () => {
                      this.handleDelete(params.row.id)
                    },
                    'on-cancel': () => {}
                  }
                },
                [
                  h(
                    'Button',
                    {
                      props: {
                        type: 'error',
                        size: 'small'
                      },
                      class: ['font12'],
                      style: {
                        marginRight: '10px'
                      },
                      on: {
                        click: () => {
                          // this.target(1, params.row.id)
                        }
                      }
                    },
                    ['删除']
                  )
                ]
              )
            ])
          }
        }
      ],
      dataTable: {}, // 表单列
      modelType: false, // 弹窗状态
      typeData: {}, // 单条记录数据
      page: {
        // 分页
        totalCount: '',
        pageSize: 10,
        currentPage: 1
      },
      handleExportData: '' // 导出表格
    }
  },
  mounted () {
    this.getList({})
  },
  methods: {
    /**
     * 删除成员
     */
    handleDelete (id) {
      approveDelete({ id: id }).then(res => {
        if (res.code === 200) {
          this.$Message.success('删除成功！')
          this.getList({})
        } else {
        }
      })
    },
    /**
     * 搜索
     */
    search () {
      let data = this.searchData
      if (this.time1[0] === '') {
        this.searchData.startTime = ''
        this.searchData.endTime = ''
        data = this.searchData
      }
      if (this.time2[0] === '') {
        this.searchData.startTime1 = ''
        this.searchData.endTime1 = ''
        data = this.searchData
      }
      this.searchData.startTime = dateFormat(this.time1[0])
      this.searchData.endTime = dateFormat(this.time1[1])
      this.searchData.startTime1 = dateFormat(this.time2[0])
      this.searchData.endTime1 = dateFormat(this.time2[1])
      data = this.searchData
      this.getList(data)
    },
    /**
     *  选择部门成员
     */
    teamChange (value, selectedData) {
      if (selectedData.length != 0) {
        this.searchData.username = selectedData[selectedData.length - 1].label
      } else {
        this.searchData.username = null
      }
    },
    /**
     * 每页条数
     */
    sizeChange (val) {
      this.page.pageSize = val
      this.getList({})
    },
    /**
     * 分页页数
     */
    getPageData (val) {
      this.page.currentPage = val
      this.getList({})
    },
    /**
     * 获取表格列表
     */
    getList (data) {
      // 获取部门成员级联
      departCascade().then(res => {
        if (res.code === 200) {
          this.departmentPeo = res.data
        } else {
          this.$Message.warning(res.message)
        }
      })
      // 获取表格
      approveList(this.page.currentPage, this.page.pageSize, data).then(res => {
        if (res.code === 200) {
          this.page.totalCount = res.data.total
          this.dataTable = {
            list: res.data.records,
            page: this.page
          }
        }
      })
    },
    /**
     *  删除记录
     */
    deleteClass (data) {
      console.log(data)
    },
    /**
     *  查看详情
     */
    getApprove (data) {
      approveGet(data).then(res => {
        if (res.code === 200) {
          this.modelType = true
          this.typeData = res.data
          console.log(this.typeData)
        } else {
        }
      })
    },
    closeModal () {
      this.modelType = false
    },
    /**
     * 导出
     */
    handleExport () {
      approveList(1, this.page.totalCount, {}).then(res => {
        if (res.code === 200) {
          this.handleExportData = {
            title: [
              '编号',
              '发起人',
              '发起时间',
              '完成时间',
              '当前审批人',
              '历史审批人'
            ],
            key: [
              'id',
              'username',
              'createTime',
              'approvedTime',
              'currentApprover',
              'historyApprover'
            ],
            data: res.data.records,
            autoWidth: true,
            filename: '审批记录列表'
          }
          downloadXlex(this.handleExportData)
        }
      })
    }
  }
}
</script>
