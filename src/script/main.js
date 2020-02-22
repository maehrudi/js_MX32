
var file_content = null;
var selected_file = null;

var channels = [];
var ip_list = new Map();
var inList;
var ip_chan_list;
var op_chan_list;

class Channel{
    constructor(dir, type, num, name, color, in_nr=null) {
        this.dir = dir;
        this.type = type;
        this.num = num;
        this.name = name;
        this.color = color;
        this.in_nr = in_nr;
    }
}

class InputItem{
    constructor(input, channel, name, color) {
        this.input = input;
        this.channel = channel;
        this.name = name;
        this.color = color;
    }

    get_tableHead() {
        return ['Input', 'Channel', 'Name', 'Color'];
    }

    get_tableEntry() {
        return [this.input, this.channel, this.name, this.color];
    }

    get_styleClass() {
        return 'color' + this.color;
    }
}

class OutputItem{
    constructor(output, source, name=null, color=null) {
        this.output = output;
        this.source = source;
        this.name = name;
        this.color = color;
    }

    get_tableHead() {
        return ['Output', 'Quelle', 'Name', 'Color']
    }

    get_tableEntry() {
        return [this.output, this.channel, this.name, this.color]
    }

    get_styleClass() {
        if(this.color !== null) {
            return 'color' + this.color;            
        }
        return null
    }
}

class InputList{
    constructor() {
        this.in_map = new Map([
            [40, 'USB-2'],
            [39, 'USB-1'],
            [38, 'AUX-6'],
            [37, 'AUX-5'],
            [36, 'AUX-4'],
            [35, 'AUX-3'],
            [34, 'AUX-2'],
            [33, 'AUX-1']
        ]);
    }

    set_input(nr, id) {
        this.in_map.set(nr, id);
    }

    get_input(nr) {
        return this.in_map.get(nr);
    }

    get_num_for(id) {
        for(let[k, v] of this.in_map) {
            if (v == id) {
                return k;
            }
        }
    }

    has_id(id) {
        for(let[k, v] of this.in_map) {
            if (v == id) {
                return true;
            }
        }
        return false;
    }
}

function load_scene(input_elem) {
    // console.log(input_elem);
    selected_file = input_elem.files[0];
    console.log("Load scene file: " + selected_file);
    proceed();
}

function proceed() {
    if(selected_file == null) {
        console.error("No file is selected!");
    } else if(file_content == null) {
        read_text_file(selected_file);
    } else if(true) {
        parse_channels();
        // console.log(channels);
        create_input_list();
        // console.log(ip_list);
        parse_inputs_patch();
        // console.log(inList);
        link_channels_to_ip();
        console.log(ip_chan_list);
        build_table('inputtable', ip_chan_list);

        op_chan_list = []
        op_chan_list.push(new OutputItem('TEST1', 'testitestitest'));
        build_table('outputtable', op_chan_list);

        init_filtertable();
    }

}


function read_text_file(file_obj) {
    var reader = new FileReader();
    reader.addEventListener('load', function(e) {
        file_content = e.target.result.split('\n');
        // console.log(file_content);
        proceed();
    });
    reader.readAsText(file_obj);
}

function parse_channels(){
    console.log("Parse channels");
    file_content.forEach(line => {
        if(/^\/(ch|auxin)\/\d\d\/config/.test(line)){
            var ch_dir = 'in';
            var ch_type = line.split('/')[1];
            var ch_num = line.split('/')[2];
            var ch_name = line.split('"')[1];
            var ch_color = line.split(' ')[line.split(' ').length-2];
            var ch_ip = line.split(' ')[line.split(' ').length-1];
            // console.log([ch_dir, ch_type, ch_num, ch_name, ch_color, ch_ip])
            channels.push(new Channel('in', ch_type, ch_num, ch_name, ch_color, ch_ip));

        } else if(/^\/(fxrtn|bus|mtx|main)\/(\d\d|st|m)\/config/.test(line)){
            var ch_dir = 'out';
            var ch_type = line.split('/')[1];
            var ch_num = line.split('/')[2];
            var ch_name = line.split('"')[1];
            var ch_color = line.split(' ')[line.split(' ').length-1];
            // console.log([ch_dir, ch_type, ch_num, ch_name, ch_color]);
            channels.push(new Channel('out', ch_type, ch_num, ch_name, ch_color));
        }
    });
}

function create_input_list() {
    console.log("Create input-list")
    channels.forEach(channel => {
        if(channel.dir=='in'){
            ip_list.set(Number(channel.in_nr), channel);
        }
    });
}

function parse_inputs_patch() {
    console.log("Parse inputs patch");
    file_content.forEach(line => {
        if(/^\/config\/routing\/IN/.test(line)){
            name = line.split(' ')[0].split('/')[3];
            var counter = 0;
            inList = new InputList();
            line.split(name)[1].split(' ').forEach(block => {
                regexp = /(AN|A|B|CARD|AUX)(\d\d?)\-(\d\d?)/
                if(regexp.test(block)){
                    var match = regexp.exec(block);
                    var src = match[1];
                    var start = parseInt(match[2]);
                    var end = parseInt(match[3]);
                    for(var i=0; i<=end-start; i++){
                        counter++;
                        inList.set_input(counter, src + '-' + String(start + i));
                    }
                }
            });
        }
    });
}


function link_channels_to_ip(){
    ip_chan_list = [];
    [
        ['AN', 32],
        ['A', 48],
        ['B', 48],
        ['CARD', 32],
        ['AUX', 6],
        ['USB', 2]
    ].forEach( pair => {
        for(var i=1; i<=pair[1]; i++) {
            var id = pair[0] + '-' + String(i);
            if(inList.has_id(id)) {
                var in_nr = inList.get_num_for(id);
                if(ip_list.has(in_nr)) {
                    var this_chan = ip_list.get(in_nr);
                    ip_chan_list.push(new InputItem(
                        id,
                        this_chan.type + this_chan.num,
                        this_chan.name,
                        this_chan.color
                    ));
                }
            }
        }
    });
}

function build_table(id, list){
    var table = document.querySelector('#' + id + ' table');
    // Clean previous runs
    console.log(table.childElementCount);
    table.innerHTML = '';
    table.innerText = '';
    console.log(table.childElementCount);
    while(table.childElementCount) {
        table.removeChild(table.firstChild);
    }
    console.log(table.childElementCount);
    // Build head
    var thead = document.createElement('thead');
    table.appendChild(thead);
    var trow = document.createElement('tr');
    list[0].get_tableHead().forEach(caption => {
        var n_cap = document.createElement('th');
        n_cap.innerText = caption;
        trow.appendChild(n_cap);
    });
    thead.appendChild(trow);
    
    // Build body
    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    list.forEach(out_item => {
        var trow = document.createElement('tr');
        if(out_item.get_styleClass() !== null) {
            trow.classList.add(out_item.get_styleClass());
        }
        out_item.get_tableEntry().forEach(value =>{
            var n_cel = document.createElement('td');
            n_cel.innerText = value;
            trow.appendChild(n_cel);
        });
        tbody.appendChild(trow);
    });
}
