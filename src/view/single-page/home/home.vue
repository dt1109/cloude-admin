<template>
  <div>
    <!--<Row :gutter="20">-->
    <!--<i-col :xs="12" :md="8" :lg="4" v-for="(infor, i) in inforCardData" :key="`infor-${i}`" style="height: 120px;padding-bottom: 10px;">-->
    <!--<infor-card shadow :color="infor.color" :icon="infor.icon" :icon-size="36">-->
    <!--<count-to :end="infor.count" count-class="count-style"/>-->
    <!--<p>{{ infor.title }}</p>-->
    <!--</infor-card>-->
    <!--</i-col>-->
    <!--</Row>-->
    <Row v-if="viewAccessSuper"
         :gutter="20"
         style="margin-top: 10px;">
      <i-col :md="24"
             :lg="12"
             style="margin-bottom: 20px;">
        <Card shadow>
          <chart-pie ref="chartpie"
                     style="height: 300px;"
                     :value="pieData"
                     text="团队成员组成统计"></chart-pie>
        </Card>
      </i-col>
      <!-- 编制计划图表 -->
      <!-- <i-col :md="24"
             :lg="12"
             style="margin-bottom: 20px;">
        <Card shadow>
          <chart-role style="height: 300px;"
                      :value="pieData"
                      text="部门成员出勤率"></chart-role>
        </Card>
      </i-col> -->
      <!-- <i-col :md="24" :lg="16" style="margin-bottom: 20px;">
      <Card shadow>
      <chart-bar style="height: 300px;" :value="barData" text="每周用户活跃量"/>
      </Card>
      </i-col> -->
    </Row>
    <Row v-if="viewAccessSuper"
         :gutter="20"
         style="margin-top: 10px;">
      <!-- 多系列柱状图图表 -->
      <!-- <i-col :md="24"
             :lg="24"
             style="margin-bottom: 20px;">
        <Card shadow>
          <chart-pillar style="height: 360px;"
                        :value="pillarData"
                        :text="dateToday"></chart-pillar>
        </Card>
      </i-col> -->

    </Row>
    <!--<Row>-->
    <!--<Card shadow>-->
    <!--<example style="height: 310px;"/>-->
    <!--</Card>-->
    <!--</Row>-->
  </div>
</template>

<script>
import InforCard from '_c/info-card'
import CountTo from '_c/count-to'
import { ChartPie, ChartBar, ChartRole, ChartPillar } from '_c/charts'
import Example from './example.vue'
import { mapActions, mapState } from 'vuex'
import { hasOneOf } from '@/libs/tools'
export default {
  name: 'home',
  components: {
    InforCard,
    CountTo,
    ChartPie,
    ChartBar,
    Example,
    ChartRole,
    ChartPillar
  },
  data() {
    return {
      dateToday: '',
      inforCardData: [
        {
          title: '新增用户',
          icon: 'md-person-add',
          count: 803,
          color: '#2d8cf0'
        },
        { title: '累计点击', icon: 'md-locate', count: 232, color: '#19be6b' },
        {
          title: '新增问答',
          icon: 'md-help-circle',
          count: 142,
          color: '#ff9900'
        },
        { title: '分享统计', icon: 'md-share', count: 657, color: '#ed3f14' },
        {
          title: '新增互动',
          icon: 'md-chatbubbles',
          count: 12,
          color: '#E46CBB'
        },
        { title: '新增页面', icon: 'md-map', count: 14, color: '#9A66E4' }
      ],
      pieData: [], // 图表信息
      pillarData: [
        [3, 3, 3, 3, 3, 3, 3, 3],
        [6, 6, 6, 6, 6, 6, 6, 6],
        [7, 7, 7, 8, 6, 7, 6, 9],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2],
        [8, 8, 8, 8, 8, 8, 8, 8],
        [2, 2, 2, 2, 2, 2, 2, 2]
      ],
      barData: {
        Mon: 13253,
        Tue: 34235,
        Wed: 26321,
        Thu: 12340,
        Fri: 24643,
        Sat: 1322,
        Sun: 1324
      }
    }
  },
  watch: {
    pieData() {
      this.pieData = this.pieData
    },
    pieData: {
      handler(newVal, oldVal) {
        if(this.$store.state.user.role != 0){
          this.getImgData()
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.dateTodaynew()
    console.log(this.$store.state.user.role)
    if(this.$store.state.user.role != 0){
      this.getImgData()
    }
  },
  mounted() {
    this.getUserData()
    this.getImgDatas()
    if(this.$store.state.user.role != 0){
      this.getImgData()
    }

  },
  computed: {
    access() {
      return this.$store.state.user.access
    },
    viewAccessSuper() {
      return hasOneOf([1], this.access)
    }
  },
  methods: {
    ...mapActions(['getImgData', 'getUserData']),
    getImgDatas() {
      if (this.$store.state.user.imgData) {
        for (let i = 0; i < this.$store.state.user.imgData.length; i++) {
          let obj = {
            value: this.$store.state.user.imgData[i].num,
            name: this.$store.state.user.imgData[i].departName
          }
          this.pieData.push(obj)
        }
      }
    },
    dateTodaynew() {
      let d = new Date()
      let str =
        d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'
      this.dateToday = str + '考勤'
    }
  }
}
</script>

<style lang="less">
.count-style {
  font-size: 50px;
}
</style>
