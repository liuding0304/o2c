import * as t from "@babel/types";
import template from "@babel/template";

/**
 * 将 objectProperty为函数的属性转换为箭头函数AST
 */
export function toArrowFuncAstByObjectProperty(objectProperty) {
  let funcParams, funcBody, funcSync;

  let funcNode;
  if (t.isObjectMethod(objectProperty)) {
    funcNode = objectProperty
  } else if(t.isFunction(objectProperty)) {
    funcNode = objectProperty
  } else if(t.isFunction(objectProperty.value)) {
    funcNode = objectProperty.value
  }
  if (funcNode) {
    funcParams = funcNode.params;
    funcBody = funcNode.body;
    funcSync = funcNode.async;
    return t.arrowFunctionExpression(funcParams, funcBody, funcSync)
  }
  return null;
}

/**
 * 导入Vue
 * @param {*} path 任意nodePath
 * @param {*} vueProperty
 */
export function importVueProperty(path, vueProperty) {
  if (!path.scope.hasBinding(vueProperty)){
    const programPath = path.findParent((path) => path.isProgram());
    const importPaths = programPath.get('body').filter(i => t.isImportDeclaration(i.node) && i.node.source.value === 'vue')
    const specifiers = importPaths.reduce((res, i) => {
      res.push(...i.node.specifiers)
      return res
    }, [])
    specifiers.sort((a, b) => t.isImportDefaultSpecifier(a) ? -1 : 0)
    specifiers.push(t.importSpecifier(t.identifier(vueProperty), t.identifier(vueProperty)))
    importPaths.forEach((item, index) => {
      if (index > 0) {
        item.remove()
      } else {
        item.replaceWith(
          t.importDeclaration(specifiers, t.stringLiteral('vue'))
        )
      }
    })
  }
}


export function insertComment(node, comments, isO2C = true) {
  if (!Array.isArray(comments)) {
    comments = [comments]
  }

  comments.forEach((comment) => {
    if (typeof comment === 'string') {
      const content = isO2C ? ` O2C WARNING:${comment}` : comment;
      t.addComment(node, 'leading', content, true);
    } else {
      node.leadingComments = node.leadingComments || []
      if (isO2C) {
        comment.value = ` O2C WARNING:${comment.value}`
      }
      node.leadingComments.push(comment)
    }
  })

}

// 在上级的export default 语句前添加代码
export function beforeExportDefault(path, astNode) {
  const exportStatement = path.find(i => t.isExportDefaultDeclaration(i))
  if (exportStatement) {
    exportStatement.insertBefore(astNode)
  }
}


export function buildAst(code, placeholderAstMap) {
  const buildRequire = template.default(code);
  return buildRequire(placeholderAstMap)
}

export function insertDefineEmits(path, eventName) {

}

export function insertAstAfterImportDeclaration(scriptAst, ast) {
  const firstStatementIndex = scriptAst.value.program.body.findIndex(n => !t.isImportDeclaration(n))
  scriptAst.value.program.body.splice(firstStatementIndex, 0, ast)
}

/**
 * 构建函数表达式
 * @param {*} variableName
 * @param {*} funcNode
 */
export function buildFuncExpression(variableName, funcNode, comments = []) {
  const node = t.variableDeclaration(
    'const',
    [
      t.variableDeclarator(
        t.identifier(variableName),
        funcNode,
      )
    ]
  )

  if (comments?.length) {
    // 都设置为leadingComments
    node.leadingComments = comments
  }
  return node
}
