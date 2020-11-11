//Budget controller
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        };   
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(item) {
            sum += item.value;
        });
        data.total[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 // doesnt exist if totals and budget is 0
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            };
            
            //create new item based on type
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type == "inc") {
                newItem = new Income(ID, des, val);
            };
            
            //push items in data structure
            data.allItems[type].push(newItem);
            
            //return new element
            return newItem;          
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            
            //calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");
            
            //calculate budget: income - expenses
            data.budget = data.total.inc - data.total.exp;
            
            //calculate percentage of income that is spended
            if(data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            };
        },
        
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(expense) {
                expense.calcPercentage(data.total.inc);
            });
        },
        
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(expense) {
                return expense.getPercentage();
            });
            return allPercentages;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();

//UI controller
var UIController = (function() {
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenceContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expencesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expPercentagesLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
        redFocus: "red-focus", 
        redBtn: "red"
    };
    
    var formatNumbers= function(number, type) {
        var numSplit, intiger, decimal;
        number = Math.abs(number);
        number = number.toFixed(2);
        numSplit = number.split(".");
        intiger = numSplit[0];
        if(intiger.length > 3) {
            intiger = intiger.substr(0, intiger.length - 3) + "." + intiger.substr(intiger.length -3, 3);
        }
        decimal = numSplit[1];
            
        return (type === "exp" ? "-": "+") + " " + intiger + "," + decimal;
    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }  
    };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // inc for + and exp for -
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }            
        },
        
        addListItem: function(obj, tp) {
            var html, newHtml, element;
            
            // create HTML string with placeholder text
            if (tp === "inc") {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                
            } else if (tp === "exp") {
                element = DOMstrings.expenceContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            };
            
            //replace placeholer text with data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumbers(obj.value, tp));
            
            //insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },
        
        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        
        clearFilds: function() {
            var inputs, inputsArr;
            
            inputs = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            inputsArr = Array.prototype.slice.call(inputs);
            inputsArr.forEach(function(input, index, array) {
                input.value = "";
            });
            
            inputsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = "inc": type = "exp";
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumbers(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumbers(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expencesLabel).textContent = formatNumbers(obj.totalExp, "exp");
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },
        
        displayPercentages: function(percentages) {
            var percLabels = document.querySelectorAll(DOMstrings.expPercentagesLabel);
            
            nodeListForEach(percLabels, function(label, index) {
                if(percentages[index] > 0) {
                    label.textContent = percentages[index] + "%";
                } else {
                    label.textContent = "---";
                };
            });
        },
        
        displayDate: function() {
            var now, months, year, month;
            now = new Date();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        },
        
        changeType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + "," +
                DOMstrings.inputDescription + "," +
                DOMstrings.inputValue);
           
            nodeListForEach(fields, function(field) {
                field.classList.toggle(DOMstrings.redFocus);
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle(DOMstrings.redBtn);
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();

//App controller
var controllerApp = (function(bdgCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        var DOM = UIController.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function(event) {
            if(event.keyCode === 13 || event.which ===13) {
                ctrlAddItem();
            } 
        });
        
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change", UIController.changeType);
    };
    
    var updatePercentages = function(){
        //calculate percentages
        budgetController.calculatePercentages();
        
        //read percentages from budget controller
        var percentages = budgetController.getPercentages();
        
        //update UI expecies list percentages
        UIController.displayPercentages(percentages);
    };
    
    var updateBudget = function(){
        //Calculate budget
        budgetController.calculateBudget();
        
        //return budget
        var budget = budgetController.getBudget();
        
        //display the budget on UI
        UIController.displayBudget(budget);
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        //Get the feiled input data 
        input = UIController.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //Add item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);
        
            //Add item to UI
            UIController.addListItem(newItem, input.type);
        
            //Clear fields
            UIController.clearFilds();
        
            //calculate and update budget
            updateBudget();
            
            //calculate and update percentage for expencies
            updatePercentages();
        }  
    };
    
    var ctrlDeleteItem = function(event) {
        var itemId, splitId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemId) {
            splitId = itemId.split("-");
            type = splitId[0];
            ID = parseInt(splitId[1]);
            
            //delete item from data structure
            budgetController.deleteItem(type, ID);
            
            //delete item from UI
            UIController.deleteListItem(itemId);
            
            //update and show new budget
            updateBudget();
            
            //calculate and update precentages for expencies
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log("Application has been started");
            UIController.displayDate();
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);


controllerApp.init();











