import gogocode from 'gogocode';
import { addUseVueRouter, arrowFuncCodeByObjectProperty, importVueProperty, isWatchObj, removeVueOption } from "../utils/vue-util.js";
// import babelParser from '@babel/parser'
// import generate from "@babel/generator";
// import traverse from "@babel/traverse";
// import template from "@babel/template";
// import * as t from "@babel/types";


/**
 * 转化watch语法
 * https://v2.cn.vuejs.org/v2/api/#watch
 *
 */
export default {
  transform(ctx) {
    const scriptAst = ctx.getScriptAst();

    scriptAst.find([
      `export default { watch: { $_$key: $_$value } }`,
    ]).each((node) => {
      const match = node.match;
      match.key.forEach(({value: keyName}, index) => {
        let {
          node: contentAst,
          value: contentStr,
        } =  match.value[index];
        if (/^\$route(\.|$)/.test(keyName)) {
          // $route.a => route.value.a; $route => route.value
          keyName = keyName.replace(/^\$route(\.|$)/, 'route.value$1')
          addUseVueRouter(scriptAst, 'route')
        } else {
          if (/\./.test(keyName)) {
            // a.c => a.value.c
            keyName = keyName.replace(/\./, '.value.')
          } else {
            // a => a.value
            keyName = keyName + '.value'
          }
        }

        if (isWatchObj(contentAst)) {
          const handlerProperty = contentAst.properties.find( i => i.key.name === 'handler')
          const immediateProperty = contentAst.properties.find( i => i.key.name === 'immediate')
          const deepProperty = contentAst.properties.find( i => i.key.name === 'deep')
          const arrowFuncCode = arrowFuncCodeByObjectProperty(handlerProperty)
          if (immediateProperty || deepProperty) {
            let watchOptions = []
            let watchOptionsCode = ''
            if (immediateProperty) {
              watchOptions.push(gogocode(immediateProperty).generate())
            }
            if (deepProperty) {
              watchOptions.push(gogocode(deepProperty).generate())
            }

            watchOptionsCode = `{${watchOptions.join(', ')}}`
            node.before(`watch(() => ${keyName}, ${arrowFuncCode}, ${watchOptionsCode});\n`)
          } else  {
            node.before(`watch(() => ${keyName}, ${arrowFuncCode});\n`)
          }
        } else {
          contentStr = contentStr.replace(/^[a-zA-Z0-9]+\(/, 'function(')
          node.before(`watch(() => ${keyName}, ${contentStr});\n`)
        }
      })
      removeVueOption(scriptAst, 'watch');
      importVueProperty(scriptAst, 'watch');
    });
  }
}