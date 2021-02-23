<style lang="less" scoped></style>

<template>
  <div>
    <Row :gutter="16"
         class="m-t-10">
      <Col span="4">
      <Input v-model="search.name"
             @on-enter="handleSearch"
             @on-click="handleSearch"
             icon="ios-search"
             placeholder="成员名称"></Input>
      </Col>
      <Col span="4">
      <Input v-model="search.phone"
             @on-enter="handleSearch"
             @on-click="handleSearch"
             icon="ios-search"
             placeholder="成员手机号"></Input>
      </Col>
      <!--<Col span="4">-->
      <!--<Input v-model="search.number" @on-enter="handleSearch" @on-click="handleSearch" icon="ios-search" placeholder="成员工号"></Input>-->
      <!--</Col>-->
      <Col span="4">
      <Cascader style="width:90%"
                :data="teamList"
                @on-change="teamSearch"
                change-on-select
                v-model="search.department"
                placeholder="请选择所属部门"></Cascader>
      </Col>
      <Col span="2">
      <Button @click="handleSearch"
              type="primary">查询</Button>
      </Col>
      <Col span="3">
      <Button @click="addOrEdit"
              type="success" v-show="false">添加成员</Button>
      </Col>
      <Col span="3">
      <Button :disabled="selectUser.length === 0"
              @click="handleSelectDelete"
              type="error">删除选中成员</Button>
      </Col>
    </Row>
    <Row :gutter="16"
         class="m-t-20">
      <Col span="4">
      <Button :disabled="selectUser.length === 0"
              @click="canShowExchange = true"
              type="primary">调换选中成员部门</Button>
      </Col>
    </Row>
    <private-table :border="border"
                   @sizeChange="sizeChange"
                   @selectChange="selectChange"
                   class="m-t-35"
                   :columnsList="tableColumns"
                   :dataTable="dataTable"
                   @getPageData="getPageData"></private-table>
    <Modal v-model="canShowAdd"
           :title="statusText"
           :mask-closable="false">
      <div slot="close"><span @click="handleCancel(model)">×</span></div>
      <Form :model="model"
            ref="model"
            :rules="rules"
            :label-width="80">
        <FormItem label="联系电话"
                  prop="phone">
          <Input style="width:90%"
                 v-model="model.phone"
                 :maxlength="11"
                 placeholder="请输入联系电话"></Input>
        </FormItem>
        <FormItem label="所属部门"
                  prop="dpName">
          <Cascader style="width:90%"
                    :data="select.dpName"
                    change-on-select
                    v-model="model.dpName"></Cascader>
        </FormItem>
        <FormItem label="管理权限"
                  prop="managerJurisdiction">
          <Cascader style="width:90%"
                    :data="select.managerJurisdiction"
                    change-on-select
                    v-model="model.managerJurisdiction"></Cascader>
        </FormItem>
        <FormItem v-if="false"
                  label="人像照片"
                  prop="">
          <img src=""
               alt="">
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handleCancel(model)">取消</Button>
        <Button type="primary"
                :loading="modalLoding"
                @click="handleAdd(model)">确定</Button>
      </div>
    </Modal>
    <Modal v-model="canShowExchange"
           title="调换选中成员部门"
           :mask-closable="false">
      <div slot="close"><span @click="teamGo(changeTeam)">×</span></div>
      <Form :model="changeTeam"
            ref="changeTeam"
            :rules="teamRules"
            :label-width="100">
        <FormItem label="调至部门："
                  prop="exchangeUser">
          <Cascader style="width:90%"
                    :data="teamList"
                    change-on-select
                    v-model="changeTeam.exchangeUser"></Cascader>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="teamGo(changeTeam)">取消</Button>
        <Button type="primary"
                :loading="modalLoding"
                @click="changeTeamTo(changeTeam)">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { isPhone } from '@/libs/tools'
