

class MixerItemContainer{
    // Class as container for all mixer-items
    constructor() {
        this.itemMap = new Map();
    }
    
    addItem(id, item) {
        if (this.itemMap.has(id)) {
            throw new Error("ID " + id + " is allready in use!");
        }
        this.itemMap.set(id, item);
    }
    addNamedItem(id, name, color){
        this.addItem(id, new NamedMixerItem(id, name, color));
        return id
    }
    addUnnamedItem(id, namedItemId) {
        this.addItem(id, new UnnamedMixerITem(this, id, namedItemId));
        return id
    }

    getIdExists(id) {
        return this.itemMap.has(id);
    }
    getItemById(id) {
        return this.itemMap.get(id);
    }
    getNameSetById(id){
        if (!id) {
            throw new Error('ID must not be empty');
        }
        if (this.itemMap.has(id)) {
            return this.itemMap.get(id).getNameSet();
        } else {
            // check if id is used
            var relations = [];
            this.itemMap.forEach(function(value, key, map){
                if (value.namedItemId == id) {
                    relations.push(value.id);
                }
            });
            if (relations.length > 0) {
                return new NameSet(relations.join(','));
            }
        }
        return new NameSet();
    }

    addChannel(type, num, name, color) {
        return this.addNamedItem(MixerItemContainer.buildId(type, num), name, color);
    }
    addInput(type, num, target_type, target_num) {
        return this.addUnnamedItem(MixerItemContainer.buildId(type, num), MixerItemContainer.buildId(target_type, target_num));
    }
    addOutput(type, num, source_type, source_num) {
        return this.addUnnamedItem(MixerItemContainer.buildId(type, num), MixerItemContainer.buildId(source_type, source_num));
    }
    static buildId(pref, num) {
        return pref + '-' + add_leading_chars(num, 2, '0');
    }

    static getTableHead() {
        return ['element', 'reference', 'name', 'color'];
    }

    getTableEntryForId(id) {
        var ns = this.getNameSetById(id);
        var namedItem = ns.namedItem;
        if (namedItem == "~none~") { namedItem = '==='; }
        var name = ns.name;
        if (name == "~unnamed~") { name = '==='; }
        var color = ns.color;
        if (color == "~unset~") { color = '==='; }

        return [id, namedItem, name, color];
    }

    getStyleClassForId(id) {
        var col = this.getNameSetById(id).color;
        if (col == '~unset~') {
            col = '_unset_';
        }
        return "color" + col;
    }

}

class NameSet {
    // Class for a set of name and color
    constructor(namedItem="~none~", name="~unnamed~", color="~unset~") {
        this.name = name;
        this.color = color;
        this.namedItem = namedItem;
    }

    toString() {
        return "name: " + this.name + " color: " + this.color + " namedItem: " + this.namedItem;
    }
}

class NamedMixerItem {
    // Class for mixer-items with name and color definition, e.g. Channels
    constructor(id, name, color) {
         this.id = id;
         this.name = name;
         this.color = color;
     }

     getNameSet() {
         return new NameSet(this.id, this.name, this.color);
     }
}

class UnnamedMixerITem {
    // Class for mixer-items withoud name and color definition, e.g. Inputs
    constructor(container, id, namedItemId) {
        this.container = container;
        this.id = id;
        this.namedItemId = namedItemId;
    }

    getNameSet() {
        if (this.namedItemId) {
            this.container.getItemById(this.namedItemId);
            if (this.container.getIdExists(this.namedItemId)){
                return this.container.getItemById(this.namedItemId).getNameSet();
            } else {
                return new NameSet(this.namedItemId);
            }
        }
        return new NameSet();
    }
}
