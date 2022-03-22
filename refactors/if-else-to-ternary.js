
import {visit, types} from 'recast';
const {namedTypes: n, builders: b} = types;

export default ast => {
	visit(ast, {
		visitIfStatement(path) {
			this.traverse(path);

			const {test, consequent, alternate} = path.node;

			const hasLoneReturn = node => 
				n.BlockStatement.check(node) &&
				node.body.length === 1 &&
				n.ReturnStatement.check(node.body[0]);

			if (
				(n.ReturnStatement.check(consequent) || hasLoneReturn(consequent)) &&
				(n.ReturnStatement.check(alternate) || hasLoneReturn(alternate))
			) {
				path.replace(
					b.returnStatement(
						b.conditionalExpression(
							test,
							n.ReturnStatement.check(consequent)
								? consequent.argument
								: consequent.body[0].argument,
							n.ReturnStatement.check(alternate)
								? alternate.argument
								: alternate.body[0].argument
						)
					)
				)
			}

			const isAssignment = node =>
				n.ExpressionStatement.check(node) &&
				n.AssignmentExpression.check(node.expression)

			const hasLoneAssignment = node =>
				n.BlockStatement.check(node) &&
				node.body.length === 1 &&
				isAssignment(node.body[0]);

			if (
				(isAssignment(consequent) || hasLoneAssignment(consequent)) &&
				(isAssignment(alternate) || hasLoneAssignment(alternate)) &&
				consequent.expression.left.name === alternate.expression.left.name
			) {
				path.replace(
					b.expressionStatement(
						b.assignmentExpression(
							'=',
							consequent.expression.left,
							b.conditionalExpression(
								test,
								consequent.expression.right,
								alternate.expression.right
							)
						)
					)
				)
			}
		}
	})
}
