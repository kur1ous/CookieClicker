//Prettify
/**
 * Converts a number into a more readable format suitable for display.
 * @param {Number} number - number to convert
 * @returns string representation of the number
 */
function prettify(number) {
    // Thanks, Trimps!
    if (!isFinite(number)) return "Infinity";
    if (number >= 1000 && number < 10000) return Math.floor(number);
    if (number == 0) return "0";
    if (number < 0) return "-" + prettify(-number);
    if (number < 0.005) return (+number).toExponential(2);


    function prettifySub(number) {
        number = parseFloat(number);
        var floor = Math.floor(number);
        if (number === floor) // number is an integer, just show it as-is
            return number;
        var precision = 3 - floor.toString().length; // use the right number of digits


        return number.toFixed(precision);
    }


    var base = Math.floor(Math.log(number) / Math.log(1000));
    if (base <= 0) return prettifySub(number);




    number /= Math.pow(1000, base);
    if (number >= 999.5) {
        // 999.5 rounds to 1000 and we don’t want to show “1000K” or such
        number /= 1000;
        ++base;
    }

    var suffices = [
        'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud',
        'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Od', 'Nd', 'V', 'Uv', 'Dv',
        'Tv', 'Qav', 'Qiv', 'Sxv', 'Spv', 'Ov', 'Nv', 'Tg', 'Utg', 'Dtg', 'Ttg',
        'Qatg', 'Qitg', 'Sxtg', 'Sptg', 'Otg', 'Ntg', 'Qaa', 'Uqa', 'Dqa', 'Tqa',
        'Qaqa', 'Qiqa', 'Sxqa', 'Spqa', 'Oqa', 'Nqa', 'Qia', 'Uqi', 'Dqi',
        'Tqi', 'Qaqi', 'Qiqi', 'Sxqi', 'Spqi', 'Oqi', 'Nqi', 'Sxa', 'Usx',
        'Dsx', 'Tsx', 'Qasx', 'Qisx', 'Sxsx', 'Spsx', 'Osx', 'Nsx', 'Spa',
        'Usp', 'Dsp', 'Tsp', 'Qasp', 'Qisp', 'Sxsp', 'Spsp', 'Osp', 'Nsp',
        'Og', 'Uog', 'Dog', 'Tog', 'Qaog', 'Qiog', 'Sxog', 'Spog', 'Oog',
        'Nog', 'Na', 'Un', 'Dn', 'Tn', 'Qan', 'Qin', 'Sxn', 'Spn', 'On',
        'Nn', 'Ct', 'Uc'
    ];
    var suffix = suffices[base - 1];
    return prettifySub(number) + suffix;
}

class Resource {
    constructor(resourceName, pic, per_second = 0) {
        this.resourceName = resourceName;
        this.quantity = 0;
        this.persecond = per_second; //this is the persecond that should be used!
        // this.emoji = emoji

        this.main = document.createElement("div");
        this.main.classList.add("resource");
        this.image = document.createElement("img");
        this.image.src = pic;
        this.image.classList.add("resource_img");
        this.quantityTextDisplay = document.createElement("p"); //document.createElement("p")
        this.quantityTextDisplay.innerHTML = this.resourceName + " ";
        this.quantityDisplay = document.createElement("span");
        this.quantityDisplay.innerHTML = "0";
        // console.log(this.main)

        this.quantityTextDisplay.appendChild(this.quantityDisplay);
        this.main.appendChild(this.image);
        // this.main.appendChild(this.quantityTextDisplay);

        this.main.onclick = () => this.gather();

        document.getElementById("resource_content").appendChild(this.main);
    }

    gather() {
        this.give(1);
    }

    spend(qty) {
        this.quantity = this.quantity - qty;
    }

    give(qty) {
        this.quantity = this.quantity + qty;
    }

    updateUI() {
        this.quantityDisplay.innerHTML = prettify(this.quantity);
    }

    tick(delta) {   
        this.give(this.persecond*delta);   
    }
}

