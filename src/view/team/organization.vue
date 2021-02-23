<style lang="less" scoped></style>

<template>
  <div>
    <Row :gutter="16"
         class="m-t-10">
      <Col span="4">
      <Cascader style="width:90%"
                :data="teamList"
                @on-change="teamSearch"
                change-on-select
                v-model="dpArr"
                placeholder="请选择部门名称"></Cascader>
      </Col>
      <Col span="4">
      <Cascader style="width:90%"
                :data="teamList"
                @on-change="upTeamSearch"
                change-on-select
                v-model="upDpArr"
                placeholder="请选择上级部门"></Cascader>
      </Col>
      <!-- <Col span="4">
      <Input v-model="search.managerName"
             @on-enter="handleSearch"
             @on-click="handleSearch"
             icon="ios-search"
             placeholder="部门主管"></Input>
      </Col> -->
      <Col span="2">
      <Button @click="handleSearch"
              type="primary">查询</Button>
      </Col>
      <Col span="3">
      <Button @click="add"
              type="success">添加部门</Button>
      </Col>
    </Row>
    <Modal v-model="canShowAdd"
           :title="statusText"
           :mask-closable="false">
      <div slot="close"><span @click="handleCancel(modelData)">×</span></div>
      <Form :ref="modelData"
            :model="modelData"
            :label-width="80"
            :rules="formVerify">
        <FormItem label="部门名称"
                  prop="dpName">
          <Input style="width:90%"
                 v-model="modelData.dpName"
                 placeholder="请输入部门名称"></Input>
        </FormItem>
        <FormItem label="部门主管">
          <Cascader style="width:90%"
                    :data="departmentPeo"
                    @on-change="teamChange"
                    v-model="modelData.managerId"
                    placeholder="选择部门主管"></Cascader>
        </FormItem>
        <FormItem label="上级部门"
                  prop="parentId">
          <Cascader style="width:90%"
                    :data="teamList"
                    @on-change="upBranch"
                    change-on-select
                    v-model="modelData.parentId"
                    placeholder="请选择上级部门"></Cascader>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handleCancel(modelData)">取消</Button>
        <Button type="primary"
                @click="handleAdd(modelData)">确定</Button>
      </div>
    </Modal>
    <private-table :border="border"
                   @sizeChange="sizeChange"
                   class="m-t-35"
                   :columnsList="tableColumns"
                   :dataTable="dataTable"
                   @getPageData="getPageData"></private-table>
  </div>
