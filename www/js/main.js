const header = document.querySelector("header");
const display = document.querySelector("#display");
let data = JSON.parse(localStorage.getItem("trello"));

if (data == null) {
    data = {
        tables: [],
        tabs: []
    };
    Save();
}

// Init
function InitTabs(tabs = []) {
    const home = CreateTab("Home", function() {
        InitHomePage(data.tables);
    });
    home.id = "homeTable";
    home.classList.add('active');
    header.appendChild(home);

    for (let i = 0; i < tabs.length; i++) {
        let tab = CreateTab(tabs[i].name, function() {
            SetActiveTab(tab);
            InitTablePage(tabs[i]);
        });
        header.appendChild(tab);
    }
}

function InitHomePage(tables = []) {
    tables.sort(function(a, b) {
        return a.lastVisit < b.lastVisit;
    })
    let homeTable = document.createElement("div");
    homeTable.id = "home";
    for (let i = 0; i < tables.length; i++) {
        let short = CreateTableShortcut(tables[i].name, function() {
            AddTab(tables[i]);
            InitTablePage()
        });
        homeTable.appendChild(short);
    }
    let newItem = CreateTableShortcut("+", function() {
        CreateModal(function(name) {
            CreateTable(name);
        });
    });
    newItem.id = "createTable";
    homeTable.appendChild(newItem)
    display.innerHTML = "";
    display.appendChild(homeTable);
}
function InitTablePage(table = {}) {

}
 

// Add
function AddTab(table = []) {

}


// Create
function CreateTab(name = '', onclick = function(){}, oncancel=function(){}) {
    let tab = document.createElement("div");
    tab.classList.add("tableLink");
    tab.innerText = name;
    let cancel = document.createElement("div");
    cancel.innerText = "x";
    cancel.onclick = oncancel(tab);
    tab.appendChild(cancel);
    tab.onclick = onclick;
    return tab;
}
function CreateTableShortcut(name, onclick=function(){}) {
    const shortcut = document.createElement('div');
    shortcut.onclick = onclick;
    shortcut.classList.add("tableShortcut");
    const data = document.createElement("div");
    data.innerText = name;
    shortcut.appendChild(data);
    return shortcut;
}

function CreateModal(oninput=function(){}) {
    let modal = document.createElement("div");
    modal.id = "modal";
    let nameField = document.createElement('div');
    nameField.id = "nameField";
    let input = document.createElement('input');
    input.id = "modalName";
    let btn = document.createElement('button');
    btn.id = "submitInput";
    btn.onclick = function() {
        let inp = input.value;
        modal.remove();
        oninput(inp);
    }
    nameField.appendChild(input);
    nameField.appendChild(btn);
    modal.appendChild(nameField);
    document.body.appendChild(modal);
}

function CreateTable(name) {
    data.tables.push({name:name, id:data.tables.length, lastVisit:Date.now()});
    Save();
    InitHomePage(data.tables);
}


//Set
function SetActiveTab(tab = {}) {
    let tabs = document.querySelectorAll("header > div");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
    tab.classList.add('active');
}

function Save() {
    localStorage.setItem('trello', JSON.stringify(data));
}

(function(){
    InitTabs(data.tabs);
    InitHomePage(data.tables);
})()