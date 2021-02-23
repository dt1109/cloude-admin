<style scoped>
.inputTop {
  margin-top: 5px;
}
.clickP {
  color: #2d8cf0;
  font-size: 14px;
  cursor: pointer;
}
.closeStart {
  font-size: 14px;
  color: #fff;
  background-color: #c71d24;
  display: inline-block;
  width: 16px;
  height: 16px;
  text-align: center;
  line-height: 16px;
  margin-left: 10px;
  cursor: pointer;
  border-radius: 50%;
}
</style>

<template>
  <div>
    <Row :gutter="2" class="m-t-10">
      <Col span="5">
        <Button type="primary" @click="addClassMore">新增班次</Button>
      </Col>
    </Row>
    <private-table
      :border="true"
      @sizeChange="sizeChange"
      class="m-t-35"
      :columnsList="tableColumns"
      :dataTable="dataTable"
      @getPageData="getPageData"
    ></private-table>
    <!--    <private-table @sizeChange="sizeChange" class="m-t-35" :columnsList="tableColumns" :dataTable="dataTable"></private-table>-->
    <Modal width="748" v-model="modalShow" title="班次管理" @on-cancel="handleReset(formItem)">
      <Form :ref="formItem" :model="formItem" :label-width="140">
        <FormItem label="班次名称">
          <Row>
            <Col span="10">
              <Input v-model="formItem.classesName" :maxlength="10" placeholder="班次名称"></Input>
            </Col>
          </Row>
          <span>最多10个字符（中英文或数字）</span>
        </FormItem>
        <FormItem label="该班次每天上下班次数">
          <RadioGroup v-model="formItem.ruleType" @on-change="workChange" type="button">
            <Radio :label="1">一天一次上下班</Radio>
            <Radio :label="2">一天两次上下班</Radio>
            <Radio :label="3">一天三次上下班</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="打卡时段设置">
          <div v-for="(item, index) in classLength" :key="index">
            <Row>
              <Col span="5">第{{index + 1}}次打卡：</Col>
            </Row>
            <Row>
              <Col span="2">上班</Col>
              <Col span="6">
                <TimePicker
                  format="HH:mm"
                  type="time"
                  placeholder="请选择时间"
                  v-model="formItem.checkingRuleStrategyDtoList[index].onDutyTime"
                ></TimePicker>
              </Col>
              <Col span="6" style="margin-left: 10px">打卡时间段(单位分钟)：</Col>
              <Col span="5">
                <Input
                  size="small"
                  type="number"
                  v-model="formItem.checkingClockStrategyDtoList[index].onDutyMinute"
                />
              </Col>
            </Row>
            <Row>
              <Col span="2">下班</Col>
              <Col span="6">
                <TimePicker
                  format="HH:mm"
                  type="time"
                  placeholder="请选择时间"
                  v-model="formItem.checkingRuleStrategyDtoList[index].offDutyTime"
                ></TimePicker>
              </Col>
              <Col span="6" style="margin-left: 10px">打卡时间段(单位分钟)：</Col>
              <Col span="5">
                <Input
                  size="small"
                  type="number"
                  v-model="formItem.checkingClockStrategyDtoList[index].offDutyMinutes"
                />
              </Col>
            </Row>
          </div>
        </FormItem>
        <!--<FormItem label="休息时段设置">-->
        <!--<Row><Checkbox v-model="single">开启/关闭</Checkbox></Row>-->
        <!--<Row v-if="single">-->
        <!--<Col span="2">休息开始</Col><Col span="8"><TimePicker type="time" placeholder="请选择时间" v-model="formItem.startRest"></TimePicker></Col>-->
        <!--<Col span="2">休息结束</Col><Col  span="8"><TimePicker type="time" placeholder="请选择时间" v-model="formItem.endRest"></TimePicker></Col>-->
        <!--</Row>-->
        <!--</FormItem>-->
        <!--<FormItem label="出勤设置">-->
        <!--合计工作时长<TimePicker type="time" placeholder="请选择时间" size="small" v-model="formItem.workTime"></TimePicker> 为 <Input style="width: 40px" v-model="formItem.oneDay" size="small" /> 天-->
        <!--<p>考勤统计工作时长及请假出差外出统计，会以此时间为准</p>-->
        <!--</FormItem>-->
        <FormItem label="下班不用打卡">
          <Checkbox v-model="formItem.noPunchClock">开启/关闭</Checkbox>
          <p>（开启后下班不打卡也不会记做异常）</p>
        </FormItem>
        <FormItem label="人性化班次">
          <!--<CheckboxGroup v-model="formItem.humanization">-->
          <Row>
            <Col span="6">
              <Checkbox v-model="latesOk">允许迟到分钟数</Checkbox>
            </Col>
            <Col span="6">
              <Input
                size="small"
                type="number"
                :disabled="!latesOk"
                v-model="formItem.checkingElasticityRegimeDto.elasticityMinute"
              />
            </Col>
          </Row>
          <Row>
            <Col span="6">
              <Checkbox v-model="latesSerious">严重迟到分钟数</Checkbox>
            </Col>
            <Col span="6">
              <Input
                size="small"
                type="number"
                :disabled="!latesSerious"
                v-model="formItem.checkingElasticityRegimeDto.onDutyMinute"
              />
            </Col>
          </Row>
          <Row>
            <Col span="6">
              <Checkbox v-model="latesDanger">旷工迟到分钟数</Checkbox>
            </Col>
            <Col span="6">
              <Input
                size="small"
                type="number"
                :disabled="!latesDanger"
                v-model="formItem.checkingElasticityRegimeDto.offDutyMinute"
              />
            </Col>
          </Row>
          <!--</CheckboxGroup>-->
        </FormItem>
        <FormItem label="晚走晚到">
          <Checkbox v-model="singleOk">开启/关闭</Checkbox>
          <div v-if="singleOk">
            <div v-for="(item, index) in formItem.checkingLateStrategyDtoList" :key="index">
              <p>晚走规则{{formItem.checkingLateStrategyDtoList[index].sort}}</p>
              <Row>
                <Col>
                  第一天下班后晚走
                  <Input
                    style="width: 50px"
                    v-model="formItem.checkingLateStrategyDtoList[index].onDutyLateMinutes"
                    type="number"
                    size="small"
                  />分钟，第二天上班可以晚到
                  <Input
                    style="width: 60px"
                    v-model="formItem.checkingLateStrategyDtoList[index].offDutyLateMinutes"
                    type="number"
                    size="small"
                  />分钟，
                  规则执行顺序：
                  <Input
                    style="width: 60px"
                    v-model="formItem.checkingLateStrategyDtoList[index].sort"
                    type="number"
                    size="small"
                  />
                  <span class="closeStart" @click="closeStart(index)">×</span>
                </Col>
              </Row>
            </div>
            <p class="clickP" @click="addSort">新增晚走晚到</p>
          </div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="handleReset(formItem)">取消</Button>
        <Button type="primary" :loading="refuseLoading" @click="handleSubmit">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { classesList, classesAddOrEdit, classesDelete } from '@/api/data'
