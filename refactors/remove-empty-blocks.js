import {visit, types} from 'recast';
const {namedTypes: n, builders: b} = types;

export default ast => {
	visit(ast, {
		visitIfStatement(path) {
			const {consequent, alternate} = path.node;

			if (n.BlockStatement.check(consequent) && consequent.body.length === 0) {
				path.replace(
					b.ifStatement(
						b.unaryExpression('!', path.node.test),
						alternate,
						null
					)
				);
			} else if (n.BlockStatement.check(alternate) && alternate.body.length === 0) {
				path.replace(
					b.ifStatement(
						path.node.test,
						consequent,
						null
					)
				);
			}

			this.traverse(path);
		}
	})
}
