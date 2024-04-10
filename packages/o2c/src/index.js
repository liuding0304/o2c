import { parse } from '@vue/compiler-sfc'
import parser from "@babel/parser";
import gogocode from 'gogocode';
import rules from './rules/index.js';

import toSFCString from './generate/index.js';



function createCtx(SFCDescriptor) {
  // js 部分的ast
  // const gogoCodeScriptAst = gogocode(SFCDescriptor.script.content)
  // SFCDescriptor.script.ast = gogoCodeScriptAst.node

  // SFCDescriptor.script.ast = parser.parse(SFCDescriptor.script.content, { sourceType: 'module'});
  // const gogoCodeScriptAst = gogocode(SFCDescriptor.script.ast)

  const scriptPath = SFCDescriptor.find('<script></script>')

  return {
    meta: {
      props: [],
      data: [],
      computed: [],
      methods: [],
    },
    getScriptAst(type = 'gogocode') {
      return type === 'gogocode' ? scriptPath : scriptPath.node;
    },
    // getScriptAst() {
    //   return this.ast.find('<script></script>');
    // },
    collectMeta(metaType, attrName) {
      this.meta[metaType] = this.meta[metaType] || [];
      if (Array.isArray(attrName)) {
        this.meta[metaType].push(...attrName)
      } else {
        this.meta[metaType].push(attrName);
      }
    }
  }
}

export default function o2c(code, config = {}) {
  // todo： parse 似乎会按文件名缓存parse结果
  // let { descriptor: SFCDescriptor, errors } = parse(code, { filename:Math.random().toString(36).slice(2) });
  // if (errors[0]) {
  //   return errors[0].message
  // }

  const SFCDescriptor = gogocode(code, { parseOptions: { language: 'vue' } });

  const useRules = rules.concat(config.rules || []);
  let ctx = createCtx(SFCDescriptor)

  useRules.forEach(( rule )=> {
    rule.transform && rule.transform(ctx)
  })
  return toSFCString(SFCDescriptor.node, { scriptSetupAst: ctx.getScriptAst('ast') })
  // return SFCDescriptor.generate()
}