export default {
  name: 'administrationClasses',
  data() {
    return {
      refuseLoading: false,
      singleOk: false, // 晚走晚到 是否开启
      latesOk: false, // 允许迟到分钟  是否可输入
      latesSerious: false, // 严重迟到分钟  是否可输入
      latesDanger: false, // 旷工迟到分钟   是否可输入
      formItem: {
        // 班次管理表单
        classesName: '', // 班次名称
        ruleType: '', // 班次选择
        checkingRuleStrategyDtoList: [], // 班次时间
        checkingClockStrategyDtoList: [], // 打卡时间段
        checkingLateStrategyDtoList: [], // 晚走晚到规则
        noPunchClock: false, // 下班不用打开  开启/关闭
        checkingElasticityRegimeDto: {
          elasticityMinute: null,
          onDutyMinute: null,
          offDutyMinute: null
        } // 弹性工作制度策略
      },
      list: [], // 列表数据
      modalShow: false, // 班次管理弹窗状态
      tableColumns: [
        // 表格表头
        { title: '班次名称', key: 'classesName', align: 'center' },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: { type: 'primary', size: 'small' },
                  on: {
                    click: () => {
                      this.classChange(params.row)
                    }
                  }
                },
                '编辑'
              ),
              h(
                'span',
                {
                  style: {
                    marginRight: '10px',
                    marginLeft: '10px',
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
                    title: `确认删除${params.row.classesName}`,
                    confirm: true
                  },
                  style: {
                    textAlign: 'left'
                  },
                  on: {
                    'on-ok': () => {
                      this.deleteClass(parseInt(params.row.id))
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
      dataTable: {}, // 列表信息
      page: {
        // 分页
        totalCount: '',
        pageSize: 10,
        currentPage: 1
      },
      classLength: []
    }
  },
  mounted() {
    this.getList({})
    this.handleReset()
  },
  methods: {
    /**
     * 新增班次
     */
    addClassMore() {
      this.singleOk = false
      this.modalShow = true
    },
    /**
     * 班次管理表格提交 新增班次
     */
    handleSubmit() {
      if (this.formItem.checkingRuleStrategyDtoList.length === 0) {
        this.$Message.warning('请填写上下班打卡时间！')
        return false
      }
      if (this.formItem.checkingRuleStrategyDtoList.length > 0) {
        for (
          let q = 0;
          q < this.formItem.checkingRuleStrategyDtoList.length;
          q++
        ) {
          if (
            this.formItem.checkingRuleStrategyDtoList[q].onDutyTime === '' ||
            this.formItem.checkingRuleStrategyDtoList[q].offDutyTime === '' ||
            this.formItem.checkingClockStrategyDtoList[q].onDutyMinute === '' ||
            this.formItem.checkingClockStrategyDtoList[q].offDutyMinutes === ''
          ) {
            this.$Message.warning('请把表格填写完整！')
            return false
          }
        }
      }
      if (
        this.formItem.classesName === '' ||
        (this.latesOk === true &&
          this.formItem.checkingElasticityRegimeDto.elasticityMinute === '') ||
        (this.latesSerious === true &&
          this.formItem.checkingElasticityRegimeDto.onDutyMinute === '') ||
        (this.latesDanger === true &&
          this.formItem.checkingElasticityRegimeDto.offDutyMinute === '')
      ) {
        this.$Message.warning('请把表格填写完整！')
        return
      }
      let integerReg = /^[0-9]*[1-9][0-9]*$/
      let reg = /^[\u4e00-\u9fa5A-Za-z0-9]+$/
      if (this.formItem.checkingLateStrategyDtoList.length > 0) {
        for (
          let e = 0;
          e < this.formItem.checkingLateStrategyDtoList.length;
          e++
        ) {
          let offDutyLateMinutes = this.formItem.checkingLateStrategyDtoList[e]
            .offDutyLateMinutes
          let onDutyLateMinutes = this.formItem.checkingLateStrategyDtoList[e]
            .onDutyLateMinutes
          let sort = this.formItem.checkingLateStrategyDtoList[e].sort
          if (this.singleOk === true) {
            if (
              sort === '' ||
              onDutyLateMinutes === '' ||
              offDutyLateMinutes === ''
            ) {
              this.$Message.warning('请把表格填写完整！')
              return false
            }
            if (
              !integerReg.test(offDutyLateMinutes) ||
              !integerReg.test(onDutyLateMinutes) ||
              !integerReg.test(sort)
            ) {
              this.$Message.warning('晚走晚到时长和规则顺序必须是正整数！')
              return false
            }
          } else {
            this.formItem.checkingLateStrategyDtoList = []
          }
        }
      }
      if (!reg.test(this.formItem.classesName)) {
        this.$Message.warning('班次名称只能是中英文或数字！')
        return false
      }
      if (
        parseInt(this.formItem.checkingElasticityRegimeDto.elasticityMinute) >
        parseInt(this.formItem.checkingElasticityRegimeDto.onDutyMinute)
      ) {
        this.$Message.warning('允许迟到分钟数不能大于严重迟到分钟数！')
        return false
      }
      if (
        parseInt(this.formItem.checkingElasticityRegimeDto.onDutyMinute) >
        parseInt(this.formItem.checkingElasticityRegimeDto.offDutyMinute)
      ) {
        this.$Message.warning('严重迟到分钟数不能大于旷工迟到分钟数！')
        return false
      }
      this.refuseLoading = true
      classesAddOrEdit(this.formItem).then(res => {
        if (res.code === 200) {
          this.modalShow = false
          this.refuseLoading = false
          this.getList({})
          this.$Message.success(res.message)
        } else {
          this.refuseLoading = false
        }
      })
    },
    /**
     * 编辑班次
     */
    classChange(data) {
      console.log(data)
      if (
        data.lateStrategy === '[]' ||
        data.lateStrategy === null ||
        data.lateStrategy === ''
      ) {
        this.singleOk = false
      } else {
        this.singleOk = true
      }
      this.modalShow = true
      this.formItem.classesName = data.classesName
      this.formItem.ruleType = data.ruleType
      this.formItem.checkingRuleStrategyDtoList =
        data.checkingRuleStrategyDtoList
      this.formItem.checkingClockStrategyDtoList =
        data.checkingClockStrategyDtoList
      this.formItem.checkingLateStrategyDtoList =
        data.checkingLateStrategyDtoList
      this.formItem.noPunchClock = data.noPunchClock
      this.formItem.checkingElasticityRegimeDto =
        data.checkingElasticityRegimeDto
      this.formItem.classesName = data.classesName
      this.formItem.id = data.id
      if (data.checkingLateStrategyDtoList > 0) {
        this.singleOk = true
      }
      let ruleType = data.ruleType
      this.classLength.length = ruleType
    },
    /**
     *  删除班次
     */
    deleteClass(data) {
      classesDelete(data).then(res => {
        if (res.code === 200) {
          this.getList({})
          this.$Message.success(res.message)
        } else {
          this.$Message.warning(res.message)
        }
      })
    },
    handleReset() {
      // 班次管理表格取消
      this.formItem = {
        // 班次管理表单
        classesName: '', // 班次名称
        ruleType: '', // 班次选择
        checkingRuleStrategyDtoList: [
          { onDutyTime: '', offDutyTime: '', times: '1' }
        ], // 班次时间
        checkingClockStrategyDtoList: [
          { times: '1', onDutyMinute: '', offDutyMinutes: '' }
        ], // 打卡时间段
        checkingLateStrategyDtoList: [], // 晚走晚到规则
        noPunchClock: false, // 下班不用打开  开启/关闭
        checkingElasticityRegimeDto: {
          elasticityMinute: null,
          onDutyMinute: null,
          offDutyMinute: null
        } // 弹性工作制度策略
      }
      this.classLength = [{}]
      this.modalShow = false
    },
    /**
     * 每天上下班打卡次数
     */
    workChange() {
      let ruleType = parseInt(this.formItem.ruleType)
      this.classLength.length = ruleType
      let checkingRuleStrategyDtoList = (this.formItem.checkingRuleStrategyDtoList = [])
      let checkingClockStrategyDtoList = (this.formItem.checkingClockStrategyDtoList = [])
      for (let i = 0; i < ruleType; i++) {
        let ruleStrategyDtoList = {
          onDutyTime: '',
          offDutyTime: '',
          times: i + 1
        }
        let clockStrategyDtoList = {
          times: i + 1,
          onDutyMinute: '',
          offDutyMinutes: ''
        }
        checkingRuleStrategyDtoList.push(ruleStrategyDtoList)
        checkingClockStrategyDtoList.push(clockStrategyDtoList)
      }
    },
    addSort() {
      // 新增晚走晚到
      this.formItem.checkingLateStrategyDtoList.push({
        sort: '',
        onDutyLateMinutes: '',
        offDutyLateMinutes: ''
      })
    },
    closeStart(index) {
      // 删除晚走晚到规则
      this.formItem.checkingLateStrategyDtoList.splice(index, 1)
    },
    // 获取列表
    getList(data) {
      classesList(this.page.currentPage, this.page.pageSize, data).then(res => {
        this.list = res.data.records
        this.page.totalCount = res.data.total
        this.dataTable = {
          list: this.list,
          page: this.page
        }
      })
    },
    // 分页
    getPageData(val) {
      // 点击页码返回的page
      this.page.currentPage = val
      this.getList({})
    },
    sizeChange(val) {
      // 点击 n条/n页
      this.page.pageSize = val
      this.getList({})
    }
  }
}
</script>
