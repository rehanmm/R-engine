const Rule=require('../models/ruleModel')
const express=require('express');
const mongoose =require('mongoose') ;
const catchAsyncError=require('../errorHandling/catchAsyncError');
const errorHandler = require('../errorHandling/customErrorHandler');
const paginationFeature=require('../utils/paginationFeature')


const list=catchAsyncError(  async function(req ,res,){
    const {page}=req.query;
    paginationFeature({limit:6,page},Rule,res)
})
const create=catchAsyncError( async function(req ,res){
    const {ruleString,name}=req.body;
    const ast=astToJson(parseRuleString(ruleString));
    const m=[];
    getParams(ast,m)
    const v=[];
    v.push(ruleString);
    const rule=new Rule({
        name,
        ruleString:v,
        AST:JSON.stringify(ast),
        params:JSON.stringify(m)
    })
    await rule.save()
    res.status(200).json({
        success:true,
        data:rule
    })

})
const read=catchAsyncError( function(req ,res){
   
    res.status(200).json({
        success: true,
        message: '',
        data: req.rule
    })
})
const remove= catchAsyncError( async function(req ,res){
    const rule=await Rule.findByIdAndDelete(req.rule._id)
    // console.log(rule);
    res.status(200).json({
        success:true,
        message:'deleted successfully'
    })

})


const update=catchAsyncError( async function(req ,res){
    const {ruleString}=req.body;
    const {_id}=req.rule
    const rule=await Rule.findByIdAndUpdate(_id,{  
        ruleString:[ruleString],
        AST:JSON.stringify(astToJson(parseRuleString(ruleString)))
    },{new:true,runValidators:true})


    res.status(200).json({
         success:true,
        message:'updated successfully',
        data:rule
    })

})

const ruleById=catchAsyncError( async function(req ,res,next){
    const {ruleId}=req.params
    const rule=await Rule.findById(ruleId);
    if(!rule){
        return next(new errorHandler('rules not found',404))
    }
    req.rule=rule;
    next()

})

const verifyUserData=catchAsyncError( async function(req ,res){
    const userData =req.body;
    const rule=req.rule;
    if(!rule){
        return next(new errorHandler('rule not found',404))
    }
    const str="((age > 30 AND department == 'Marketing')) AND (salary > 20000 OR experience > 5)";
    // console.log(typeof(str));
    const ast = parseRuleString(req.rule.ruleString[0]);
    // console.log(ast)
   const result=evaluateDFS(astToJson(ast),userData);
    console.log(result,rule.ruleString,userData);
    res.status(200).json({
        success:true,
       message:'updated successfully',
       isValid:result,
       ruleString:rule.ruleString,
       userData,
   })

})
const combineRules=catchAsyncError(async function(req,res){
    //ruleid:[]
    const {ruleString,name}=req.body;
    const substrings = ruleString.split('#');
    const result = substrings.map(substring => `(${substring.trim()})`).join(' AND ');

    const ast=astToJson(parseRuleString(result));
    const m=[];
    getParams(ast,m)
    const v=[];
    v.push(result);
    const rule=new Rule({
        name,
        ruleString:v,
        isCombined:true,
        AST:JSON.stringify(ast),
        params:JSON.stringify(m)
    })
    await rule.save()
    res.status(200).json({
        success:true,
        data:rule
    })
    
})

module.exports={list,read,update,create,remove,ruleById,verifyUserData,combineRules}



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
function combineASTs(ast1, ast2) {

    return new Node('operator', ast1, ast2, 'AND');
}