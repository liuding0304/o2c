import { importVueProperty } from "../utils/vue-util.js";
import * as t from "@babel/types";

export default {
  transform(ctx) {
    const scriptAst = ctx.getScriptAst();

    scriptAst.find(`export default { props: $_$props,}`).each((node) => {
      const { props } = node.match;
      if (props?.[0]) {
        let propsMatched = props?.[0]
        let propNames = [];

        if (t.isArrayExpression(propsMatched.node)) {
          propNames = propsMatched.node.elements.map(i => i.value);
        } else if (t.isObjectExpression(propsMatched.node)) {
          propNames = propsMatched.node.properties.map(i => i.key.name)
        }

        ctx.collectMeta('props', propNames)

        node.before(`const props = defineProps(${propsMatched.value});`)
        node.before(`const {${ ctx.meta.props.join(',') }} = toRefs(props);`)
        node.replace(`export default {props: $_$, $$$}`, `export default {$$$}`);
        importVueProperty(scriptAst, 'toRefs');
      }
    });
  }
}