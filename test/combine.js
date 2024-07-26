class Node {
    constructor(type, left = null, right = null, value = null) {
        this.type = type; // 'operator' for AND/OR, 'operand' for conditions
        this.left = left; // Left child node
        this.right = right; // Right child node
        this.value = value; // Value for operand nodes
    }
}

function parseRuleString(ruleString) {
    const tokens = ruleString.match(/(?:\w+|AND|OR|[><=!]+|'[^']*'|\(|\))/g);
    if (!tokens) {
        throw new Error('Invalid rule string');
    }

    let index = 0;

    function parseExpression() {
        let left = parseTerm();

        while (tokens[index] === 'OR') {
            const operator = tokens[index++];
            const right = parseTerm();
            left = new Node('operator', left, right, operator);
        }

        return left;
    }

    function parseTerm() {
        let left = parseFactor();

        while (tokens[index] === 'AND') {
            const operator = tokens[index++];
            const right = parseFactor();
            left = new Node('operator', left, right, operator);
        }

        return left;
    }

    function parseFactor() {
        if (tokens[index] === '(') {
            index++;
            const node = parseExpression();
            if (tokens[index] !== ')') {
                throw new Error('Mismatched parentheses');
            }
            index++;
            return node;
        }

        return parseOperand();
    }

    function parseOperand() {
        const left = tokens[index++];
        const operator = tokens[index++];
        const right = tokens[index++];

        const value = `${left} ${operator} ${right}`;
        return new Node('operand', null, null, value);
    }

    return parseExpression();
}

function countOperators(node, operatorCounts = { AND: 0, OR: 0 }) {
    if (!node) return operatorCounts;

    if (node.type === 'operator') {
        operatorCounts[node.value]++;
        countOperators(node.left, operatorCounts);
        countOperators(node.right, operatorCounts);
    }

    return operatorCounts;
}

function getMostFrequentOperator(operatorCounts) {
    return operatorCounts.AND >= operatorCounts.OR ? 'AND' : 'OR';
}

function combineASTs(ast1, ast2) {

    return new Node('operator', ast1, ast2, 'AND');
}

// Test the parser with sample rules
const ruleString1 = "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)";
const ruleString2 = "((age > 30 AND department = 'Marketing')) AND (salary > 20000 OR experience > 5)";
const ast1 = parseRuleString(ruleString1);
const ast2 = parseRuleString(ruleString2);
// console.log(ast1);
// Combine the ASTs using the most frequent operator heuristic
const combinedAST = combineASTs(ast1, ast2);

// Function to convert AST to JSON for visualization
function astToJson(node) {
    if (!node) return null;
    return {
        type: node.type,
        left: astToJson(node.left),
        right: astToJson(node.right),
        value: node.value
    };
}

const combinedASTJson = astToJson(combinedAST);
console.log(JSON.stringify(combinedASTJson, null, 2));
