
var file_content = null;
var selected_file = null;

var channels = [];
var ip_list = new Map();

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
            ip_list.set(channel.get('ip'), channel);
        }
    });
}