</template>
<script>
import {
  departCascade,
  departList,
  departMenu,
  departDelete,
  managerEdit,
  departAdd,
  departEdit,
  departEditData
} from '@/api/data'
export default {
  name: 'adjoining-mgt',
  props: {},
  data() {
    return {
      border: true,
      teamList: [], // 部门级联
      dpArr: [], // 搜索部门选择
      upDpArr: [], // 搜索上级部门选择
      departmentPeo: [], // 部门成员下拉
      search: {
        dpName: '', // 所属部门
        parentId: '', // 上级部门
        managerName: '' // 部门主管
      },
      select: {
        department: [], // 部门
        role: [] // 管理权限
      },
      statusText: '添加部门', // 对话框文案：添加、编辑
      canShowAdd: false, // 是否显示添加成员对话框
      formData: {
        teamId: '', // 团队ID
        dpName: '', // 部门名称
        managerId: '', // 管理员ID
        parentId: '' // 上级部门ID
      },
      modelData: {
        dpName: '', // 部门名称
        managerId: [], // 选中部门主管
        parentId: [] // 选中上级部门
      },
      formVerify: {
        dpName: [
          { required: true, message: '请填写部门名称！', trigger: 'blur' }
        ],
        parentId: [
          {
            type: 'array',
            min: 1,
            required: true,
            message: '请选择上级部门！',
            trigger: 'change'
          }
        ]
      },
      tableColumns: [
        { title: '编号', key: 'id', align: 'center', minWidth: 110 },
        { title: '部门名称', key: 'name', align: 'center', minWidth: 110 },
        { title: '上级部门', key: 'dpName', align: 'center', minWidth: 110 },
        { title: '成员数量', key: 'num', align: 'center', minWidth: 110 },
        {
          title: '部门主管',
          key: 'managerName',
          align: 'center',
          minWidth: 110
        },
        {
          title: '操作',
          width: '270px',
          key: 'action',
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
                        this.goUser(params.row)
                      }
                    }
                  },
                  ['查看成员']
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
                        this.statusText = '编辑部门'
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
                    title: `确认删除${params.row.name}`,
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
                        click: () => {}
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
        totalCount: '',
        pageSize: 20,
        currentPage: 1
      },
      addOrEdit: true, // 编辑或添加
      rowData: '' // 编辑行信息
    }
  },
  mounted() {
    this.getList(this.search)
    this.getGarp()
    this.getDepart()
  },
  methods: {
    handleSearch() {
      // 搜索
      console.log(this.search)
      this.getList(this.search)
    },
    /**
     * 添加部门按钮
     */
    add() {
      this.canShowAdd = true
      this.statusText = '添加部门'
      this.addOrEdit = true
    },
    /**
     * 添加/修改部门
     */
    handleAdd(name) {
      // 添加成员
      this.$refs[name].validate(valid => {
        if (valid) {
          this.formData.dpName = this.modelData.dpName
          this.formData.teamId = this.$store.state.user.data.teamId
          if (this.addOrEdit === true) {
            departAdd(this.formData).then(res => {
              if (res.code === 200) {
                this.$Message.success(res.message)
                this.$refs[name].resetFields()
                this.canShowAdd = false
                this.modelData.managerId = []
                this.getList({})
              }
            })
          } else {
            let obj = { id: this.rowData.id }
            Object.assign(this.formData, obj)
            // console.log(this.modelData.parentId[0])
            // this.formData.parentId = this.modelData.parentId[0]
            this.formData.parentId = this.modelData.parentId[
              this.modelData.parentId.length - 1
            ]
            departEdit(this.formData).then(res => {
              if (res.code === 200) {
                this.$Message.success(res.message)
                this.$refs[name].resetFields()
                this.canShowAdd = false
                this.modelData.managerId = []
                this.getList({})
              }
            })
          }
        }
      })
    },
    /**
     * 编辑按钮
     */
    hadleEdit(val) {
      this.rowData = val.row
      this.addOrEdit = false
      this.canShowAdd = true
      let data = this.dataTable.list[val.index]
      departEditData({
        parentId: this.rowData.pid,
        managerId: this.rowData.managerId
      }).then(res => {
        if (res.code === 200) {
          // console.log(res.data);
          let arr = []
          let list = []
          for (let i = 0; i < res.data.managerList.length; i++) {
            arr.push(res.data.managerList[i].toString())
          }
          for (let k = 0; k < res.data.parentDepartList.length; k++) {
            // console.log(res.data.parentDepartList[k]);
            list.push(res.data.parentDepartList[k].toString())
          }
          this.modelData.managerId = arr
          this.modelData.parentId = list
          this.modelData.dpName = data.name
        }
      })
    },
    // 查看成员
    goUser(data) {
      this.$router.push({ name: 'member', query: { id: data.id } })
    },
    handleCancel(name) {
      // 取消
      this.canShowAdd = false
      this.modelData.managerId = []
      this.$refs[name].resetFields()
    },
    sizeChange(val) {
      // 每页条数
      this.page.pageSize = val
      this.getList()
    },
    getPageData(val) {
      // 分页页数
      this.page.currentPage = val
      this.getList()
    },
    handleDelete(data) {
      departDelete(data).then(res => {
        if (res.code === 200) {
          this.$Message.success(res.message)
          this.getList({})
        } else {
          this.$Message.warning(res.message)
        }
      })
    },
    /**
     *  获取列表
     */
    getList(data) {
      departList(
        this.page.pageSize,
        this.page.currentPage,
        data.dpName,
        data.parentId,
        data.managerName
      ).then(res => {
        if (res.code === 200) {
          this.page.totalCount = res.data.total
          this.dataTable = {
            list: res.data.records,
            page: this.page
          }
        } else {
          this.$Message.warning(res.message)
        }
      })
    },
    /**
     * 获取部门下拉
     */
    getGarp() {
      departMenu({}).then(res => {
        let arr = res.data
        this.teamList = JSON.parse(JSON.stringify(arr)) // 深复制
        this.teamList.push({ teamId: '0', value: '0', label: '团队' })
      })
    },
    /**
     * 获取部门成员级联
     */
    getDepart() {
      departCascade().then(res => {
        if (res.code === 200) {
          this.departmentPeo = res.data
        }
      })
    },
    // 选择部门成员
    teamChange(value, selectedData) {
      if (selectedData.length > 0) {
        this.formData.managerId = selectedData[selectedData.length - 1].value
      } else {
        this.formData.managerId = ''
      }
    },
    // 搜索部门选择
    teamSearch(value, selectedData) {
      if (selectedData.length > 0) {
        this.search.dpName = selectedData[selectedData.length - 1].label
      } else {
        this.search.dpName = ''
      }
    },
    upBranch(value, selectedData) {
      // console.log(selectedData)
      if (selectedData.length != 0) {
        this.formData.parentId = selectedData[selectedData.length - 1].value
      } else {
        this.formData.parentId = null
      }
    },
    upTeamSearch(value, selectedData) {
      this.search.parentId = value[value.length - 1]
      console.log(this.search.parentId)
    },
    adminForm(value, selectedData) {
      this.select.dpIds = value[value.length - 1]
    }
  },
  components: {}
}
</script>
