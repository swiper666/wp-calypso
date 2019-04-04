Lodash Babel Transform
======================

This Babel transform between imports from lodash and imports from lodash-es.

The default is to transform any lodash imports into lodash-es imports:

```js
import get from 'lodash/get'
```

becomes:

```js
import { get } from 'lodash-es'
```

This transform avoids duplication of the Lodash library and makes sure that all imports
from all packages are satisfied by individual named imports from `lodash-es`, enabling
tree-shaking of unused Lodash methods.

It's also possible to transform from lodash-es imports into lodash imports, to
enable a commonjs-based pipeline.

Options:
- from: the library to transform from (default: 'lodash')
- to: the library to convert to (default: 'lodash-es')
