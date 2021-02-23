<style lang="less" scoped></style>

<template>
  <div>
    <Row :gutter="16"
         class="m-t-10">
      <Col span="4">
      <Input v-model="teamName"
             @on-enter="handleSearch"
             @on-click="handleSearch"
             icon="ios-search"
             placeholder="团队名称"></Input>
      </Col>
      <Col span="2">
      <Button @click="handleSearch"
              type="primary">查询</Button>
      </Col>
      <Col span="3">
      <Button @click="canShowAdd = true"
              type="success">创建团队</Button>
      </Col>
    </Row>
    <Modal v-model="canShowAdd"
           :title="'创建团队'">
      <Form :ref="model"
            :model="model"
            :rules="formVerify"
            :label-width="80">
        <FormItem label="团队名称"
                  prop="teamName">
          <Input style="width:90%"
                 v-model="model.teamName"
                 placeholder="请输入团队名称"></Input>
        </FormItem>
        <FormItem label="所在行业"
                  prop="profession">
          <Input style="width:90%"
                 v-model="model.profession"
                 placeholder="请输入所在行业"> </Input>
        </FormItem>
        <FormItem label="公司规模"
                  prop="teamScale">
          <Select style="width:90%"
                  v-model="model.teamScale"
                  placeholder="请选择公司规模">
            <Option v-for="item in select.scale"
                    :value="item.value"
                    :key="item.value">{{item.label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="所在地区"
                  prop="address">
          <Cascader style="width:90%"
                    :render-format="format"
                    :data="departmentPeo"
                    v-model="model.address"
                    placeholder="请选择所在地区"></Cascader>
        </FormItem>
        <FormItem label="负责人">
          <p>{{this.$store.state.user.data.username}}</p>
        </FormItem>
        <FormItem label="联系方式">
          <p>{{this.$store.state.user.data.phone}}</p>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handleCancel(model)">取消</Button>
        <Button type="primary"
                :loading="refuseLoading"
                @click="handleAdd(model)">确定</Button>
      </div>
    </Modal>
    <private-table :border='border'
                   @sizeChange="sizeChange"
                   class="m-t-35"
                   :columnsList="tableColumns"
                   :dataTable="dataTable"
                   @getPageData="getPageData"></private-table>
  </div>
</template>
<script>
import { getDate } from '@/libs/tools'
import { getEeamList, getCityList, addOrEdit, TeamExchange } from '@/api/data'
export default {
  name: 'adjoining-mgt',
  data () {
    return {
      refuseLoading: false,
      border: true, // 表格边框
      departmentPeo: [], // 城市级联数据
      canShowAdd: false,
      teamName: '',
      select: {
        department: [], // 部门
        role: [], // 管理权限
        scale: [
          {
            label: '0-50',
            value: '1'
          },
          {
            label: '51-100',
            value: '2'
          },
          {
            label: '101-200',
            value: '3'
          },
          {
            label: '201-500',
            value: '4'
          },
          {
            label: '500以上',
            value: '5'
          }
        ]
      },
      model: {
        teamName: '',
        profession: '',
        teamScale: '',
        address: []
      }, // 创建表单
      formVerify: {
        teamName: [
          { required: true, message: '请输入团队名称！', trigger: 'blur' }
        ],
        profession: [
          { required: true, message: '请输入所属行业！', trigger: 'blur' }
        ],
        teamScale: [
          { required: true, message: '请选择团队规模！', trigger: 'change' }
        ],
        address: [
          {
            type: 'array',
            min: 1,
            required: true,
            message: '请选择所在地区！',
            trigger: 'change'
          }
        ]
      },
      tableColumns: [
        { title: '团队名称', key: 'teamName', align: 'center', minWidth: 110 },
        {
          title: '所在行业',
          key: 'profession',
          align: 'center',
          minWidth: 110
        },
        {
          title: '公司规模',
          key: 'teamScale',
          align: 'center',
          minWidth: 110,
          render: (h, params) => {
            return h('span', this.getCompanyScale(params.row.teamScale))
          }
        },
        { title: '负责人', key: 'userName', align: 'center', minWidth: 110 },
        { title: '联系方式', key: 'phone', align: 'center', minWidth: 140 },
        {
          title: '创建时间',
          key: 'createTime',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h(
              'span',
              {},
              getDate(Date.parse(params.row.createTime), 'year')
            )
          }
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
                        this.handleToggle(params.row)
                      }
                    }
                  },
                  ['进入后台管理']
                )
              ])
            ])
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
    this.cityList()
  },
  methods: {
    handleSearch () {
      // 搜索
      let teamName = this.teamName
      this.getList({
        pageNumber: this.page.currentPage,
        pageSize: this.page.pageSize,
        teamName: teamName
      })
    },
    target (status, id) {
      // 新建跳转
      this.$router.push({ name: 'adjoining-mgt-mask', query: { status, id } })
    },
    // 切换至团队
    handleToggle (val) {
      TeamExchange(val.id).then(res => {
        if (res.code === 200) {
          this.$Message.success('已切换至团队：' + val.teamName)
          this.$store.commit('setAccess', [1])
          let data = this.$store.state.user.data
          data.teamName = res.data.teamName
          data.teamId = res.data.id
          this.$store.commit('data', data)
          this.data = data.teamName
          window.location.reload()
        }
      })
    },
    /**
     * 获取公司规模
     * @param {String} -scale 规模
     * @returns 公司规模
     */
    getCompanyScale (scale) {
      let st = ''
      switch (scale) {
        case 1:
          st = '0-50'
          break
        case 2:
          st = '51-100'
          break
        case 3:
          st = '101-200'
          break
        case 4:
          st = '201-500'
          break
        case 5:
          st = '>500以上'
          break
      }
      return st
    },
    /**
     * 创建团队
     * @param name
     */
    handleAdd (name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          this.refuseLoading = true
          let params = {
            teamScale: this.model.teamScale,
            address: this.model.address[1]
          }
          let old = {
            teamName: this.model.teamName,
            profession: this.model.profession
          }
          Object.assign(params, old)
          addOrEdit(params).then(res => {
            if (res.code === 200) {
              this.$Message.success(res.message)
              this.$refs[name].resetFields()
              this.canShowAdd = false
              this.refuseLoading = false
              this.getList({})
            } else {
              this.refuseLoading = false
            }
          })
        }
      })
    },
    hadleEdit (val) {
      // 编辑
      this.canShowAdd = true
      for (let key in this.model) {
        this.model[key] = val[key] ? val[key] : ''
      }
    },
    handleCancel (name) {
      // 取消
      this.canShowAdd = false
      this.$refs[name].resetFields()
    },
    sizeChange (val) {
      // 每页条数
      this.page.pageSize = val
      this.getList({})
    },
    getPageData (val) {
      // 分页页数
      this.page.currentPage = val
      this.getList({})
    },
    getList () {
      // 获取列表
      getEeamList({
        pageNum: this.page.currentPage,
        pageSize: this.page.pageSize,
        teamName: this.teamName
      }).then(r => {
        this.list = r.data.records
        this.page.totalCount = r.data.total
        this.dataTable = {
          list: this.list,
          page: this.page
        }
      })
    },
    /**
     * 城市级联数据
     */
    cityList () {
      getCityList().then(res => {
        var obj = res.data
        var arr = []
        for (let i in obj) {
          var city = { value: i, label: i, children: [] }
          for (let o in obj[i]) {
            city.children.push({ value: obj[i][o].name, label: obj[i][o].name })
          }
          arr.push(city)
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
  },
  components: {}
}
</script>
