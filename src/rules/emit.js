// https://v3-migration.vuejs.org/zh/breaking-changes/emits-option.html

import * as t from "@babel/types";
import traverse from "@babel/traverse";
import { insertAstAfterImportDeclaration, buildAst, insertComment, toArrowFuncAstByObjectProperty } from '../utils/index.js';

export default {
  transform(ctx) {
    const ast = ctx.getScriptAst('ast');
    const scriptAst = ctx.getScriptAst();
    traverse.default(ast, {
      ThisExpression(path) {
        if (t.isIdentifier(path.parent.property, { name: '$emit'})) {
          // const emit = defineEmits(['change-val'])
          const callStatementPath = path.findParent(i => t.isCallExpression(i))
          const firstArgument = callStatementPath.get('arguments.0')
          const emitEventName = firstArgument?.node?.value
          callStatementPath.node.callee = t.identifier('emit')
          if (emitEventName) {
            const all = path.scope.getAllBindings()
            if (all.emit) {
              const emitPath = all.emit.path;
              const emitEventNameArr = emitPath.get('init.arguments.0')
              const isExited = emitEventNameArr.node.elements.some(i => i.value === emitEventName)
              if (!isExited) {
                emitEventNameArr.node.elements.unshift(t.stringLiteral(emitEventName))
              }
            } else {
              insertAstAfterImportDeclaration(scriptAst, buildAst(`const emit = defineEmits(['${emitEventName}'])`))
            }
          } else {
            insertComment(callStatementPath.node, 'emit—事件名称无法识别', true)
          }

          // beforeExportDefault(path, buildAst(`const emit = defineEmits(['${emitEventName}'])`))
        }
      },
    });
  }
}