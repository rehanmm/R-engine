class Node {
    constructor(type, value = null, left = null, right = null) {
      this.type = type; // "operator" or "operand"
      this.value = value; // E.g., "AND", "OR", "age > 30"
      this.left = left; // Left child Node
      this.right = right; // Right child Node
    }
  
    toJSON() {
      return {
        type: this.type,
        value: this.value,
        left: this.left ? this.left.toJSON() : null,
        right: this.right ? this.right.toJSON() : null
      };
    }
  
    static fromJSON(json) {
      if (!json) return null;
      const node = new Node(json.type, json.value);
      node.left = Node.fromJSON(json.left);
      node.right = Node.fromJSON(json.right);
      return node;
    }
  }
  

  function tokenize(ruleString) {
    const regex = /\s*(=>|<=|==|!=|>|<|>=|AND|OR|\(|\)|\w+|'[^']*'|\"[^\"]*\")\s*/g;
    return ruleString.match(regex).map(token => token.trim()).filter(token => token.length > 0);
  }
  

  function parse(tokens) {
    let currentTokenIndex = 0;
  
    function parseExpression() {
      let node = parseTerm();
      while (currentTokenIndex < tokens.length && tokens[currentTokenIndex] === 'OR') {
        const operator = tokens[currentTokenIndex++];
        const rightNode = parseTerm();
        node = new Node('operator', operator, node, rightNode);
      }
      return node;
    }
  
    function parseTerm() {
      let node = parseFactor();
      while (currentTokenIndex < tokens.length && tokens[currentTokenIndex] === 'AND') {
        const operator = tokens[currentTokenIndex++];
        const rightNode = parseFactor();
        node = new Node('operator', operator, node, rightNode);
      }
      return node;
    }
  
    function parseFactor() {
      const token = tokens[currentTokenIndex++];
  
      if (token === '(') {
        const node = parseExpression();
        console.log(tokens,currentTokenIndex);
        if (tokens[currentTokenIndex] === ')') {
          currentTokenIndex++; // Skip ')'
        } else {
          throw new Error("Missing closing parenthesis");
        }
        return node;
      }
  
      if (isAttribute(token)) {
        const attribute = token;
        const operator = tokens[currentTokenIndex++];
        const value = tokens[currentTokenIndex++];
        return new Node('operand', `${attribute} ${operator} ${value}`);
      }
  
      throw new Error(`Unexpected token: ${token}`);
    }
  
    function isAttribute(token) {
      // Assuming attributes are alphanumeric words (like age, department, etc.)
      return /^[a-zA-Z_]\w*$/.test(token);
    }
  
    return parseExpression();
  }
  
  function create_rule(ruleString) {
    const tokens = tokenize(ruleString);
    return parse(tokens);
  }
  

  function evaluateOperand(operand, data) {
    const regex = /(\w+)\s*(==|!=|<=|>=|<|>)\s*(.+)/;
    const match = operand.match(regex);
    if (match) {
      const [_, attribute, operator, value] = match;
      const dataValue = data[attribute];
      const parsedValue = isNaN(value) ? value.replace(/['"]/g, '') : parseFloat(value);
  
      switch (operator) {
        case '==': return dataValue == parsedValue;
        case '!=': return dataValue != parsedValue;
        case '>': return dataValue > parsedValue;
        case '<': return dataValue < parsedValue;
        case '>=': return dataValue >= parsedValue;
        case '<=': return dataValue <= parsedValue;
        default: return false;
      }
    }
    return false;
  }
  
  function evaluateOperator(operator, leftResult, rightResult) {
    switch (operator) {
      case 'AND': return leftResult && rightResult;
      case 'OR': return leftResult || rightResult;
      default: return false;
    }
  }
  
  function evaluateNode(node, data) {
    if (node.type === 'operand') {
      return evaluateOperand(node.value, data);
    } else if (node.type === 'operator') {
      const leftResult = evaluateNode(node.left, data);
      const rightResult = evaluateNode(node.right, data);
      return evaluateOperator(node.value, leftResult, rightResult);
    }
    return false;
  }
  

  const ruleString = "(age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')";
const ast = create_rule(ruleString);
console.log(ast);
// const data1 = { age: 35, department: 'Sales', salary: 60000, experience: 3 };
// const data2 = { age: 24, department: 'Marketing', salary: 40000, experience: 6 };
// const data3 = { age: 28, department: 'Sales', salary: 30000, experience: 4 };

// console.log(evaluateNode(ast, data1)); // true
// console.log(evaluateNode(ast, data2)); // true
// console.log(evaluateNode(ast, data3)); // false


















// function dfs(node,data){
//     if(node.left==null||node.right==null) {
//         const arr=node.value.split(" ");
//         // console.log(arr);
//         let num=Number(arr[2]);
//         const op=arr[1];
//         // console.log(data);
//         let vari=Number(data[arr[0]]);
//         if(isNaN(vari)){
//             vari=data[arr[0]];
//         }
//         if(isNaN(num)){
//             num=arr[2];
//         }
//         const dataValue=vari;
//         const parsedValue=num;
//         // console.log(num,vari);
//         switch (op) {
//             case '==': return dataValue == parsedValue;
//             case '!=': return dataValue != parsedValue;
//             case '>': return dataValue > parsedValue;
//             case '<': return dataValue < parsedValue;
//             case '>=': return dataValue >= parsedValue;
//             case '<=': return dataValue <= parsedValue;
//             case '<=': return dataValue <= parsedValue;
//             case 'AND': return dataValue && parsedValue;
//             case 'OR': return dataValue || parsedValue;
//             default: return false;
//           }

//     }
//     const dataValue=dfs(node.left,data);
//     const parsedValue=dfs(node.right,data);
//     switch (node.value) {
//         case '==': return dataValue == parsedValue;
//         case '!=': return dataValue != parsedValue;
//         case '>': return dataValue > parsedValue;
//         case '<': return dataValue < parsedValue;
//         case '>=': return dataValue >= parsedValue;
//         case '<=': return dataValue <= parsedValue;
//         case '<=': return dataValue <= parsedValue;
//         case 'AND': return dataValue && parsedValue;
//         case 'OR': return dataValue || parsedValue;
//         default: return false;
//       }
// }

// const out=dfs(astJson,{
//     age:40,
//     department:"Marketing",
//     salary:30000,
//     experience:10
// });

// console.log(out,"OUTPUT");