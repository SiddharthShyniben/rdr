import {visit, types} from 'recast';
const {namedTypes: n, builders: b} = types;

export default ast => {
	visit(ast, {
		visitConditionalExpression(path) {
			// case bool ? b : c
			if (isLiteralBoolean(path.node.test)) {
				const {test, consequent, alternate} = path.node;
				const {value} = test;

				if (value) {
					path.replace(consequent);
				} else {
					path.replace(alternate);
				}
			}
			// case a ? bool : bool
			else if (
				isLiteralBoolean(path.node.consequent) &&
				isLiteralBoolean(path.node.alternate)
			) {
				const ae = path.node.consequent.value;
				const be = path.node.alternate.value;

				if (ae) {
					if (be) path.replace(b.literal(true));
					else path.replace(b.unaryExpression('!', b.unaryExpression('!', path.node.test)));
				} else {
					if (be) path.replace(b.unaryExpression('!', path.node.test));
					else path.replace(b.literal(false));
				}
			}
			// case a ? a : b
			else if (
				n.Identifier.check(path.node.test) &&
				n.Identifier.check(path.node.consequent) &&
				path.node.test.name === path.node.consequent.name
			) {
				path.replace(
					// a || b
					b.logicalExpression('||', path.node.test, path.node.alternate)
				)
			}
			// case a ? b : a
			else if (
				n.Identifier.check(path.node.test) &&
				n.Identifier.check(path.node.alternate) &&
				path.node.test.name === path.node.alternate.name
			) {
				path.replace(
					// a && b
					b.logicalExpression('&&', path.node.test, path.node.consequent)
				)
			}

			this.traverse(path);
		} 
	})
}

const isLiteralBoolean = node => n.Literal.check(node) && ['true', 'false'].includes(node.raw);
