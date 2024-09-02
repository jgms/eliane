/* 
    first we'll make an inventory of all the valid tokens
*/
function lexer(code){

    let tokens = []; 
    
    let index = 0; //where we are inside the code
    
    while(index < code.length){
        
        let character = code[index];

        //comments
        if(character == "#"){
            //we ignore everything until we find a return or new line
            while(character && !/[\n\r]/.test(character)){
                character = code[++index];
            }
            continue;
        }

    
        //delimiters
        if(/[{};[\],]/.test(character)){
            tokens.push({ token : character, type : "delimiter" });
            index++;
            continue;
        }

        //arithmetic operators and possible negative numbers
        if(/[+\-*/]/.test(character)){
            if(character == "-"){//first we'll try to see if it is a negative number
                if(/[0-9]/.test(code[index + 1])){
                    let number = "-";

                    character = code[++index];//we skip the negative sign

                    while(character && /[0-9.]/.test(character)){
                        number += character;
                        character = code[++index];
                    }

                    tokens.push({ token : number, type : "number" });
                    continue;
                }
            }
            tokens.push({ token : character, type : "operator" });
            index++;
            continue;
        }

        //other operators
        if(/[=<>!]/.test(character)){
            tokens.push({ token : character + (code[index + 1] == "=" ? code[++index] : ""), type : "operator" });
            index++;
            continue;
        }

        //positive numbers
        if(/[0-9]/.test(character)){
            let number = "";

            while(character && /[0-9.]/.test(character)){
                number += character;
                character = code[++index];
            }

            tokens.push({ token : number, type : "number" });
            continue;
        }

        //something (vars, functions, keywords, arguments etc)
        if(/[a-z]/.test(character)){
            let name = "";

            while(character && /[a-z_:.[\]0-9]/.test(character)){
                name += character;
                character = code[++index];
            }

            if(/^(if|else|repeat|wait|pulse)$/.test(name)){ //the five reserved keywords
                tokens.push({ token : name, type : "keyword" });
                continue;
            }

            if(/^(true|false)$/.test(name)){ //the boolean values
                tokens.push({ token : name, type : "boolean" });
                continue;
            }

            if(/^[a-z]+(\[(\d+|[a-z]+)])?$/.test(name)){ //variables with possible array indexes: this OR this[n]
                tokens.push({ token : name, type : "variable" });
                continue;
            }

            if(/^[a-z]+:([a-z]+(\[(\d+|[a-z]+)])?|\d+(\.\d+)?)?$/.test(name)){ //arguments
                let nameSplit = name.split(":");

                tokens.push({ token : nameSplit[0] + ":", type : "argument" });

                if(/^[a-z]+(\[\d+])?|\d+(\.\d+)?$/.test(nameSplit[1])){
                    tokens.push({ token : nameSplit[1], type : /^[a-z]+(\[\d+])?$/.test(nameSplit[1]) ? "variable" : "number" });
                }

                continue;
            }

            if(/^[a-z]+(_[a-z]+)+$/.test(name)){ //functions
                tokens.push({ token : name, type : "function" });
                continue;
            }

            //stuff that is not implemented yet, like recursive array indexes a[b[c[3]]]
            throw new Error(`unexpected symbol '${name}'`);
        }

        //whitespace of any kind
        if(/[\s\t\n\r]/.test(character)){
            index++;
            continue;
        }

        //anything else!
        throw new Error(`unexpected token '${character}'.`);

    }

    return tokens;
}

/*
    then, we'll feed our tokens in the next function in order to generate our abstract syntax tree
*/

