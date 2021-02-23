export function dateFormat (dateValue, isTime = false) {
  if (!dateValue) return null
  if (typeof dateValue === 'string' && dateValue.length === 13) {
    dateValue = parseInt(dateValue)
  }
  var date = new Date(dateValue)
  var year = date.getFullYear()
  var month = ('00' + (date.getMonth() + 1 + '')).slice(-2) // js从0开始取
  var date1 = ('00' + (date.getDate() + '')).slice(-2)

  var hour = ('00' + (date.getHours() + '')).slice(-2)
  var minutes = ('00' + (date.getMinutes() + '')).slice(-2)
  var second = ('00' + (date.getSeconds() + '')).slice(-2)
  return (year + '-' + month + '-' + date1 + ' ' + hour + ':' + minutes + ':' + second)
}
