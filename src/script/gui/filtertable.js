
// enable filtering for tables marked with class "filtertable"

function init_filtertable() {
    console.log("init_filtertable")

    document.querySelectorAll('.filtertable').forEach(element => {
        var hrow = element.querySelector('thead tr');
        var filterrow = document.createElement('tr');
        hrow.childNodes.forEach(t_cap => {
            var new_tr = document.createElement('td');
            var new_ip = document.createElement('input');
            new_tr.appendChild(new_ip);
            filterrow.appendChild(new_tr);
        });
        element.querySelector('thead').appendChild(filterrow);


        element.addEventListener('keyup', function(event){
            // get filterset
            var filterset = [];
            filterrow.querySelectorAll('input').forEach(input_elem => {
                filterset.push(input_elem.value);
            });
            // filter table for matching sets
            element.querySelectorAll('tbody tr').forEach(this_row => {
                var match = true;
                for (let i = 0; i < filterset.length; i++) {
                    const filterval = filterset[i].toLowerCase();
                    if (filterval.length > 0) {
                        if (!this_row.childNodes[i].innerText.toLowerCase().includes(filterval)) {
                            var match = false;
                            break;
                        }
                    }
                }
                if (match) {
                    this_row.style.display = '';
                } else {
                    this_row.style.display = 'none';
                }
            });
        });
    });
}

//
