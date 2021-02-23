<style scoped>

</style>

<template>
  <div>
    <Form ref="searchData" :model="searchData" inline>
      <FormItem prop="numbering" :style="inpWidth">
        <Col span="8">
          <span>设备编号：</span>
        </Col>
        <Col span="16">
          <Input clearable v-model="searchData.numbering"  placeholder="请输入设备编号"></Input>
        </Col>
      </FormItem>
      <FormItem prop="time" style="width: 300px">
        <Col span="7">
          <span>设备绑定时间：</span>
        </Col>
        <Col span="17">
          <DatePicker clearable type="daterange" placeholder="选择日期" v-model="searchData.time" style="width: 200px"></DatePicker>
        </Col>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="search">查询</Button>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleExport"><Icon type="ios-download-outline"></Icon>导出</Button>
      </FormItem>
    </Form>

    <private-table :border="true" :exportHide="tableName"  @sizeChange="sizeChange" class="m-t-35" :columnsList="tableColumns" :dataTable="dataTable"
                    @getPageData="getPageData"></private-table>
  </div>
</template>

<script>
import { dateFormat } from '../../components/common_fun'
import { downloadXlex } from '@/libs/tools'
import { facilityAllList, facilityUnbind } from '@/api/data'
export default {
  name: 'equipment',
  props: {},
  data () {
    return {
      tableName: '设备管理列表',
      inpWidth: 'width: 240px', // 搜索框宽度
      searchData: {
        numbering: '',
        time: ''
      },
      tableColumns: [
        { title: '编号', type: 'index', align: 'center', minWidth: 100 },
        { title: '设备号', key: 'facilityNum', align: 'center', minWidth: 100 },
        { title: '绑定时间', key: 'createTime', align: 'center', minWidth: 100 },
        { title: '团队名称', key: 'teamName', align: 'center', minWidth: 100 },
        { title: '负责人', key: 'managerName', align: 'center', minWidth: 100 },
        { title: '负责人电话', key: 'managerPhone', align: 'center', minWidth: 100 },
        {
          title: '操作',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return h('div', {}, [
              h('Button', {
                props: {
                  fontSize: '18px',
                  color: '#ccc',
                  verticalAlign: 'middle',
                  textAlign: 'center',
                  type: 'primary'
                },
                style: {
                  marginRight: '10px'
                },
                on: {
                  click: () => {
                    this.untied(params.row)
                  }
                }
              }, '解绑')
            ]
            )
          }
        }
      ],
      dataTable: {},
      list: [],
      page: {
        totalCount: 0,
        pageSize: 10,
        currentPage: 1
      }
    }
  },
  mounted () {
    this.getList({})
  },
  methods: {
    /**
     * 搜索
     */
    search () {
      if (this.searchData.time.length > 0) {
        var startTime = dateFormat(this.searchData.time[0])
        var endTime = dateFormat(this.searchData.time[1])
      }
      let data = { facilityNum: this.searchData.numbering, startTime: startTime, endTime: endTime }
      this.getList(data)
    },
    /**
     * 解绑设备
     * @param data
     */
    untied (data) {
      this.$Modal.confirm({
        title: '确认解绑',
        content: data.facilityNum,
        onOk: () => {
          facilityUnbind(data.id).then(res => {
            if (res.code === 200) {
              this.$Message.success(res.message)
              this.getList({})
            } else {}
          })
        },
        onCancel: () => {
          this.$Message.info('取消解绑')
        }
      })
    },
    sizeChange (val) {
      this.page.pageSize = val
      this.getList({})
    }, // 每页条数
    getPageData (val) {
      this.page.currentPage = val
      this.getList({})
    }, // 分页页数
    getList (data) {
      facilityAllList(this.page.currentPage, this.page.pageSize, data).then(res => {
        if (res.code === 200) {
          this.list = res.data.records
          this.page.totalCount = res.data.total
          this.dataTable = {
            list: this.list,
            page: this.page
          }
        } else {}
      })
    },
    handleExport () {
      facilityAllList(1, this.page.totalCount, {}).then(res => {
        if (res.code === 200) {
          this.handleExportData = {
            title: ['设备号', '绑定时间', '团队名称', '负责人', '负责人电话'],
            key: ['facilityNum', 'createTime', 'teamName', 'managerName', 'managerPhone'],
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
