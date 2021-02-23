<template>
  <div ref="dom"
       class="charts chart-pie"></div>
</template>

<script>
import echarts from 'echarts'
import tdTheme from './theme.json'
import { on, off } from '@/libs/tools'
echarts.registerTheme('tdTheme', tdTheme)
export default {
  name: 'ChartPie',
  props: {
    value: Array,
    text: String,
    subtext: String
  },
  data () {
    return {
      dom: null
    }
  },
  created () {},
  methods: {
    resize () {
      this.dom.resize()
    }
  },
  mounted () {
    this.$nextTick(() => {
      // let legend = this.value.map(_ => _.name)
      let option = {
        title: {
          text: this.text,
          subtext: this.subtext,
          x: 'center'
        },
        color: ['#441EEC', '#0A88FD', '#24DB72', '#CE720F'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
          // formatter: function(params) {}
          // "formatter
        },
        backgroundColor: 'transparent',
        grid: {
          top: '15%',
          left: '3%',
          right: '4%',
          bottom: '8%',
          containLabel: true
        },
        legend: {
          data: [
            '迟到',
            '早退',
            '请假',
            '出差',
            '外勤',
            '缺卡',
            '正常考勤',
            '旷工'
          ],
          'bottom': 5,
          // top: "5%",
          icon: 'roundRect',
          textStyle: {
            color: '#333'
          }
        },
        xAxis: [
          {
            type: 'category',
            data: ['部门1', '部门2', '部门3', '部门4'],
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              lineStyle: {
                color: '#fff',
                width: 2
              }
            }
          }
        ],
        yAxis: [
          {
            name: '数量',
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#333',
                width: 1
              }
            },
            axisLabel: {
              // "formatter": "{value} T/h"
              formatter: '{value}'
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#333',
                width: 1
              }
            }
          }
        ],
        series: [
          {
            type: 'bar',
            barWidth: 16,
            barGap: '50%',
            name: '迟到',
            data: this.value[0],
            itemStyle: {
              emphasis: {
                barBorderRadius: [8, 8, 0, 0]
              },
              normal: {
                barBorderRadius: [8, 8, 0, 0]
              }
            }
          },
          {
            type: 'bar',
            barWidth: 16,
            barGap: '50%',
            name: '早退',
            data: this.value[1],
            itemStyle: {
              emphasis: {
                barBorderRadius: [8, 8, 0, 0]
              },
              normal: {
                barBorderRadius: [8, 8, 0, 0]
              }
            }
          },
          {
            type: 'bar',
            barWidth: 16,
            name: '请假',
            barGap: '50%',
            data: this.value[2],
            // yAxisIndex: 1,
            itemStyle: {
              emphasis: {
                barBorderRadius: [8, 8, 0, 0]
              },
              normal: {
                barBorderRadius: [8, 8, 0, 0]
              }
            }
          },
          {
            type: 'bar',
            barWidth: 16,
            name: '出差',
            barGap: '50%',
            data: [1, 2, 3, 4, 5, 6, 7],
            // yAxisIndex: 1,
            itemStyle: {
              emphasis: {
                barBorderRadius: [8, 8, 0, 0]
              },
              normal: {
                barBorderRadius: [8, 8, 0, 0]
              }
            }
          },
          {
            type: 'bar',
            barWidth: 16,
            name: '外勤',
            barGap: '50%',
            data: this.value[4],
            // yAxisIndex: 1,
            itemStyle: {
              emphasis: {
                barBorderRadius: [8, 8, 0, 0]
              },
              normal: {
                barBorderRadius: [8, 8, 0, 0]
              }
            }
          },
          {
            type: 'bar',
            barWidth: 16,
            name: '缺卡',
            barGap: '50%',
            data: this.value[5],
            // yAxisIndex: 1,
            itemStyle: {
              emphasis: {
                barBorderRadius: [8, 8, 0, 0]
              },
              normal: {
                barBorderRadius: [8, 8, 0, 0]
              }
            }
          },
          {
            type: 'bar',
            barWidth: 16,
            name: '正常考勤',
            barGap: '50%',
            data: this.value[6],
            // yAxisIndex: 1,
            itemStyle: {
              emphasis: {
                barBorderRadius: [8, 8, 0, 0]
              },
              normal: {
                barBorderRadius: [8, 8, 0, 0]
              }
            }
          },
          {
            type: 'bar',
            barWidth: 16,
            name: '旷工',
            barGap: '50%',
            data: this.value[7],
            // yAxisIndex: 1,
            itemStyle: {
              emphasis: {
                barBorderRadius: [8, 8, 0, 0]
              },
              normal: {
                barBorderRadius: [8, 8, 0, 0]
              }
            }
          }
        ]
      }
      this.dom = echarts.init(this.$refs.dom, 'tdTheme')
      this.dom.setOption(option)
      on(window, 'resize', this.resize)
    })
  },
  beforeDestroy () {
    off(window, 'resize', this.resize)
  }
}
</script>
