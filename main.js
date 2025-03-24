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

let prodMult = 1;

class Warning {
    constructor(name, desc, time){
        this.name = name;
        this.desc = desc;
        this.time = time;


        this.main = document.createElement("div");
        this.main.classList.add("warning");
        this.main.append(desc);

        document.getElementById("warning_area").appendChild(this.main);

        setTimeout(() => {
            this.main.remove();
        }, this.time);
    }
}

class Resource {
    constructor(resourceName, pic, per_second = 0) {
        this.resourceName = resourceName;
        this.quantity = 0;
        this.basepersecond = per_second;
        this.persecond = per_second; //this is the persecond that should be used!
   

        this.main = document.createElement("div");
        this.main.classList.add("resource");
        this.image = document.createElement("img");
        this.image.src = pic;
        this.image.classList.add("resource_img");
        this.quantityTextDisplay = document.createElement("p"); 
        this.quantityTextDisplay.innerHTML = this.resourceName + " ";
        this.quantityDisplay = document.createElement("span");
        this.quantityDisplay.innerHTML = "0";

        this.quantityTextDisplay.appendChild(this.quantityDisplay);
        this.main.appendChild(this.image);

        this.main.onclick = () => this.gather();

        if (this instanceof ClickableResource) {
            document.getElementById("resource_content").appendChild(this.main);
        }
}

    getclick() {

    }

    gather() {
    }

