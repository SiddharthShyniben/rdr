import {visit, types} from 'recast';
const {namedTypes: n, builders: b} = types;

export const fixNestedIfs = ast => {
	visit(ast, {
		visitIfStatement(path) {
			const {consequent, alternate} = path.node;

			const hasLoneIf = node => 
				n.BlockStatement.check(node) &&
				node.body.length === 1 &&
				n.IfStatement.check(node.body[0]);

			if (n.IfStatement.check(consequent) || hasLoneIf(consequent)) {
				const {test, consequent: consequentIf} = hasLoneIf(consequent) ? consequent.body[0] : consequent;

				path.replace(
					b.ifStatement(
						b.logicalExpression('&&', path.node.test, test),
						consequentIf
					)
				);

				fixNestedIfs(path);
			} 

			this.traverse(path);
		}
	});
}

export default fixNestedIfs;
