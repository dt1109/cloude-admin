<template>
  <div>
    <Modal width="700" v-model="modelType" :mask-closable="false">
      <div slot="close" @click="closeModal">×</div>
      <div class="modelBox">
        <p class="modelBox-tile">{{typeData.title}}</p>
        <p>
          <img src alt />
          <Avatar :src="typeData.icon" />
        </p>
        <p>所在部门： {{typeData.departmentName}}</p>
        <p>{{applyStartType(typeData.applyType)}}类型： {{applyStartType(typeData.applyType)}}</p>
        <div v-for="(item, index) in typeData.timeList" :key="index" v-if="typeData.applyType != 1">
          <p>开始时间： {{item.startTime}}</p>
          <p>结束时间： {{item.endTime}}</p>
        </div>
        <p>{{applyStartType(typeData.applyType)}}事由： {{typeData.reason}}</p>
      </div>
      <div class="modelBox">
        <p class="startPlan startplanTitle">审批进度：</p>
        <Timeline>
          <div v-for="(item, index) in typeData.approverList" :key="index">
            <TimelineItem color="green">
              <Avatar :src="item.icon" />审批人：
              <br />
              <p class="paddingLeft">
                {{item.approverName}}({{statusType(item.status)}})
                <span class="marginLeft">{{item.createTime}}</span>
              </p>
              <p class="paddingLeft">
                <span>审批意见：{{item.reason}}</span>
              </p>
            </TimelineItem>
          </div>
        </Timeline>
      </div>
      <div slot="footer">
        <Button @click="closeModal" type="primary">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'approval-modal',
  props: {
    typeData: {
      type: [Object]
    },
    modelType: {
      type: [Boolean]
    }
  },
  data() {
    return {}
  },
  methods: {
    closeModal() {
      this.$emit('closeModal')
    },
    /**
     * 申请类型
     * @param {String} -scale 状态码
     */
    applyStartType(scale) {
      let _status = parseInt(scale)
      switch (_status) {
        case 1:
          return '补卡'
        case 2:
          return '请假'
        case 3:
          return '外出'
        case 4:
          return '出差'
        case 5:
          return '加班'
      }
    },
    /**
     * 审批状态
     * @param {String} -scale 状态码
     */
    statusType(scale) {
      let _status = parseInt(scale)
      switch (_status) {
        case 0:
          return '审批中'
        case 1:
          return '已撤消 '
        case 2:
          return '审批通过'
        case 3:
          return '审批未通过'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.modelBox {
  padding: 0 20px;
  font-size: 15px;
  .modelBox-tile {
    font-size: 22px;
    text-align: center;
  }
  p {
    line-height: 1.5;
    margin-bottom: 5px;
  }
  .startPlan {
    padding: 5px 0 8px;
  }
  .startplanTitle {
    background: #f2f2f2;
    border: 1px solid #666666;
    margin-top: 5px;
    border-radius: 3px;
  }
  .paddingLeft {
    padding-left: 32px;
  }
}
</style>
