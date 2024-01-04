
import { addDefineExpose, removeVueOption, importVueProperty, arrowFuncCodeByObjectProperty, arrowFuncAstByObjectProperty, insertAstAfterImportDeclaration, addUseVueRouter } from "../utils/vue-util.js";
import gogocode from 'gogocode';
import babelParser from '@babel/parser'
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import template from "@babel/template";
import * as t from "@babel/types";


/**
 * todo 支持  const { title } = this
 * todo 支持  const that = this
 */
export default {
  transform(ctx) {
    const scriptAst = ctx.getScriptAst();

    let addVmDeclarationFlag = false;

    const thisA = scriptAst.find(`this.$_$property`)
    thisA.each((node) => {
      const { property } = node.match;

      const {
        computed,
        data,
        props,
        methods
      } = ctx.meta
      property.forEach(({value: propertyName}) => {
        // computed || data || props
        if ([...computed, ...data, ... props].includes(propertyName)) {
          node.replaceBy(
            t.memberExpression(
              t.identifier(propertyName),
              t.identifier('value'),
            )
         );
        } else if (methods.includes(propertyName)) {
          // methods
          node.replaceBy(
            t.identifier(propertyName),
          );
        }  else if (['$route', '$router'].includes(propertyName)) {
          propertyName = propertyName.replace(/^\$/, '')
          node.replaceBy(
            t.identifier(propertyName),
          );
          addUseVueRouter(scriptAst, propertyName)
        }  else if (['$nextTick', '$set', '$delete'].includes(propertyName)) {
          // nextTick  set delete
          node.replaceBy(
            t.identifier(propertyName.slice(1)),
          );
          importVueProperty(scriptAst, propertyName.slice(1))
        } else {
          // unknown
          // 导入vue getCurrentInstance
          addVmDeclarationFlag = true
          node.replaceBy(
            t.memberExpression(
              t.identifier('$vm'),
              t.identifier(propertyName),
            )
          );
        }
      })
    });

    if (addVmDeclarationFlag) {
      importVueProperty(scriptAst, 'getCurrentInstance')
      const buildRequire = template.default('const { proxy: $vm } = getCurrentInstance();\n');
      insertAstAfterImportDeclaration(scriptAst, buildRequire())
    }
  }
}