class CappedResource extends Resource {
    constructor(name, pic, cap, per_second = 0) {
        super(name, pic, per_second);
        this.cap = cap;
        
        //html
        this.capDisplay = document.createElement("span");
        this.capDisplay.innerHTML = prettify(this.cap);
    
        this.quantityTextDisplay.append("/");
        this.quantityTextDisplay.appendChild(this.capDisplay);

    
    }
    give(qty) {
        super.give(qty);
        if (this.quantity > this.cap) {
            this.quantity = this.cap;
        }
    }

    updateUI() {

    }
}

class ResourceView {
    constructor(resource){
        this.resource = resource;

        this.main = document.createElement("div");
        this.main.classList.add("resource_icon");
        this.main.innerHTML = this.resource.resourceName + " ";
        this.quantityDisplay = document.createElement("span");
        this.main.appendChild(this.quantityDisplay);

        if (this.resource.cap) { //if resource.cap is true then -->
            this.capDisplay = document.createElement("span");
            this.main.append("/");
            this.capDisplay.innerHTML = 0;
            this.main.appendChild(this.capDisplay);
        }
        

        this.persecondTextDisplay = document.createElement("span");
        this.persecondTextDisplay.innerHTML = " (";
        this.persecondDisplay = document.createElement("span");
        this.persecondTextDisplay.appendChild(this.persecondDisplay);

        this.persecondTextDisplay.append("/s)");
        this.main.appendChild(this.persecondTextDisplay);
        this.updateUI();

    }

    updateUI() {

        this.quantityDisplay.innerHTML = prettify(this.resource.quantity);

        if (this.resource.cap) {
            this.capDisplay.innerHTML = prettify(this.resource.cap)
        }
        

        this.quantityDisplay.innerHTML = prettify(this.resource.quantity);
        if (this.resource.cap) {
            this.capDisplay.innerHTML = this.resource.cap;
        }
        if (this.resource.persecond == 0) {
            this.persecondTextDisplay.style.display = "none";
        }
        else {
            this.persecondTextDisplay.style.display = "";
            this.persecondDisplay.innerHTML = prettify(this.resource.persecond)
        }

    }
    
}

class Utility {
    constructor(name, cost, production, elementID, pic) {
        this.name = name;
        this.cost = cost;
        this.quantity = 0
        this.show = 0
        this.production = production;


        //for html
        this.main_icon = document.createElement("div");
        this.main_icon.classList.add("utility")
        this.button = document.createElement("button");
     
        this.image = document.createElement("img");
        this.image.src = pic;
        this.hover_area = document.createElement("div");

        this.tooltip = document.createElement("div");
        this.tooltip.classList.add("tooltip");

        this.info_div = document.createElement("div");

        this.name_area = document.createElement("p");
        this.name_area.classList.add("utility_name")

        // this.description_area = document.createElement("p");
        this.production_area = document.createElement("p");

        this.productionDisplay = document.createElement("span");
        this.productionDisplay.classList.add("utility_production");
        this.productionDisplay.innerHTML = this.show;
    


        this.cost_area = document.createElement("p");
        this.costDisplay = document.createElement("span");
        this.costDisplay.classList.add("utility_cost");
        this.costDisplay.innerHTML = this.cost

        this.quantityDisplay = document.createElement("span");
        this.quantityDisplay.classList.add("utility_quantity");
        this.quantityDisplay.innerHTML = this.quantity;

        this.name_area.innerHTML = this.name;


        this.production_area.innerHTML = "Produces ";
        this.production_area.appendChild(this.productionDisplay);
        this.production_area.append(" 🍪/second.");

        this.cost_area.innerHTML = "Cost: ";
        this.cost_area.appendChild(this.costDisplay);
        this.cost_area.append("🍪");

        this.info_div.appendChild(this.name_area);

        // this.tooltip.appendChild(this.description_area);
        this.tooltip.appendChild(this.production_area);
        this.tooltip.appendChild(this.cost_area);
        

        

        this.button.appendChild(this.image);
        this.button.appendChild(this.info_div);
        this.button.appendChild(this.quantityDisplay);
    

        this.button.onclick = () => {this.purchase();};
     
        this.info_div.appendChild(this.quantityDisplay)
        this.main_icon.appendChild(this.tooltip);
        this.main_icon.appendChild(this.button);




        document.getElementById("utility_area").appendChild(this.main_icon);




    }

