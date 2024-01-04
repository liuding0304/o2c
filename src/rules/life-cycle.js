

import { addDefineExpose, removeVueOption, importVueProperty, arrowFuncCodeByObjectProperty } from "../utils/vue-util.js";
import * as t from "@babel/types";

const lifeCycleTransMap = [
  {
    from: 'beforeCreate',
    to: 'setup',
  },
  {
    from: 'created',
    to: 'setup',
  },
  {
    from: 'beforeMount',
    to: 'onBeforeMount',
  },
  {
    from: 'mounted',
    to: 'onMounted',
  },
  {
    from: 'activated',
    to: 'onActivated',
  },
  {
    from: 'deactivated',
    to: 'onDeactivated',
  },
  {
    from: 'beforeUpdate',
    to: 'onBeforeUpdate',
  },
  {
    from: 'updated',
    to: 'onUpdated',
  },
  {
    from: 'beforeDestroy',
    to: 'onBeforeUnmount',
  },
  {
    from: 'destroyed',
    to: 'onUnmounted',
  },
  {
    from: 'errorCaptured',
    to: 'onErrorCaptured',
  },
  {
    from: 'renderTracked',
    to: 'onRenderTracked',
  },
  {
    from: 'renderTriggered',
    to: 'onRenderTriggered',
  },
]

export default {
  transform(ctx) {
    const scriptAst = ctx.getScriptAst();

    lifeCycleTransMap.forEach(({ from, to }) => {
      scriptAst.find(`export default { ${from}: $_$life }`).each((node) => {
        const lifeContent = node.match.life[0]
        const lifeFuncCode = arrowFuncCodeByObjectProperty(lifeContent.node)
        if (to === 'setup') {
          const customLifeFuncName = `on${from.charAt(0).toUpperCase()}${from.slice(1)}`
          const customLifeFuncCode = `const ${customLifeFuncName} = ${lifeFuncCode};\n`
          const invokeCustomLifeFunc = `${customLifeFuncName}();\n`
          node.before(customLifeFuncCode)
          node.before(invokeCustomLifeFunc)
          removeVueOption(scriptAst, from)
        } else {
          node.before(`${to}(${lifeFuncCode});\n`)
          importVueProperty(scriptAst, to)
          removeVueOption(scriptAst, from)
        }
      });
    })
  }
}