function giveMeMyAST(tokens){

    let ast = [];

    let blocks = [];//variable to track any open block {} and store its contents as a nested AST, if it has something inside, then we are in the block stored in its last index

    let index = 0;

    while(index < tokens.length){

        let {token,type} = tokens[index];
 
        //first we are going to check that the keywords true/false are not being used as variable names
        if(type == "boolean" && tokens[index + 1].token == "="){
            throw new Error("cannot use 'true' or 'false' as variable names.");
        }

        //then, misplaced arguments
        if(type == "argument"){
            throw new Error(`unexpected token '${token}'.`); 
        }

    
        //then we'll check for VARIABLES
        if(type == "variable"){
            let variable = {type};//hoping for the best

            //first, we'll check if it's followed by brackets and a number/variable, in that case it's referencing an element inside an array
            if(/^[a-z]+\[(\d+|[a-z]+)]$/.test(token)){
                let tokenSplit = token.split("[");
                token = tokenSplit[0];
                variable.index = tokenSplit[1].slice(0,-1);
            }

            //after we've made sure it's not referencing an element inside an array, we proceed to store the name and check if the next token is an equal sign

            variable.name = token;


            if(!tokens[index + 1]){//is there something to look at?
                throw new Error("unexpected end of input.");
            }

            if(tokens[index + 1].token == "="){
                //ok, we have an equal sign, so we have to check if there's something valid after it
                index++; //first, we ignore the equal sign
                let stepsBeforeSemicolon = 0;
                let lookAheadIndex = 1;
                //while there's a token to look up and said token is not a semicolon
                while(tokens[index + lookAheadIndex] && tokens[index + lookAheadIndex].token != ";"){
                    stepsBeforeSemicolon++;
                    lookAheadIndex++;
                }
                //if we have no token we throw an error
                if(!tokens[index + lookAheadIndex]){
                    throw new Error("unexpected end of input");
                }

                let valueAsString = ""; //we'll concatenate all the tokens for easier validation

                for(let i = 1; i <= stepsBeforeSemicolon; i++){
                    valueAsString+=tokens[index + i].token;
                }

                //now we're going to validate all the possible options

                let validValue = false; //guilty until proven otherwise


                //variables and possible NOT operator before them (we'll "file" them as expressions)
                if(/^!?[a-z]+(\[(\d+|[a-z]+)])?$/.test(valueAsString)){
                    variable.dataType = "expression";//we classify it as an expression

                    //if there's a ! and the variable is an array, we throw an error right away
                    if(valueAsString.indexOf("!") >= 0 && valueAsString.indexOf("[") >= 0){
                        throw new Error(`invalid reference/assignment to variable '${token}', can't use the ! operator with a number.`);
                    }

                    variable.value = valueAsString[0] == "!" ? ["!",valueAsString.slice(1)] : [valueAsString];//value will be an array of tokens
                    validValue = true;//we mark it as valid
                }
                
                //numbers
                if(/^-?\d+(\.\d+)?$/.test(valueAsString)){
                    variable.dataType = "number";
                    variable.value = Number(valueAsString);//we cast it right away
                    validValue = true;//we mark it as valid
                }

                //booleans and possible NOT operator before them (in case there is, we'll "file" them as expressions)
                if(/^!?(true|false)$/.test(valueAsString)){
                    if(valueAsString[0] == "!"){
                        variable.dataType = "expression";
                        variable.value = ["!",valueAsString.slice(1) == "true"];//we cast it right away
                    }else{
                        variable.dataType = "boolean";
                        variable.value = valueAsString == "true";//we cast it right away
                    }
                    validValue = true;//we mark it as valid
                }

                //arrays
                if(/^\[(-?\d+(\.\d+)?(,-?\d+(\.\d+)?)*)?\]$/.test(valueAsString)){
                    variable.dataType = "array";
                    //if valueAsString length is 2, the array is empty, else...
                    //...as in our little language arrays can only store numbers, we'll cast and store them right away
                    variable.value = valueAsString.length == 2 ? [] : valueAsString.slice(1,valueAsString.length - 1).split(",").map(n => Number(n));
                    validValue = true;//we mark it as valid
                }

                //simple comparison expressions, no && or || or parentheses for the time being
                if(/^([a-z]+(\[\d+])?|-?\d+(\.\d+)?)(==|<|>|<=|>=|!=)([a-z]+(\[\d+])?|-?\d+(\.\d+)?)$/.test(valueAsString)){
                    variable.dataType = "expression";
                    variable.value = valueAsString.split(/==|<=|>=|<|>|!=/);//we separate the things being compared
                    variable.value.splice(1,0,valueAsString.split("").filter( ch => /=|>|<|!/.test(ch)).join(""));//and insert the operator between them
                    //then, we're going to cast what's castable
                    variable.value = variable.value.map((token,i) => {
                        if(i != 1){//we ignore the operator
                            if(/^-?\d+(\.\d+)?$/.test(token)){//number
                                return Number(token);
                            }
                            return token; //regular variable
                        }
                        return token;//operator
                    }); 
                    validValue = true;//we mark it as valid                
                }
                
                //simple arithmetic expressions --> a +|-|*|/ b, parentheses are not allowed for the time being
                if(/^([a-z]+(\[(\d+|[a-z]+)])?|-?\d+(\.\d+)?)(\+|\-|\*|\/)([a-z]+(\[(\d+|[a-z]+)])?|-?\d+(\.\d+)?)$/.test(valueAsString)){
                    
                    let characters = valueAsString.split("");//we split it in order to search for negative numbers
                    
                    //then we compile the first term
                    let firstTerm = characters.shift();
                    while(!/\+|\-|\*|\//.test(characters[0])){//while character is not an operator
                        firstTerm += characters.shift();
                    }
                    //once we find the operator
                    let operator = characters.shift();
                    //the rest is our second term
                    let secondTerm = characters.join("");

                    //so now we can proceed
                    variable.dataType = "expression";
                    variable.value = [firstTerm,operator,secondTerm];
                    //then, we're going to cast what's castable
                    variable.value = variable.value.map((token,i) => {
                        if(i != 1){//we ignore the operator
                            if(/^-?\d+(\.\d+)?$/.test(token)){//number
                                return Number(token);
                            }
                            return token; //regular variable
                        }
                        return token;//operator
                    }); 
                    validValue = true;//we mark it as valid   
                }

                //if everything went right...
                if(validValue){
                    (blocks.length > 0 ? blocks[blocks.length - 1].what : ast).push(variable);//we push it in the main AST or in the current block
                    index+=(stepsBeforeSemicolon + 2);//we ignore the tokens that make up the value, the semicolon and move on
                    continue; 
                } 
            }
            //if we arrive here, there's been a problem
            throw new Error(`invalid reference/assignment to variable '${token}'.`);
        }


        //WAIT and PULSE keywords
        if(type == "keyword" && (token == "wait" || token == "pulse")){
            
            if(
                tokens[index + 1] && tokens[index + 2] && //has at least two tokens after
                (tokens[index + 1].type == "number" || tokens[index + 1].type == "variable") && //next token is number or a variable
                tokens[index + 2].token == ";" //the statement ends with a semicolon
            ){
                (blocks.length > 0 ? blocks[blocks.length - 1].what : ast).push({//we push it in the main AST or in the current block
                    type : token,
                    time : tokens[index + 1].token
                });
                index+=3;//we ignore the wait time and the semicolon and move on
                continue;
            }
            //in case we can't go on, we throw an error
            throw new Error(`invalid argument for '${token}', it must be a number or a variable and the statement must end with a semicolon.`);  
        }

        //REPEAT keyword
        if(type == "keyword" && token == "repeat"){
            if(
                tokens[index + 1] && tokens[index + 2] && //has at least two tokens after
                (tokens[index + 1].type == "number" || tokens[index + 1].type == "variable") && //next token is number or a variable
                tokens[index + 2].token == "{" //next token opens a block
            ){
                blocks.push({//we push it into the "blocks" array and all the way down we'll check if it closes
                    type : "repeat",
                    times : tokens[index + 1].token,
                    what : [] //here we'll store its own AST
                });
                index+=3;//we ignore the repeats and the opening curly brace and move on
                continue;
            }
            //in case we can't go on, we throw an error
            throw new Error("invalid argument for 'repeat', it must be a number or a variable and must be followed by '{'.");
        }

        //IF keyword
        if(type == "keyword" && token == "if"){
            let stepsBeforeOpeningBrace = 0;
            let lookAheadIndex = 1;
            //while there's a token to look up and said token is not an opening brace
            while(tokens[index + lookAheadIndex] && tokens[index + lookAheadIndex].token != "{"){
                stepsBeforeOpeningBrace++;
                lookAheadIndex++;
            }
            //if we have no token we throw an error
            if(!tokens[index + lookAheadIndex]){
                throw new Error("unexpected end of input");
            }
            //if we have one, two or three tokens before the opening brace, then we have a possibly valid condition
            //so we are going to look for a possible error and if we can't find one, then we proceed to add it to the blocks array

            let validCondition = true;//hoping for the best
            let validOperators = ["==",">",">=","<","<=","!="]; //possible operators in case we have three tokens
            if(stepsBeforeOpeningBrace == 1){
                //if we have only one, it must be a variable or a boolean
                if(tokens[index + 1].type != "boolean" && tokens[index + 1].type != "variable"){
                   validCondition = false; //if that's not the case, we mark the condition as invalid
                }
            }
            if(stepsBeforeOpeningBrace == 2){
                //the only valid option here is the operator '!' followed by a variable or a boolean
                if(
                    tokens[index + 1].token != "!" ||
                    (tokens[index + 2].type != "boolean" && tokens[index + 2].type != "variable")
                ){
                    validCondition = false; //if that's not the case, we mark the condition as invalid
                }
            }
            if(stepsBeforeOpeningBrace == 3){
                //here we need two variables/numbers and a valid operator between them
                if(
                    validOperators.indexOf(tokens[index + 2].token) < 0 || //first we check the operator
                    (tokens[index + 1].type != "number" && tokens[index + 1].type != "variable") || //then what's before
                    (tokens[index + 3].type != "number" && tokens[index + 3].type != "variable") //and after
                ){
                    validCondition = false; //if that's not the case, we mark the condition as invalid
                }
            }
            //if the condition is valid
            if(validCondition){
                let condition = [];//we'll add the condition tokens to an array

                //with a simple for loop
                for(let offset = 1; offset <= stepsBeforeOpeningBrace; offset++){
                    condition.push(tokens[index + offset].token);
                }

                blocks.push({//we push it into the "blocks" array and all the way down we'll check if it closes
                    type : "if",
                    condition,
                    what : [] //here we'll store its own AST
                });
                index+=(stepsBeforeOpeningBrace + 2);//we ignore the arguments and opening curly brace and move on
                continue;
            }
            //in case it's not
            throw new Error("invalid condition for 'if', it must be a boolean, a variable, or a boolean expression comparing two numbers/numeric variables.");
        }

        //ELSE keyword
        if(type == "keyword" && token == "else"){
            //the only thing we have to check here is that we have an opening brace after our keyword, if that's the case, we're good to go
            if(tokens[index + 1] && tokens[index + 1].token == "{"){
                blocks.push({//we push it into the "blocks" array and all the way down we'll check if it closes
                    type : "else",
                    what : [] //here we'll store its own AST
                });
                index+=2;//we ignore the opening curly brace and move on
                continue;
            }
            //if it's not, we throw an error
            throw new Error("'else' keyword must be followed by '{'.");
        }

        //BLOCK END --> }
        if(type == "delimiter" && token == "}"){
            if(blocks.length > 0){//there's actually something to close
                //we remove it from the blocks array
                let closingBlock = blocks.pop();
                //and then we push it in the main AST or in the current block
                (blocks.length > 0 ? blocks[blocks.length - 1].what : ast).push(closingBlock);
                index++;//we ignore the curly brace and move on
                continue;
            }
            //in case there's nothing to close, we throw an error
            throw new Error(`unexpected token '${token}'.`);
        }

        //FUNCTION calls
        if(type == "function"){//if it's a function
            let stepsBeforeSemicolon = 0;
            let lookAheadIndex = 1;
            //while there's a token to look up and said token is not a semicolon
            while(tokens[index + lookAheadIndex] && tokens[index + lookAheadIndex].token != ";"){
                stepsBeforeSemicolon++;
                lookAheadIndex++;
            }
            //if we have no token we throw an error
            if(!tokens[index + lookAheadIndex]){
                throw new Error("unexpected end of input");
            }

            if(stepsBeforeSemicolon == 1){//we can't have just one "something" between the call and the semicolon
                throw new Error(`invalid arguments for function ${token}`);//hence
            }
            
            if(stepsBeforeSemicolon == 0){//there are no arguments
                (blocks.length > 0 ? blocks[blocks.length - 1].what : ast).push({//we push it in the main AST or in the current block
                    type : "function call",
                    name : token,
                    arguments : {}
                });
                index+=2;//we ignore the semicolon and move on
                continue;
            }
            
            if((stepsBeforeSemicolon / 2) % 1.5 == 1){//there's one or more possible arguments
                let args = {};//we hope for the best!

                if(stepsBeforeSemicolon == 2){//one possible argument
                    if(
                        tokens[index + 1].type == "argument" && //the next token is an argument
                        (tokens[index + 2].type == "number" || tokens[index + 2].type == "variable") //next token is number or a variable
                    ){
                        //we add it to the args object, the argument name loses the colon
                        args[tokens[index + 1].token.slice(0,tokens[index + 1].token.length - 1)] = tokens[index + 2].token; 
                        (blocks.length > 0 ? blocks[blocks.length - 1].what : ast).push({//we push it in the main AST or in the current block
                            type : "function call",
                            name : token,
                            arguments : args
                        });
                        index+=4;//we ignore the semicolon and move on
                        continue;
                    }
                    throw new Error(`invalid arguments for function ${token}`);
                }
                
                //more than one possible arguments
                for(let i = 3; i <= stepsBeforeSemicolon + 1; i+=3){//we'll check every three to see if it is a comma and if the tokens are valid, we check from 3 to stepsBeforeSemicolor + 1 to move in groups of three --> argument (i - 2) value (i - 1) delimiter (i), "i" will be the offset for our global index
                    if(
                        (tokens[index + i].token == "," || tokens[index + i].token == ";") && //token is comma or semicolon
                        tokens[index + (i - 2)].type == "argument" && //the argument token
                        (tokens[index + (i - 1)].type == "number" || tokens[index + (i - 1)].type == "variable")//the value token is number or variable
                    ){
                        //we add it to the args object, the argument name loses the colon
                        args[tokens[index + (i - 2)].token.slice(0,tokens[index + (i - 2)].token.length - 1)] = tokens[index + (i - 1)].token;
                    }else{
                        //if validation fails we throw an error
                        throw new Error(`invalid arguments for function ${token}`);
                    }
                }
                //if we arrive here, we have our arguments stored, so we can proceed to push our function into the AST
                (blocks.length > 0 ? blocks[blocks.length - 1].what : ast).push({//we push it in the main AST or in the current block
                    type : "function call",
                    name : token,
                    arguments : args
                });
                index+=(stepsBeforeSemicolon + 2);//we ignore the arguments and the semicolon and move on
                continue;
            }else{
                //if validation fails (on (stepsBeforeSemicolon / 2) % 1.5 == 1) we throw an error
                throw new Error(`invalid arguments for function ${token}`); 
            }
        }
        
        //if we arrive here, it can only be an out of place delimiter/operator
        if(type == "delimiter" || type == "operator"){
            throw new Error(`unexpected token '${token}'.`); 
        }
    }
    //once outside of the loop the only thing to do is check for any open block left unclosed
    if(blocks.length > 0){
        throw new Error(`block '${blocks[blocks.length - 1].type}' has no closing '}'`); //and throw an error
    }

    return ast;

}

