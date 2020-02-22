
var file_content = null;
var selected_file = null;

var channels = [];
var ip_list = new Map();
var inList = new Map();
var ip_chan_list = [];

function load_scene(input_elem) {
    console.log(input_elem);
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
        console.log(channels);
        create_input_list();
        console.log(ip_list);
        parse_inputs_patch();
        console.log(inList);
        link_channels_to_ip();
        console.log(ip_chan_list);
        build_input_table();

    }

}


function read_text_file(file_obj) {
    var reader = new FileReader();
    reader.addEventListener('load', function(e) {
        file_content = e.target.result.split('\n');
        console.log(file_content);
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
            channels.push(
                new Map([
                    ['dir', ch_dir],
                    ['type', ch_type],
                    ['num', ch_num],
                    ['name', ch_name],
                    ['color', ch_color],
                    ['ip', ch_ip]
                ])
            );

        } else if(/^\/(fxrtn|bus|mtx|main)\/(\d\d|st|m)\/config/.test(line)){
            var ch_dir = 'out';
            var ch_type = line.split('/')[1];
            var ch_num = line.split('/')[2];
            var ch_name = line.split('"')[1];
            var ch_color = line.split(' ')[line.split(' ').length-1];
            // console.log([ch_dir, ch_type, ch_num, ch_name, ch_color]);
            channels.push(
                new Map([
                    ['dir', ch_dir],
                    ['type', ch_type],
                    ['num', ch_num],
                    ['name', ch_name],
                    ['color', ch_color]
                ])
            );
        }
    });
}

function create_input_list() {
    console.log("Create input-list")
    channels.forEach(channel => {
        if(channel.get('dir')=='in'){
            ip_list.set(Number(channel.get('ip')), channel);
        }
    });
}

function parse_inputs_patch() {
    console.log("Parse inputs patch");
    file_content.forEach(line => {
        if(/^\/config\/routing\/IN/.test(line)){
            name = line.split(' ')[0].split('/')[3];
            var counter = 0;
            inList = new Map([
                [40, 'USB-2'],
                [39, 'USB-1'],
                [38, 'AUX-6'],
                [37, 'AUX-5'],
                [36, 'AUX-4'],
                [35, 'AUX-3'],
                [34, 'AUX-2'],
                [33, 'AUX-1']
            ]);
            line.split(name)[1].split(' ').forEach(block => {
                regexp = /(AN|A|B|CARD|AUX)(\d\d?)\-(\d\d?)/
                if(regexp.test(block)){
                    var match = regexp.exec(block);
                    var src = match[1];
                    var start = parseInt(match[2]);
                    var end = parseInt(match[3]);
                    for(var i=0; i<=end-start; i++){
                        counter++;
                        inList.set(counter, src + '-' + String(start + i));
                    }
                }
            });
        }
    });
}


function link_channels_to_ip(){
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
            for(let [k, v] of inList){
                if(id == v && ip_list.has(k)) {
                    // console.log(id, k, v, ip_list.get(k));
                    var this_chan = ip_list.get(k);
                    ip_chan_list.push(new Map([
                        ['input', id],
                        ['channel', this_chan.get('type') + this_chan.get('num')],
                        ['name', this_chan.get('name')],
                        ['color', this_chan.get('color')]
                    ]));
                    break;
                }
            }
        }
    });
}

function build_input_table(){
    var heads = [
        ['Input', 'Channel', 'Name', 'Color'],
        ['input', 'channel', 'name', 'color']
    ]
    // Build head
    var thead = document.querySelector('#inputtable table thead');
    // Clean previous runs
    while(thead.firstChild) {
        thead.removeChild(thead.firstChild);
    }
    // Fill new
    var trow = document.createElement('tr');
    heads[0].forEach(caption => {
        var n_cap = document.createElement('th');
        n_cap.innerText = caption;
        trow.appendChild(n_cap);
    });
    thead.appendChild(trow);
    
    // Build body
    var tbody = document.querySelector('#inputtable table tbody');
    // Clean previous runs
    while(tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    // Fill new
    ip_chan_list.forEach(channel => {
        var trow = document.createElement('tr');
        trow.classList.add('color'+channel.get('color'));
        heads[1].forEach(key =>{
            var n_cel = document.createElement('td');
            n_cel.innerText = channel.get(key);
            trow.appendChild(n_cel);
        });
        tbody.appendChild(trow);
    });

    init_filtertable();

}
