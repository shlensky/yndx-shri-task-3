import * as jsonToAst from 'json-to-ast';
import '../vendor/block-linter';

function parseJson(json: string): jsonToAst.AstJsonEntity | undefined {
    try {
        return jsonToAst(json);
    } catch (err) {
        return undefined;
    }
}

function walk(
    node: jsonToAst.AstJsonEntity,
    cbProp: (property: jsonToAst.AstProperty) => void,
    cbObj: (property: jsonToAst.AstObject) => void
) {
    switch (node.type) {
        case 'Object':
            cbObj(node);

            node.children.forEach((entity) => {
                if (entity.type === 'Property') {
                    cbProp(entity);
                    walk(entity.value, cbProp, cbObj);
                }
            });
            break;
        case 'Array':
            node.children.forEach((item: jsonToAst.AstJsonEntity) => walk(item, cbProp, cbObj));
            break;
    }
}

export interface LinterProblem<TKey> {
    key: TKey;
    loc: jsonToAst.AstLocation;
}

export function makeLint<TProblemKey>(
    json: string,
    validateProperty: (property: jsonToAst.AstProperty) => LinterProblem<TProblemKey>[],
    validateObject: (property: jsonToAst.AstObject) => LinterProblem<TProblemKey>[]
): LinterProblem<TProblemKey>[] {

    let errors: LinterProblem<TProblemKey>[] = [];
    const ast: jsonToAst.AstJsonEntity | undefined = parseJson(json);

    const cbProp = (property: jsonToAst.AstProperty) => {
        errors = errors.concat(...validateProperty(property));
    };

    const cbObj = (obj: jsonToAst.AstObject) => {
        errors = errors.concat(...validateObject(obj));
    };

    if (ast) {
        walk(ast, cbProp, cbObj);
    }

    const blockLinterErrors = lint(json);
    errors = errors.concat(blockLinterErrors.map(({ error, location }) => {
        return {
            key: error,
            loc: location
        } as LinterProblem<TProblemKey>;
    }));

    return errors;
}