    spend(qty) {
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

class ClickableResource extends Resource {
    constructor(){
        super("🍪", "images/resources/cookie.png", 0)
    }

    gather() {
        this.give(1+(ResearchProjects.ClickResearch.onComplete()));
    }

    spend(qty) {
        this.quantity = this.quantity - qty;
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

    

    spend(qty) {
        this.quantity = this.quantity - qty;
    }

    updateUI() {
    }
    
    tick(delta) {   
        this.give(this.persecond*delta);   
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

        this.production_area = document.createElement("p");

        this.productionDisplay = document.createElement("span");
        this.productionDisplay.classList.add("utility_production");
        this.show = this.production * this.quantity;
    


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
        if (ResearchProjects.ProductionResearch.level == 0) {
            new Warning("Purchase Warning", "Try researching production level first!", 3000)
        }

        else if (resources.cookies.quantity >= this.cost) {
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
        this.productionDisplay.innerHTML = prettify(this.getProduction() * this.quantity);

    }


    getProduction() {
        return prettify(this.production * (ResearchProjects.ProductionResearch.level * 0.1) * prodMult);
    }
    

    tick(delta) {
        resources.cookies.give(this.getProduction() * this.quantity * delta);
    }
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

class MilkProgressView {
    constructor(resource){
        this.resource = resource;

        this.main = document.createElement("div");
        this.main.classList.add('milk_container');
        
        this.fill = document.createElement('div');
        this.fill.classList.add('milk_fill');

        this.text = document.createElement('span');
        this.text.classList.add("milk_pct")
     
        this.main.appendChild(this.fill);
        this.main.appendChild(this.text);

        document.getElementById('milk_content').appendChild(this.main);

        this.updateUI()
    }

    updateUI(){
        var pct = (this.resource.quantity/this.resource.cap) * 100;
        this.fill.style.height = pct + "%";
        this.text.innerHTML = `${Math.floor(pct)}`;
    }
}

class Spell {
    constructor(name, desc, cost, duration, cooldown, picture) {
        this.name = name;
        this.desc = desc;
        this.cost = cost;
        this.baseduration = duration;
        this.duration = duration;
        this.cooldown = cooldown;

        this.main = document.createElement("div");
        this.main.classList.add("spells")
        this.spellimage = document.createElement("img");
        this.spellimage.src = picture;
        this.spellimage.classList.add("spellsimage")
        this.spelldesc = document.createElement("div");
        this.spelldesc.append(this.desc);
        this.spellcost = document.createElement("div");
        this.spellcost.classList.add("spellsprice")
        this.spellcost.append(this.cost);
        this.spellduration = document.createElement("div");
        this.spellduration.classList.add("spellsduration");
        this.spellduration.append(this.duration)

        this.tooltip = document.createElement("div");
        this.tooltip.classList.add("spellstooltip");

        
        this.tooltip.appendChild(this.spellduration);
        this.tooltip.appendChild(this.spellcost);
        this.main.appendChild(this.spellimage);
        this.tooltip.appendChild(this.spelldesc);
        this.main.append(this.name);

        this.main.appendChild(this.tooltip);

        this.main.onclick = () => {this.purchase();};

        document.getElementById("spells_content").appendChild(this.main);
    }

    getDuration(){
        return this.duration;
    }

    purchase(){
    if (resources.milk.quantity >= this.cost) {
        resources.milk.spend(this.cost);
        this.onCast();
    }
    else {
        console.log("too poor!");
        console.log(this.getDuration());

    }

    }

    updateUI() {
    
        this.spellduration.innerHTML = this.duration;
    }

    onCast(qty){

    }
    
}

class Instabake extends Spell {
    constructor(name, desc, cost, duration, cooldown, img){
        super(name, desc, cost, duration, cooldown, img)
    }

    onCast(){
        console.log(this)
        resources.cookies.give(5)
    }
}

class Overdrive extends Spell {
    constructor(name, desc, cost, duration, cooldown, img){
        super(name, desc, cost, duration, cooldown, img)
    }
    onCast(){
        prodMult = 1.25;
        for (let i in resources){
            resources[i].persecond = resources[i].persecond * prodMult;
        }
        
        setTimeout(() => {
            prodMult = 1;
            for (let i in resources){
                resources[i].persecond = resources[i].basepersecond;
            }
            
        }, this.duration*1000);
        
    }
}



class ResearchProject {
	
	constructor(name, desc, timeNeeded, picture, level = 0, progress =0,) {
		this.name = name; 
        this.desc = desc;
        this.timeNeeded = timeNeeded;
        this.picture = picture;
        this.level = level;
        this.progress = progress;

        this.main = document.createElement("div");
        this.main.classList.add("research_main");

        this.progressOverlay = document.createElement("div");
        this.progressOverlay.classList.add("research_progress");


        this.researchname = document.createElement("span");
        this.researchname.classList.add("research_desc");

        this.researchlevel = document.createElement("div");
        this.researchlevel.classList.add("research_lvl");
        
  

        this.researchimage = document.createElement("img");
        this.researchimage.src = picture;
        this.researchimage.classList.add("research_image");

        this.description = document.createElement("span");
        this.description.classList.add("research_desc");

        this.tneeded = document.createElement("span");
        this.tneeded.classList.add("research_desc");

        this.tooltip = document.createElement("div");
        this.tooltip.classList.add("researchtooltip");


        this.researchlevel.innerHTML = "level " + this.level;
        this.researchname.append(this.name);
        this.tneeded.append(this.timeNeeded);
        this.description.append(this.desc);


        this.main.appendChild(this.progressOverlay);
        this.main.appendChild(this.researchlevel);
        this.main.appendChild(this.researchname);
        this.main.appendChild(this.tooltip);
        this.tooltip.appendChild(this.description)

        this.proginfo = document.createElement("div");
        this.proginfo.classList.add("research_prog_info");
        this.proginfo.innerHTML = "0% (0s/0s)";
        this.tooltip.appendChild(this.proginfo);

        this.main.appendChild(this.researchimage);

        document.getElementById("research_content").appendChild(this.main)
        console.log(this.name)

        this.main.onclick = () => {this.select();};

	}

    select() {
        for (let i in ResearchProjects) {
            ResearchProjects[i].main.classList.remove("active_research");
        }
        CurrentResearch = this;
        this.main.classList.add("active_research");
        console.log(this);

    }

    tick(delta) {
        this.progress += delta;
        if (this.progress >= this.timeNeeded) {
            this.levelUP();
        }
    }

    levelUP() {
        this.progress -= this.timeNeeded;
        this.level += 1;
        this.timeNeeded *= 1.5;
        console.log(this.name + this.level);
        this.onComplete();
    }

    onComplete() {

    }

    updateUI() {
        this.researchlevel.innerHTML = this.level;
        var researchpct = (this.progress/this.timeNeeded) *100;
        this.progressOverlay.style.width = `${researchpct}%`;
        this.proginfo.innerHTML = `${Math.floor(researchpct)}% (${prettify(this.progress.toFixed(1))}s / ${prettify(this.timeNeeded.toFixed(1))}s)`;
        
        if (CurrentResearch === this) {
            this.progressOverlay.style.display = 'block';
        } else {
            this.progressOverlay.style.display = 'none';
        }

    }
}

class MilkResearch extends ResearchProject {
    constructor(){
        super("Milk", "Increase milk regen", 5, "images/research/milkresearch.png", 0, 0);
    }
    onComplete() {
        resources.milk.persecond += 0.1;
    }
}

class CapResearch extends ResearchProject {
    constructor(){
        super("Milk Cap", "Increase Milk Cap", 5, "images/research/capincrease.png", 0, 0)
    }
    onComplete(){
        resources.milk.cap += 1;
        console.log(this)
    }
}

class ClickResearch extends ResearchProject {
    constructor(){
        super("Click", "Increase Cookie per Click", 5, "images/research/click.png", 0, 0)
    }
    onComplete(){
        for (let i in utility) {
            return (utility[i].getProduction()*utility[i].quantity*this.level)*0.01;
        }
    }
}

class SpellResearch extends ResearchProject {
    constructor() {
        super("Spells", "Increace Spell Duration", 5,"images/research/spellresearch.png")
    }

    onComplete(){
        for(let i in spells){
            spells[i].duration = spells[i].duration + (spells[i].baseduration*0.01);
            spells[i].updateUI();
        }
    }
}




var ResearchProjects = {
    MilkResearch: new MilkResearch(),
    ClickResearch: new ClickResearch(),
    ProductionResearch: new ResearchProject("Production", "Increace utility production", 5,"images/research/production.png"),
    CapResearch: new CapResearch(),
    SpellResearch: new SpellResearch()


}

var spells = {
    instabake: new Instabake("Instabake", "Hastely", 50, 0, 10, "images/spells/instabakev2.png"),
    overdrive: new Overdrive("Overdrive", "Increase production of all resources by 25%", 25, 10, 5, "images/spells/overdrive.png"),
    gamble: new Spell("Gamble", "What are the odds?", 20, 4, 5, "images/spells/gamble.png"),

}

//research
var CurrentResearch = null;


//resource creation
var resources = {
    cookies: new ClickableResource(),
    milk: new CappedResource("🥛", "images/resources/milk.png", 100,  0.1)
};


var milkProgView = new MilkProgressView(resources.milk);



var cookiesDisplay = new ResourceView(resources.cookies);
var milkDisplay = new ResourceView(resources.milk);


var infoBar = document.getElementById("info_bar");

infoBar.appendChild(cookiesDisplay.main);
infoBar.appendChild(milkDisplay.main);

var resourceViews = [cookiesDisplay, milkDisplay, milkProgView]



//util creation
var utility = {
    oven: new Utility("Oven", 50, 1, "oven", "images/ovens/oven.png"),
    silveroven: new Utility("Silver Oven", 200, 2, "silveroven", "images/ovens/silveroven.png"),
    goldoven: new Utility("Gold Oven", 500, 3, "goldoven", "images/ovens/goldoven.png"),
    platoven: new Utility("Platnium Oven", 1500, 5, "platoven", "images/ovens/platinumoven.png"),
    amethystoven: new Utility("Amethyst Oven", 5000, 10, "amethystoven", "images/ovens/amethystoven.png")
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

    for (let i in spells){
        spells[i].updateUI();
    }

    for (let r in resources) { 
        resources[r].updateUI();
    }

    for (let i in utility) {
        utility[i].updateUI();
    }

    for (let i in ResearchProjects) {
        ResearchProjects[i].updateUI();
    }

};

function tick() {
    var now = Date.now();
    var delta = (now - last_tick) / 1000;
    last_tick = now;

    if (CurrentResearch != null)
        CurrentResearch.tick(delta);

    for (let i in resources) {
        resources[i].tick(delta);
    }

    for (let i of resourceViews) {
        i.updateUI()
    }

    for (let i in utility) {
        utility[i].tick(delta);
    }

    

    


    update_ui();
};

window.setInterval(tick, 1000 / 60);

function r(qty){
    resources.cookies.give(qty);
}
function m(qty){
    resources.milk.give(qty);
}