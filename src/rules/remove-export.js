
import { addDefineExpose, removeVueOption } from "../utils/vue-util.js";


export default {
  transform(ctx) {
    const scriptAst = ctx.getScriptAst();

    scriptAst.find(`export default { $$$1 }`).each((node) => {
      if (node.match.$$$1.length === 0) {
        node.remove()
      }
    });
  }
}