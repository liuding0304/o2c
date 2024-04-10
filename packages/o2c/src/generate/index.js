import generate from "@babel/generator";

function toString(sfcDescriptor) {
  const {
    template,
    scriptSetup,
    styles,
  } = sfcDescriptor;
  return [template, scriptSetup, ...styles]
    .filter(block => block != null)
    // figure out exact source positions of blocks
    .map(block => {
      const openTag = makeOpenTag(block);
      const closeTag = makeCloseTag(block);
      return Object.assign({}, block, {
        openTag,
        closeTag,
      });
    })
    // generate sfc source
    .reduce((sfcCode, block) => {
      return sfcCode + '\n' + (block.openTag + '\n' + block.content.replace(/^\n/, '') + block.closeTag);
    }, '');
}

function makeOpenTag(block) {
  let source = '<' + block.type;

  source += Object.keys(block.attrs)
    .sort()
    .map(name => {
      const value = block.attrs[name];

      if (value === true) {
        return name;
      } else {
        return `${name}="${value}"`;
      }
    })
    .map(attr => ' ' + attr)
    .join('');

  return source + '>';
}

function makeCloseTag(block) {
  return `</${block.type}>\n`
}


export default function toSFCString(sfcDescriptor, { scriptSetupAst }) {
  const scriptTemp= sfcDescriptor.script
  sfcDescriptor.script = null;
  scriptTemp.attrs = scriptTemp.attrs || {}
  scriptTemp.attrs.setup = true
  scriptTemp.content = generate.default(scriptSetupAst, {}, scriptTemp.content).code;
  sfcDescriptor.scriptSetup = scriptTemp
  return toString(sfcDescriptor);
}