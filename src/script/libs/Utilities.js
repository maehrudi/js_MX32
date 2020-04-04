


function add_leading_chars(num_in, len, char) {
    var num = String(num_in);
    while(num.length < len) {
        num = String(char) + num;
    }
    return num
}


