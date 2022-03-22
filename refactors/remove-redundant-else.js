import {visit, types} from 'recast';

const {namedTypes: n} = types;

export default ast => {
	visit(ast, {
		visitIfStatement(path) {
			const {node} = path;
			if (node.alternate) {
				if (n.ReturnStatement.check(node.consequent)
					|| (n.BlockStatement.check(node.consequent) && node.consequent.body.find(node => n.ReturnStatement.check(node)))) {

					path.insertAfter(
						...(n.ReturnStatement.check(node.alternate)
							? [node.alternate]
							: node.alternate.body)
					);

					node.alternate = null;
				}
			}

			this.traverse(path);
		}
	})
}
