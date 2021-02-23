<style scoped>
img {
    width: 100%;
}

.itemInfo {
    line-height: 30px;
    margin-left: 10px;
    font-size: 20px;
}

.titleInfo {
    font-size: 16px;
    color: #515a6e;
}

.checkbox-line {
    line-height: 32px;
}

.spanStyle span {
    padding: 4px 8px;
    color: #515a6e;
    background-color: #fff;
    border: 1px solid #dcdee2;
    font-size: 14px;
    cursor: pointer;
}

.spanStyle .spanStyleBack {
    background-color: #57a3f3;
    border: 1px solid #57a3f3;
    color: #fff;
}

.paddingBox {
    padding: 15px 0;
}

.timeInput {
    display: inline-block;
    width: 210px;
    height: 32px;
    line-height: 1.5;
    padding: 4px 7px;
    font-size: 12px;
    border: 1px solid #dcdee2;
    border-radius: 4px;
    color: #515a6e;
    background-color: #fff;
    background-image: none;
    position: relative;
    cursor: text;
    margin-left: 10px;
    -webkit-transition: border 0.2s ease-in-out, background 0.2s ease-in-out,
        -webkit-box-shadow 0.2s ease-in-out;
    transition: border 0.2s ease-in-out, background 0.2s ease-in-out,
        -webkit-box-shadow 0.2s ease-in-out;
    transition: border 0.2s ease-in-out, background 0.2s ease-in-out,
        box-shadow 0.2s ease-in-out;
    transition: border 0.2s ease-in-out, background 0.2s ease-in-out,
        box-shadow 0.2s ease-in-out, -webkit-box-shadow 0.2s ease-in-out;
}

.btnBox {
    display: flex;
    justify-content: center;
    padding: 30px 0;
}

.changeStart {
    width: 150px;
    margin: 0 20px;
}

.ivu-table-cell {
    padding-left: 0;
    padding-right: 0;
}
</style>

<template>
<div>
    <Form inline>
        <FormItem>
            <DatePicker v-model="searchData.startTime" type="month" placeholder="考勤时间" style="width: 200px"></DatePicker>
        </FormItem>
        <FormItem>
            <Cascader @on-change="teamChange" :data="departmentPeo" v-model="model1" placeholder="部门/人员"></Cascader>
        </FormItem>
        <FormItem>
            <Checkbox class="checkbox-line" size="large" v-model="searchData.containQuit">离职人员</Checkbox>
        </FormItem>
        <FormItem>
            <Button @click="_search" type="primary">搜索</Button>
        </FormItem>
        <FormItem>
            <Button type="primary" @click="handleExport">
                <Icon type="ios-download-outline"></Icon>导出
            </Button>
        </FormItem>
    </Form>
    <private-table :exportHide="tableName" :border="true" :pageHide="false" @sizeChange="sizeChange" class="m-t-35" :columnsList="tableColumns" :dataTable="dataTable" @getPageData="getPageData"></private-table>
    <!-- 考勤异常每日详情-->
    <Modal width="800" v-model="modalDay" :title="modalDataDayTitle.title">
        <Row>
            <!--用户头像-->
            <!--<Col span="2"><img :src="modalDataDay.imgUrl" alt=""></Col>-->
            <Col span="4" class="itemInfo">
            <p class="name">{{modalDataDayTitle.name}}</p>
            <p class="titleInfo">考勤组：{{modalDataDay.groupName}}</p>
            <p class="titleInfo">今日打卡{{modalDataDay.punchTimes}}次</p>
            </Col>
        </Row>
        <private-table :pageHide="true" :border="true" @sizeChange="sizeChange" class="m-t-25" :columnsList="userStart" :dataTable="punchRecordList" @getPageData="getPageData"></private-table>
    </Modal>
    <!--日考勤异常修改-->
    <Modal v-model="modalDayChange" :title="modalDataDayTitle.title" width="500" footer-hide @on-cancel="closeDay">
        <div class="padLeft">
            <p class="spanStyle">
                将考勤结果修改为：
                <span @click="changeStartTrue" :class="{spanStyleBack:dayAbnormalBtn === true}">正常</span>
                <span @click="changeStartFalse" :class="{spanStyleBack:dayAbnormalBtn === false}">{{dayAbnormal}}</span>
            </p>
            <p v-if="dayAbnormalBtn === false" class="paddingBox">
                <span>{{dayAbnormal}}：</span>
                <input class="timeInput" v-model="dayStartTime" placeholder="时长单位/（分钟）" />
            </p>
            <Row>
                <Col>
                </Col>
            </Row>
        </div>
        <div class="btnBox">
            <Button class="changeStart" :loading="loanging" type="primary" @click="changeStartDay">保存</Button>
            <Button class="changeStart" @click="closeDay">取消</Button>
        </div>
    </Modal>
    <!--月汇总-->
    <Modal width="800" v-model="modalMonth" :title="modalDataDayMonth.title">
        <private-table :border="true" @sizeChange="sizeChange" class="m-t-35" :columnsList="monthStartValue===1?monthStart:monthStartValue===2?monthStartClass:monthStartValue===3?monthStartDay: ''" :dataTable="monthStartList" @getPageData="getPageData"></private-table>
    </Modal>
