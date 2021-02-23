<style lang="less" scoped>
  .top-btn button:not(:first-child){
    margin-left: 20px;
  }
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
  <div class="top-btn">
    <Button type="primary" @click="create">创建团队</Button>
    <Button type="primary">登陆团队后台</Button>

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
            <Option v-for="item in numPeople" :style="modelWidth" :value="item.value" :label="item.label" :key="item.value"></Option>
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
  </div>
</template>

<script>
import City from '../../store/city.js'
export default {
  name: 'attendance',
  props: {},
  data () {
    return {
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
          value: '0-50人',
          label: '0-50人'
        },
        {
          value: '51-100人',
          label: '51-100人'
        },
        {
          value: '101-200人',
          label: '101-200人'
        },
        {
          value: '201-500人',
          label: '201-500人'
        },
        {
          value: '500人以上',
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
    // console.log(City);
  },
  methods: {
    create () {
      this.teamAdd = true
    },
    handleSubmit (name) {
      let cityList = this.formValidate.chinaArea
      let city = cityList.join('')
      let params = Object.assign({}, this.formValidate, {
        chinaArea: city
      })
      this.$refs[name].validate((valid) => {
        if (valid) {
          console.log(params)
          // console.log(this.formValidate);
          this.$Message.success('提交成功!')
        } else {
          this.$Message.error('提交失败!')
        }
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    cityChange (value, selectedData) {
      console.log(selectedData)
      const areaName = selectedData.map(item => item.label)
      let chinaArea = [...areaName]
      this.formValidate.chinaArea = chinaArea
    }
  }
}
</script>
