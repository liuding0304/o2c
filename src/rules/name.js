
import { addDefineOptions, removeVueOption } from "../utils/vue-util.js";


export default {
  transform(ctx) {
    const scriptAst = ctx.getScriptAst();

    scriptAst.find(`export default { name:  $_$name,}`).each((node) => {
      const { name } = node.match;
      addDefineOptions(scriptAst, 'name', name[0].raw ||  name[0].value);
      removeVueOption(scriptAst, 'name')
    });
  }
}