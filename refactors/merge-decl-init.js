import {visit, types} from 'recast';
const {namedTypes: n} = types;

export default ast => {
	function visitor(path) {
			const visitedDecls = [];

			this.traverse(path);
			
			path.node.body = path.node.body.map(node => {
				if (n.VariableDeclaration.check(node)) {
					visitedDecls.push(...node.declarations);
				}
				if (n.ExpressionStatement.check(node)) {
					if (n.AssignmentExpression.check(node.expression)) {
						if (n.Identifier.check(node.expression.left) && visitedDecls.find(d => d.id.name === node.expression.left.name)) {
							const nodeIndex = visitedDecls.findIndex(d => d.id.name === node.expression.left.name);
							const decl = visitedDecls[nodeIndex];

							decl.init = node.expression.right;
							visitedDecls.splice(nodeIndex, 1, decl);
							return null;
						}
					}
				}
				return node;
			}).filter(node => node);
		}

	visit(ast, {
		visitBlockStatement: visitor,
		visitProgram: visitor
	})
}
