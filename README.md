# babel-plugin-css-module-parse


一个自动增加 css class 前缀的 babel 插件，将 css module 的引用转换成带前缀的字符串。

样式的文件路径会作为转换函数的参数，因此可以将目录名或文件名作为 css class 的前缀或前缀的一部分。 

由于文件系统保证了文件名唯一性，如此可以帮助在编译期增加样式名前缀，避免样式名冲突。

同时，生成的前缀样式名，方便选择组件中的元素，以进行样式覆盖和二次开发。

例如：组件库`lib` 的 组件`component` 引用的 `index.scss` 中 `.name`，可以处理成 `lib-component-name`。


## 示例：

属性访问（MemberExpression）转换成字符串或字符串模板。

```javascript
import styles from './index.scss';
<div className={styles.name}></div>
<div className={styles[name]}></div>

// 转换成
import './index.scss';
<div className={'prefix-name'}></div>
<div className={`prefix-${name}`}></div>
```


## 使用方式

终端：
```shell
npm install babel-plugin-css-module-parse --save-dev
```

babel 配置：
```javascript
{
  "plugins": [["babel-plugin-css-module-parse", options]]
}
```

因为需要转换的场景不一，插件的默认参数均为空，需要自行配置。见下方 `示例参数`。

编写样式时，需要使用 css module 的形式。



## 参数

### test
类型：`RegExp` | `(value: string) => boolean`
默认: `() => false`

匹配 import source value 选取 ImportDeclaration 节点。

例：`import styles from 'index.scss'` 中 value 为 `index.scss`。


### prefixParser
类型：`(filename: string) => string`
默认: `() => ''`

将样式的文件路径处理成前缀字符串的函数。


### sourceParser
类型：`(value: string) => string`
默认: `i => i`

转换 ImportDeclaration 的 import source value。

此外，默认会把 ImportDeclaration 的 specifiers 置为空，即 `import styles from './index.scss';` 会转换成 `import './index.scss';`。



## 示例参数

匹配 `import styles from *.scss` 

`src/components/a/index.scss` 生成前缀 `lib-a-`

`src/components/a/not-index.scss` 生成前缀 `lib-a-not-index-`

```javascript
const libName = 'lib';

const options = {
  test: /\.scss$/,
  prefixParser: (filename) => {
    const names = filename.split('/').reverse();
    let moduleName = '', subModuleName = '';
    if (/^index\./.test(names[0])) {
      names.shift();
      moduleName = names[0];
    } else {
      moduleName = names[1];
      subModuleName = names[0];
    }

    return `${libName ? `${libName}-` : ''}${moduleName ? `${moduleName}-` : ''}${subModuleName ? `${subModuleName}-` : ''}`.toLowerCase();
  },
}
```


## 与css处理器集成

babel 插件处理 javascript 文件，需要和 css处理器 配合使用。


### css-loader

使用 css-loader 配置。

```javascript
const options = {
  modules: {
    getLocalIdent: (context, localIdentName, localName) => {
      const name = localName;
      const prefix = option.prefixParser(context.resourcePath);
      return `${prefix}${name}`;
    },
  },
}
```


### postcss

使用 postcss 的插件 postcss-modules。

```javascript
const postcssModule = require('postcss-modules');

postcssModule({
  generateScopedName(name, filename) {
    const prefix = option.prefixParser(filename);
    return `${prefix}${name}`;
  },
})
```

```
