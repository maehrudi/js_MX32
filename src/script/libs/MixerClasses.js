

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
    }
    addUnnamedItem(id, namedItemId) {
        this.addItem(id, new UnnamedMixerITem(this, id, namedItemId));
    }

    getIdExists(id) {
        return this.itemMap.has(id);
    }
    getItemById(id) {
        return this.itemMap.get(id);
    }
    getNameSetById(id){
        if (this.itemMap.has(id)) {
            return this.itemMap.get(id).getNameSet();
        }
        return new NameSet();
    }

    addChannel(type, num, name, color) {
        this.addNamedItem(this.buildId(type, num), name, color);
    }
    addInput(type, num, target_type, target_num) {
        this.addUnnamedItem(this.buildId(type, num), this.buildId(target_type, target_num));
    }
    addOutput(type, num, source_type, source_num) {
        this.addUnnamedItem(this.buildId(type, num), this.buildId(source_type, source_num));
    }
    buildId(pref, num) {
        return pref + add_leading_chars(num, 2, '0');
    }
}

class NameSet {
    // Class for a set of name and color
    constructor(name="unnamed", color="unset") {
        this.name = name;
        this.color = color;
    }

    toString() {
        return "name: " + this.name + " color: " + this.color;
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
         return new NameSet(this.name, this.color);
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
            }
        }
        return new NameSet();
    }
}
