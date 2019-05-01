var budgetController = (function() {
    var Expense = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome>0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;
    }
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    var Incomes = function(id,description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    var calculateTotals = function(type) {
        var sum = 0;
        data.allItems[type].forEach(item => {
            sum += item.value;
        });
        data.totals[type] = sum;
    }
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }
    return {
        addItem: function(type,des,val) {
            var ID, newItem;

            // Create new ID
            if(data.allItems[type].length === 0)
                ID = 0;
            else
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            
            // Create new item
            if(type === 'exp')
                newItem = new Expense(ID,des,val);
            else if(type === 'inc')
                newItem = new Incomes(ID,des,val);
            
            // Add the new item to our data structure
            data.allItems[type].push(newItem);
            
            // Return the new item
            return newItem;
        },
        calculateBudget: function() {
            // Calculate the total expenses & income
            calculateTotals('inc');
            calculateTotals('exp');

            // Calculate the budget i.e. income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we have spent
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else
                data.percentage = -1;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(curr=>{
                curr.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function() {
            var percentages = data.allItems.exp.map(e=>{
                return e.getPercentage();
            })
            return percentages;
        },
        deleteItem: function(type,id) {
            var ids,index;
            ids = data.allItems[type].map(item=>{
                return item.id;
            });
            index = ids.indexOf(id);
            if(index>-1)
                data.allItems[type].splice(index,1);
        },
        testing: function() {
            console.log(data);
        }
    }
})();


 //*******************************************************************************
var UIController = (function() {
    // Some UI related tasks
    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel:".budget__income--value",
        expensesLabel:".budget__expenses--value",
        percentageLabel:".budget__expenses--percentage",
        container:".container",
        expensePercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    }
    // Beautify the numbers displayed
    var formatNumber = function(num,type) {
        var numSplit,int,dec;
        // Remove - from before the number
        num = Math.abs(num);
        // Add the decimal points upto 2 digits
        num = num.toFixed(2);
        // Split the integer & decimal part
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        // Make comma separated thousands
        if(int.length>3)
            int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        return (type==='exp'?'-':'+')+' '+int+'.'+dec;
    }
    // AN iterator to iterate over a list
    function nodesForEach(list,callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i],i);
        }
    }

    return {
        getDOMStrings: function() {
            return DOMStrings;
        },

        displayDate: function() {
            var date,mon,year,months;
            months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            date = new Date();
            mon = date.getMonth();
            year = date.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[mon] + " " + year;
        },

        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem(object,type) {
            var html,element,newHtml;
            
            // Form the html string
            if(type==='inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type==='exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with the actual data
            newHtml = html.replace("%id%",object.id);
            newHtml = newHtml.replace("%description%",object.description);
            newHtml = newHtml.replace("%value%",formatNumber(object.value,type));
            
            // Insert the element into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields,fieldsArr;
            
            // Fetch the list of description and value of the newly adding element  
            fields = document.querySelectorAll(DOMStrings.inputDescription+ ", "+DOMStrings.inputValue);
            
            // Convert the list into an array so that we can use the methods defined in Array.prototype
            fieldsArr = Array.prototype.slice.call(fields);
            
            // Clear the fields
            fieldsArr.forEach((curr) => {
                curr.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            type = obj.budget > 0 ? 'inc' : 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            if(obj.percentage>0)
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage+'%';
            else
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensePercLabel);
            // Traverse through the list and change the percentage displayed in it
            nodesForEach(fields,function(current,index){
                if(percentages[index] > 0)
                    current.textContent = percentages[index] + "%";
                else
                    current.textContent = "---";
            });
        },

        changedType: function() {
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ","+ DOMStrings.inputValue + "," + DOMStrings.inputType);
            nodesForEach(fields,function(curr) {
                curr.classList.toggle("red-focus");
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
        }
    }
})();


//***********************************************************************************
var controller = (function(budgetCtrl,UICtrl) {
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
    
        // Add an event listener to the button to add item to our budget
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        // Add a global event listener to the DOM for when enter key is pressed, then add whatever item is present to the budget
        document.addEventListener('keypress',function(event){
            // event.keyCode is not supported in some older browsers, so we use event.which also
            if(event.keyCode === 13 || event.which === 13)
                ctrlAddItem();
        });

        // Add an event listener for container item which we can then use to delegate event
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        // Add an event listener to change the color of the input elements and button when changing the type
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    }

    var updateBudget = function() {
        // Calculate the budget
        budgetCtrl.calculateBudget();

        // Return the budget
        var budget = budgetCtrl.getBudget();

        // Display the budget on UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
        // Update the percentages
        budgetCtrl.calculatePercentages();

        // Read the percentages from budget controller
        var percentages = budgetCtrl.getPercentages();

        // Update the UI with new percentages
        UICtrl.displayPercentages(percentages);

    }

    // A function to add item to our budget
    var ctrlAddItem = function() {
        // Get the field input data
        var input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value !== 0) {
            // Add the item to budget controller
            var newItem = budgetCtrl.addItem(input.type,input.description,input.value);

            // Add the item to UI
            UICtrl.addListItem(newItem,input.type);

            // Clear the input fields
            UICtrl.clearFields();

            // Calculate & update the budget
            updateBudget();

            // Calculate & update the budget
            updatePercentages();
        }
    }

    // Delete item
    var ctrlDeleteItem = function(event) {
        var itemId, splitID, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        splitID = itemId.split("-");
        type = splitID[0];
        ID = parseInt(splitID[1]);

        // Delete the item from our data structure
        budgetCtrl.deleteItem(type,ID);

        // Delete the item from UI
        UICtrl.deleteListItem(itemId);

        // Update the budget
        updateBudget();

        // Calculate & update the budget
        updatePercentages();
    }

    return {
        init: function() {
            console.log("App has started");
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
})(budgetController,UIController);

controller.init();