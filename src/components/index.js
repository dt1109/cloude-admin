import privateTable from './private-table'

const components = [
  privateTable
]

const install = (Vue, opts = {}) => {
  components.map(component => {
    Vue.component(component.name, component)
  })
}
export default install