import {
  memberExchange,
  departMenu,
  fingerprintUnbind,
  memberDelete,
  memberAddOrEdit,
  managerEdit,
  memberList
} from '@/api/data'
export default {
  name: 'adjoining-mgt',
  props: {},
  data () {
    let verify = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入手机号'))
      } else if (!isPhone(value)) {
        callback(new Error('手机号格式错误'))
      } else {
        callback()
      }
    }
    return {
      modalLoding: false,
      teamList: [],
      border: true,
      refuseLoading: true,
      search: {
        name: '', // 成员名称
        phone: '', // 成员手机号
        department: [] // 员工部门
      },
      select: {},
      statusText: '添加成员', // 对话框文案：添加、编辑
      canShowExchange: false, // 是否显示转换部门对话框
      canShowAdd: false, // 是否显示添加成员对话框
      changeTeam: {
        exchangeUser: [] // 调换至部门
      },
      teamRules: {
        exchangeUser: [
          {
            type: 'array',
            required: true,
            message: '请选择调换部门！',
            trigger: 'change'
          }
        ]
      },
      selectUser: [], // 选中的成员
      model: {
        phone: '', // 电话
        dpName: [], // 所属部门
        managerJurisdiction: [] // 管理权限
      },
      rules: {
        phone: [{ required: true, validator: verify, trigger: 'blur' }],
        dpName: [
          {
            type: 'array',
            required: true,
            message: '请选择所属部门！',
            trigger: 'change'
          }
        ]
      },
      tableColumns: [
        { type: 'selection', width: 60, align: 'center' },
        { title: '成员名称', key: 'userName', align: 'center', minWidth: 110 },
        { title: '联系电话', key: 'phone', align: 'center', minWidth: 110 },
        { title: '职务', key: 'positionName', align: 'center', minWidth: 110 },
        { title: '邮箱', key: 'email', align: 'center', minWidth: 160 },
        { title: '部门', key: 'department', align: 'center', minWidth: 110 },
        { title: '管理权限', key: 'principal', align: 'center', minWidth: 110 },
        {
          title: '加入团队时间',
          key: 'createTime',
          align: 'center',
          minWidth: 150
        },
        {
          title: '指纹状态',
          key: 'fingerprintStatus',
          align: 'center',
          minWidth: 120
        },
        {
          title: '操作',
          width: '270px',
          key: 'action',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, [
              h(
                'Poptip',
                {
                  props: {
                    title: `是否解绑成员${params.row.userName}指纹`,
                    confirm: true
                  },
                  style: {
                    textAlign: 'left'
                  },
                  on: {
                    'on-ok': () => {
                      this.handleUnbind(params.row)
                    },
                    'on-cancel': () => {}
                  }
                },
                [
                  h(
                    'Button',
                    {
                      props: {
                        type: 'primary',
                        size: 'small',
                        disabled: params.row.fingerprintStatus !== '已注册'
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
                    ['指纹解绑']
                  )
                ]
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
                        this.hadleEdit(params.row)
                        // this.target(1, params.row.id)
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
      dataTable: {},
      list: [],
      page: {
        totalCount: '',
        pageSize: 10,
        currentPage: 1
      },
      addOrChange: true,
      id: '' // 编辑时的关联Id
    }
  },
  mounted () {
    this.getList('', '', this.$route.query.id)
    this.getDepartment()
  },
  methods: {
    /**
     * 调换成员
     */
    selectChange (v) {
      // 多选
      this.selectUser = v
    },
    /**
     * 调换至部们
     */
    changeTeamTo (name) {
      this.$refs.changeTeam.validate(valid => {
        if (valid) {
          this.modalLoding = true
          let arr = []
          for (let i = 0; i < this.selectUser.length; i++) {
            arr.push(this.selectUser[i].id)
          }
          let team = this.changeTeam.exchangeUser[
            this.changeTeam.exchangeUser.length - 1
          ]
          memberExchange({ idList: arr, dpId: team }).then(res => {
            if (res.code === 200) {
              this.$Message.success(res.message)
              this.canShowExchange = false
              this.$refs.changeTeam.resetFields()
              this.modalLoding = false
              this.selectUser.length = 0
              this.getList()
            } else {
              this.modalLoding = false
            }
          })
        } else {
        }
      })
    },
    /**
     * 获取部门级联数据
     */
    getDepartment () {
      departMenu({}).then(r => {
        this.select.dpName = r.data
        this.teamList = JSON.parse(JSON.stringify(r.data)) // 深复制
        this.select.managerJurisdiction = JSON.parse(JSON.stringify(r.data)) // 深复制
        this.select.managerJurisdiction.push({
          teamId: 'all',
          value: 'all',
          label: '全部'
        })
      })
    },
    // 过滤选项
    format (labels, selectedData) {
      const index = labels.length - 1
      return labels[index]
    },
    /**
     * 获取指纹状态
     * @param {String} -status 指纹状态id
     * @returns 指纹状态
     */
    getFingerprintStatus (status) {
      let st = ''
      switch (status) {
        case 0:
          st = '未绑定'
          break
        case 1:
          st = '已绑定'
          break
        case 2:
          st = '已解绑'
          break
      }
      return st
    },
    handleSelectDelete (v) {
      // 删除选中的成员
      let nameArr = []
      let userId = []
      this.selectUser.forEach(r => {
        nameArr.push(r.userName)
        userId.push(r.id)
      })
      this.$Modal.confirm({
        title: '您是否确认删除成员:',
        content: nameArr.join(),
        loading: true,
        onOk: () => {
          this.asyncDelete(userId)
        }
      })
    },
    handleSearch () {
      // 搜索
      if (this.search.department.length > 0) {
        var team = this.search.department[this.search.department.length - 1]
      } else {
        team = ''
      }
      let name = this.search.name
      let phone = this.search.phone
      this.getList(name, phone, team)
    },
    /**
     *  指纹解绑
     */
    handleUnbind (data) {
      console.log(data)
      let message = { userId: data.userId, teamId: data.teamId }
      fingerprintUnbind(message).then(res => {
        if (res.code === 200) {
          this.$Message.success(res.message)
          this.getList()
        } else {
        }
      })
    },
    /**
     * 删除成员
     */
    handleDelete (id) {
      memberDelete({ idList: [id] }).then(res => {
        if (res.code === 200) {
          this.$Message.success('删除成功！')
          this.getList()
        } else {
        }
      })
    },
    /**
     * 添加成员按钮
     */
    addOrEdit () {
      this.canShowAdd = true
      this.statusText = '添加成员'
      this.addOrChange = true
    },
    /**
     * 添加成员
     */
    handleAdd (name) {
      this.$refs.model.validate(valid => {
        if (this.addOrChange) {
          var data = {
            phone: this.model.phone,
            dpId: this.model.dpName[this.model.dpName.length - 1],
            dpIds: this.model.managerJurisdiction[
              this.model.managerJurisdiction.length - 1
            ]
          }
        } else {
          // console.log(this.model.managerJurisdiction)
          data = {
            id: this.id,
            phone: this.model.phone,
            dpId: this.model.dpName[this.model.dpName.length - 1],
            dpIds: this.model.managerJurisdiction[
              this.model.managerJurisdiction.length - 1
            ]
          }
        }
        if (valid) {
          this.modalLoding = true
          memberAddOrEdit(data).then(res => {
            if (res.code === 200) {
              this.$Message.success(res.message)
              this.canShowAdd = false
              this.$refs.model.resetFields()
              this.modalLoding = false
              this.getList()
            } else {
              this.modalLoding = false
            }
          })
        }
      })
    },
    /**
     * 编辑成员返回信息
     */
    hadleEdit (data) {
      this.id = data.id
      this.addOrChange = false
      this.statusText = '编辑成员'
      this.canShowAdd = true
      managerEdit({ dpId: data.dpId, dpIds: data.dpIds }).then(res => {
        if (res.code === 200) {
          let arr = []
          for (let i = 0; i < res.data.memberList.length; i++) {
            arr.push(res.data.memberList[i].toString())
          }
          this.model.dpName = arr
          this.model.phone = data.phone
          this.model.managerJurisdiction = res.data.managerList
        } else {
        }
      })
    },
    handleCancel (name) {
      // 取消
      this.canShowAdd = false
      this.$refs.model.resetFields()
    },
    teamGo (name) {
      this.canShowExchange = false
      this.$refs.changeTeam.resetFields()
    },
    /**
     * 删除多个成员
     * @param {String} -uid 删除成员id(多个成员','隔开)
     */
    asyncDelete (value) {
      memberDelete({ idList: value }).then(res => {
        if (res.code === 200) {
          this.$Message.success(res.message)
          this.$Modal.remove()
          this.getList()
        }
      })
    },
    sizeChange (val) {
      // 每页条数
      if(val > this.page.totalCount){
        this.page.currentPage = 1
      }
      this.page.pageSize = val
      this.getList()
    },
    getPageData (val) {
      // 分页页数
      this.page.currentPage = val
      this.getList()
    },
    getList (name, phone, team) {
      console.log(this.page.pageSize)
      console.log(this.page.currentPage)
      // 获取列表
      memberList({
        pageSize: this.page.pageSize,
        pageNum: this.page.currentPage,
        username: name,
        phone: phone,
        dpId: team
      }).then(r => {
        this.list = r.data.records
        this.page.totalCount = r.data.total
        this.dataTable = {
          list: this.list,
          page: this.page
        }
      })
    },
    // 搜索部门选择
    teamSearch (value, selectedData) {
      this.search.department = value
    }
  },
  components: {}
}
</script>