/*
    the transformer function will take our main AST as argument and push all the events into the sequence array (found in globals.js), everytime that it finds a repeat/if/else block it will call itself using the "what" property of those blocks (each one an AST in its own right) as argument; also, we'll have a helper function (for variables, pulse, wait, repeat, if and function calls) called getValue that will help us read the values or possible values (in case of references to variables), throwing errors when it is due, this will make the code A LOT cleaner
*/

/*
    The helper function will receive the value/variable, and two optional arguments: the type we are expecting and an error message in case we receive something wrong, these two arguments will always work together, if there's whatToExpect we MUST have errorMsg

    The value/variable could be a number, a boolean or a string representing something (variables, indexes from arrays, numbers, booleans).

    The function will also have a generic error to inform when a variable or index is not defined
*/
function getValue(toCheck,whatWeExpect,errorMsg){
    //first we'll check if it is one of the number/boolean values that we cast in the giveMeMyAST function
    if(typeof toCheck == "number" || typeof toCheck == "boolean"){
        //in case we are expecting something in particular, we check it
        if(whatWeExpect && typeof toCheck != whatWeExpect){
            throw new Error(errorMsg);//we throw the error message
        }
        return toCheck;//if everything went right, we return it as is
    }

    //the only possible options from here are number/boolean values to cast or references to possible variables/indexes
    
    //numbers
    if(/^-?\d+(\.\d+)?$/.test(toCheck)){
        //in case we are expecting a number, we check it
        if(whatWeExpect && whatWeExpect != "number"){
            throw new Error(errorMsg);//we throw the error message
        }
        return Number(toCheck);//we cast and return it
    }

    //booleans
    if(/^(true|false)$/.test(toCheck)){
        //in case we are expecting a boolean, we check it
        if(whatWeExpect && whatWeExpect != "boolean"){
            throw new Error(errorMsg);//we throw the error message
        }
        return toCheck == "true";//we cast and return it
    }

    //variables
    if(/^[a-z]+$/.test(toCheck)){
        //first we check if it is defined
        if(variables[toCheck] == undefined){
            throw new Error(`'${toCheck}' is not defined.`);
        }
        //in case we are expecting something in particular, we check it
        if(whatWeExpect && typeof variables[toCheck] != whatWeExpect){
            throw new Error(errorMsg);//we throw the error message
        }
        return variables[toCheck];//if everything went right, we return it
    }

    //array indexes
    if(/^[a-z]+\[(\d+|[a-z]+)]$/.test(toCheck)){
        //first we check if it is defined
        let toCheckSplit = toCheck.split("[");
        toCheck = toCheckSplit[0];
        
        let index = getValue(toCheckSplit[1].slice(0,-1),"number",`invalid index for '${toCheck}'.`);

        if(index < 0){
            throw new Error(`invalid index for '${toCheck}', arrays can't have negative indexes.`);
        }


        if(variables[toCheck] == undefined || variables[toCheck][index] == undefined){
            throw new Error(`'${toCheck}[${index}]' is not defined.`);
        }
        //in case we are expecting something in particular, we check it
        if(whatWeExpect && typeof variables[toCheck][index] != whatWeExpect){
            throw new Error(errorMsg);//we throw the error message
        }
        return variables[toCheck][index];//if everything went right, we return it
    }

    //it's impossible to arrive here, but for future improvements and testing...
    throw new Error(`syntax error '${toCheck}'`);

}

