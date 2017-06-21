var no;

//Create global symbol no if it doesn't exist. Throw an error if it exists but is not an object
if (!no) no = {};
else if (typeof no != "object")
    throw new Error("no already exists and is not an object!");

// Create symbol no.nas if it doesn't exist. Throw an error if it exists but is not an object
if (!no.nas) no.nas = {};
else if (typeof no.nas != "object")
    throw new Error("no.nas already exists and is not an object!");

//Create symbol no.nas.util if it doesn't exist. Throw an error if it exists but is not an object
if (!no.nas.util) no.nas.util = {};
else if (typeof no.nas != "object")
    throw new Error("no.nas.util already exists and is not an object!");


/**
 * Zero-pads a value.
 * 
 * @param value the value to zero-pad
 * @param numberOfDigits the minimum number of digits after padding. Optional parameter defaults to 2.
 */
no.nas.util.zeroPad = function(value, numberOfDigits) {
    var num = numberOfDigits || 2;
    var s = "" + value;
    for (var i = s.length; i < num; i++) {
        s = "0" + s;
    }
    return s;
}
