
cont = new MixerItemContainer();


console.log("Add named item and check nameset");
cont.addNamedItem('ch03', 'Keys', 'YE');
item = cont.getItemById('ch03');
nameSet = cont.getNameSetById('ch03');
checkCondition(nameSet.name == 'Keys' && nameSet.color == 'YE', nameSet.toString(), nameSet.toString());

console.log("Add unnamed item, link with named item and check nameset");
cont.addUnnamedItem('AN03', 'ch03');
item = cont.getItemById('AN03');
nameSet = cont.getNameSetById('AN03');
checkCondition(nameSet.name == 'Keys' && nameSet.color == 'YE', nameSet.toString(), nameSet.toString());

console.log("Add unnamed item, link with unnamed item and check nameset");
cont.addUnnamedItem('XLR03', 'AN03');
item = cont.getItemById('XLR03');
nameSet = cont.getNameSetById('XLR03');
checkCondition(nameSet.name == 'Keys' && nameSet.color == 'YE', nameSet.toString(), nameSet.toString());

console.log("Add unnamed item, link with nothing and check nameset");
cont.addUnnamedItem('XLR04', '');
item = cont.getItemById('XLR04');
nameSet = cont.getNameSetById('XLR04');
checkCondition(nameSet.name == 'unnamed' && nameSet.color == 'unset', nameSet.toString(), nameSet.toString());

console.log("Check nameset of not existing item");
item = cont.getItemById('XLR05');
nameSet = cont.getNameSetById('XLR05');
checkCondition(nameSet.name == 'unnamed' && nameSet.color == 'unset', nameSet.toString(), nameSet.toString());

console.log("Check if adding of existing item raises error");
try {
    cont.addNamedItem('XLR04', 'Test', 'BK');
    throw new Error("Kein Fehler geworfen, obwohl erwartet!");
} catch (error) {
    checkCondition(error.message == 'ID XLR04 is allready in use!', error.message, error.message);
}

console.log("Add Channel Bus 8 and check nameset");
cont.addChannel('bus', 8, 'Voc4', 'BU');
item = cont.getItemById('bus08');
nameSet = cont.getNameSetById('bus08');
checkCondition(nameSet.name == 'Voc4' && nameSet.color == 'BU', nameSet, nameSet);

console.log("Add Input to Bus 8 and check nameset");
cont.addInput('AN', 15, 'bus', 8);
item = cont.getItemById('AN15');
nameSet = cont.getNameSetById('AN15');
checkCondition(nameSet.name == 'Voc4' && nameSet.color == 'BU', nameSet, nameSet);

console.log("Add Output to that Input and check nameset");
cont.addOutput('AES50A_O', 3, 'AN', 15);
item = cont.getItemById('AES50A_O_03');
item = cont.getNameSetById('AES50A_O_03');
checkCondition(nameSet.name == 'Voc4' && nameSet.color == 'BU', nameSet, nameSet);
