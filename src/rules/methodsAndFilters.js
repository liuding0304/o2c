import { addDefineExpose, removeVueOption, importVueProperty, arrowFuncCodeByObjectProperty, arrowFuncAstByObjectProperty, addUseStore } from "../utils/vue-util.js";
import gogocode from 'gogocode';
import babelParser from '@babel/parser'
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import template from "@babel/template";
import * as t from "@babel/types";

import { transVuexMap } from '../utils/vuex-util.js'
import { buildFuncExpression } from "../utils/index.js";

function transformMethodOrFilters(ctx, type) {
  const scriptAst = ctx.getScriptAst();

  scriptAst.find(`export default { ${type}:  { $_$key: $_$value } }`).each((node) => {
    const methodNames = node.match.key.map(i => i.value);
    const methodBody = node.match.value;

    methodNames.forEach((methodName, index) => {
      const {node: methodNode, value } = methodBody[index]
      if (t.isIdentifier(methodNode)) {
        // 值是一个普通的引用
        if (methodNode.name !== methodName) {
            node.before(`const ${methodName} = ${ methodNode.name };\n`)
        }
        ctx.collectMeta('methods', methodName)
      } else if (t.isFunction(methodNode)) {
        // 函数声明
        const funcDea = buildFuncExpression(methodName, arrowFuncAstByObjectProperty(methodNode))
        node.before(funcDea)
        ctx.collectMeta('methods', methodName)
      } else if (t.isCallExpression(methodNode))  {
        // 语句
        node.before(`const ${methodName} = ${value};\n`)
        ctx.collectMeta('methods', methodName)
      } else if (t.isSpreadElement(methodNode)) {
        // 扩展运算符
        const mapActionsCodeMap = transVuexMap('mapActions', methodNode)

        if(mapActionsCodeMap.length) {
          mapActionsCodeMap.forEach(({key, code}) => {
            ctx.collectMeta('methods', key)
            node.before(code)
          })
          addUseStore(scriptAst)
        }
      }

    });

    removeVueOption(scriptAst, type)
  });
}

export default {
  transform(ctx) {
    transformMethodOrFilters(ctx, 'filters')
    transformMethodOrFilters(ctx, 'methods')
  }
}