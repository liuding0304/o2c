
import { addDefineExpose, removeVueOption, importVueProperty, arrowFuncCodeByObjectProperty, addUseStore } from "../utils/vue-util.js";
import * as t from "@babel/types";
import { transVuexMap } from '../utils/vuex-util.js'

export default {
  transform(ctx) {
    const scriptAst = ctx.getScriptAst();

    scriptAst.find(`export default { computed: { $_$key: $_$value } }`).each((node) => {
      const match = node.match;
      match.key.forEach(({value: computedName}, index) => {
        const computedContentObj = match.value[index]
        const isfunc = t.isFunction(computedContentObj.node)
        const isSequenceExpression = t.isSpreadElement(computedContentObj.node)

        if (isfunc) {
          // computed函数
          const arrowFuncCode = arrowFuncCodeByObjectProperty(computedContentObj.node)
          node.before(`const ${computedName} = computed(${arrowFuncCode});\n`);
          ctx.collectMeta('computed', computedName)
        } else if(isSequenceExpression) {
          // 扩展运算符
          let resCodes = []
          const mapStateCodeMap = transVuexMap('mapState', computedContentObj.node)
          mapStateCodeMap.forEach(({key, code}) => {
            ctx.collectMeta('computed', key)
            resCodes.push(code)
          })
          const mapGettersCodeMap = transVuexMap('mapGetters', computedContentObj.node)
          mapGettersCodeMap.forEach(({key, code}) => {
            ctx.collectMeta('computed', key)
            resCodes.push(code)
          })

          if(resCodes.length) {
            resCodes.forEach((code) => {
              node.before(code)
            })
            addUseStore(scriptAst)
          }
        } else {
          node.before(`const ${computedName} = computed(${computedContentObj.value});\n`);
          ctx.collectMeta('computed', computedName)
        }
      });

      importVueProperty(scriptAst, 'computed')
      removeVueOption(scriptAst, 'computed')
    });
  }
}