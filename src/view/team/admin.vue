<style lang="less" scoped></style>

<template>
  <div>
    <Row :gutter="10" class="m-t-10">
      <Col span="4">
        <Input
          v-model="search.userName"
          @on-enter="handleSearch"
          @on-click="handleSearch"
          icon="ios-search"
          placeholder="管理员名称"
        ></Input>
      </Col>
      <Col span="4">
        <Input
          v-model="search.phone"
          @on-enter="handleSearch"
          @on-click="handleSearch"
          icon="ios-search"
          placeholder="管理员手机号"
        ></Input>
      </Col>
      <Col span="4">
        <Cascader
          style="width:90%"
          :data="searchTeamList"
          @on-change="teamSearch"
          change-on-select
          v-model="dpArr"
          placeholder="请选择管理部门"
        ></Cascader>
      </Col>
      <Col span="2">
        <Button @click="handleSearch" type="primary">查询</Button>
      </Col>
      <Col span="3">
        <Button
          @click="(canShowAdd = true), (statusText = '添加管理员')"
          type="success"
          >添加管理员</Button
        >
      </Col>
    </Row>
    <Modal v-model="canShowAdd" :title="statusText" :mask-closable="false">
      <div slot="close" @click="handleCancel(textChange)">×</div>
      <Form
        :ref="textChange"
        :model="textChange"
        :label-width="90"
        :rules="formVerify"
      >
        <FormItem label="管理员：" prop="model1">
          <Cascader
            style="width:90%"
            :data="departmentPeo"
            v-model="textChange.model1"
            placeholder="部门/人员"
          ></Cascader>
        </FormItem>
        <FormItem label="管理权限：" prop="dpArrAdmin">
          <Cascader
            style="width:90%"
            :data="teamList"
            change-on-select
            v-model="textChange.dpArrAdmin"
            placeholder="请选择管理权限"
          ></Cascader>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handleCancel(textChange)">取消</Button>
        <Button
          type="primary"
          :loading="modalLoding"
          @click="handleAdd(textChange)"
          >确定</Button
        >
      </div>
    </Modal>
    <private-table
      :border="true"
      @sizeChange="sizeChange"
      class="m-t-35"
      :columnsList="tableColumns"
      :dataTable="dataTable"
      @getPageData="getPageData"
    ></private-table>
  </div>
