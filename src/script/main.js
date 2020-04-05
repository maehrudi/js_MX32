
var ip_chan_list;
var op_chan_list;

let DEBUG = false;


function convert_op_num_to_id(num_in) {
    var num = Number(num_in);
    if (num == 0) { return 'off' }
    if (num == 1) { return 'main-l' }
    if (num == 2) { return 'main-r' }
    if (num == 3) { return 'main-m' }
    num = num - 3;
    if (num <= 16) { return 'bus-' + add_leading_chars(num, 2, '0') }
    num = num - 16;
    if (num <= 6) { return 'mtx-' + add_leading_chars(num, 2, '0') }
    num = num - 6;
    if (num <= 32) { return 'ch-' + add_leading_chars(num, 2, '0') }
    num = num - 32;
    if (num <= 8) { return 'auxin-' + add_leading_chars(num, 2, '0') }
    num = num - 8;
    if (num <= 8) { return 'fxrtn-' + add_leading_chars(num, 2, '0') }
    num = num - 8;
    if (num == 1) { return 'MonL' }
    if (num == 2) { return 'MonR' }
    if (num == 3) { return 'TB' }
    throw 'Unknown source ' + num_in
}


function load_scene(input_elem) {
    // console.log(input_elem);
    var selected_file = input_elem.files[0];
    console.log("Load scene file: " + selected_file);
    var reader = new FileReader();
    reader.addEventListener('load', function(e) {
        var file_content = e.target.result.split('\n');
        var m_i_c = new MixerItemContainer()
        var ch_ip_map = new Map();
        
        // Parse channels
        file_content.forEach(line => {
            if(/^\/(ch|auxin|fxrtn|bus|mtx)\/(\d\d)\/config/.test(line)){
                var ch_type = line.split('/')[1];
                var ch_num = line.split('/')[2];
                var ch_name = line.split('"')[1];
                if (['ch', 'auxin'].includes(ch_type)){
                    var ch_color = line.split(' ')[line.split(' ').length-2];
                } else {
                    var ch_color = line.split(' ')[line.split(' ').length-1];
                }
                var ch_id = m_i_c.addChannel(ch_type, ch_num, ch_name, ch_color);
                if (['ch', 'auxin'].includes(ch_type)){
                    var ch_ip = Number(line.split(' ')[line.split(' ').length-1]);
                    if (ch_ip != 0) {
                        ch_ip_map.set(ch_ip, ch_id);
                    }
                }
            }
            if(/^\/(main)\/(st|m)\/config/.test(line)){
                var ch_type = line.split('/')[1];
                var ch_num = line.split('/')[2];
                var ch_name = line.split('"')[1];
                var ch_color = line.split(' ')[line.split(' ').length-1];
                if (ch_num == 'st') {
                    m_i_c.addNamedItem(ch_type + '-l', ch_name, ch_color);
                    m_i_c.addNamedItem(ch_type + '-r', ch_name, ch_color);
                } else {
                    m_i_c.addNamedItem(ch_type + '-' + ch_num, ch_name, ch_color);
                }
            }
        });
        if (DEBUG) { console.log(m_i_c.itemMap); }
        if (DEBUG) { console.log(ch_ip_map); }

        // parse input-patch
        var in_rout_count;
        file_content.forEach(line => {
            if(/^\/config\/routing\/IN/.test(line)){
                name = line.split(' ')[0].split('/')[3];
                var counter = 0;
                line.split(name)[1].split(' ').forEach(block => {
                    regexp = /(AN|A|B|CARD|AUX)(\d\d?)\-(\d\d?)/
                    if(regexp.test(block)){
                        var match = regexp.exec(block);
                        var src = match[1];
                        var start = parseInt(match[2]);
                        var end = parseInt(match[3]);
                        
                        if (src == 'CARD') { src = 'C'; }
                        
                        for(var i=0; i<=end-start; i++){
                            counter++;
                            tar_id = ch_ip_map.get(counter);
                            m_i_c.addUnnamedItem(MixerItemContainer.buildId(src, start + i), tar_id);
                        }
                    }
                });
                in_rout_count = counter;                
            }
        });
        if(DEBUG){console.log(m_i_c.itemMap);}
        // create fixed inputs
        new Map([
            [40, 'USB-02'], [39, 'USB-01'],
            [38, 'AUX-06'], [37, 'AUX-05'],
            [36, 'AUX-04'], [35, 'AUX-03'],
            [34, 'AUX-02'], [33, 'AUX-01']
        ]).forEach( function(val, key, map) {
            if (key > in_rout_count) {
            // if (!m_i_c.getIdExists(val)) {
                tar_id = ch_ip_map.get(key);
                m_i_c.addUnnamedItem(val, tar_id);
            }
        });
        if(DEBUG){console.log(m_i_c.itemMap);}
        
        // parse core-outputs
        file_content.forEach(line => {
            if(/^\/outputs\/(main|aux|p16|aes|rec)\/(\d+) (\d+) /.test(line)){
                var op_type = line.split('/')[2];
                var op_num = line.split('/')[3].split(' ')[0];
                var src_num = line.split(' ')[1];
                var src_id = convert_op_num_to_id(src_num);
                m_i_c.addUnnamedItem(MixerItemContainer.buildId(op_type, op_num), src_id);
            }
        })
        if(DEBUG){console.log(m_i_c.itemMap);}
        // parse output patch
        file_content.forEach(line => {
            if(/^\/config\/routing\/(AES50[AB]|CARD|OUT)/.test(line)){
                name = line.split(' ')[0].split('/')[3];
                var counter = 0;
                line.split(' ').slice(1).forEach(block => {

                    regexp = /(OUT|AN|A|B|CARD|P16)(\d\d?)\-(\d\d?)/
                    if(regexp.test(block)){
                        var match = regexp.exec(block);
                        var src = match[1];
                        var start = parseInt(match[2]);
                        var end = parseInt(match[3]);
                        if (src == 'OUT') { src = 'main'}
                        if (src == 'P16') { src = 'p16'}
                        
                        for(var i=0; i<=end-start; i++){
                            counter++;
                            m_i_c.addOutput(name, counter, src, start + i)
                        }
                    }
                    // special handling
                    if (['AUX/CR', 'AUX/TB'].includes(block)){
                        var blockSources;
                        // special aux-out, monitor
                        if (block == 'AUX/CR') {
                            blockSources = [
                                'aux-01',
                                'aux-02',
                                'aux-03',
                                'aux-04',
                                'aux-05',
                                'aux-06',
                                'mon-l',
                                'mon-r'
                            ]
                        }
                        // special aux-in, talkback
                        if (block == 'AUX/TB') {
                            blockSources = [
                                'AUX-01',
                                'AUX-02',
                                'AUX-03',
                                'AUX-04',
                                'AUX-05',
                                'AUX-06',
                                'Talkback',
                                'Talkback'
                            ]
                        }
                        if (name == 'OUT'){
                            if (counter % 8 == 0){
                                blockSources = blockSources.slice(0, 4);
                            } else {
                                blockSources = blockSources.slice(4, 8);
                            }
                        }
                        blockSources.forEach(blockItem => {
                            counter++;
                            m_i_c.addUnnamedItem(MixerItemContainer.buildId(name, counter), blockItem);
                        });
                    }
                });
            }
        })
        if(DEBUG){console.log(m_i_c.itemMap);}


        visualize(m_i_c);
    });
    reader.readAsText(selected_file);
}

