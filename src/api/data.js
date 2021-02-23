import axios from '@/libs/api.request'

/**
 * 公共接口
 * @returns {ClientHttp2Stream | * | void | never | AxiosPromise<any> | ClientRequest}
 */
// 获取部门级联数据
export const departMenu = data => {
  return axios.request({ url: 'depart/menu', method: 'get', data })
}
// 获取部门成员级联
export const departCascade = () => {
  return axios.request({ url: 'depart/cascade', method: 'get' })
}
// 级联成员以及管理权限回显数据处理
export const managerEdit = data => {
  return axios.request({ url: 'member/manager/edit', method: 'post', data })
}
// 上级部门回显
export const departEditData = data => {
  return axios.request({ url: 'depart/editData', method: 'post', data })
}
/**
 * 团队管理
 * @param pageNumber
 * @param pageSize
 * @param data
 * @returns {ClientHttp2Stream | * | void | never | AxiosPromise<any> | ClientRequest}
 */
// 获取团队管理列表
export const getEeamList = params => {
  return axios.request({
    url: 'team/list',
    method: 'get',
    params
    // (pageNumber, pageSize, teamName)
  })
}
// 获取团队信息
export const teamGetTeamInfo = () => {
  return axios.request({ url: 'team/getTeamInfo', method: 'get' })
}
// 城市级联数据
export const getCityList = () => {
  return axios.request({ url: 'area/list', method: 'get' })
}
// 创建团队
export const addOrEdit = data => {
  return axios.request({ url: 'team/addOrEdit', data, method: 'post' })
}
// 切换团队
export const TeamExchange = data => {
  return axios.request({ url: 'team/exchange/' + data, method: 'get' })
}
// 获取成员列表
export const memberList = data => {
  return axios.request({ url: 'member/list', method: 'post', data })
}
// 成员调换部门
export const memberExchange = data => {
  return axios.request({ url: 'member/exchange', data, method: 'post' })
}
// 指纹解绑
export const fingerprintUnbind = params => {
  return axios.request({
    url: 'member/fingerprint/unbind',
    method: 'get',
    params
  })
}
// 删除成员
export const memberDelete = data => {
  return axios.request({ url: 'member/delete', method: 'post', data })
}
// 添加成员
export const memberAddOrEdit = data => {
  return axios.request({ url: 'member/addOrEdit', method: 'post', data })
}
// 获取管理员列表
export const managerList = data => {
  return axios.request({ url: 'member/manager/list', method: 'post', data })
}
// 删除管理员
export const managerDelete = data => {
  return axios.request({ url: 'member/manager/delete/' + data, method: 'get' })
}
// 添加、编辑管理员
export const managerAddOrEdit = data => {
  return axios.request({
    url: 'member/manager/addOrEdit',
    method: 'post',
    data
  })
}
// 获取组织架构列表
export const departList = (
  pageSize,
  pageNumber,
  dpName,
  parentId,
  managerName,
  data
) => {
  return axios.request({
    url: 'depart/list',
    method: 'get',
    params: { pageSize, pageNumber, dpName, parentId, managerName },
    data
  })
}
// 部门删除
export const departDelete = dpId => {
  return axios.request({
    url: 'depart/delete',
    method: 'get',
    params: { dpId }
  })
}
// 添加部门
export const departAdd = data => {
  return axios.request({ url: 'depart/add', method: 'post', data })
}
// 修改部门
export const departEdit = data => {
  return axios.request({ url: 'depart/edit', method: 'post', data })
}
/**
 * 考勤管理
 * @param data
 * @returns {ClientHttp2Stream | * | void | never | AxiosPromise<any> | ClientRequest}
 */
