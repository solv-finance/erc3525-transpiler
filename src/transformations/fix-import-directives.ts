import path from 'path';

import { SourceUnit } from 'solidity-ast';
import { getImportDirectives, getSourceIndices } from '../solc/ast-utils';
import { Transformation } from './type';
import { relativePath } from '../utils/relative-path';
import { renamePath } from '../rename';

export function* fixImportDirectives(
  ast: SourceUnit,
  sourcePath: string,
): Generator<Transformation> {
  const dirname = path.dirname(sourcePath);

  const imports = getImportDirectives(ast);

  for (const imp of imports) {
    const transformed = [];

    if (imp.file.startsWith('.')) {
      transformed.unshift(imp.file); // TODO: may not be a relative path
    } else {
      transformed.unshift(relativePath(dirname, imp.file));
    }

    const finalTransformation = transformed.map(t => `import "${renamePath(t)}";`).join('\n');
    const [start, len] = getSourceIndices(imp);

    yield {
      kind: 'fix-import-directives',
      start: start,
      length: len,
      text: finalTransformation,
    };
  }
}
