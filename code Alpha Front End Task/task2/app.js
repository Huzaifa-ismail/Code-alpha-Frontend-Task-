 // ---------- CALCULATOR STATE ----------
    let currentInput = "0";       // what user sees as main display (result area)
    let expressionBuffer = "";    // stores full expression for secondary display (optional)
    let lastOperator = null;
    let waitingForOperand = false;   // after operator, waiting for next number
    let shouldResetInput = false;     // after equals or error, next number clears
    
    // DOM elements
    const resultDisplay = document.getElementById("resultDisplay");
    const expressionDisplay = document.getElementById("expressionDisplay");
    
    // Helper: update UI from current state (main display + expression)
    function updateDisplay() {
        // format currentInput: limit length to avoid overflow
        let displayValue = currentInput;
        if (displayValue.length > 18) {
            displayValue = parseFloat(displayValue).toExponential(8);
        }
        resultDisplay.innerText = displayValue;
        
        // expression display: show full expression if available else empty
        if (expressionBuffer) {
            expressionDisplay.innerText = expressionBuffer;
        } else {
            expressionDisplay.innerText = "";
        }
    }
    
    // Clear everything (AC)
    function allClear() {
        currentInput = "0";
        expressionBuffer = "";
        lastOperator = null;
        waitingForOperand = false;
        shouldResetInput = false;
        updateDisplay();
    }
    
    // Delete last character (CE like backspace)
    function deleteLast() {
        if (shouldResetInput) {
            // after equals, pressing delete resets to fresh state? better treat as clear new start
            allClear();
            return;
        }
        // if waitingForOperand and no number typed yet, then clear pending operator state
        if (waitingForOperand && currentInput === "0") {
            // cancel the pending operator, return to previous value
            if (lastOperator !== null) {
                // revert state: keep previous currentInput, remove last operator from expression
                let lastOpIndex = expressionBuffer.lastIndexOf(lastOperator);
                if (lastOpIndex !== -1) {
                    expressionBuffer = expressionBuffer.substring(0, lastOpIndex).trim();
                }
                lastOperator = null;
                waitingForOperand = false;
                updateDisplay();
            }
            return;
        }
        
        // normal digit deletion
        if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith("-") && currentInput[1] !== undefined)) {
            currentInput = "0";
        } else {
            currentInput = currentInput.slice(0, -1);
            // remove trailing dot if last character is dot and we delete it: just keep
            if (currentInput === "-") currentInput = "0";
        }
        // sync expression if needed (but better keep expression unchanged until new operator)
        updateDisplay();
    }
    
    // handle number or decimal point input
    function inputNumber(num) {
        if (shouldResetInput) {
            // after equals, start fresh expression
            allClear();
            shouldResetInput = false;
        }
        
        if (waitingForOperand) {
            currentInput = num;
            waitingForOperand = false;
            shouldResetInput = false;
        } else {
            // avoid multiple leading zeros
            if (currentInput === "0" && num === "0") return;
            if (currentInput === "0" && num !== ".") {
                currentInput = num;
            } else {
                // prevent multiple dots
                if (num === "." && currentInput.includes(".")) return;
                currentInput += num;
            }
        }
        updateDisplay();
    }
    
    // calculate result based on two operands and operator
    function calculate(a, b, operator) {
        let num1 = parseFloat(a);
        let num2 = parseFloat(b);
        if (isNaN(num1) || isNaN(num2)) return null;
        
        switch (operator) {
            case '+': return num1 + num2;
            case '-': return num1 - num2;
            case '*': return num1 * num2;
            case '/': 
                if (num2 === 0) return "Error";
                return num1 / num2;
            case '%': return num1 % num2;
            default: return null;
        }
    }
    
    // handle operator (+, -, *, /, %)
    function handleOperator(op) {
        if (shouldResetInput) {
            // after equals we start new expression with currentInput as first operand
            shouldResetInput = false;
            expressionBuffer = currentInput;
            lastOperator = op;
            waitingForOperand = true;
            updateDisplay();
            return;
        }
        
        // if waiting for operand & lastOperator exists, just replace operator
        if (waitingForOperand && lastOperator !== null) {
            // replace last operator in expressionBuffer
            if (expressionBuffer.length > 0) {
                let lastChar = expressionBuffer[expressionBuffer.length - 1];
                if (['+', '-', '*', '/', '%'].includes(lastChar)) {
                    expressionBuffer = expressionBuffer.slice(0, -1) + getOperatorSymbol(op);
                } else {
                    expressionBuffer += getOperatorSymbol(op);
                }
            } else {
                expressionBuffer = currentInput + getOperatorSymbol(op);
            }
            lastOperator = op;
            updateDisplay();
            return;
        }
        
        // normal case: we have currentInput (second operand not yet typed)
        if (lastOperator !== null && !waitingForOperand) {
            // compute previous operation with existing operands
            let expressionParts = expressionBuffer.split(/(?=[+\-*/%])/);
            let firstOperand = currentInput;
            let prevValue = currentInput;
            
            // better approach: get stored previous value from expressionBuffer?  robust method:
            // we maintain expressionBuffer: example "12+", we need to evaluate "12+5" but we have only 12+ and now operator pressed before new number?
            // Actually typical scenario: user types 5 + 3, then presses *. Now we must compute 5+3=8 and then set operator '*'
            if (expressionBuffer && !waitingForOperand) {
                // evaluate current expression fully
                const result = evaluateExpression(expressionBuffer + currentInput);
                if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                    currentInput = String(result);
                    expressionBuffer = currentInput + getOperatorSymbol(op);
                    lastOperator = op;
                    waitingForOperand = true;
                    updateDisplay();
                    return;
                } else if (result === "Error") {
                    currentInput = "Error";
                    expressionBuffer = "";
                    lastOperator = null;
                    waitingForOperand = false;
                    shouldResetInput = true;
                    updateDisplay();
                    return;
                }
            }
        }
        
        // fresh operator entry (very first operator or after clear)
        if (!lastOperator || waitingForOperand) {
            if (expressionBuffer === "" && currentInput !== "0") {
                expressionBuffer = currentInput + getOperatorSymbol(op);
            } else if (expressionBuffer !== "" && !waitingForOperand) {
                expressionBuffer = currentInput + getOperatorSymbol(op);
            } else if (waitingForOperand && expressionBuffer !== "") {
                // replace last operator
                expressionBuffer = expressionBuffer.slice(0, -1) + getOperatorSymbol(op);
            } else {
                expressionBuffer = currentInput + getOperatorSymbol(op);
            }
            lastOperator = op;
            waitingForOperand = true;
            updateDisplay();
        }
    }
    
    // symbol mapper for visual consistency
    function getOperatorSymbol(op) {
        if (op === '/') return '÷';
        if (op === '*') return '×';
        return op;
    }
    
    function mapToRealOperator(symbol) {
        if (symbol === '÷') return '/';
        if (symbol === '×') return '*';
        return symbol;
    }
    
    // evaluate full mathematical expression (safe)
    function evaluateExpression(expr) {
        try {
            let processed = expr.replace(/÷/g, '/').replace(/×/g, '*');
            // evaluate using Function constructor (safe for arithmetic)
            let result = Function('"use strict"; return (' + processed + ')')();
            if (!isFinite(result)) return "Error";
            // round floating point to avoid excessive decimals
            if (Math.abs(result) > 1e12) return result.toExponential(8);
            return parseFloat(result.toFixed(8));
        } catch (e) {
            return "Error";
        }
    }
    
    // equals action: compute final result
    function computeResult() {
        if (shouldResetInput) {
            return;
        }
        // if waitingForOperand and no second number, just ignore equal
        if (waitingForOperand && lastOperator !== null) {
            // scenario like "5 + " and press equals → keep 5
            if (expressionBuffer.endsWith('+') || expressionBuffer.endsWith('-') || expressionBuffer.endsWith('×') || expressionBuffer.endsWith('÷') || expressionBuffer.endsWith('%')) {
                // remove trailing operator
                expressionBuffer = expressionBuffer.slice(0, -1);
                lastOperator = null;
                waitingForOperand = false;
                currentInput = expressionBuffer || "0";
                updateDisplay();
                return;
            }
        }
        
        let fullExpression = expressionBuffer + currentInput;
        if (fullExpression === "") fullExpression = currentInput;
        
        const result = evaluateExpression(fullExpression);
        
        if (result === "Error") {
            currentInput = "Error";
            expressionBuffer = "";
            lastOperator = null;
            waitingForOperand = false;
            shouldResetInput = true;
            updateDisplay();
            return;
        }
        
        // format result nicely
        let finalResult = result;
        if (typeof finalResult === 'number') {
            if (Math.abs(finalResult) > 999999999) {
                finalResult = finalResult.toExponential(8);
            } else {
                finalResult = parseFloat(finalResult.toFixed(8)).toString();
            }
        }
        currentInput = String(finalResult);
        expressionBuffer = "";   // after equals, fresh state
        lastOperator = null;
        waitingForOperand = false;
        shouldResetInput = true;   // next number will reset screen
        updateDisplay();
    }
    
    // ---- keyboard support (bonus fully implemented) ----
    function handleKeyboard(e) {
        const key = e.key;
        // prevent unwanted default actions like form submit
        if (key === 'Enter' || key === '=' || key === '+' || key === '-' || key === '*' || key === '/' || key === '%' || key === '.' || key === 'Escape' || key === 'Backspace' || (key >= '0' && key <= '9')) {
            e.preventDefault();
        }
        
        // digits and decimal
        if (/^[0-9]$/.test(key)) {
            inputNumber(key);
        }
        else if (key === '.') {
            inputNumber('.');
        }
        else if (key === '+' || key === '-' || key === '*' || key === '/') {
            let mappedOp = key;
            if (key === '*') mappedOp = '*';
            if (key === '/') mappedOp = '/';
            handleOperator(mappedOp);
        }
        else if (key === '%') {
            handleOperator('%');
        }
        else if (key === 'Enter' || key === '=') {
            computeResult();
        }
        else if (key === 'Backspace') {
            deleteLast();
        }
        else if (key === 'Escape') {
            allClear();
        }
        // optional: support delete or clear
    }
    
    // attach button event listeners (UI)
    function attachButtonEvents() {
        // number buttons
        document.querySelectorAll('[data-number]').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = btn.getAttribute('data-number');
                inputNumber(num);
            });
        });
        
        // operator buttons (except equals and clear)
        document.querySelectorAll('[data-operator]').forEach(btn => {
            btn.addEventListener('click', () => {
                let op = btn.getAttribute('data-operator');
                if (op === '/') handleOperator('/');
                else if (op === '*') handleOperator('*');
                else if (op === '+') handleOperator('+');
                else if (op === '-') handleOperator('-');
                else if (op === '%') handleOperator('%');
            });
        });
        
        // clear (AC)
        const clearBtn = document.querySelector('[data-action="clear"]');
        if (clearBtn) clearBtn.addEventListener('click', allClear);
        
        // delete (⌫)
        const delBtn = document.querySelector('[data-action="delete"]');
        if (delBtn) delBtn.addEventListener('click', deleteLast);
        
        // equals
        const equalsBtn = document.querySelector('[data-action="equals"]');
        if (equalsBtn) equalsBtn.addEventListener('click', computeResult);
    }
    
    // additional bug fix: recalc if decimal edge case: make sure initial display stable
    function initCalculator() {
        attachButtonEvents();
        window.addEventListener('keydown', handleKeyboard);
        allClear();  // fresh start with '0'
    }
    
    // improve operator replace scenario when consecutive operators:
    // already covered by handleOperator. Additional polish for '÷' and '×' displays
    // also handle minus sign and negative numbers logic robust: because inputNumber allows leading minus.
    // ensure that after equals pressing operator starts new expression:
    // Already 'shouldResetInput' flag used in inputNumber & handleOperator.
    // Override handleOperator to capture when shouldResetInput:
    const originalHandleOperator = handleOperator;
    window.handleOperator = function(op) {
        if (shouldResetInput) {
            shouldResetInput = false;
            expressionBuffer = currentInput;
            lastOperator = op;
            waitingForOperand = true;
            expressionBuffer = currentInput + getOperatorSymbol(op);
            updateDisplay();
            return;
        }
        originalHandleOperator(op);
    };
    handleOperator = function(op) {
        if (shouldResetInput) {
            shouldResetInput = false;
            expressionBuffer = currentInput;
            lastOperator = op;
            waitingForOperand = true;
            expressionBuffer = currentInput + getOperatorSymbol(op);
            updateDisplay();
            return;
        }
        originalHandleOperator(op);
    }.bind(this);
    
    // replace global handleOperator to incorporate new flag
    window.handleOperatorBinding = handleOperator;
    // rebind operator buttons because we overrode
    function rebindOperators() {
        document.querySelectorAll('[data-operator]').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                let op = newBtn.getAttribute('data-operator');
                if (op === '/') handleOperator('/');
                else if (op === '*') handleOperator('*');
                else if (op === '+') handleOperator('+');
                else if (op === '-') handleOperator('-');
                else if (op === '%') handleOperator('%');
            });
        });
    }
    
    // final re-initialization for robust operator overwrite
    initCalculator();
    rebindOperators();
    // reassign equals, delete, clear again because rebindOperators may not touch them — safe
    const clearBtnSec = document.querySelector('[data-action="clear"]');
    if (clearBtnSec) clearBtnSec.addEventListener('click', allClear);
    const delBtnSec = document.querySelector('[data-action="delete"]');
    if (delBtnSec) delBtnSec.addEventListener('click', deleteLast);
    const equalsBtnSec = document.querySelector('[data-action="equals"]');
    if (equalsBtnSec) equalsBtnSec.addEventListener('click', computeResult);
    
    // also ensure numbers rebinding after potential dom refresh (but no refresh)
    document.querySelectorAll('[data-number]').forEach(btn => {
        btn.removeEventListener('click', inputNumber);
        btn.addEventListener('click', (e) => {
            const num = btn.getAttribute('data-number');
            inputNumber(num);
        });
    });
    
    // final touch: ensure that after equals, percentage works correctly & display update smooth
    console.log("✅ Calculator ready with operators +, -, ×, ÷, % , full keyboard support.");