// 获取考勤统计列表
export const checkingMonthStatistics = (pageNumber, pageSize, data) => {
  return axios.request({
    url: 'checking/monthStatistics',
    method: 'post',
    params: { pageNumber, pageSize },
    data:data
  })
}
//导出考勤统计
export const ExportcheckingMonthStatistics = (pageNumber, pageSize, data) => {
  return axios.request({
    url: 'webExcel/export/monthStatistics',
    responseType: 'blob',
    method: 'post',
    params: { pageNumber, pageSize },
    data:data
  })
}
// 考勤月统计详情
export const checkingMonthStatisticsDetail = (type, id) => {
  return axios.request({
    url: 'checking/monthStatisticsDetail',
    method: 'get',
    params: { type, id }
  })
}
// 某日考勤详情
export const checkingMonthStatisticsDayDetail = (id, date) => {
  return axios.request({
    url: 'checking/monthStatisticsDayDetail',
    method: 'get',
    params: { id, date }
  })
}
// 管理员修改每日异常
export const checkingFix = data => {
  return axios.request({ url: 'checking/fix', method: 'post', data })
}
// 获取日报表列表
export const checkingDayStatistics = (pageNumber, pageSize, data) => {
  return axios.request({
    url: 'checking/dayStatistics',
    method: 'post',
    data:data,
    params: { pageNumber, pageSize }
  })
}
// 审批
export const approveGet = id => {
  return axios.request({ url: 'approve/get', method: 'get', params: { id } })
}
// 获取考勤组负责人数据
export const groupCheckingMember = () => {
  return axios.request({ url: 'group/checkingMember', method: 'get' })
}
// 获取管理员数据
export const managerSelect = () => {
  return axios.request({ url: 'member/manager/select', method: 'get' })
}
// 获取考勤组列表
export const groupList = (pageNum, pageSize) => {
  return axios.request({
    url: 'group/list',
    method: 'get',
    params: { pageNum, pageSize }
  })
}
// 获取班次列表
export const classesSelect = () => {
  return axios.request({ url: 'classes/select', method: 'get' })
}
// 删除考勤组
export const groupDelete = groupId => {
  return axios.request({
    url: 'group/delete',
    method: 'get',
    params: { groupId }
  })
}
// 编辑考勤组数据返回
export const groupEdit = id => {
  return axios.request({ url: 'group/edit', method: 'get', params: { id } })
}
// 参与和无需考勤人员去除部分
export const groupDeleteUser = (id, userIds) => {
  return axios.request({
    url: 'group/deleteUser',
    method: 'get',
    params: { id, userIds }
  })
}
// 修改、添加考勤组
export const groupAddOrEdit = data => {
  return axios.request({ url: 'group/addOrEdit', method: 'post', data })
}
// 获取班次管理列表
export const classesList = (pageNum, pageSize, data) => {
  return axios.request({
    url: 'classes/list',
    method: 'get',
    data,
    params: { pageNum, pageSize }
  })
}
// 新增、修改班次
export const classesAddOrEdit = data => {
  return axios.request({ url: 'classes/addOrEdit', method: 'post', data })
}
// 删除班次
export const classesDelete = id => {
  return axios.request({
    url: 'classes/delete',
    method: 'get',
    params: { id }
  })
}
// 提交补卡规则
export const supplementSave = data => {
  return axios.request({ url: 'supplement/save', method: 'post', data })
}
// 获取补卡规则数据
export const getSupplement = () => {
  return axios.request({ url: 'supplement/get', method: 'get' })
}
// 获取补卡规则数据
export const facilityList = (pageNumber, pageSize, data) => {
  return axios.request({
    url: 'facility/list',
    method: 'post',
    params: { pageNumber, pageSize },
    data
  })
}
// 添加考勤设备
export const facilityAdd = data => {
  return axios.request({ url: 'facility/add', method: 'post', data })
}
// 考勤设备密码修改
export const facilityChangePassword = data => {
  return axios.request({
    url: 'facility/changePassword',
    method: 'post',
    data
  })
}
/**
 * 审批记录
 * @param data
 * @returns {ClientHttp2Stream | * | void | never | AxiosPromise<any> | ClientRequest}
 */
// 考勤设备密码修改
export const approveList = (pageNumber, pageSize, data) => {
  return axios.request({
    url: 'approve/list',
    method: 'post',
    data,
    params: { pageNumber, pageSize }
  })
}
/**
 * 个人中心
 */
// 更改登录密码
export const adminUpdatePassword = (oldPassword, newPassword) => {
  return axios.request({
    url: 'admin/updatePassword',
    method: 'post',
    params: { oldPassword, newPassword }
  })
}
// 更改个人信息
export const teamUpdateUser = data => {
  return axios.request({ url: 'team/updateUser', method: 'post', data })
}
// 更改团队信息
export const teamAddOrEdit = data => {
  return axios.request({ url: 'team/addOrEdit', method: 'post', data })
}
// 解散团队
export const teamDissolve = data => {
  return axios.request({ url: 'team/dissolve/' + data, method: 'get' })
}
// 更换负责人 负责人接收验证码
export const teamSendMsgCode = phone => {
  return axios.request({
    url: 'team/sendMsgCode',
    method: 'get',
    params: { phone }
  })
}
// 更换负责人 提交更改
export const teamChangePrincipal = (phone, authCode) => {
  return axios.request({
    url: 'team/changePrincipal',
    method: 'get',
    params: { phone, authCode }
  })
}
// 效验负责人是否为同一团队
export const memberJudge = data => {
  return axios.request({ url: 'member/judge/' + data, method: 'get' })
}
/**
 * 恋指团后台管理
 */
// 获取团队列表
export const teamAllList = data => {
  return axios.request({ url: 'team/allList', method: 'get', data })
}
// 获取考勤设备列表
export const facilityAllList = (pageNumber, pageSize, data) => {
  return axios.request({
    url: 'facility/allList',
    method: 'post',
    data,
    params: { pageNumber, pageSize }
  })
}
// 解绑设备
export const facilityUnbind = id => {
  return axios.request({
    url: 'facility/unbind',
    method: 'get',
    params: { id }
  })
}
// 解绑设备
export const approveDelete = id => {
  return axios.request({
    url: 'approve/delete',
    method: 'get',
    params: id
  })
}
