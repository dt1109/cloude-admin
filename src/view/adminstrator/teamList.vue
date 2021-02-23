<style lang="less" scoped>
  .vertical-center-modal{
    display: flex;
    align-items: center;
    justify-content: center;
    .ivu-modal{
      top: 0;
    }
  }
  .modal-title{
    padding: 10px 0 20px;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
  }
</style>

<template>
  <div>
    <Form ref="teamMessage" :modal="teamMessage" inline>
      <FormItem prop="teamName">
        <Input col="1" clearable :style="inpWidth" v-model="teamMessage.teamName"  placeholder="请输入团队名称"></Input>
      </FormItem>
      <FormItem prop="teamPhone">
        <Input clearable :style="inpWidth" v-model="teamMessage.phone"  placeholder="请输入成员手机号"></Input>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="search">查询</Button>
      </FormItem>
    </Form>
    <Modal v-model="teamAdd" class-name="vertical-center-modal" :mask-closable="false" footer-hide header-hide>
      <p class="modal-title">
        <span>创建团队</span>
      </p>
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
        <FormItem label="团队名称" prop="teamName">
          <Input v-model="formValidate.teamName" :style="modelWidth" placeholder="团队名称"></Input>
        </FormItem>
        <FormItem label="所在行业" prop="teamIndustry">
          <Input v-model="formValidate.teamIndustry" :style="modelWidth" placeholder="所在行业"></Input>
        </FormItem>
        <FormItem label="公司规模" prop="teamScale">
          <Select v-model="formValidate.teamScale" :style="modelWidth" placeholder="请选择">
            <Option v-for="item in numPeople" :value="item.value" :label="item.label" :key="item.value"></Option>
          </Select>
        </FormItem>
        <FormItem label="我的职务">
          <Select v-model="formValidate.teamPosition" :style="modelWidth" disabled placeholder="默认负责人，不可修改">
            <Option value="" label="默认负责人，不可修改"></Option>
          </Select>
        </FormItem>
        <FormItem label="所在地区" prop="chinaArea">
          <Cascader v-model="formValidate.chinaArea" :style="modelWidth" :data="created" @on-change="cityChange"></Cascader>
        </FormItem>
        <FormItem label="详细地址" prop="teamAddress">
          <Input v-model="formValidate.teamAddress" :style="modelWidth" type="textarea" :autosize="{minRows: 4,maxRows: 7}" placeholder="请输入详细地址"></Input>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleSubmit('formValidate')">提交</Button>
          <Button @click="handleReset('formValidate')" style="margin-left: 8px">重置表单</Button>
        </FormItem>
      </Form>
    </Modal>

    <private-table :border="true"  @sizeChange="sizeChange" class="m-t-35" :columnsList="tableColumns" :dataTable="dataTable"
                   @getPageData="getPageData"></private-table>
  </div>
</template>

