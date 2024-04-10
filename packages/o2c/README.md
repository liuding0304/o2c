# Options API to Composition API

## 迁移指南
  官方迁移支持文档： https://v3-migration.vuejs.org/zh/

## 开发
  使用gogocode进行开发注意: 目前发现添加注释失败、scope.rename无法正确重命名import解构的变量，

## 注意事项

1. `<script setup>`不会暴露任组件的内容任何的声明, 当使用模版引用调用组件方法或获取数据时，需要开发者手动定义组件可暴露的声明。(详见 https://cn.vuejs.org/api/sfc-script-setup.html#defineexpose)
1. 无法识别动态内容，需开发者手动处理，例如：`this[type]`、`this[funcName]()`、`this.$emit(eventName)`

## todo list
- [x] name
- [x] components
  - [x] 组件名属性简写 `{  comC, }`
  - [x] 支持属性定义组件别名 `{  comAlisa: comA, }`
  - [x] 动态组件 `{ comD: () => import('xxxxxx'), }`
- [x] props
  - [x] 对象声明 `{ props: { propA: { type: String, ...其他属性 } } }`
  - [x] 数组声明 `{ props: ['propA']`
- [x] data
  - [x] 简单函数声明（函数内只有return 对象字面量语句形式）`{ data() { return { name: 1 } } }`
  - [x] 较复杂函数声明（函数内有其他非return 语句）`{ data() { const name = 1;   return { name } } }`
  - [ ] 对象字面量声明Data `{ data: { name: 1 } }`（暂不考虑支持，此为不推荐的使用方式）
  - [ ] 引入变量声明data `{ data: compData }`（暂不考虑支持，此为不推荐的使用方式）
- [x] computed
  - [x] computed函数
  - [x] 支持使用vuex的mapState、mapGetters，`{ ...mapState(), ...mapGetters()  }`
- [x] watch
  - [x] 支持监听route以及route属性 `{ route() {} }`、`'router.path'(){ }`
  - [x] 支持对象配置 `{ dataA: { handler(){}, deep: true, immediate: true } }`
- [ ] directives
- [ ] event
  - [x] $emit
  - [ ] $on 暂不支持
  - [ ] $once 暂不支持
  - [ ] $off 暂不支持
- [ ] eventBus `const eventBus = new Vue();`
- [ ] provide 暂不支持
- [ ] inject 暂不支持
- [ ] inheritAttrs 暂不支持
- [ ] model 暂不支持
- [x] lifeCycle
  - [x] beforeCreate
  - [x] created
  - [x] beforeMount
  - [x] mounted
  - [x] activated
  - [x] deactivated
  - [x] beforeUpdate
  - [x] updated
  - [x] beforeDestroy
  - [x] destroyed
  - [x] errorCaptured
  - [x] renderTracked, vue3 options api选项，顺手支持了
  - [x] renderTriggered, vue3 options api选项，顺手支持了
  - [x] `this.$nextTick`
  - [ ] `this.$mount` （暂不考虑支持，非常见用法）
  - [ ] `this.$forceUpdate`（暂不考虑支持，非常见用法）
  - [ ] `this.$destroy`（暂不考虑支持，非常见用法）
- [x] methods、filters
  - [x] 变量引用 `{  funA: funB }` 或 `{ funA: funA }` 或 `{ funA }`
  - [x] 语句 `{ funA: debounce(function () { ...doSomething }) }`
  - [x] 函数声明 `{ funA() {} }` 或 `funA: function () {}`等
  - [x] 支持vuex的mapActions,`{ ...mapActions() }`
- [x] this引用
  - [x] this引用data属性
  - [x] this引用props
  - [x] this引用methods或filters
  - [x] 支持`this.$route`
  - [x] 支持`this.$router`
  - [x] `this.$set`
  - [x] `this.$delete`
  - [x] `this.$el`   => $vm.&el
  - [x] `this.$refs` => $vm.$refs
  - [ ] `this.$attrs`
  - [ ] `this.$data`
  - [ ] `this.$props`
  - [ ] `this.$listeners`
  - [ ] `this.$options`
  - [ ] `this.$root`
  - [ ] `this.$slots`
  - [ ] `this.$scopedSlots`
  - [ ] `this.$parent`
  - [ ] `this.$children` vue3已移除该属性， https://v3-migration.vuejs.org/zh/breaking-changes/children.html#%E6%A6%82%E8%A7%88
  - [ ] `this.$watch`
  - [ ] 解构this `const { title } = this`
  - [ ] this重命名 `const self = this`
  - [x] 其他未知的this语句， 转化为$vm语句 `this.propertyA` 转化为 `$vm.propertyA`

## 不支持转换的属性

- mixins

## name

option
```js
export default {
  name: 'EName'
}
```
composition
```js
import { defineExpose } from 'vue';

defineExpose({
  name: 'EName',
});

```


## components
option
```js
import componentA from '@/xxx/xxx/componentA.vue';
import componentB from '@/xxx/xxx/componentB.vue';

export default {
  components: {
    componentA,
    componentAlisa: componentB
  }
}
```

composition
```js
import componentA from '@/xxx/xxx/componentA.vue';
import componentB as componentAlisa from '@/xxx/xxx/componentB.vue';

```

## mixins(不支持)

## props
option
```js
export default {
  props: {
    userName: String,
    userAge: [String, Number],
    userInfo: {
      type: Object,
      required: false,
      default: () => ({
        userName: 'Todd Cochran',
        userAge: 20
      })
    }
  }
}
```
composition
```js
const props = defineProps({
	userName: String,
	userAge: [String, Number],
	userInfo: {
		type: Object,
		required: false,
		default: () => ({
			userName: 'Todd Cochran',
			userAge: 20
		})
	}
})
```

## data

```js
  data() {
    return {
      firstName: '',
      lastName: '',
      age: this.userAge || 20,
      birthday: new Date().getFullYear(),
      married: false,
      child: null,
      address: undefined,
      experience: {},
      friends: ['Casey Adams', 'Lena Clark', 'Nzinga Blake']
    }
  },
```

```js
import { ref, reactive } from 'vue'

const firstName = ref('')
const lastName = ref('')
const age = ref('')
const birthday = ref(new Date().getFullYear())
const married = ref(false)
const child = ref(null)
const address = ref(undefined)
const experience = reactive({})
const friends = reactive([])

```


## computed

```js
export default {
  computed: {
    friendNames() {
      return this.friends.join(', ')
    },
    fullName: {
      get: () => {
        return this.firstName + ' ' + this.lastName
      },
      set: (newValue) => {
        const names = newValue.split(' ')
        this.firstName = names[0]
        this.lastName = names[names.length - 1]
      }
    }
  },
}
```
```js
const friendNames = computed(() => {
	return data.friends.join(', ')
})

const fullName = computed({
	get: () => {
		return data.firstName + ' ' + data.lastName
	},
	set: (newValue) => {
		const names = newValue.split(' ')
		data.firstName = names[0]
		data.lastName = names[names.length - 1]
	}
})

```

## filter
```js
export default {
  filters: {
    toMarried(value) {
      return value ? 'Yes' : 'No'
    }
  },
}
```

```js
function toMarried(value) {
	return value ? 'Yes' : 'No'
}
```

## watch
```js
export default {
  watch: {
    userName(nVal, oVal) {
      console.log('watch props', nVal, oVal)
    },
    firstName(nVal, oVal) {
      console.log('watch data', nVal, oVal)
    },
    friendNames(nVal, oVal) {
      console.log('watch computed', nVal, oVal)
    },
    lastName: {
      handler(nVal, oVal) {
        console.log('watch options', nVal, oVal)
      },
      immediate: false,
      deep: true
    }
  },
}
```

```js
watch(() => props.userName, (nVal, oVal) => {
	console.log('watch props', nVal, oVal)
})

watch(() => data.firstName, (nVal, oVal) => {
	console.log('watch data', nVal, oVal)
})

watch(() => friendNames.value, (nVal, oVal) => {
	console.log('watch computed', nVal, oVal)
})

watch(() => data.lastName, (nVal, oVal) => {
	console.log('watch options', nVal, oVal)
}, {
	immediate: false,
	deep: true
})
```

## methods

```js
export default {
  methods: {
    async getData() {
      console.log('async function')
    },
    onSubmit(value0, { value1, value2 }) {
      console.log('function arguments', value0, value1, value2)
    },
    vmMethods() {
      this.$nextTick(() => {
        this.$set(this.experience, '2020', 'principle of compiling')
        this.$delete(this.experience, '2019')
        this.$emit('change-val', +new Date())
        this.$refs.childenComponent.name
        this.$attrs.name
        this.$slots.name
        this.$route.name
        this.$router.push({ name: 'Home' })
        this.$store.state.name
      })
    },
    otherMethods() {
      this.$data
      this.$props
      this.$el
      this.$options
      this.$parent
      this.$root
      this.$children
      this.$isServer
      this.$listeners
      this.$watch
      this.$on
      this.$once
      this.$off
      this.$mount
      this.$forceUpdate
      this.$destroy
    }
  }
}
```
```js

const { proxy: $vm } = getCurrentInstance()

async function getData() {
	console.log('async function')
}

function onSubmit(value0, { value1, value2 }) {
	console.log('function arguments', value0, value1, value2)
}

function vmMethods() {
	nextTick(() => {
		set(data.experience, '2020', 'principle of compiling')
		delete(data.experience, '2019')
		emit('change-val', +new Date())
		childenComponent.value.name
		attrs.name
		slots.name
		route.name
		router.push({ name: 'Home' })
		store.state.name
	})
}

function otherMethods() {
	$vm.$data
	$vm.$props
	$vm.$el
	$vm.$options
	$vm.$parent
	$vm.$root
	$vm.$children
	$vm.$isServer
	$vm.$listeners
	$vm.$watch
	$vm.$on
	$vm.$once
	$vm.$off
	$vm.$mount
	$vm.$forceUpdate
	$vm.$destroy
}
```

## 生命周期

```js
export default {
  async created() {
    console.log('created async function')
  },
  mounted() {
    console.log('mounted function')
  },
  updated() {
    console.log('updated function')
  },
  destroyed() {
    console.log('destroyed function')
  },
  activated() {
    console.log('activated function')
  },
  deactivated() {
    console.log('deactivated function')
  },
  errorCaptured(err, vm, info) {
    console.log('errorCaptured function', err, vm, info)
  },
}

```

```js
async function onCreated() {
	console.log('created async function')
}
onCreated()

onMounted(() => {
	console.log('mounted function')
})

onUpdated(() => {
	console.log('updated function')
})

onUnmounted(() => {
	console.log('destroyed function')
})

onActivated(() => {
	console.log('activated function')
})

onDeactivated(() => {
	console.log('deactivated function')
})

onErrorCaptured((err, vm, info) => {
	console.log('errorCaptured function', err, vm, info)
})

```