/* finally, the transformer function */

function transformer(ast,main = true){//main will indicate if we are transforming the main AST and not one inside an if/else/repeat block
    //at this point everything is already validated, so the only possible errors are references to variables that do not exist, boolean operations (!) on numbers and arithmetic/comparisons between booleans
    
    //if we are in the main AST, we reset the sequence, wait, bpm and variables
    if(main){
        bpm = 1000;
        wait = 0;
        variables = {};
        sequence.length = 0;
    }

    let astIndex = 0; //where we are in the AST

    while(astIndex < ast.length){

        let {type} = ast[astIndex]; //we extract the type for convenience

        //we'll start with the variables
        if(type == "variable"){

            let {name,dataType,value,index} = ast[astIndex]; //we extract the other properties, the index property will only exist if we are trying to insert a value in an array

        
            //if it is an index, we'll check if said array exists and if the dataType is number or variable 
            if(index != undefined){
                if(variables[name] != undefined){
                    if(dataType == "number" || (dataType == "expression" && value.length == 1)){
                        //this "index" mechanism is just a cheap substitute for a proper PUSH method, so, we'll fill with zeros all the possible undefined indexes, SHAME ON ME!!!
                        index = getValue(index, "number", `invalid index for '${name}'.`);

                        if(index < 0){
                            throw new Error(`invalid index for '${name}', arrays can't have negative indexes.`);
                        }

                        for(let i = 0; i < index; i++){
                            if(variables[name][i] == undefined){
                                variables[name][i] = 0;
                            }
                        }
                        variables[name][index] = getValue(dataType == "number" ? value : value[0], "number",`invalid asignment for variable '${name}', arrays can only store numbers.`);
                        astIndex++;
                        continue;//and move on...
                    }
                }
                //if the array doesn't exists, we'll throw an error
                throw new Error(`'${name}' is not defined.`);
            }

            //if it is a number, boolean or array we store or change its value (if it was already declared) right away
            if(dataType == "number" || dataType == "boolean" || dataType == "array"){
                variables[name] = value;
                astIndex++;
                continue;//and move on...
            }

            /*
                if it is an expression, we have several possibilities:
                1)reference to a variable 
                2)reference to an index of an array 
                3)NOT operator (!) followed by a boolean or a variable
                4)a comparison or arithmetic expression between variables and/or numbers
            */
            if(dataType == "expression"){
                if(value.length == 1){//reference to a variable or an index of an array
                    variables[name] = getValue(value[0]);//we'll try to store it
                    astIndex++;
                    continue;//and move on...
                }

                if(value.length == 2){//NOT operator (!) followed by a boolean or a variable
                    variables[name] = !getValue(value[1],"boolean","cannot use the NOT operator on a number.");//we'll try to store it
                    astIndex++;
                    continue;//and move on...
                }

                //if we arrive here, it can only be an arithmetic or comparison expression of length 3
                //so the index 1 represents the operator
                switch(value[1]){
                    case "+":
                        variables[name] = getValue(value[0],"number","'+' operator not allowed between booleans.") + getValue(value[2],"number","'+' operator not allowed between booleans.");
                    break;
                    case "-":
                        variables[name] = getValue(value[0],"number","'-' operator not allowed between booleans.") - getValue(value[2],"number","'-' operator not allowed between booleans.");
                    break;
                    case "*":
                        variables[name] = getValue(value[0],"number","'*' operator not allowed between booleans.") * getValue(value[2],"number","'*' operator not allowed between booleans.");
                    break;
                    case "/":
                        variables[name] = getValue(value[0],"number","'/' operator not allowed between booleans.") / getValue(value[2],"number","'/' operator not allowed between booleans.");
                    break;
                    case "==":
                        variables[name] = getValue(value[0],"number","'==' operator not allowed between booleans.") == getValue(value[2],"number","'==' operator not allowed between booleans.");
                    break;
                    case "!=":
                        variables[name] = getValue(value[0],"number","'!=' operator not allowed between booleans.") != getValue(value[2],"number","'!=' operator not allowed between booleans.");
                    break;
                    case ">":
                        variables[name] = getValue(value[0],"number","'>' operator not allowed between booleans.") > getValue(value[2],"number","'>' operator not allowed between booleans.");
                    break;
                    case ">=":
                        variables[name] = getValue(value[0],"number","'>=' operator not allowed between booleans.") >= getValue(value[2],"number","'>=' operator not allowed between booleans.");
                    break;
                    case "<":
                        variables[name] = getValue(value[0],"number","'<' operator not allowed between booleans.") < getValue(value[2],"number","'<' operator not allowed between booleans.");
                    break;
                    case "<=":
                        variables[name] = getValue(value[0],"number","'<=' operator not allowed between booleans.") <= getValue(value[2],"number","'<=' operator not allowed between booleans.");
                    break;       
                }
                astIndex++;
                continue;//and move on...
            }

        }

        //PULSE keyword
        if(type == "pulse"){
            //this will set the bpm
            let {time} = ast[astIndex]; //we extract the time

            let value = getValue(time,"number", "'pulse' only accepts numeric values.");//try to asign it

            if(value <= 0){
                throw new Error(`'pulse' cannot have zero or negative values.`);
            }

            bpm = 60000 / value;
            astIndex++;
            continue;//and move on...
        }

        //WAIT keyword
        if(type == "wait"){
            //this will add to the wait time, the time value is always a multiple of our bpm
            let {time} = ast[astIndex]; //we extract the time

            let value = getValue(time,"number", "'wait' only accepts numeric values.");//try to asign it

            if(value <= 0){
                throw new Error(`'wait' cannot have zero or negative values.`);
            }

            wait += bpm * value;
            astIndex++;
            continue;//and move on...
        }
        
        //functions
        if(type == "function call"){
            //in this case we are going to push an event object to the sequence
            //event object --> { functionName : "nameAsString", wait : 1000, args : { a : 1, b : 2 } }

            let {name} = ast[astIndex];//we extract the name
            let args = {...ast[astIndex].arguments}; //and create a copy of the arguments, this is because we need to start from scratch if we are inside a REPEAT block, if we simply extract them, we will be referencing the same object so we would lose any variable reference in the next "for in" loop, basically the dynamic arguments will get "frozen" on the first repeat

            
            for(let key in args){//then we assign the real numeric values from strings and variable references to our arguments's copy   
                args[key] = getValue(args[key],"number",`argument '${key}' from function '${name}' only accepts numeric values.`);
            }


            let event = {
                //we change the name to camel case --> some_thing --> someThing
                functionName : name.split("_").map((word,i) => i > 0 ? word.slice(0,1).toUpperCase() + word.slice(1) : word).join(""),
                wait, //the wait is our global variable of the same name
                args
            };

            sequence.push(event);//we push the event
            wait = 0;//reset the wait time
            astIndex++;
            continue;//and move on...
        }

        if(type == "repeat"){
            //if it is the repeat statement we'll call our transformer function on its 'what' property
            let {times,what} = ast[astIndex]; //we extract the times and what properties

            //then we'll take the times value and will get its actual value (it could be referencing a variable)
            times = getValue(times,"number","invalid argument for 'repeat', it has to be a number or a numeric value.");

            for(let i = 0; i < times; i++){
                transformer(what,false);//here we go!!
            }

            //once we're done
            astIndex++;
            continue;//and move on...
        }

        if(type == "if"){
            //if it's a conditional block we'll call our transformer function on its 'what' property
            let {condition,what} = ast[astIndex]; //we extract the condition and what properties

            //then we'll check if it has an else block
            let hasElse = ast[astIndex + 1] && ast[astIndex + 1].type == "else";

            //then we'll proceed to check the possible conditions
            let proceed = false; //if the condition is true, this variable will hold the value

            if(condition.length == 1){//a boolean or a boolean variable
                proceed = getValue(condition[0],"boolean",`invalid condition for 'if', it must be a boolean, a variable, or a boolean expression comparing two numbers/numeric variables, got only a number/reference to a number '${condition[0]}'` );
            }

            if(condition.length == 2){//NOT operator followed by a boolean or a boolean variable
                proceed = !getValue(condition[1],"boolean","invalid condition for 'if', cannot use the NOT operator on a number." );
            }

            if(condition.length == 3){ //two numbers/numeric variables being compared
                //the index 1 represents the operator
                switch(condition[1]){
                    case "==":
                        proceed = getValue(condition[0],"number","'==' operator not allowed between booleans.") == getValue(condition[2],"number","'==' operator not allowed between booleans.");
                    break;
                    case "!=":
                        proceed = getValue(condition[0],"number","'!=' operator not allowed between booleans.") != getValue(condition[2],"number","'!=' operator not allowed between booleans.");
                    break;
                    case ">":
                        proceed = getValue(condition[0],"number","'>' operator not allowed between booleans.") > getValue(condition[2],"number","'>' operator not allowed between booleans.");
                    break;
                    case ">=":
                        proceed = getValue(condition[0],"number","'>=' operator not allowed between booleans.") >= getValue(condition[2],"number","'>=' operator not allowed between booleans.");
                    break;
                    case "<":
                        proceed = getValue(condition[0],"number","'<' operator not allowed between booleans.") < getValue(condition[2],"number","'<' operator not allowed between booleans.");
                    break;
                    case "<=":
                        proceed = getValue(condition[0],"number","'<=' operator not allowed between booleans.") <= getValue(condition[2],"number","'<=' operator not allowed between booleans.");
                    break;       
                }
            }

            if(proceed){//condition is TRUE
                //so...
                transformer(what,false);
                //once we're done
                astIndex += (hasElse ? 2 : 1);//if there's an else block, we skip it too
                continue;//and move on...
            }

            //condition is FALSE
            //so, we check if there's an else block
            if(hasElse){
                transformer(ast[astIndex + 1].what,false);
                //once we're done
                astIndex+=2;
                continue;//and move on...
            }

            //if it is FALSE and has no else, we move on
            astIndex++;
            continue;
        }

        //if we arrive here, it only can be an else block on its own, so we throw an error
        throw new Error(`'else' block without an 'if' block.`);
    }
}