</div>
</template>

<script>
import {
    dateFormat
} from '../../components/common_fun'
import {
    downloadXlex,
    downExcel
} from '@/libs/tools'
import {
    checkingMonthStatistics,
    checkingMonthStatisticsDetail,
    checkingMonthStatisticsDayDetail,
    departCascade,
    checkingFix,
    ExportcheckingMonthStatistics
} from '@/api/data'
export default {
    name: 'statistics',
    data() {
        return {
            hand: 'hand',
            loanging: false,
            tableName: '考勤统计',
            dayStatus: [], // 每日状态
            dayRow: {}, // 表格行信息
            modalDay: false, // 每日考勤状态
            modalDayChange: false, // 修改每日考勤状态
            modalMonth: false, // 当月考勤异常
            modalDataDay: {}, // 某日详情
            modalDataDayTitle: {
                // 某日详情表头
                title: ''
            },
            modalDataDayMonth: {
                // 月统计表头
                title: '',
                text: ''
            },
            dayAbnormal: '', // 管理修改每日状态
            dayAbnormalBtn: false, // 管理修改每日状态
            departmentPeo: [], // 部门、人员
            // 考勤统计列表
            tableColumns: [{
                    title: '姓名',
                    key: 'username',
                    fixed: 'left',
                    minWidth: 100,
                    align: 'center'
                },
                {
                    title: '部门',
                    key: 'departmentName',
                    minWidth: 100,
                    align: 'center'
                },
                // { title: '工号', key: 'workNum', minWidth: 100, align: 'center' },
                {
                    title: '出勤天数',
                    key: 'workDays',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                style: {
                                    padding: '10px'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 0)
                                    }
                                }
                            },
                            params.row.workDays
                        )
                    }
                },
                {
                    title: '加班次数',
                    key: 'overtimeTimes',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                style: {
                                    padding: '10px'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 17)
                                    }
                                }
                            },
                            params.row.overtimeTimes
                        )
                    }
                },
                {
                    title: '加班时长',
                    key: 'overtimeDuration',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                style: {
                                    padding: '10px'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 17)
                                    }
                                }
                            },
                            params.row.overtimeDuration
                        )
                    }
                },
                {
                    title: '休息天数',
                    key: 'restDays',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                style: {
                                    padding: '10px'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 18)
                                    }
                                }
                            },
                            params.row.restDays
                        )
                    }
                },
                {
                    title: '迟到次数',
                    key: 'lateTimes',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                style: {
                                    padding: '10px'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 1)
                                    }
                                }
                            },
                            params.row.lateTimes
                        )
                    }
                },
                {
                    title: '迟到时长',
                    key: 'lateDuration',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 1)
                                    }
                                }
                            },
                            params.row.lateDuration
                        )
                    }
                },
                {
                    title: '早退次数',
                    key: 'leaveEarlyTimes',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 4)
                                    }
                                }
                            },
                            params.row.leaveEarlyTimes
                        )
                    }
                },
                {
                    title: '早退时长',
                    key: 'leaveEarlyDuration',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 4)
                                    }
                                }
                            },
                            params.row.leaveEarlyDuration
                        )
                    }
                },
                {
                    title: '上班缺卡次数',
                    key: 'noCheckingTimes',
                    minWidth: 150,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 5)
                                    }
                                }
                            },
                            params.row.noCheckingTimes
                        )
                    }
                },
                {
                    title: '出差天数',
                    key: 'businessTripDuration',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 14)
                                    }
                                }
                            },
                            params.row.businessTripDuration
                        )
                    }
                },
                {
                    title: '请假天数',
                    key: 'leaveDuration',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 16)
                                    }
                                }
                            },
                            params.row.leaveDuration
                        )
                    }
                },
                {
                    title: '外出天数',
                    key: 'outDuration',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 15)
                                    }
                                }
                            },
                            params.row.outDuration
                        )
                    }
                },
                {
                    title: '旷工天数',
                    key: 'absenceDuration',
                    minWidth: 100,
                    align: 'center',
                    render: (h, params) => {
                        return h(
                            'Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        this.monthStatistics(params.row, 3)
                                    }
                                }
                            },
                            params.row.absenceDuration
                        )
                    }
                }
            ],
            dataTable: {
                list: []
            },
            // 每日详情列表
            userStart: [{
                    title: '考勤时间',
                    key: 'checkingTime',
                    align: 'center'
                },
                {
                    title: '打卡时间',
                    key: 'punchTime',
                    align: 'center'
                },
                {
                    title: '考勤结果',
                    key: 'status',
                    align: 'center',
                    render: (h, params) => {
                        var userDayStart = ''
                        userDayStart = this.timeStart(params.row.status)
                        let startNum = parseInt(params.row.status)
                        if (
                            startNum === 1 ||
                            startNum === 2 ||
                            startNum === 3 ||
                            startNum === 4
                        ) {
                            return h(
                                'Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.dayAbnormal = userDayStart
                                            this.workAmend(params.row)
                                        }
                                    }
                                },
                                userDayStart
                            )
                        } else {
                            return h('Span', userDayStart)
                        }
                    }
                },
                {
                    title: '考勤班次',
                    key: 'checkClassesInfo',
                    align: 'center'
                }
            ],
            monthStartValue: 1, // 异常状态表头
            // 每月异常总数
            monthStart: [{
                    title: '考勤时间',
                    key: 'checkingTime',
                    align: 'center'
                },
                {
                    title: '用户打卡时间',
                    key: 'punchTime',
                    align: 'center'
                },
                {
                    title: '考勤结果',
                    key: 'result',
                    align: 'center'
                },
                {
                    title: '考勤班次',
                    key: 'checkingClass',
                    align: 'center'
                }
            ],
            monthStartClass: [{
                    title: '考勤日期',
                    key: 'checkingTime',
                    align: 'center'
                },
                {
                    title: '考勤结果',
                    key: 'result',
                    align: 'center'
                },
                {
                    title: '考勤班次',
                    key: 'checkingClass',
                    align: 'center'
                }
            ],
            monthStartDay: [{
                    title: '考勤日期',
                    key: 'checkingTime',
                    align: 'center'
                },
                {
                    title: '考勤结果',
                    key: 'result',
                    align: 'center'
                },
                {
                    title: '时长',
                    key: 'duration',
                    align: 'center'
                },
                {
                    title: '开始时间',
                    key: 'startTime',
                    align: 'center'
                },
                {
                    title: '结束时间',
                    key: 'endTime',
                    align: 'center'
                }
            ],
            monthStartList: {}, // 每月考勤异常统计
            punchRecordList: {}, // 每日详情表格数据
            searchData: {
                containQuit: false,
                startTime: '',
                departmentId: '',
                userId: ''
            },
            page: {
                totalCount: '', // 总页数
                pageSize: 10, // 每页条数
                currentPage: 1 // 分页页数
            },
            model1: [],
            month: '',
            date: '',
            day: '',
            currentTime: '',
            dayStartData: '', // 某日异常状态内容
            dayStartTime: '', // 某日异常修改时长
            dayMessage: '', // 每日异常按钮修改数据
            dataMessage: '' // 列表重构数据
        }
    },
    created() {
        this.getList({})
        this.calendar(new Date())
        this.labelList()
    },
    mounted() {
        this.getList({})
        this.calendar(new Date())
        this.labelList()
    },
    methods: {
        // 获取标准时间，并给每日对应的key值
        calendar(data) {
            if (data.length === 19) {
                data = new Date(Date.parse(data.toString().replace(/-/g, '/')))
            }
            let arr = this.tableColumns
            arr.splice(15, arr.length - 15)
            let y = data.getFullYear()
            let m = data.getMonth() + 1
            let d = new Date(y, m, 0).getDate()
            for (let i = 1; i <= d; i++) {
                let p = new Date(y, m - 1, 1)
                this.GetDate(p, i - 1)
            }
        },
        /**
         *  当月每日考勤状态
         * {currentDate} 时间
         *  {num} 当日对应的key值
         */
        GetDate(currentDate, num) {
            let date = new Date(currentDate)
            date = date.valueOf()
            date = date + num * 24 * 60 * 60 * 1000
            date = new Date(date)
            this.month = date.getMonth() + 1
            this.date = date.getDate()
            this.day = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][
                date.getDay()
            ]
            this.currentTime = this.day + '(' + this.month + '月' + this.date + ')'
            let y = {
                title: this.currentTime,
                key: parseInt(num) + 1,
                minWidth: 120,
                align: 'center',
                cursor: 'pointer',
                render: (h, params) => {
                    var userDayStarts = ''
                    if (params.row.punchDailyRecordList !== null) {
                        for (var i = 0; i < params.row.punchDailyRecordList.length; i++) {
                            if (
                                parseInt(
                                    new Date(
                                        params.row.punchDailyRecordList[i].checkingTime
                                    ).getDate()
                                ) ===
                                parseInt(num) + 1
                            ) {
                                userDayStarts = params.row.punchDailyRecordList[i].statusMsg
                            }
                        }
                    }
                    if (params.row.punchRecordList.length === 0) {
                        return h('Span')
                    } else {
                        return h(
                            'Span', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                style: {
                                    cursor: 'pointer'
                                },
                                on: {
                                    click: () => {
                                        this.modalDay = true
                                        for (
                                            let q = 0; q < params.row.punchRecordList.length; q++
                                        ) {
                                            if (
                                                parseInt(
                                                    new Date(
                                                        params.row.punchRecordList[q].checkingTime
                                                    ).getDate()
                                                ) === parseInt(params.column.key)
                                            ) {
                                                var id = params.row.id
                                                var data = this.dateChange(
                                                    params.row.punchRecordList[q].checkingTime
                                                )
                                            }
                                        }
                                        this.modalDataDayTitle.title =
                                            params.row.username + ' ' + data
                                        this.modalDataDayTitle.name = params.row.username
                                        this.dayMessage = {
                                            id: id,
                                            data: data
                                        }
                                        this.getUserStart(id, data)
                                    }
                                }
                            },
                            userDayStarts
                        )
                    }
                }
            }
            let t = this.tableColumns
            t.push(y)
        },
        /**
         *  管理员修改每日异常弹窗
         */
        workAmend(data) {
            this.modalDayChange = true
            this.dayStartData = data
        },
        /**
         *  管理员修改每日异常
         */
        changeStartDay() {
            let integerReg = /^[0-9]*[1-9][0-9]*$/
            let id = this.dayStartData.id
            let status = this.dayStartData.status
            let dayStartTime = this.dayStartTime
            if (this.dayAbnormalBtn === true) {
                status = 0
                dayStartTime = 0
            } else {
                if (!integerReg.test(dayStartTime)) {
                    this.$Message.warning('修改时长只能为正整数！')
                    return false
                }
            }
            this.loanging = true
            checkingFix({
                duration: parseInt(dayStartTime),
                id: id,
                status: status
            }).then(res => {
                if (res.code === 200) {
                    this.getUserStart(this.dayMessage.id, this.dayMessage.data)
                    this.modalDayChange = false
                    this.loanging = false
                    this.dayStartTime = ''
                    this.$Message.success(res.message)
                } else {
                    this.loanging = false
                }
            })
        },
        closeDay() {
            this.modalDayChange = false
            this.dayStartTime = ''
        },
        /**
         *  搜索
         */
        _search() {
            this.searchData.startTime = dateFormat(this.searchData.startTime)
            if (this.model1.length === 0) {
                this.searchData.departmentId = ''
                this.searchData.userId = ''
            }
            let data = this.searchData
            this.getList(data)
            if (
                this.searchData.startTime === null ||
                this.searchData.startTime === ''
            ) {
                this.calendar(new Date())
            } else {
                this.calendar(this.searchData.startTime)
            }
        },
        /**
         *  选择部门成员
         */
        teamChange(value, selectedData) {
            if (selectedData.length > 0) {
                this.searchData.departmentId =
                    selectedData[selectedData.length - 1].parentId
                this.searchData.userId = selectedData[selectedData.length - 1].value
            }
        },
        /**
         * 每月异常总数
         */
        monthStatistics(data, type) {
            let text = this.monthStartListZon(type)
            if (type === 3) {
                this.monthStartValue = 2
            }
            if (type === 4) {
                this.monthStartValue = 1
            }
            if (type === 14 || type === 15 || type === 16 || type === 17) {
                this.monthStartValue = 3
            }
            this.modalDataDayTitle.title = data.username + '  ' + data.month
            this.modalDataDayMonth.title =
                data.username + '  ' + data.month + ' ' + text
            this.modalMonth = true
            checkingMonthStatisticsDetail(type, data.id).then(res => {
                for (let i = 0; i < res.data.length; i++) {
                    if (res.data[i].checkingTime !== null) {
                        res.data[i].checkingTime = res.data[i].checkingTime.split(' ', 1)
                    }
                }
                this.monthStartList = {
                    list: res.data,
                    page: ''
                }
            })
        },
        /**
         *  页数变化
         */
        getPageData(val) {
            this.page.currentPage = val
            this.searchData.startTime = dateFormat(this.searchData.startTime)
            if (this.model1.length === 0) {
                this.searchData.departmentId = ''
                this.searchData.userId = ''
            }
            let data = this.searchData
            this.getList(data)
        },
        /**
         *  每页条数变化
         */
        sizeChange(val) {
            this.page.pageSize = val
            this.searchData.startTime = dateFormat(this.searchData.startTime)
            if (this.model1.length === 0) {
                this.searchData.departmentId = ''
                this.searchData.userId = ''
            }
            let data = this.searchData
            this.getList(data)
        },
        /**
         *  考勤列表
         */
        getList(data) {
            if (data.containQuit === false) {
                delete data.containQuit
            }
            checkingMonthStatistics(
                this.page.currentPage,
                this.page.pageSize,
                data
            ).then(res => {
                this.page.totalCount = res.data.total
                this.getNewList(res.data.records)
                this.dataTable = {
                    list: this.dataMessage,
                    page: this.page
                }
            })
        },
        /**
         * 列表数据重构
         */
        getNewList(data) {
            let dataMessage = data
            for (let i = 0; i < dataMessage.length; i++) {
                if (dataMessage[i].punchDailyRecordList !== null) {
                    for (let q = 0; q < dataMessage[i].punchDailyRecordList.length; q++) {
                        let date = new Date(
                            dataMessage[i].punchDailyRecordList[q].checkingTime
                        )
                        let y = date.getFullYear()
                        let m = date.getMonth() + 1
                        let d = new Date(y, m, 0)
                        let daysNums = d.getDate()
                        let dayNum = parseInt(
                            new Date(
                                dataMessage[i].punchDailyRecordList[q].checkingTime
                            ).getDate()
                        )
                        let obj = {}
                        for (let w = 1; w < daysNums + 1; w++) {
                            if (w === dayNum) {
                                obj[w] = dataMessage[i].punchDailyRecordList[q].statusMsg
                            }
                        }
                        Object.assign(dataMessage[i], obj)
                    }
                }
            }
            this.dataMessage = dataMessage
        },
        /**
         *  某日考勤详情
         * @id {Number}  id
         * @data {Date} 日期
         */
        getUserStart(id, data) {
            checkingMonthStatisticsDayDetail(id, data).then(res => {
                this.modalDataDay = res.data
                if (res.data.punchRecordList === null) {
                    this.punchRecordList = {
                        list: [],
                        page: ''
                    }
                } else {
                    this.punchRecordList = {
                        list: res.data.punchRecordList,
                        page: ''
                    }
                }
            })
        },
        /**
         *  某日考勤详情
         * @data {Date}  日期
         */
        dateChange(data) {
            let date = new Date(data)
            let Y = date.getFullYear()
            let M = date.getMonth() + 1
            let D = date.getDate()
            if (M < 10) {
                M = '0' + M
            }
            if (D < 10) {
                D = '0' + D
            }
            return Y + '-' + M + '-' + D
        },
        /**
         *  获取部门成员级联数据
         */
        labelList() {
            departCascade().then(res => {
                if (res.code === 200) {
                    this.departmentPeo = res.data
                }
            })
        },
        changeStartTrue() {
            this.dayAbnormalBtn = true
        },
        changeStartFalse() {
            this.dayAbnormalBtn = false
        },
        // 导出报表
        handleExport() {
            this.searchData.startTime = dateFormat(this.searchData.startTime)
            if (this.model1.length === 0) {
                this.searchData.departmentId = ''
                this.searchData.userId = ''
            }
            let data = this.searchData
            console.log(data)
            ExportcheckingMonthStatistics(1, this.page.totalCount,
                data).then(res => {
                // console.log(res)
                downExcel(res, '考勤统计')
                this.$Message.success('导出成功!')

            })
            // checkingMonthStatistics(1, this.page.totalCount,
            //   data
            // ).then(res => {
            //   if (res.code === 200) {
            //     let arr = []
            //     let key = []
            //     for (let i = 0; i < this.tableColumns.length; i++) {
            //       arr.push(this.tableColumns[i].title)
            //       key.push(this.tableColumns[i].key)
            //     }
            //     this.getNewList(res.data.records)
            //     this.handleExportData = {
            //       title: arr,
            //       key: key,
            //       data: this.dataMessage,
            //       autoWidth: true,
            //       filename: '考勤统计列表'
            //     }
            //     downloadXlex(this.handleExportData)
            //   }
            // })
        },
        switchJun(status) {
            let _status = parseInt(status)
            switch (_status) {
                case 0:
                    return '正常打卡'
                case 1:
                    return '迟到'
                case 2:
                    return '严重迟到'
                case 3:
                    return '旷工'
                case 4:
                    return '早退'
                case 5:
                    return '上班缺卡'
                case 6:
                    return '下班缺卡'
                case 7:
                    return '迟到、下班缺卡'
                case 8:
                    return '严重迟到、下班缺卡'
                case 9:
                    return '缺卡'
                case 10:
                    return '管理员补卡'
                case 11:
                    return '迟到、早退'
                case 12:
                    return '严重迟到、早退'
                case 13:
                    return '上班缺卡'
                case 14:
                    return '出差'
                case 15:
                    return '外出'
                case 16:
                    return '请假'
                case 17:
                    return '加班'
                case 18:
                    return '休息'
            }
        },
        timeStart(status) {
            let _status = parseInt(status)
            switch (_status) {
                case 0:
                    return '正常打卡'
                case 1:
                    return '迟到'
                case 2:
                    return '严重迟到'
                case 3:
                    return '旷工'
                case 4:
                    return '早退'
                case 5:
                    return '缺卡'
                case 6:
                    return '管理员补卡'
                case 7:
                    return '请假'
                case 8:
                    return '外出'
                case 9:
                    return '出差'
                case 10:
                    return '加班'
                case 11:
                    return '管理员修改为正常打卡'
            }
        },
        monthStartListZon(status) {
            let _status = parseInt(status)
            switch (_status) {
                case 0:
                    return '出勤月汇总'
                case 17:
                    return '加班月汇总'
                case 18:
                    return '休息月汇总'
                case 1:
                    return '迟到月汇总'
                case 4:
                    return '早退月汇总'
                case 5:
                    return '缺卡月汇总'
                case 14:
                    return '出差月汇总'
                case 16:
                    return '请假月汇总'
                case 15:
                    return '外出月汇总'
                case 3:
                    return '旷工月汇总'
            }
        }
    }
}
</script>
