class Node {
    constructor(type, left = null, right = null, value = null) {
        this.type = type; // 'operator' for AND/OR, 'operand' for conditions
        this.left = left; // Left child node
        this.right = right; // Right child node
        this.value = value; // Value for operand nodes
    }
}


function parseRuleString(ruleString) {
    // Tokenize the rule string
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

// Test the parser with the sample rule
const ruleString = "((age > 30 AND department == 'Marketing')) AND (salary > 20000 OR experience > 5)";
const ast = parseRuleString(ruleString);

// Function to convert AST to JSON
function astToJson(node) {
    if (!node) return null;
    return {
        type: node.type,
        left: astToJson(node.left),
        right: astToJson(node.right),
        value: node.value
    };
}


const astJson = astToJson(ast);
console.log(astJson);
// console.log(JSON.stringify(astJson, null, 2));


function evaluateDFS(node, userData) {
    if (!node) return true;

    if (node.type === 'operand') {
        const condition = node.value.replace(/(\w+)/g, (match) => {
            return userData.hasOwnProperty(match) ? JSON.stringify(userData[match]) : match;
        });
        return eval(condition);
    } else if (node.type === 'operator') {
        const leftValue = evaluateDFS(node.left, userData);
        const rightValue = evaluateDFS(node.right, userData);
        if (node.value === 'AND') {
            return leftValue && rightValue;
        } else if (node.value === 'OR') {
            return leftValue || rightValue;
        }
    }

    return false;
}
const userData = {
    age: 31,
    department: "Marketing",
    salary: 50,
    experience: 6
};
//  "((age > 30 AND department == 'Marketing')) AND (salary > 20000 OR experience > 5)";
console.log(evaluateDFS(astJson,userData));
function getParams(node, userData) {

    if (node.left===null&&node.right===null) {
        const arr=node.value.split(" ");
        const m={};
        if(isNaN(arr[2])){
            m[arr[0]]=arr[2];
            m.type="String";
        }else{
            m[arr[0]]=Number(arr[2]);
            m.type="Number"
        }

        userData.push(m);
        return;
    }
        getParams(node.left, userData);
        getParams(node.right, userData);

}
const d=[];
getParams(astJson,d);
console.log(d);