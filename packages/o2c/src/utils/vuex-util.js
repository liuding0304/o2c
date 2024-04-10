import * as t from "@babel/types";
import { addDefineExpose, removeVueOption, importVueProperty, arrowFuncCodeByObjectProperty } from "../utils/vue-util.js";

const generateVuexCompositionCode = (type,{namespace, key, value, funcCode} ) => {
  if (type === 'mapState') {
    return generateGettersOrStateCompositionCode('state', {namespace, key, value, funcCode})
  }
  if (type === 'mapGetters') {
    return generateGettersOrStateCompositionCode('getters',{namespace, key, value, funcCode})
  }
  if (type === 'mapActions') {
    return generateActionsCompositionCode({namespace, key, value, funcCode})
  }
  if (type === 'mapMutations') {
    return generateMutationsCompositionCode({namespace, key, value, funcCode})
  }
}

const generateMutationsCompositionCode = ({namespace, key, value, funcCode}) => {
  if (funcCode) {
    // if (namespace) {
    //   namespace = '.' + namespace.split('/').join('.')
    // }
    // return `const ${key} = computed(() => (${funcCode})(store.${typeName}${namespace}));`
  } else if (value) {
    let dispatchArgs = ''
    if (namespace) {
      dispatchArgs = `${namespace}/${value}`
    }else {
      dispatchArgs = value
    }
    return `const ${key} = (...args) => store.commit('${dispatchArgs}', ...args);\n`
  }
  return ''
}
const generateActionsCompositionCode = ({namespace, key, value, funcCode}) => {
  if (funcCode) {
    // if (namespace) {
    //   namespace = '.' + namespace.split('/').join('.')
    // }
    // return `const ${key} = computed(() => (${funcCode})(store.${typeName}${namespace}));`
  } else if (value) {
    let dispatchArgs = ''
    if (namespace) {
      dispatchArgs = `${namespace}/${value}`
    }else {
      dispatchArgs = value
    }
    return `const ${key} = (...args) => store.dispatch('${dispatchArgs}', ...args);\n`
  }
  return ''
}

const generateGettersOrStateCompositionCode = (typeName, {namespace, key, value, funcCode} ) => {
  if (funcCode) {
    if (namespace) {
      namespace = '.' + namespace.split('/').join('.')
    }
    return `const ${key} = computed(() => (${funcCode})(store.${typeName}${namespace}));`
  } else if (value) {
    if (namespace) {
      namespace = namespace.split('/').join('.') + '.'
    }
    return `const ${key} = computed(() => store.${typeName}.${namespace}${value});\n`
  }
  return ''
}

export const transVuexMap = (type, objectPropertyNode) => {
  let resCodes = [];
  if (t.isIdentifier(objectPropertyNode.argument.callee, { name: type })) {
    const vuexArguments = objectPropertyNode.argument.arguments;
    let namespace = '';
    let vuexMap;
    if (t.isStringLiteral(vuexArguments[0])) {
      namespace = vuexArguments[0].value;
      vuexMap = vuexArguments[1]
    } else {
      vuexMap = vuexArguments[0]
    }
    if (t.isArrayExpression(vuexMap)) {
      vuexMap.elements.forEach((element) => {
        if (t.isStringLiteral(element)) {
          const value = element.value;
          resCodes.push({
            key:value,
            code: generateVuexCompositionCode(type, {
              namespace,
              key: value,
              value,
            })
          })
        }
      })
    } else if (t.isObjectExpression(vuexMap)) {
      vuexMap.properties.forEach((property) => {
        const key = property.key.name;
        if (t.isStringLiteral(property.value)) {
          const value = property.value.value;
          resCodes.push({
            key: key,
            code: generateVuexCompositionCode(type, { namespace, key, value })
          })
        } else if (t.isFunction(property.value) || t.isObjectMethod(property)) {
          const funcCode = arrowFuncCodeByObjectProperty(property)
          resCodes.push({ key, code: generateVuexCompositionCode(type, { namespace, key, funcCode })})
        }
      })
    }
  }
  return resCodes.filter(i => i.code);
}
