"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: "Disallow React namespace access (e.g. React.ReactElement)",
            recommended: true,
        },
        messages: {
            noReactNamespace: "Use named imports instead of React namespace (e.g. 'ReactElement' instead of 'React.ReactElement').",
        },
        schema: [],
    },
    create(context) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            TSQualifiedName(node) {
                if (node.left?.name === 'React') {
                    context.report({ node, messageId: 'noReactNamespace' });
                }
            },
        };
    },
};
exports.default = rule;