<script>
import City from '../../store/city.js'
import { teamAllList } from '@/api/data'
export default {
  name: 'teamList',
  props: {},
  data () {
    return {
      teamMessage: {
        teamName: '', // 团队名称
        phone: '' // 成员手机号
      },
      inpWidth: 'width: 170px', // 搜索框宽度
      tableColumns: [
        // { type: 'selection', width: 60, align: 'center' },
        { title: '团队名称', key: 'teamName', align: 'center' },
        { title: '所在行业', key: 'profession', align: 'center' },
        { title: '公司规模', key: 'teamScale', align: 'center' ,render: (h, params) => {
            return h('span', this.getCompanyScale(params.row.teamScale))
          }},
        { title: '负责人', key: 'userName', align: 'center' },
        { title: '联系方式', key: 'phone', align: 'center' },
        { title: '创建时间', key: 'createTime', align: 'center' }
        // { title: '操作',
        //   key: 'togo',
        //   width: 180,
        //   align: 'center',
        //   render: (h, params) => {
        //     return h('div', {}, [
        //       h('Button', {
        //         props: {
        //           type: 'primary'
        //         },
        //         style: {
        //           marginRight: '10px'
        //         },
        //         on: {
        //           click: () => {
        //             this.target(1, params.row._index)
        //           }
        //         }
        //       }, '编辑'),
        //       h('Poptip', {
        //         props: {
        //           title: `确认删除${params.row.teamName}`,
        //           confirm: true
        //         },
        //         style: {
        //           textAlign: 'left'
        //         },
        //         on: {
        //           'on-ok': () => {
        //             this.handleDelete(params.row._index)
        //           },
        //           'on-cancel': () => {
        //             this.$Message.error('取消删除！')
        //           }
        //         }
        //       },
        //       [h('Button', {
        //         props: {
        //           type: 'error'
        //         },
        //         style: {
        //           verticalAlign: 'middle',
        //           color: '#fff'
        //         },
        //         class: ['colorError', 'font12']
        //       }, '删除')])
        //     ]
        //     )
        //   }
        // }
      ],
      dataTable: {},
      list: [],
      page: {
        totalCount: 0,
        pageSize: 10,
        currentPage: 1
      },
      created: City,
      modelWidth: 'width: 90%', // model 宽度
      teamAdd: false, // 创建团队表单显示状态
      formValidate: {
        teamName: '', // 团队名称
        teamIndustry: '', // 所在行业
        teamScale: '', // 公司规模
        teamPosition: '负责人', // 我的职务
        chinaArea: [], // 省市区 三级表单
        teamAddress: '' // 公司详细地址
      },
      numPeople: [ // 公司规模
        {
          value: '1',
          label: '0-50人'
        },
        {
          value: '2',
          label: '51-100人'
        },
        {
          value: '3',
          label: '101-200人'
        },
        {
          value: '4',
          label: '201-500人'
        },
        {
          value: '5',
          label: '500人以上'
        }
      ],
      ruleValidate: { // 表单验证
        teamName: [
          { required: true, message: '请填写团队名称', trigger: 'blur' }
        ],
        teamIndustry: [
          { required: true, message: '请填写所在行业', trigger: 'blur' }
        ],
        teamScale: [
          { required: true, message: '请选择公司规模', trigger: 'change' }
        ],
        teamAddress: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ],
        chinaArea: [
          { type: 'array', required: true, message: '请选择所在地区', trigger: 'change' }
        ]
      }
    }
  },
  components: {
    City
  },
  mounted () {
    this.getList()
  },
  methods: {
    /**
     * 获取公司规模
     * @param {String} -scale 规模
     * @returns 公司规模
     */
    getCompanyScale (scale) {
      let st = ''
      switch (scale) {
        case 1:
          st = '0-50人'
          break
        case 2:
          st = '51-100人'
          break
        case 3:
          st = '101-200人'
          break
        case 4:
          st = '201-500人'
          break
        case 5:
          st = '>500人以上'
          break
      }
      return st
    },
    target (status, id) { // 1详情、2新增、3编辑
      console.log(status)
      console.log(id)
      this.teamAdd = true
      // this.$router.push({ name: 'adjoining-mgt-mask', query: { status, id } })
    }, // 新建跳转
    search () {
      this.getList()
    }, // 搜索
    sizeChange (val) {
      this.page.pageSize = val
      this.getList()
    }, // 每页条数
    getPageData (val) {
      this.page.currentPage = val
      this.getList()
    }, // 分页页数
    getList () {
      let data = { pageSize: this.page.pageSize, pageNum: this.page.currentPage, teamName: this.teamMessage.teamName, phone: this.teamMessage.phone }
      teamAllList(data).then(res => {
        if (res.code === 200) {
          this.list = res.data.records
          this.page.totalCount = res.data.total
          this.dataTable = {
            list: this.list,
            page: this.page
          }
        } else {}
      })
    }, // 获取列表
    handleDelete (id) {
      console.log(id)
    }, // 删除
    // 创建表单出现
    addTeam () {
      this.teamAdd = true
    },
    // 提交表单
    handleSubmit (name) {
      let cityList = this.formValidate.chinaArea
      let city = cityList.join('')
      let params = Object.assign({}, this.formValidate, {
        chinaArea: city
      })
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.$Message.success('提交成功!')
        } else {
          this.$Message.error('提交失败!')
        }
      })
    },
    // 重置表单
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    // 所在地区选择
    cityChange (value, selectedData) {
      const areaName = selectedData.map(item => item.label)
      let chinaArea = [...areaName]
      this.formValidate.chinaArea = chinaArea
    }
  }
}
</script>
