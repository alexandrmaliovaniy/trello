const header = document.querySelector("header");
const display = document.querySelector("#display");

class Storage {
    static Parse(data) {
        let res = {
            tabs:[],
            tables:[]
        };
        for (let i = 0; i < data.tabs.length; i++) {
            res.tabs[i] = new Tab(data.tabs[i].id, data.tabs[i].name);
        }
        for (let i = 0; i < data.tables.length; i++) {
            res.tables[i] = new Table(data.tables[i].id, data.tables[i].name, data.tables[i].data);
        }
        return res;
    }
    constructor(name) {
        this.name = name;
        let data = JSON.parse(localStorage.getItem(this.name));
        this.data = data ? Storage.Parse(data) : {
            tabs:[],
            tables: []
        }
        this.Save();
    }
    AddNewTable(name) {
        const table = new Table(this.data.tables.length, name);
        this.data.tables.push(table);
        this.Save();
        return table;
    }
    AddNewTab(name, id) {
        const tab = new Tab(id, name);
        this.data.tabs.push(tab);
        this.Save();
        return tab;
    }
    Set(cb) {
        cb(this.data);
        Save();
    }
    Save() {
        let data = {
            tabs: [],
            tables: []
        }
        for (let i = 0; i < this.data.tabs.length; i++) {
            data.tabs[i] = {name: this.data.tabs[i].name, id: this.data.tabs[i].id};
        }
        for (let i = 0; i < this.data.tables.length; i++) {
            data.tables[i] = {name: this.data.tables[i].name, id: this.data.tables[i].id, data: this.data.tables[i].data};
        }
        localStorage.setItem(this.name, JSON.stringify(data));
    }
}
class Tab {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    GetHTML(onclick = function(){}, oncancel = function(){}) {
        let tab = document.createElement("div");
        tab.classList.add("tableLink");
        tab.innerText = this.name;
        let cancel = document.createElement("div");
        cancel.innerText = "x";
        cancel.onclick = oncancel(tab);
        tab.appendChild(cancel);
        tab.onclick = onclick;
        tab.tableID = this.id;
        return tab;
    }

}

class Table {
    constructor(id, name, data = {}) {
        this.id = id;
        this.name = name;
        this.data = data;
    }
    ShortHTML(onclick = function(){}) {
        const shortcut = document.createElement('div');
        shortcut.onclick = onclick;
        shortcut.classList.add("tableShortcut");
        const data = document.createElement("div");
        data.innerText = this.name;
        shortcut.appendChild(data);
        return shortcut;
    }
}

class Modal {
    constructor(root) {
        this.root = root;
    }
    Init(cb = function(){}) {
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
            cb(inp);
        }
        nameField.appendChild(input);
        nameField.appendChild(btn);
        modal.appendChild(nameField);
        document.body.appendChild(modal);
    }
}

class Display {
    constructor(tabsContrainer, displayContainer, storage) {
        this.tabsContrainer = tabsContrainer;
        this.displayContainer = displayContainer;
        this.storage = storage;
        this.activeTab = null;
    }
    Init() {
        this.InitTabs(this.storage.data.tabs);
        this.InitHome(this.storage.data.tables);
    }
    SetActiveTab(tab) {
        console.log(tab);
        if (this.activeTab) {
            this.activeTab.classList.remove("active");
        }
        this.activeTab = tab;
        this.activeTab.classList.add("active");
    }
    InitTabs(tabs) {
        let home = (new Tab(-1, "Home")).GetHTML(() => {
            this.SetActiveTab(home);
            this.InitHome(this.storage.data.tables);
        })
        this.SetActiveTab(home);

        this.tabsContrainer.appendChild(home);

        for (let i = 0; i < tabs.length; i++) {
            let tab = tabs[i].GetHTML(() => {
                this.SetActiveTab(tab);
                this.InitTable(this.storage.data.tables[tabs[i].id]);
            })
            this.tabsContrainer.appendChild(tab);
        }
    }
    AddTab(tableID) {
        let tabs = document.querySelectorAll('.tableLink');
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].tableID == tableID) {
                this.SetActiveTab(tabs[i]);
                return tabs[i];
            }
        }
        let newTab = this.storage.AddNewTab(this.storage.data.tables[tableID].name, tableID).GetHTML(()=> {
            this.SetActiveTab(newTab);
            this.InitTable(this.storage.data.tables[tableID])
        });
        newTab.tableID = tableID;
        this.tabsContrainer.appendChild(newTab);
        return newTab;
        
    }
    AddTable(name) {
        this.storage.AddNewTable(name);
        this.InitHome(this.storage.data.tables);
    }
    InitTable(table = {}) {

    }
    InitHome(tables = []) {
        tables.sort(function(a, b) {
            return a.lastVisit < b.lastVisit;
        })
        let homeTable = document.createElement("div");
        homeTable.id = "home";

        for (let i = 0; i < tables.length; i++) {
            let short = tables[i].ShortHTML(() => {
                const tab = this.AddTab(tables[i].id);
                this.SetActiveTab(tab);
                this.InitTable(tables[i])
            });
            homeTable.appendChild(short);
        }
        let newTable = (new Table(-2, "+", {})).ShortHTML(() => {
            (new Modal(document.body)).Init((name)=> {
                this.AddTable(name);
            })
        })
        newTable.id = "createTable";
        homeTable.appendChild(newTable);
        this.displayContainer.innerHTML = "";
        this.displayContainer.appendChild(homeTable);
    }
}


const d = new Display(header, display, new Storage("trello"));
d.Init();