import props from './props.js'
import components from './components.js'
import name from './name.js'
import watch from './watch.js'
import computed from './computed.js'
import data from './data.js'
// import script from './script.js'
import methodsAndFilters from './methodsAndFilters.js'
import thisStatement from './thisStatement.js'
import removeExport from './remove-export.js'
import lifeCycle from './life-cycle.js'
import emit from './emit.js'

const rules = [
  name,
  components,
  props,
  data,
  computed,
  watch,
  methodsAndFilters,
  lifeCycle,
  emit,

  // expose,

  thisStatement,
  removeExport,
  // script,
]

export default rules;