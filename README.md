# babel-plugin-css-module-parse

Babel plugin for transforming css module references to strings with prefix.


```javascript
// transforming
import styles from './index.scss';
<div class={styles.wrap}></div>
<div class={styles[wrap]}></div>

// to
import './index.css';
<div class={'prefix-wrap'}></div>
<div class={`prefix-${wrap}`}></div>
```