    purchase() {
        if (resources.cookies.quantity >= this.cost) {
            this.quantity = this.quantity + 1;
            resources.cookies.spend(this.cost)
            this.cost = this.cost * 1.15;
            this.show = this.production * this.quantity
            console.log(this.name + this.quantity)

        }
    }

    updateUI() {
        this.quantityDisplay.innerHTML = prettify(this.quantity);
        this.costDisplay.innerHTML = prettify(this.cost);
        this.productionDisplay.innerHTML = prettify(this.show);

    }

    // tick(delta) {
    //     resources.cookies.give(this.production * this.quantity * delta)
    // }
}

class ProgressBarView {
    constructor(resource, bg, fg) {
        this.resource = resource;

        this.main = document.createElement("div");
        this.main.style.backgroundColor = bg;
        this.main.classList.add("progress_bar");
        
        this.fill = document.createElement("div");
        this.fill.style.backgroundColor = fg;
        this.fill.classList.add("progress_bar_inner");

        this.fill.append("MILK")
        
        this.main.appendChild(this.fill);
        this.updateUI();

    }

    updateUI() {
        var pct = (this.resource.quantity/this.resource.cap) * 100;
        this.fill.style.width = pct + "%";
    }
}

//resource creation
var resources = {
    cookies: new Resource("🍪", "images/resources/cookie.png"),
    milk: new CappedResource("🥛", "images/resources/milk.png", 100,  0.1)
};


var cookiesDisplay = new ResourceView(resources.cookies);
var milkDisplay = new ResourceView(resources.milk);
var milkprog = new ProgressBarView(resources.milk, "black", "grey");


var infoBar = document.getElementById("info_bar");

infoBar.appendChild(cookiesDisplay.main);
infoBar.appendChild(milkDisplay.main);
infoBar.appendChild(milkprog.main);




var resourceViews = [cookiesDisplay, milkDisplay, milkprog]



//util creation
var utility = {
    oven: new Utility("Oven", 1, 1, "oven", "images/ovens/oven.png"),
    silveroven: new Utility("Silver Oven", 2, 2, "silveroven", "images/ovens/silveroven.png"),
    goldoven: new Utility("Gold Oven", 500, 5, "goldoven", "images/ovens/goldoven.png"),
    platoven: new Utility("Platnium Oven", 1500, 15, "platoven", "images/ovens/platinumoven.png"),
    amethystoven: new Utility("Amethyst Oven", 5000, 100, "amethystoven", "images/ovens/amethystoven.png")
};


function tab_Click(tabname) {
    let tabs = document.querySelectorAll(".tab_button"); //takes all elements with class "tab_button" and stores in nodelist    
    let contents = document.querySelectorAll(".tab_content");
    
    contents.forEach(content => content.style.display = "none"); //loops through all elements with class "tab_content" and hides div
    tabs.forEach(tab => tab.classList.remove("active_tab")); //loops through all elements in tabs nodelist and removes "active_tab" from button

    let active_tab_button = document.getElementById(tabname + "_tab");
    let active_content = document.getElementById(tabname + "_content");

    if (active_tab_button && active_content) {
        active_tab_button.classList.add("active_tab");
        active_content.style.display = "";
    }

}
tab_Click('resource');


var last_tick = Date.now();

function update_ui() {

    for (let r in resources) { 
        resources[r].updateUI();
    }

    for (let i in utility) {
        utility[i].updateUI();
    }

};

function tick() {
    var now = Date.now();
    var delta = (now - last_tick) / 1000;
    last_tick = now;

    for (let i in resources) {
        resources[i].tick(delta);
    }

    for (let i of resourceViews) {
        i.updateUI()
    }

    for (let i in utility) {
        resources.cookies.give(utility[i].production *utility[i].quantity * delta);
    }

    

    


    update_ui();
};

window.setInterval(tick, 1000 / 60);