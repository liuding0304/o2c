import gogocode from 'gogocode';
import babelParser from '@babel/parser'
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import template from "@babel/template";
import * as t from "@babel/types";

export function importVueProperty(scriptAst, propertyName) {
  if (typeof propertyName === 'string') {
    if (!scriptAst.has('import { $$$ } from "vue"')) {
      scriptAst.before(`import { ${propertyName} } from "vue";\n`)
    } else {
      if (!scriptAst.has(`import { ${propertyName} } from "vue"`)) {
        scriptAst.replace('import { $$$ } from "vue"', `import { ${propertyName}, $$$} from "vue";`)
      }
    }
  } else if(Array.isArray(propertyName)){
    propertyName.forEach(importVueProperty)
  }
}

export function addDefineExpose(scriptAst, exposeName, exposeValue) {
  if (scriptAst.has('defineExpose({})')) {
    if (!scriptAst.has(`defineExpose({ ${exposeName}: $_$ })`)) {
      scriptAst.replace('defineExpose({ $$$ })', `defineExpose({\n  ${exposeName}: ${exposeValue},\n $$$ })`)
    }
  } else {
    scriptAst.after(`\ndefineExpose({ ${exposeName}: ${exposeValue} });\n`)
  }
}
export function addDefineOptions(scriptAst, exposeName, exposeValue) {
  if (scriptAst.has('defineOptions({})')) {
    if (!scriptAst.has(`defineOptions({ ${exposeName}: $_$ })`)) {
      scriptAst.replace('defineOptions({ $$$ })', `defineOptions({\n  ${exposeName}: ${exposeValue},\n $$$ })`)
    }
  } else {
    scriptAst.after(`\ndefineOptions({ ${exposeName}: ${exposeValue} });\n`)
  }
}

export function removeVueOption(scriptAst, optionName) {
  if (scriptAst.has(`export default { ${optionName}:  $_$1,}`)) {
    scriptAst.replace(`export default { ${optionName}: $_$1, $$$}`, `export default {$$$}`);
  }
}

export function isWatchObj(node) {
  const props = node.properties || [];
  const fPs = props.filter(p => ( p.key && p.key.name === 'handler'));
  return fPs.length > 0;
}

/**
 * 将 objectProperty为函数的属性转换为箭头函数AST
 */
export function arrowFuncAstByObjectProperty(objectProperty) {
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
 * 将 objectProperty为函数的属性转换为箭头函数代码
 */
export function arrowFuncCodeByObjectProperty(objectProperty) {
  const arrowFuncAST = arrowFuncAstByObjectProperty(objectProperty)
  return gogocode(arrowFuncAST).generate()
}

export function insertAstAfterImportDeclaration(scriptAst, ast) {
  const firstStatementIndex = scriptAst.value.program.body.findIndex(n => !t.isImportDeclaration(n))
  scriptAst.value.program.body.splice(firstStatementIndex, 0, ast)
}

/**
 * 添加引入vuex.useStore代码 和 声明store,会移除mapState, mapGetters, mapMutations, mapActions
 */
export function addUseStore (scriptAst) {
  if (!scriptAst.has('import { useStore } from "vuex"')) {
    if (scriptAst.has('import {$$$} from "vuex"')) {
      scriptAst.replace('import {$$$} from "vuex"', `import { useStore } from 'vuex';\n`)
    } else {
      scriptAst.before(`import { useStore } from 'vuex';\n`)
    }
  }
  if (!scriptAst.has('const store = useStore()')) {
    insertAstAfterImportDeclaration(scriptAst, template.default('const store = useStore();\n')())
  }
}


/**
 * 在scriptAst添加 useRoute, useRouter
 * @param {*} scriptAst
 * @param {*} routerAttr
 */
export function addUseVueRouter(scriptAst, routerAttr) {
  if (['route', 'router'].includes(routerAttr)) {
    const hookMap = {
      route: 'useRoute',
      router: 'useRouter',
    }
    const hookName = hookMap[routerAttr]
    //  添加import 语句
    if (scriptAst.has('import {$$$} from "vue-router"')) {
      if (!scriptAst.has(`import { ${hookName} } from "vue-router"`)) {
        scriptAst.replace('import {$$$} from "vue-router"', `import { ${hookName}, $$$ } from 'vue-router';\n`)
      }
    } else {
      scriptAst.before(`import { ${hookName} } from 'vue-router';\n`)
    }

    // 添加hook
    const hookDeclarationCode = `const ${routerAttr} = ${hookName}()`
    if (!scriptAst.has(hookDeclarationCode)) {
      insertAstAfterImportDeclaration(scriptAst, template.default(hookDeclarationCode)())
    }
  }
}