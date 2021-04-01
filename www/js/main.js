const header = document.querySelector("header");
const display = document.querySelector("#display");


class Storage {
    static Parse(data) {
        let res = {
            currentTab: null,
            tabs:[],
            tables:[]
        };
        res.currentTab = data.currentTab;
        for (let i = 0; i < data.tabs.length; i++) {
            res.tabs[i] = new Tab(data.tabs[i].id, data.tabs[i].name);
        }
        for (let i = 0; i < data.tables.length; i++) {
            res.tables[i] = new Table(data.tables[i].id, data.tables[i].name, data.tables[i].data, data.tables[i].lastVisit);
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
    AddNewList(title, tableID) {
        const list = new List(title, tableID, []);
        console.log(tableID);
        this.data.tables[tableID].data.push(list);
        this.Save();
        return list;
    }
    Set(cb) {
        cb(this.data);
        Save();
    }
    Save() {
        let data = {
            currentTab: null,
            tabs: [],
            tables: []
        }
        data.currentTab = this.data.currentTab;
        for (let i = 0; i < this.data.tabs.length; i++) {
            data.tabs[i] = {name: this.data.tabs[i].name, id: this.data.tabs[i].id};
        }
        for (let i = 0; i < this.data.tables.length; i++) {
            data.tables[i] = {name: this.data.tables[i].name, id: this.data.tables[i].id, data: this.data.tables[i].data, lastVisit: this.data.tables[i].lastVisit};
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
        cancel.innerHTML = "&#x2715";
        cancel.onclick = (e) => { 
            e.stopPropagation();
            oncancel(tab);
        };
        tab.appendChild(cancel);
        tab.onclick = onclick;
        tab.tableID = this.id;
        return tab;
    }
}

class Table {
    constructor(id, name, data = [], lastVisit) {
        this.id = id;
        this.name = name;
        this.data = [];
        for (let i = 0; i < data.length; i++) {
            this.data[i] = new List(data[i].title, this.id, data[i].items);
        }
        this.lastVisit = lastVisit || Date.now();
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
        input.focus();
    }
}

class List {
    constructor(title = '', id = 0, items = []) {
        this.title = title;
        this.id = id;
        this.items = [];
        items.forEach(element => {
            this.items.push(new ListItem(element));
        });
    }
    GetHTML(onchange = function(){}) {
        const taskTable = document.createElement('div');
        taskTable.classList.add("taskTable");
        const title = document.createElement('div');
        title.classList.add("title");
        title.innerText = this.title;
        title.ondblclick = () => {
            title.classList.add("edit");
            title.setAttribute("contenteditable", "true");
            title.focus();
            title.onblur = () => {
                this.title = title.innerText;
                title.classList.remove("edit");
                title.onblur = function(){};
                title.setAttribute("contenteditable", "false");
                onchange();
            }
        }
        const tasks = document.createElement('ul');
        tasks.classList.add('tasks');
        for (let i = 0; i < this.items.length; i++) {
            tasks.appendChild(this.items[i].GetHTML(onchange));
        }

        const newItem = document.createElement('li');
        newItem.classList.add("new");
        newItem.innerText = '+';
        newItem.onclick = () => {
            const newli = new ListItem({value:"New Item"});
            this.items.push(newli);
            const liel = newli.GetHTML(()=> {
                onchange()
            });
            tasks.insertBefore(liel, newItem);
            onchange();
        }
        tasks.appendChild(newItem);
        taskTable.appendChild(title);
        taskTable.appendChild(tasks);
        return taskTable;
    }
}
class ListItem {
    constructor(item) {
        this.value = item.value;
    }
    GetHTML(onchange = function(){}) {
        const li = document.createElement("li");
        li.innerText = this.value;
        li.classList.add("task");
        li.ondblclick = () => {
            li.classList.add("edit");
            li.setAttribute("contenteditable", "true");
            li.focus();
            li.onblur = () => {
                li.classList.remove("edit");
                this.value = li.innerText;
                li.onblur = function() {};
                li.setAttribute("contenteditable", "false");
                onchange();
            }
        }
        return li;
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
        if (this.storage.data.currentTab != null) {
            this.InitTable(this.storage.data.tables[this.storage.data.currentTab]);
        } else {
            this.InitHome(this.storage.data.tables);
        }
    }
    SetActiveTab(tab) {
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
            }, (tab) => {
                for (let i = 0; i < this.storage.data.tabs.length; i++) {
                    if (tab.tableID == this.storage.data.tabs[i].id) {
                        this.storage.data.tabs = this.storage.data.tabs.slice(0, i).concat(this.storage.data.tabs.slice(i+1, this.storage.data.tabs.length));
                        this.storage.Save();
                        break;
                    }
                }
                if (tab.classList.contains("active")) {
                    this.InitHome(this.storage.data.tables);
                }
                tab.remove();
                
            });
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
        }, (tab) => {
            for (let i = 0; i < this.storage.data.tabs.length; i++) {
                if (tab.tableID == this.storage.data.tabs[i].id) {
                    this.storage.data.tabs = this.storage.data.tabs.slice(0, i).concat(this.storage.data.tabs.slice(i+1, this.storage.data.tabs.length));
                    this.storage.Save();
                    break;
                }
            }
            if (tab.classList.contains("active")) {
                this.InitHome(this.storage.data.tables);
            }
            tab.remove();
            
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
        this.storage.data.currentTab = table.id;
        this.AddTab(table.id);
        table.lastVisit = Date.now();
        this.storage.Save();
        let homeTable = document.createElement("div");
        homeTable.id = "table";
        for (let i = 0; i < table.data.length; i++) {
            let list = table.data[i].GetHTML(()=> {
                this.storage.Save();
            });
            homeTable.appendChild(list);
        }
        const addItem = (new List("+", -3)).GetHTML();
        addItem.onclick = () => {
            let newList = (this.storage.AddNewList("New List", table.id)).GetHTML(()=> {
                this.storage.Save();
            });
            homeTable.insertBefore(newList, addItem);
        }
        addItem.innerHTML = "<div class='add'>+</div>";
        homeTable.appendChild(addItem);
        display.innerHTML = "";
        display.appendChild(homeTable);
    }
    InitHome(unsortedTables = []) {
        this.storage.data.currentTab = null;
        this.storage.Save();
        let tables = [...unsortedTables];
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


(function() {
    (new Display(header, display, new Storage("trello"))).Init();
})();