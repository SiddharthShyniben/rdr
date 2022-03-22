import {parse, prettyPrint} from 'recast';
import simplifyTernary from './refactors/simplify-ternary.js';
import simplifyIfElse from './refactors/simplify-if-else.js';
import simplifyStrings from './refactors/make-template-string.js';
import ifElseToTernary from './refactors/if-else-to-ternary.js';
import removeRedundantElse from './refactors/remove-redundant-else.js';
import mergeDeclInit from './refactors/merge-decl-init.js';
import mergeNestedIf from './refactors/merge-nested-if.js';
import removeEmptyBlocks from './refactors/remove-empty-blocks.js';

export default code => {
	const parsed = parse(code);

	ifElseToTernary(parsed);
	simplifyTernary(parsed);
	simplifyIfElse(parsed);
	simplifyStrings(parsed);
	removeRedundantElse(parsed);
	mergeDeclInit(parsed);
	removeEmptyBlocks(parsed);
	mergeNestedIf(parsed);

	const newCode = prettyPrint(parsed).code;
	return newCode;
}
