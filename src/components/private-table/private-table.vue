<style scoped>
.zzuiTable {
  position: relative;
  min-height: 138px;
}
.table-bottom {
  margin-top: 20px;
  height: 35px;
  width: 100%;
}
.table-btmRight {
  float: right;
}
.marginBtn {
  margin-bottom: 10px;
}
</style>
<template>
  <div class="zzuiTable font12">
    <!--表格公用组件模板-->
    <div v-if="bool">
      <!--<Row>-->
      <!--<Col v-if="exportHide!==''" span="4">-->
      <!--<Button @click="handleExport" class="marginBtn" type="primary"><Icon type="ios-download-outline"></Icon> 导出</Button>-->
      <!--</Col>-->
      <!--</Row>-->
      <Table :width="width"
             :border="border"
             :height="height"
             stripe
             size="small"
             :disabled-hover="banHover"
             ref="table"
             :columns="columns"
             :data="dataTable.list"
             @on-selection-change="selectChange"
             @on-expand="expandTab">
      </Table>
      <Row class="table-bottom"
           v-if="!pageHide"
           :gutter="16">
        <Col class="m-t-10 fRight">
        <Page :total="dataTable.page.totalCount"
              @on-change="goPage"
              show-elevator
              :page-size="dataTable.page.pageSize"
              :current="dataTable.page.currentPage"
              @on-page-size-change="sizeChange"
              size="small"
              show-sizer></Page>
        </Col>
      </Row>
    </div>
    <div class="center p-t-40"
         v-else>查询不到任何相关数据</div>
  </div>
</template>
<script>
// import config from '@/config'
// import { getToken } from '@/libs/util'
// import { export_array_to_excel } from '@/libs/tools'
// import excel from '@/libs/excel'
export default {
  name: 'private-table',
  /* @
   * param columnsList 表格标题字段
   * param dataTable 表格数据
   * param columnsProp 通过条件判断、判断表格配置项
   * param extendColumns 通过新增表格配置项
   * */
  props: {
    columnsList: {
      type: [Array]
    },
    dataTable: {
      type: [Object]
    },
    pageStart: {
      type: [Boolean]
    },
    columnsProp: {
      type: [String, Object]
    },
    extendColumns: {
      type: [String, Object]
    },
    extendWidth: {
      type: [Array, Object]
    },
    pageHide: {
      type: [String, Boolean],
      default: false
    },
    exportHide: {
      type: [String],
      default: ''
    },
    banHover: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    border: {
      type: Boolean
    }
  },
  data () {
    return {
      bool: false,
      columns: []
    }
  },
  watch: {
    dataTable () {
      if (this.dataTable.page || this.dataTable.list) this.formatData()
    }
  },
  mounted () {},
  methods: {
    /* 列表格式化 */
    formatData () {
      let arr = []
      this.columnsList.forEach((item, index) => {
        let obj = {
          // align: item.align ? item.align : "center",
          ellipsis: item.ellipsis ? item.ellipsis : true,
          tooltip: true,
          render: (h, params) => {
            return h(
              'span',
              {
                attrs: {
                  title: params.row[item.key]
                }
              },
              params.row[item.key]
            )
          }
        }
        Object.assign(obj, item)
        arr.push(obj)
      })
      this.columns = arr
      this.bool = true
    },
    /* 点击页码更换数据 */
    goPage (val) {
      this.$emit('getPageData', val)
    },
    selectChange (selection) {
      this.$emit('selectChange', selection)
    },
    expandTab (row, status) {
      this.$emit('expandTab', { row, status })
    },
    sizeChange (val) {
      this.$emit('sizeChange', val)
    }
  }
}
</script>
