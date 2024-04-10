const vscode = require('vscode');
const fs = require('fs')
const path = require('path')
const { cosmiconfigSync } = require('cosmiconfig');

function walkSync(currentDirPath, callback) {
  fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach(function(dirent) {
    var filePath = path.join(currentDirPath, dirent.name);
    if (dirent.isFile()) {
      callback(filePath, dirent);
    } else if (dirent.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}

function executeJSFile(filePath) {
  try {
    // 读取JavaScript文件内容
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // 使用eval函数执行JavaScript文件
    const config =  eval(fileContent);

    // 或者使用Function构造函数执行JavaScript文件
    // const loadedModule = new Function(fileContent)();

    console.log('JavaScript file executed successfully', config);
  } catch (error) {
    console.error(`Failed to execute JavaScript file: ${error}`);
  }
}

const findConfigFile = (fsPath) => {
  const nexPath = fsPath.replace(/\/[^/]+$/, '')
  if (fsPath !== nexPath) {
    if (fs.existsSync(path.resolve(nexPath, 'o2c.config.cjs'))) {
      return path.resolve(nexPath, 'o2c.config.cjs')
    } else  {
      if (!fs.existsSync(path.resolve(nexPath, 'package.json'))) {
        return findConfigFile(nexPath)
      }  else {
        return null;
      }
    }
  }
  return null;
}

const getConfigByFile = (filePath) => {
  const explorer = cosmiconfigSync('o2c');
  explorer.clearLoadCache()
  const config = explorer.load(filePath);
  console.log('config', config)
  return config
}


const reuqireO2c = async () => {
  const { default: o2c } = await import('../o2c/src/index.js')
  return o2c
}

const transFile = async (fsPath, config) => {
  if (path.extname(fsPath) === '.vue') {
    const o2c = await reuqireO2c();
    const content = fs.readFileSync(fsPath, 'utf-8')
    fs.writeFileSync(fsPath.replace('.vue', '-out.vue'), o2c(content, config))
  }
}

function activate(context) {
  let disposable = vscode.commands.registerCommand('optionsapi2compositionapi.transform', async function (uri) {
    const isFile = fs.statSync(uri.fsPath).isFile()
    const configFilePath = findConfigFile(uri.fsPath)
    const config = getConfigByFile(configFilePath).config
    if (isFile) {
      transFile(uri.fsPath, config);
    } else {
      walkSync(uri.fsPath, async (filePath) => {
        try {
          await transFile(filePath, config);
        } catch (error) {
          console.log('xxxxxx', error)
        }
      })
    }
  });
  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}
