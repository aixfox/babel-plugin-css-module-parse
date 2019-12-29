import p from 'path';

export const defaultOpts = {
  prefixParser: (file) => {
    const { dir } = file;
    const moduleName = (dir.split('/').pop() || '').toLowerCase();
    return `${moduleName}-`;
  },
  test: /\.scss$/,
  sourceParser: (value) => value.replace(/\.scss$/, '.css'),
};

export default function ({ types: t }) {
  const visitor = {
    ImportDeclaration(path, state) {
      const { prefixParser, test, sourceParser } = { ...defaultOpts, ...state.opts };

      if (
        !(
          test instanceof RegExp ? // eslint-disable-line no-nested-ternary
            test.test(path.node.source.value) :
            typeof test === 'function' ?
              test(path.node.source.value) :
              false
        ) ||
        path.node.specifiers.length !== 1 ||
        !t.isImportDefaultSpecifier(path.node.specifiers[0])
      ) return;

      const refName = path.node.specifiers[0].local.name;
      const binding = path.scope.bindings[refName];

      if (!binding) return;

      binding.referencePaths.forEach((item) => {
        const fileState = p.parse(state.filename);
        let fileStyle = fileState;
        try {
          fileStyle = p.parse(p.join(fileState.dir, path.node.source.value));
        } catch (e) {} // eslint-disable-line no-empty

        if (!t.isMemberExpression(item.parentPath.node)) return;

        if (item.parentPath.node.computed === false) {
          const propertyName = item.parentPath.node.property.name;
          item.parentPath.replaceWith(
            t.stringLiteral(`${prefixParser(fileStyle)}${propertyName}`),
          );
        } else {
          item.parentPath.replaceWith(
            t.templateLiteral(
              [
                t.templateElement({ raw: '', cooked: '' }, false),
                t.templateElement({ raw: '', cooked: '' }, false),
                t.templateElement({ raw: '', cooked: '' }, true),
              ],
              [
                t.stringLiteral(prefixParser(fileStyle)),
                item.parentPath.node.property,
              ],
            ),
          );
        }
      });

      path.replaceWith(
        t.importDeclaration([], t.stringLiteral(sourceParser(path.node.source.value))),
      );
    },
  };

  return {
    visitor,
  };
}
