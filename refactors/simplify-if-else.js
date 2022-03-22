import {visit, types} from 'recast';
const {namedTypes: n, builders: b} = types;

export default ast => {
	visit(ast, {
		visitIfStatement(path) {
			this.traverse(path);
			const {test, consequent, alternate} = path.node;

			const hasLoneReturn = node => n.ReturnStatement.check(node)
				&& node.body.length === 1
				&& n.ReturnStatement.check(node.body[0]);

			// if (bool) ...
			if (isLiteralBoolean(test)) {
				if (test.value) {
					if (n.BlockStatement.check(consequent)) {
						path.replace(...consequent.body);
					} else {
						path.replace(consequent);
					}
				} else {
					if (alternate) {
						if (n.BlockStatement.check(alternate)) {
							path.replace(...alternate.body);
						} else {
							path.replace(alternate);
						}
					} else path.replace();
				}
			}
			// if (a) return bool else return bool
			else if (
				(n.ReturnStatement.check(consequent) || hasLoneReturn(consequent)) &&
				(n.ReturnStatement.check(alternate) || hasLoneReturn(alternate))
			) {
				const [consequentReturn, alternateReturn] = [consequent, alternate].map(node => {
					if (n.ReturnStatement.check(node)) {
						return node;
					} else {
						return node.body[0];
					}
				});

				if (isLiteralBoolean(consequentReturn.argument) && isLiteralBoolean(alternateReturn.argument)) {
					const ae = consequent.argument.value;
					const be = alternate.argument.value;

					if (ae) {
						if (be) {
							path.replace(consequentReturn);
						} else {
							path.replace(
								b.returnStatement(b.unaryExpression('!', b.unaryExpression('!', test)))
							);
						}
					} else {
						if (be) {
							path.replace(
								b.returnStatement(b.unaryExpression('!', test))
							);
						} else {
							path.replace(alternateReturn);
						}
					}
				}
				// if (a) return a;
				// else return b;
				else if (
					n.Identifier.check(test) &&
					n.Identifier.check(consequentReturn.argument) &&
					n.Identifier.check(alternateReturn.argument) &&
					test.name === consequentReturn.argument.name
				) {
					path.replace(
						b.returnStatement(
							b.logicalExpression('||', test, alternateReturn.argument)
						)
					);
				}
				// if (a) return b;
				// else return a;
				else if (
					n.Identifier.check(test) &&
					n.Identifier.check(consequentReturn.argument) &&
					n.Identifier.check(alternateReturn.argument) &&
					test.name === alternateReturn.argument.name
				) {
					path.replace(
						b.returnStatement(
							b.logicalExpression('&&', test, consequentReturn.argument)
						)
					);
				}
			}

			this.traverse(path);
		} 
	})
}

const isLiteralBoolean = node => n.Literal.check(node) && ['true', 'false'].includes(node.raw);
