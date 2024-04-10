import { addDefineExpose, removeVueOption, importVueProperty, arrowFuncCodeByObjectProperty, arrowFuncAstByObjectProperty } from "../utils/vue-util.js";
import gogocode from 'gogocode';
import babelParser from '@babel/parser'
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import template from "@babel/template";
import * as t from "@babel/types";

function createUseDataHelperFunc(arrowFuncAst) {
  // todo 默认了return在顶层语句，待优化
  const returnStatement = arrowFuncAst?.body?.body.find(i => t.isReturnStatement(i))
  returnStatement.argument = t.callExpression(t.identifier('reactive'), [returnStatement.argument])
  return t.functionDeclaration(t.identifier('useDataHelper'), arrowFuncAst.params, arrowFuncAst.body)
}

function createUseDataExpressionAst(attrs) {
  return gogocode(`const { ${attrs.join(', ')} } = toRefs(useDataHelper());`).node
}

function collectionDataProperty(ctx, dataProperties) {
  dataProperties.forEach((property) =>{
    ctx.collectMeta('data', property.key.name)
  })
}

export default {
  transform(ctx) {
    const scriptAst = ctx.getScriptAst();

    scriptAst.find(`export default { data: $_$data }`).each((node) => {
      const {node: dataPropertyValue } = node.match.data[0];
      if (t.isObjectExpression(dataPropertyValue)){
        // todo  处理使用对象方式声明的data属性 `data: {}`
      } else if (t.isFunction(dataPropertyValue)) {
        const arrowFuncAst = arrowFuncAstByObjectProperty(dataPropertyValue)
        const firstStatement = arrowFuncAst?.body?.body?.[0]
        if (t.isReturnStatement(firstStatement)) {
          const returnStatement = firstStatement
          const dataProperties =  returnStatement.argument.properties
          if (dataProperties){
            collectionDataProperty(ctx, dataProperties)
            dataProperties.forEach((property) =>{
              const buildRequire = template.default(`
                const %%variableName%% = ref(%%variableValue%%)
              `);
              const resAst = buildRequire({
                variableName:  t.identifier(property.key.name),
                variableValue: property.value
              })
              node.before(resAst)
              importVueProperty(scriptAst, 'ref')
            })
          }
        } else {
          const returnStatement = arrowFuncAst?.body?.body.find(i => t.isReturnStatement(i))
          const dataVariableNames = returnStatement?.argument?.properties.map(i => i.key.name)
          collectionDataProperty(ctx, returnStatement?.argument?.properties)
          const useDataHelperFuncAst= createUseDataHelperFunc(arrowFuncAst)
          const useDataExpressionAst = createUseDataExpressionAst(dataVariableNames)
          node.before(useDataHelperFuncAst)
          node.before(useDataExpressionAst)
          importVueProperty(scriptAst, ['reactive', 'toRefs'])
        }
      }
      removeVueOption(scriptAst, 'data')
    });
  }
}