function visualize(mixer_item_container){
    all_inputs = get_full_input_set();
    if(DEBUG) { console.log(all_inputs); }
    build_table(mixer_item_container, 'inputtable', all_inputs);
    all_outputs = get_full_output_set();
    if(DEBUG) { console.log(all_outputs); }
    build_table(mixer_item_container, 'outputtable', all_outputs);
    

    init_filtertable();
}

function get_full_set(counts){
    var full_set = [];
    counts.forEach(pair => {
        for (let i = 1; i <= pair[1]; i++) {
            full_set.push(MixerItemContainer.buildId(pair[0], i));
        }
    })
    return full_set;
}

function get_full_input_set(){
    return get_full_set([['AN', 32], ['A', 48], ['B', 48], ['C', 32], ['AUX', 6], ['USB', 2]]);
}

function get_full_output_set(){
    return get_full_set([['AES50A', 48], ['AES50B', 48], ['CARD', 32], ['OUT', 16], ['p16', 16], ['aux', 6], ['rec', 2], ['aes', 2]]);
}

function build_table(mixer_item_container, table_id, list){
    var table = document.querySelector('#' + table_id + ' table');
    // Clean previous runs
    table.innerHTML = '';
    table.innerText = '';
    while(table.childElementCount) {
        table.removeChild(table.firstChild);
    }
    // Build head
    var thead = document.createElement('thead');
    table.appendChild(thead);
    var trow = document.createElement('tr');
    MixerItemContainer.getTableHead().forEach(caption => {
        var n_cap = document.createElement('th');
        n_cap.innerText = caption;
        trow.appendChild(n_cap);
    });
    thead.appendChild(trow);
    
    // Build body
    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    list.forEach(id => {
        var trow = document.createElement('tr');
        trow.classList.add(mixer_item_container.getStyleClassForId(id));
        mixer_item_container.getTableEntryForId(id).forEach(value =>{
            var n_cel = document.createElement('td');
            n_cel.innerText = value;
            trow.appendChild(n_cel);
        });
        tbody.appendChild(trow);
    });
}

//
