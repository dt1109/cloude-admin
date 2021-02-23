<template>
  <div>
    <Button type="primary" @click="addModal">新增考勤组</Button>
    <private-table
      :border="true"
      @sizeChange="sizeChange"
      class="m-t-35"
      :columnsList="tableColumns"
      :dataTable="dataTable"
      @getPageData="getPageData"
    ></private-table>
    <Modal
      width="700"
      v-model="modal1"
      :styles="{ top: '20px' }"
      title="考勤组管理"
      :mask-closable="false"
      footer-hide
    >
      <div slot="close">
        <span class="closeBtn" @click="handleReset(formItem)">×</span>
      </div>
      <Form
        :ref="formItem"
        :model="formItem"
        :label-width="110"
        :rules="ruleValidate"
      >
        <FormItem label="考勤组名称：" prop="groupName">
          <Input
            style="width: 90%"
            :maxlength="10"
            v-model="formItem.groupName"
            placeholder="请输入考勤组名称："
          ></Input>
          <p>最多10个字符（中英文或数字）</p>
        </FormItem>
        <FormItem label="参与考勤人：" prop="checkingMemberDtoList">
          <Select
            style="width: 90%"
            v-model="selectYes"
            multiple
            @on-change="getUser"
            ref="addIn"
          >
            <Option
              v-for="(item, index) in cascade"
              :key="index"
              :disabled="item.selectStatus"
              :value="item.userId + ',' + item.dpId + ',' + item.userName"
            >
              {{ item.userName }}
              <span v-if="item.dpName">({{ item.dpName }})</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="无需考勤人：">
          <Select
            style="width: 90%"
            v-model="selectNo"
            multiple
            @on-change="getUserNo"
          >
            <Option
              v-for="(item, index) in cascade"
              :key="index + '-only'"
              :disabled="item.selectStatus"
              :value="item.userId + ',' + item.dpId + ',' + item.userName"
            >
              {{ item.userName }}
              <span v-if="item.dpName">({{ item.dpName }})</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="考勤组负责人：" prop="managerId">
          <Select style="width: 90%" v-model="formItem.managerId" clearable>
            <Option
              v-for="(item, index) in select"
              :key="index"
              :value="item.label"
              >{{ item.value }}</Option
            >
          </Select>
        </FormItem>
        <FormItem label="考勤类型" prop="checkingType">
          <RadioGroup v-model="formItem.checkingType" vertical>
            <Radio label="0">固定班制(每天考勤时间一样)</Radio>
            <Radio label="1">排班制(自定义设置考勤时间)</Radio>
            <Radio label="2" v-show="false"
              >自由工时(不设置班次，随时打卡)</Radio
            >
          </RadioGroup>
        </FormItem>
        <FormItem
          label="排班类型"
          required
          :show-message="false"
          v-show="formItem.checkingType === '1'"
        >
          <RadioGroup v-model="formItem.checkingStrategyData.scheduleType">
            <Radio label="0">不固定班次</Radio>
            <Radio label="1">固定班次</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem
          label="排班班次"
          prop="checkingType"
          v-show="
            formItem.checkingType === '1' &&
              formItem.checkingStrategyData.scheduleType === '0'
          "
        >
          <Button type="primary" @click="modalShiftpaiban = !modalShiftpaiban"
            >请选择</Button
          >
          <div v-show="paibanShowArrarList.length > 0">
            <div v-for="(item, index) in paibanShowArrarList" :key="index">
              <!-- {{item.classesName}}
              {{item.classesName == '休息' ? '' : paibandaytimearr[index][0].offDutyTime + '-' + paibandaytimearr[index][0].onDutyTime}} -->
              {{ !!item.classInfoDesc ? item.classInfoDesc : "" }}
            </div>
          </div>
        </FormItem>
        <FormItem
          label="排班周期"
          prop="checkingType"
          v-show="
            formItem.checkingStrategyData.scheduleType === '1' &&
              formItem.checkingType === '1'
          "
        >
          <Button
            type="primary"
            v-if="this.shiftDatapaiban.list.length <= 0"
            @click="modalShiftTimepaiban = !modalShiftTimepaiban"
            >请设置排班周期</Button
          >
          <div v-show="isShowpaibanTable">
            <private-table
              :border="true"
              ref="selection"
              @sizeChange="sizeChange"
              class="m-t-35"
              :columnsList="shiftTitlepaiban"
              :dataTable="shiftDatapaiban"
              :pageHide="true"
              stripe
            ></private-table>
          </div>
        </FormItem>
        <FormItem label="工作日设置" v-show="formItem.checkingType === '0'">
          <Button type="text" @click="modal2 = !modal2"
            >工作班次（点击选择）</Button
          >
          <private-table
            :border="true"
            ref="selection"
            @sizeChange="sizeChange"
            class="m-t-35"
            :columnsList="shiftTitle"
            :dataTable="shiftData"
            :pageHide="true"
            stripe
          ></private-table>
          <Checkbox v-model="formItem.legalRestFlag"
            >法定节假日自动排休</Checkbox
          >
        </FormItem>

        <FormItem
          label="排班制设置"
          v-show="formItem.checkingType === '1'"
          v-if="false"
        >
          <Row>
            <Col span="4">周期名称：</Col>
            <Col span="5">
              <Input
                v-model="formItem.checkingStrategyData.periodName"
                :maxlength="6"
                placeholder="请输入周期名称："
              ></Input>
            </Col>
            <span style="margin-left: 10px">最多6个中文字符（中文或英文）</span>
          </Row>
          <Row>
            <Col span="4">每个周期天数：</Col>
            <Col span="2">
              <Input
                v-model="formItem.checkingStrategyData.periodDay"
                :maxlength="2"
                @on-change="periodDayChange"
              ></Input>
            </Col>
            <span style="margin-left: 10px"
              >以{{
                formItem.checkingStrategyData.periodDay
              }}天为周期进行循环，最大周期天数为31天</span
            >
          </Row>
          <div v-for="(item, index) in periodDay" :key="index">
            <Row>
              <Col span="4">第{{ index + 1 }}天：</Col>
              <Col span="6">
                <Select v-model="classListData[index]" @on-change="dayAndWeek">
                  <Option
                    v-for="(item, idx) in classList"
                    :value="
                      parseInt(index) + 1 + ',' + item.label + ',' + item.value
                    "
                    :key="idx"
                    >{{ item.value }}</Option
                  >
                </Select>
              </Col>
            </Row>
          </div>
        </FormItem>
        <div v-show="formItem.checkingType === '2'">
          <FormItem label="工作日设置">
            <CheckboxGroup v-model="weekDay" @on-change="weekDayChange">
              <Checkbox label="1">周一</Checkbox>
              <Checkbox label="2">周二</Checkbox>
              <Checkbox label="3">周三</Checkbox>
              <Checkbox label="4">周四</Checkbox>
              <Checkbox label="5">周五</Checkbox>
              <Checkbox label="6">周六</Checkbox>
              <Checkbox label="7">周日</Checkbox>
            </CheckboxGroup>
            <span>请假时工作日以外的时间不计入请假时长</span>
          </FormItem>
          <FormItem label="考勤开始时间">
            <TimePicker
              type="time"
              format="HH:mm"
              v-model="clockTime"
              placeholder="考勤开始时间"
              style="width: 168px"
            ></TimePicker>
          </FormItem>
        </div>
        <FormItem>
          <Button
            type="primary"
            :loading="refuseLoading"
            @click="handleSubmit(formItem)"
            >保存设置</Button
          >
          <Button style="margin-left: 30px" @click="handleReset(formItem)"
            >取消设置</Button
          >
        </FormItem>
      </Form>
      <!--<div slot="footer">-->
      <!--<Button type="primary" @click="ok">保存设置</Button>-->
      <!--<Button @click="cancel">取消设置</Button>-->
      <!--</div>-->
    </Modal>
    <!--固定班制\更改班次-->
    <Modal v-model="modalShift" title="选择班次">
      <Row>
        <private-table
          @sizeChange="sizeChange"
          :border="true"
          ref="selection"
          class="m-t-35"
          :columnsList="shiftDataTitle"
          :dataTable="shiftTimeData"
          :pageHide="true"
        ></private-table>
      </Row>
    </Modal>
    <!--排班制 选择班次更改班次-->
    <Modal v-model="modalShiftpaiban" title="选择班次" @on-ok="ok">
      <Row>
        <private-table
          @sizeChange="sizeChange"
          :border="true"
          ref="selection"
          class="m-t-35"
          :columnsList="shiftDataTitlepaiban"
          :dataTable="shiftTimeDatapaiban"
          :pageHide="true"
        ></private-table>
      </Row>
    </Modal>
    <!-- 固定班次周期设定排班周期 -->
    <Modal
      v-model="modalShiftTimepaiban"
      width="35%"
      title="设置排班周期"
      @on-ok="setPaibanok"
    >
      <Row>
        <Col span="4">周期名称：</Col>
        <Col span="5">
          <Input
            v-model="formItem.checkingStrategyData.periodName"
            :maxlength="6"
            placeholder="请输入周期名称："
          ></Input>
        </Col>
        <span style="margin-left: 10px">最多6个中文字符（中文或英文）</span>
      </Row>
      <Row class="margin-top">
        <Col span="4">每个周期天数：</Col>
        <Col span="2">
          <Input
            v-model="formItem.checkingStrategyData.periodDay"
            :maxlength="2"
            @on-change="periodDayChange"
          ></Input>
        </Col>
        <span style="margin-left: 10px"
          >以{{
            formItem.checkingStrategyData.periodDay
          }}天为周期进行循环，最大周期天数为31天</span
        >
      </Row>
      <div v-for="(item, index) in periodDay" :key="index">
        <Row class="margin-top">
          <Col span="4">第{{ index + 1 }}天：</Col>
          <Col span="6">
            <Select v-model="classListData[index]" @on-change="dayAndWeek">
              <Option
                v-for="(item, idx) in classList"
                :value="
                  parseInt(index) + 1 + ',' + item.label + ',' + item.value
                "
                :key="idx"
                >{{ item.value }}</Option
              >
            </Select>
          </Col>
        </Row>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  groupCheckingMember,
  managerSelect,
  groupList,
  classesSelect,
  groupDelete,
  groupEdit,
  groupAddOrEdit,
  groupDeleteUser
} from "@/api/data";
export default {
  name: "administrationGroup",
  data() {
    return {
      refuseLoading: false,
      cascade: [], // 成员级联数据
      border: true, // 表格边框
      modal1: false, // 考勤组管理
      modalShift: false, // 班次管理
      modalShiftpaiban: false, // 班次管理
      modalShiftTimepaiban: false, //固定周期班次 设置排班周期
      classList: [], // 班次列表
      classListChange: [], // 固定班制班次修改列表
      classListChangePaiban: [], // 固定班制班次修改列表
      classListData: [], // 自定义考勤周期
      classListDataList: [], // 自定义考勤周期列表
      weekDay: [], // 自由工时/工作日设置
      clockTime: "", // 自由工时/考勤时间
      select: [], // 管理员列表
      managerId: "", // 管理员
      periodDay: [], // 周期天数
      checkingStrategyData: [], // 考勤日期以及对应的班次
      formItem: {
        // 班次信息
        groupName: "", // 考勤组名称
        managerId: "", // 考勤负责人ID
        checkingType: "0", // 考勤类型
        legalRestFlag: false, // 法定假日是否自动排休
        checkingStrategyData: {
          scheduleType: "0"
        }, // 考勤日期以及对应的班次
        checkingMemberDtoList: [], // 参与考勤人员
        noCheckingMemberDtoList: [] // 无需考勤人员
      },
      groupId: "", // 考勤组ID
      groupAddOrChange: "",
      selectYes: [], // 参与考勤人
      selectNo: [], // 无需考勤人
      oldSelectYes: [], // 参与考勤人
      oldSelectNo: [], // 无需考勤人
      list: [],
      ruleValidate: {
        // 新增/编辑 表单验证
        groupName: [
          { required: true, message: "请输入考勤组名称！", trigger: "blur" }
        ],
        checkingMemberDtoList: [
          {
            type: "array",
            required: true,
            message: "请添加参与考勤人！",
            trigger: "change"
          }
        ],
        managerId: [
          {
            type: "number",
            required: true,
            message: "请选择考勤组负责人！",
            trigger: "change"
          }
        ],
        checkingType: [
          { required: true, message: "请选择考勤类型！", trigger: "change" }
        ]
      },
      page: {
        // 分页
        totalCount: "",
        pageSize: 10,
        currentPage: 1
      },
      tableColumns: [
        // 考勤列表\表头
        { title: "名称", key: "groupName", align: "center" },
        { title: "人数", key: "memberCount", align: "center" },
        {
          title: "类型",
          key: "checkingType",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  }
                },
                this.switchJun(params.row.checkingType)
              )
            ]);
          }
        },
        { title: "考勤部门", key: "partakeDepart", align: "center" },
        { title: "考勤班次", key: "classesNames", align: "center" },
        {
          title: "操作",
          key: "12",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: { type: "primary", size: "small" },
                  on: {
                    click: () => {
                      this.modal1 = true;
                      this.redactModal(params);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "span",
                {
                  style: {
                    marginRight: "10px",
                    marginLeft: "10px",
                    fontSize: "18px",
                    color: "#ccc",
                    verticalAlign: "middle"
                  }
                },
                "|"
              ),
              h(
                "Poptip",
                {
                  props: {
                    title: `确认删除${params.row.groupName}`,
                    confirm: true
                  },
                  style: {
                    textAlign: "left"
                  },
                  on: {
                    "on-ok": () => {
                      this.deleteGroup(parseInt(params.row.id));
                    },
                    "on-cancel": () => {}
                  }
                },
                [
                  h(
                    "Button",
                    {
                      props: {
                        type: "error",
                        size: "small"
                      },
                      on: {
                        click: () => {}
                      }
                    },
                    ["删除"]
                  )
                ]
              )
            ]);
          }
        }
      ],
      dataTable: {}, // 考勤列表List
      dataDay: [
        // 固定班制
        { day: "周一", dayAndWeek: "1", classesName: "休息", classesId: 0 },
        { day: "周二", dayAndWeek: "2", classesName: "休息", classesId: 0 },
        { day: "周三", dayAndWeek: "3", classesName: "休息", classesId: 0 },
        { day: "周四", dayAndWeek: "4", classesName: "休息", classesId: 0 },
        { day: "周五", dayAndWeek: "5", classesName: "休息", classesId: 0 },
        { day: "周六", dayAndWeek: "6", classesName: "休息", classesId: 0 },
        { day: "周日", dayAndWeek: "7", classesName: "休息", classesId: 0 }
      ],
      days: "",
      selectRadio: null,
      selectRadiopaiban: null,
      shiftTitle: [
        // 固定班制工作日设置\表头
        { title: "工作日", key: "day", align: "center" },
        { title: "班次名称", key: "classesName", align: "center" },
        {
          title: "操作",
          key: "action",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.selectRadio = params.row.classesName;
                      this.currentChoose = null;
                      this.modalShift = true;
                      this.days = params.row.dayAndWeek;
                    }
                  }
                },
                "更改班次"
              )
            ]);
          }
        }
      ],
      currentChoose: "",
      currentChoosepaiban: "",
      shiftData: {}, // 固定班制工作日设置\每日考勤
      shiftDataTitle: [
        // 固定班制工作日设置\操作（更改班次\表头）
        {
          title: "选择",
          width: 60,
          align: "center",
          render: (h, params) => {
            let id = params.row.id;
            let flag = false;
            if (this.currentChoose === id) {
              flag = true;
            } else if (this.selectRadio == params.row.classesName) {
              flag = true;
            } else {
              flag = false;
            }
            let self = this;
            return h("div", [
              h("Radio", {
                props: {
                  value: flag
                },
                on: {
                  "on-change": () => {
                    this.selectRadio = null;
                    self.currentChoose = id;
                    this.dataDay[this.days - 1].classesId = params.row.id;
                    this.dataDay[this.days - 1].classesName =
                      params.row.classesName;
                  }
                }
              })
            ]);
          }
        },
        { title: "班次名称", key: "classesName" }
      ],
      shiftDatapaiban: {
        list: []
      }, //排班制 固定班次周期
      shiftTitlepaiban: [
        { title: "周期名称", key: "periodName", align: "center" },
        { title: "周期班次", key: "classNameList", align: "center" },
        { title: "周期天数", key: "periodDay", align: "center" },
        {
          title: "操作",
          key: "action",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.modalShiftTimepaiban = !this.modalShiftTimepaiban;
                    }
                  }
                },
                "设置"
              )
            ]);
          }
        }
      ],
      shiftDataTitlepaiban: [
        // 固定班制工作日设置\操作（更改班次\表头）
        {
          title: "选择",
          width: 60,
          align: "center",
          render: (h, params) => {
            let id = params.row.id;
            let flag = false;
            if (this.currentChoosepaiban === id) {
              flag = true;
            } else if (this.selectRadiopaiban == params.row.classesName) {
              flag = true;
            } else {
              flag = false;
            }
            let self = this;
            return h("div", [
              h("Checkbox", {
                props: {
                  value: flag
                },
                on: {
                  "on-change": sds => {
                    // this.selectRadiopaiban = null
                    // self.currentChoosepaiban = id
                    if (sds == true) {
                      this.paibanArrarList.push(params.row);
                      this.paibanArrarList = Array.from(
                        new Set(this.paibanArrarList)
                      );
                    } else {
                      this.paibanArrarList.forEach((item, index) => {
                        if (params.row.classesName == item.classesName) {
                          this.paibanArrarList.splice(index, 1);
                        }
                      });
                    }
                  }
                }
              })
            ]);
          }
        },
        { title: "班次名称", key: "classesName" }
      ],
      paibanArrarList: [], //排班选择数组
      paibanShowArrarList: [], //排班展示数组
      paibandaytimearr: [], //时间段数组
      shiftTimeData: {}, // 固定班制工作日设置\操作（更改班次\班次信息）
      shiftTimeDatapaiban: {}, // 固定班制工作日设置\操作（更改班次\班次信息）
      isShowpaibanTable: false
    };
  },
  watch: {
    "dataTable.list"(val, oldVal) {
      this.labelList();
    }
  },
  created() {
    this.getList();
  },
  mounted() {
    this.getList({}); // 获取考勤组列表
    this.getShiftList(); // 获取工作日设置列表
    this.labelList(); // 获取成员级联
    this.getClass();
    this.getSelect();
  },
  methods: {
    //确定排班周期 固定班次周期
    setPaibanok() {
      let shiftDatapaibanDataChange = [];
      let classNameListStr = "";
      this.classListDataList.forEach((item, index) => {
        classNameListStr += item.classesName + ",";
      });
      shiftDatapaibanDataChange.push({
        periodName: this.formItem.checkingStrategyData.periodName,
        periodDay: this.formItem.checkingStrategyData.periodDay,
        classNameList: classNameListStr
      });
      this.shiftDatapaiban = {
        list: shiftDatapaibanDataChange,
        page: this.page
      };
    },
    // 排班制确定班次
    ok(params) {
      this.paibanShowArrarList = JSON.parse(
        JSON.stringify(this.paibanArrarList)
      );
      let classesVoListSubmit = [];
      this.paibanShowArrarList.forEach(item => {
        if (!!item.ruleStrategy) {
          this.paibandaytimearr.push(eval(item.ruleStrategy));
        }
        classesVoListSubmit.push({
          id: item.id,
          classInfoDesc:
            item.classesName +
            " " +
            eval(item.ruleStrategy)[0].onDutyTime +
            "-" +
            eval(item.ruleStrategy)[0].offDutyTime
        });
        item.classInfoDesc =
          item.classesName +
          " " +
          eval(item.ruleStrategy)[0].onDutyTime +
          "-" +
          eval(item.ruleStrategy)[0].offDutyTime;
        //  JSON.parse(item.ruleStrategy)
      });
      this.formItem.checkingStrategyData.classesVoList = classesVoListSubmit;
    },
    /**
     *  新增考勤组按钮
     */
    addModal() {
      this.modal1 = true;
      this.groupAddOrChange = 1;
      this.shiftDatapaiban = {
        list: []
      };
      this.paibanShowArrarList = []
    },
    /**
     *  初始化表格
     */
    closeForm(name) {
      this.selectYes = [];
      this.selectNo = [];
      this.modal1 = false;
      this.$nextTick(() => {
        this.$refs[name].resetFields();
      });
    },
    handleReset(name) {
      // 取消设置
      this.closeForm(name);
    },
    /**
     *  添加/修改考勤组
     */
    handleSubmit(name) {
      let dataUser = [];
      for (let i = 0; i < this.selectYes.length; i++) {
        let user = this.selectYes[i].split(",");
        let userData = { userId: user[0], dpId: user[1], userName: user[2] };
        dataUser.push(userData);
      }
      this.formItem.checkingMemberDtoList = dataUser; // 需要考勤人员
      this.$refs[name].validate(valid => {
        if (valid) {
          for (let w = 0; w < this.selectYes.length; w++) {
            for (let e = 0; e < this.selectNo.length; e++) {
              if (this.selectYes[w] === this.selectNo[e]) {
                this.$Message.warning(
                  "参与考勤人与和无需考勤人员不能为同一人！"
                );
                return false;
              }
            }
          }
          let reg = /^[\u4e00-\u9fa5A-Za-z0-9]+$/;
          for (let q = 0; q < this.dataDay.length; q++) {
            delete this.dataDay[q].day;
          }
          this.checkingTimeStrategyList = this.dataDay;
          if (this.formItem.checkingType === "0") {
            this.formItem.checkingStrategyData.checkingTimeStrategyList = this.checkingTimeStrategyList;
            let dayWeekJdata = [
              "周一",
              "周二",
              "周三",
              "周四",
              "周五",
              "周六",
              "周日"
            ];
            for (let q = 0; q < this.dataDay.length; q++) {
              this.dataDay[q].day = dayWeekJdata[q];
            }
          }
          if (this.formItem.checkingType === "1") {
            this.formItem.checkingStrategyData.checkingTimeStrategyList = this.classListDataList;
            if (this.formItem.checkingStrategyData.scheduleType == "0") {
              if (this.paibanShowArrarList.length < 2) {
                this.$Message.warning("不固定班次请至少选择两个班次！");
                return false;
              }
              let a = 1;
              // this.formItem.checkingStrategyData.classesVoList = [];
            } else {
              let integerReg = /^[0-9]*[1-9][0-9]*$/;
              if (
                !integerReg.test(this.formItem.checkingStrategyData.periodDay)
              ) {
                this.$Message.warning("考勤周期必须是正整数！");
                return false;
              }
              if (this.classListData.length !== this.periodDay.length) {
                if (this.classListData.length > this.periodDay.length) {
                } else {
                  this.$Message.warning("设置排班周期每日班次请填写完整！");
                  return false;
                }
              }
              if (!reg.test(this.formItem.checkingStrategyData.periodName)) {
                this.$Message.warning("班制周期名称只能是中文或英文！");
                return false;
              }
            }
          }
          if (this.formItem.checkingType === "2") {
            let day = [];
            for (let q = 0; q < this.weekDay.length; q++) {
              let obj = { dayAndWeek: this.weekDay[q] };
              day.push(obj);
            }
            this.formItem.checkingStrategyData.checkingTimeStrategyList = day;
            this.formItem.checkingStrategyData.clockTime = this.clockTime;
          }
          if (this.groupAddOrChange === 1) {
            delete this.formItem.id;
          } else {
            this.formItem.id = this.groupId;
          }
          if (!reg.test(this.formItem.groupName)) {
            this.$Message.warning("考勤组名称只能是中英文或数字！");
            return false;
          }
          this.refuseLoading = true;
          let data = this.formItem;
          let yesUserIds = this.oldSelectYes;
          let noUserIds = this.oldSelectNo;
          for (let ff = 0; ff < this.oldSelectYes.length; ff++) {
            for (let f = 0; f < this.selectYes.length; f++) {
              if (this.oldSelectYes[ff] === this.selectYes[f]) {
                yesUserIds.splice(ff, 1);
              }
            }
          }
          for (let gg = 0; gg < this.oldSelectNo.length; gg++) {
            if (this.selectNo.length === 0) {
              noUserIds = this.selectNo;
            } else {
              for (let g = 0; g < this.selectNo.length; g++) {
                if (this.oldSelectNo[gg] === this.selectNo[g]) {
                  noUserIds.splice(gg, 1);
                }
              }
            }
          }
          let userIdsArr = yesUserIds.concat(noUserIds);
          let userIds = [];
          for (let h = 0; h < userIdsArr.length; h++) {
            userIds.push(userIdsArr[h].split(",")[0]);
          }
          let userIdsData = "";
          if (userIds.length === 0) {
            userIdsData = "";
          } else {
            userIdsData = userIds.join(",");
          }
          if (userIdsData !== "") {
            groupDeleteUser(this.formItem.id, userIdsData).then(res => {});
          }
          groupAddOrEdit(data).then(res => {
            if (res.code === 200) {
              this.$Message.success(res.message);
              this.refuseLoading = false;
              this.getList();
              this.closeForm(name);
            } else {
              this.refuseLoading = false;
            }
          });
        }
      });
    },
    /**
     *  编辑考勤组
     */
    async redactModal(data) {
      this.groupAddOrChange = 2;
      await groupEdit(data.row.id).then(res => {
        let dataList = res.data;
        this.groupId = dataList.id;
        this.formItem.groupName = dataList.groupName;
        this.formItem.checkingType = dataList.checkingType.toString();
        // debugger;
        this.formItem.checkingStrategyData.scheduleType = dataList.checkingStrategyData.scheduleType.toString();
        let userYes = []; // 参与考勤
        let userNo = []; // 无需考勤
        for (let i = 0; i < dataList.checkingMemberDtoList.length; i++) {
          userYes.push(
            dataList.checkingMemberDtoList[i].userId +
              "," +
              dataList.checkingMemberDtoList[i].dpId +
              "," +
              dataList.checkingMemberDtoList[i].userName
          );
        }
        for (let r = 0; r < dataList.noCheckingMemberDtoList.length; r++) {
          userNo.push(
            dataList.noCheckingMemberDtoList[r].userId +
              "," +
              dataList.noCheckingMemberDtoList[r].dpId +
              "," +
              dataList.noCheckingMemberDtoList[r].userName
          );
        }
        this.selectYes = this.oldSelectYes = userYes;
        this.selectNo = this.oldSelectNo = userNo;
        this.formItem.managerId = dataList.managerId;
        if (!!dataList.checkingStrategy) {
          let checkingStrategy = JSON.parse(dataList.checkingStrategy);
        }
        let checkingStrategydatalisttype = dataList.checkingStrategyData;
        if (dataList.checkingType === 0) {
          for (
            let w = 0;
            w < checkingStrategydatalisttype.checkingTimeStrategyList.length;
            w++
          ) {
            this.dataDay[w].classesId =
              checkingStrategydatalisttype.checkingTimeStrategyList[
                w
              ].classesId;
            this.dataDay[w].classesName =
              checkingStrategydatalisttype.checkingTimeStrategyList[
                w
              ].classesName;
            this.dataDay[w].dayAndWeek =
              checkingStrategydatalisttype.checkingTimeStrategyList[
                w
              ].dayAndWeek;
          }
          this.formItem.legalRestFlag = dataList.legalRestFlag;
        }
        if (dataList.checkingType === 1) {
          // debugger
          if (dataList.checkingStrategyData.scheduleType == 1) {
            let shiftDatapaibanData = [];
            shiftDatapaibanData.push({
              periodName: checkingStrategydatalisttype.periodName,
              periodDay: checkingStrategydatalisttype.periodDay,
              classNameList: checkingStrategydatalisttype.classNameList
            });
            this.shiftDatapaiban = {
              list: shiftDatapaibanData,
              page: this.page
            };
            if (shiftDatapaibanData.length > 0) {
              // debugger;
              this.isShowpaibanTable = true;
            }
          }
          if (dataList.checkingStrategyData.scheduleType == 0) {
            this.paibanShowArrarList =
              dataList.checkingStrategyData.classesVoList;
            this.paibandaytimearr = [];
          }
          this.formItem.checkingStrategyData.periodName =
            checkingStrategydatalisttype.periodName;
          this.formItem.checkingStrategyData.periodDay =
            checkingStrategydatalisttype.periodDay;
          // checkingStrategydatalisttype.checkingTimeStrategyList.map(
          //   (item, index) => {
          //     let objperiodDay = {}
          //     this.periodDay.push(objperiodDay)
          //   }
          // )
          // this.periodDay = checkingStrategydatalisttype.periodDay
          let dayAndWeek = [];
          for (
            let e = 0;
            e < checkingStrategydatalisttype.checkingTimeStrategyList.length;
            e++
          ) {
            dayAndWeek.push(
              parseInt(
                checkingStrategydatalisttype.checkingTimeStrategyList[e]
                  .dayAndWeek
              ) +
                "," +
                parseInt(
                  checkingStrategydatalisttype.checkingTimeStrategyList[e]
                    .classesId
                ) +
                "," +
                checkingStrategydatalisttype.checkingTimeStrategyList[e]
                  .classesName
            );
          }
          this.classListData = dayAndWeek;
          this.classListDataList =
            dataList.checkingStrategyData.checkingTimeStrategyList;
          this.periodDayChange();
        }
        if (dataList.checkingType === 2) {
          let day = [];
          for (
            let q = 0;
            q < checkingStrategydatalisttype.checkingTimeStrategyList.length;
            q++
          ) {
            day.push(
              checkingStrategydatalisttype.checkingTimeStrategyList[
                q
              ].dayAndWeek.toString()
            );
          }
          this.weekDay = day;
          this.clockTime = checkingStrategydatalisttype.clockTime;
        }
      });
    },
    /**
     *  删除考勤组
     */
    deleteGroup(id) {
      groupDelete(id).then(res => {
        if (res.code === 200) {
          this.$Message.success(res.message);
          this.getList();
        }
      });
    },
    /**
     *  自定义班次周期
     */
    dayAndWeek(data) {
      let dataUser = [];
      for (let i = 0; i < this.classListData.length; i++) {
        let user = this.classListData[i].split(",");
        let userData = {
          dayAndWeek: user[0],
          classesId: user[1],
          classesName: user[2]
        };
        if (userData.classesId == "undefined") {
          userData.classesId = 0;
        }
        dataUser.push(userData);
      }
      this.classListDataList = dataUser;
    },
    /**
     *  自定义工时
     */
    weekDayChange(data) {
      this.weekDay = data;
    },
    /**
     *  点击页码返回的page
     */
    getPageData(val) {
      this.page.currentPage = val;
      this.getList({});
    },
    /**
     *  点击 n条/n页
     */
    sizeChange(val) {
      this.page.pageSize = val;
      this.getList({});
    },
    /**
     *  参与考勤人员
     */
    getUser(data) {
      let dataUser = [];
      for (let i = 0; i < data.length; i++) {
        let user = data[i].split(",");
        let userData = { userId: user[0], dpId: user[1], userName: user[2] };
        dataUser.push(userData);
      }
      this.formItem.checkingMemberDtoList = dataUser;

      // 将删除参与考勤人设为可选中
      let participateArr = [];
      this.$refs.addIn.value.map(item => {
        participateArr.push(item.split(",")[2]);
      });
      this.cascade.map((item, index) => {
        if (participateArr.toString().indexOf(item.userName) != -1) {
          item.selectStatus = false;
        }
      });
    },
    /**
     *  无需考勤人员
     */
    getUserNo(data) {
      let dataUser = [];
      for (let i = 0; i < data.length; i++) {
        let user = data[i].split(",");
        let userData = { userId: user[0], dpId: user[1], userName: user[2] };
        dataUser.push(userData);
      }
      this.formItem.noCheckingMemberDtoList = dataUser;
    },
    /**
     *  自定义考勤周期天数
     */
    periodDayChange() {
      let data = [];
      if (parseInt(this.formItem.checkingStrategyData.periodDay) > 31) {
        this.$Message.warning("最大周期为31");
      } else {
        for (let i = 0; i < this.formItem.checkingStrategyData.periodDay; i++) {
          let obj = {};
          data.push(obj);
          this.periodDay = data;
        }
      }
      if (this.classListDataList.length > this.periodDay.length) {
        Array.from(this.classListDataList);
        let teamArr = this.classListDataList.slice(0, this.periodDay.length);
        this.classListDataList = teamArr;
      }
    },
    /**
     *  获取工作日设置列表
     */
    getShiftList() {
      this.shiftData = {
        list: this.dataDay,
        page: this.page
      };
    },
    /**
     * 获取班次列表
     */
    getClass() {
      classesSelect().then(res => {
        this.classListChange = res.data;
        this.classListChangePaiban = JSON.parse(JSON.stringify(res.data));
        this.shiftTimeDatapaiban = {
          list: this.classListChangePaiban,
          page: this.page
        };
        this.classListChange.push({
          label: 0,
          classesName: "休息"
        });
        this.shiftTimeData = {
          list: this.classListChange,
          page: this.page
        };

        let classListData = this.classList;
        for (let i = 0; i < res.data.length; i++) {
          let obj = {};
          if (!res.data[i].id) {
            obj.label = res.data[i].label;
          } else {
            obj.label = res.data[i].id;
          }
          obj.value = res.data[i].classesName;
          classListData.push(obj);
        }
        classListData.push({ label: 0, value: "休息" });
        this.classList = this.classList.filter((x, index, self) => {
          let arrids = [];
          this.classList.forEach((item, i) => {
            arrids.push(item.label);
          });
          return arrids.indexOf(x.label) === index;
        });
      });
    },
    /**
     * 获取考勤组列表
     */
    getList() {
      groupList(this.page.currentPage, this.page.pageSize).then(res => {
        this.list = res.data.records;
        this.page.totalCount = res.data.total;
        this.dataTable = {
          list: this.list,
          page: this.page
        };
      });
    },
    /**
     * 获取管理员列表
     */
    getSelect() {
      managerSelect().then(res => {
        let classListData = this.select;
        for (let i = 0; i < res.data.length; i++) {
          let objs = {};
          objs.label = res.data[i].userId;
          objs.value = res.data[i].userName;
          classListData.push(objs);
        }
      });
    },
    /**
     *  获取考勤组负责人数据
     */
    labelList() {
      groupCheckingMember().then(res => {
        if (res.code === 200) {
          this.cascade = res.data;
        }
      });
    },
    switchJun(status) {
      let _status = parseInt(status);
      switch (_status) {
        case 0:
          return "固定班制";
        case 1:
          return "排班制";
        case 2:
          return "自由工时";
      }
    }
  }
};
</script>

<style scoped>
.closeBtn {
  font-size: 26px;
}
.margin-top {
  margin-top: 10px;
}
</style>