</template>
<script>
import {
  departMenu,
  departCascade,
  managerDelete,
  managerList,
  managerEdit,
  managerAddOrEdit
} from '@/api/data'
export default {
  name: 'adjoining-mgt',
  data () {
    return {
      modalLoding: false,
      statusText: '添加管理员',
      teamList: [], // 部门下拉
      searchTeamList: [],
      dpArr: [], // 搜索部门选择
      departmentPeo: [], // 部门成员下拉
      search: {
        userName: '', // 管理员名称
        phone: '', // 管理员员手机号
        dpIds: '' // 部门Id
      },
      textChange: {
        dpArrAdmin: [], // 部门选择
        model1: [] // 部门成员选择
      },
      select: {
        userId: '', // 用户ID
        dpIds: '' // 管理的部门
      },
      formVerify: {
        model1: [
          {
            type: 'array',
            min: 1,
            required: true,
            message: '请选择管理员！',
            trigger: 'change'
          }
        ],
        dpArrAdmin: [
          {
            type: 'array',
            min: 1,
            required: true,
            message: '请选择管理权限！',
            trigger: 'change'
          }
        ]
      },
      canShowAdd: false, // 是否显示添加成员对话框
      model: {
        name: '',
        department: '' // 部门
      },
      tableColumns: [
        { title: '编号', type: 'index', minWidth: 100, align: 'center' },
        {
          title: '管理员名称',
          key: 'userName',
          minWidth: 100,
          align: 'center'
        },
        { title: '联系电话', key: 'phone', minWidth: 100, align: 'center' },
        { title: '职务', key: 'positionName', minWidth: 100, align: 'center' },
        { title: '管理权限', key: 'principal', minWidth: 100, align: 'center' },
        {
          title: '操作',
          width: '200px',
          key: 'action',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', {}, [
              h('a', {}, [
                h(
                  'Button',
                  {
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    class: ['font12'],
                    style: {
                      marginRight: '10px'
                    },
                    on: {
                      click: () => {
                        this.hadleEdit(params)
                      }
                    }
                  },
                  ['编辑']
                )
              ]),
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
                    title: `确认删除${params.row.userName}`,
                    confirm: true
                  },
                  style: {
                    textAlign: 'left'
                  },
                  on: {
                    'on-ok': () => {
                      this.handleDelete(params.row.userId)
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
      dataTable: {},
      list: [],
      page: {
        totalCount: 0,
        pageSize: 10,
        pageNumber: 1
      }
    }
  },
  mounted () {
    this.getList({})
    this.getGarp()
    this.getDepart()
  },
  methods: {
    target (status, id) {
      // 新建跳转
      this.$router.push({ name: 'adjoining-mgt-mask', query: { status, id } })
    },
    handleSearch () {
      // 搜索
      let obj = {
        pageSize: this.page.pageSize,
        pageNumber: this.page.pageNumber
      }
      Object.assign(this.search, obj)
      this.getList(this.search)
    },
    /**
     *  添加/编辑 管理员
     */
    handleAdd (name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.modalLoding = true
          this.select.userId = this.textChange.model1[
            this.textChange.model1.length - 1
          ]
          this.select.dpIds = this.textChange.dpArrAdmin[
            this.textChange.dpArrAdmin.length - 1
          ]
          managerAddOrEdit(this.select).then(res => {
            if (res.code === 200) {
              this.$Message.success(res.message)
              this.$refs[name].resetFields()
              this.canShowAdd = false
              this.modalLoding = false
              this.getList({})
            } else {
              this.modalLoding = false
            }
          })
        }
      })
    },
    /**
     * 编辑
     */
    hadleEdit (val) {
      this.statusText = '编辑管理员'
      this.canShowAdd = true
      let data = this.dataTable.list[val.index]
      managerEdit({
        userId: data.userId,
        dpId: data.dpId,
        dpIds: data.dpIds
      }).then(res => {
        if (res.code === 200) {
          let arr = []
          for (let i = 0; i < res.data.memberList.length; i++) {
            arr.push(res.data.memberList[i].toString())
          }
          this.textChange.model1 = arr
          this.textChange.dpArrAdmin = res.data.managerList
        } else {
        }
      })
    },
    handleCancel (name) {
      // 取消
      this.canShowAdd = false
      this.$refs[name].resetFields()
    },
    sizeChange (val) {
      // 每页条数
      this.page.pageSize = val
      let obj = {
        pageSize: this.page.pageSize,
        pageNumber: this.page.pageNumber
      }
      Object.assign(this.search, obj)
      this.getList(this.search)
    },
    getPageData (val) {
      // 分页页数
      this.page.pageNumber = val
      let obj = {
        pageSize: this.page.pageSize,
        pageNumber: this.page.pageNumber
      }
      Object.assign(this.search, obj)
      this.getList(this.search)
    },
    getList (data) {
      // 获取列表
      managerList(data).then(res => {
        if (res.code === 200) {
          this.page.totalCount = res.data.total
          this.dataTable = {
            list: res.data.records,
            page: this.page
          }
        } else {
          this.$Message.warning('未获取到对应的成员信息')
        }
      })
    },
    /**
     *  删除管理员
     */
    handleDelete (data) {
      console.log(data)
      managerDelete(data).then(res => {
        if (res.code === 200) {
          this.$Message.success(res.message)
          let obj = {
            pageSize: this.page.pageSize,
            pageNumber: this.page.pageNumber
          }
          Object.assign(this.search, obj)
          this.getList(this.search)
        }
      })
    },
    /**
     * 获取部门下拉
     */
    getGarp () {
      departMenu({}).then(res => {
        this.teamList = JSON.parse(JSON.stringify(res.data)) // 深复制
        this.teamList.push({ value: 'all', label: '全部' })
        this.searchTeamList = JSON.parse(JSON.stringify(res.data)) // 深复制
        this.searchTeamList.push({ value: 'all', label: '全部' })
      })
    },
    /**
     * 获取部门成员级联
     */
    getDepart () {
      departCascade().then(res => {
        if (res.code === 200) {
          this.departmentPeo = res.data
        }
      })
    },
    // 搜索部门选择
    teamSearch (value, selectedData) {
      this.search.dpIds = value[value.length - 1]
    }
  },
  components: {}
}
</script>
