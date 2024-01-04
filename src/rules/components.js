
import * as t from "@babel/types";
import traverse from "@babel/traverse";
import { insertComment, toArrowFuncAstByObjectProperty } from '../utils/index.js';

/**
 * 转换components选项
 * import comA from 'xxxx'
 * import comC from 'xxxx'
 *
 * const comB = Vue.component('comB', xxxx)
 *
 * {
 *   comAlisa: comA,
 *   comB,
 *   comC,
 *   comD: () => import('xxxxxx'),
 *    ...
 * }
 *
 *
 * vue3 动态组件
 * import { defineAsyncComponent } from 'vue'
 * const asyncModal = defineAsyncComponent(() => import('./Modal.vue'))
 */

export default {
  transform(ctx) {
    const ast = ctx.getScriptAst('ast');
    traverse.default(ast, {
      ExportDefaultDeclaration(path) {
        if (t.isObjectExpression(path.node.declaration)) {
          let hasUnknownProperty = false
          const components = path.get('declaration.properties').find(i => t.isIdentifier(i.node.key, { name: 'components' }));
          const componentsProperties = components?.get('value.properties')

          componentsProperties?.forEach((compPropertyPath) => {
            if (t.isIdentifier(compPropertyPath.node.value)) {
              const keyName = compPropertyPath.node.key.name;
              const valueName = compPropertyPath.node.value.name;
              if (keyName !== valueName) {
                if (compPropertyPath.scope.hasBinding(valueName)) {
                  // t.addComment(path.node, 'leading', 'My first comment');
                  compPropertyPath.scope.rename(valueName, keyName);
                }
              }
              compPropertyPath.remove();
            } else {
              // 支持函数声明component
              let arrowFunc = toArrowFuncAstByObjectProperty(compPropertyPath.node)
              if (arrowFunc) {
                // 使用defineAsyncComponent重新声明组件
                let constName = compPropertyPath.node.key.name
                t.callExpression(t.identifier('defineAsyncComponent'),[arrowFunc])
                // todo add defineAsyncComponent import
                path.insertBefore(
                  t.variableDeclaration(
                    'const',
                    [
                      t.variableDeclarator(
                        t.identifier(constName),
                        t.callExpression(t.identifier('defineAsyncComponent'),[arrowFunc])
                      )
                    ]
                  )
                )
                compPropertyPath.remove()
              } else {
                hasUnknownProperty = true
              }
              // todo：支持值为普通语句
            }
          })

          if (hasUnknownProperty) {
            insertComment(components.node, '存在未解析的语法', true)
          } else {
            components?.remove()
          }
        }
      },
    });
  }
}