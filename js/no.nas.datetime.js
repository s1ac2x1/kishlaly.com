var no;

//Create global symbol no if it doesn't exist. Throw an error if it exists but is not an object
if (!no) no = {};
else if (typeof no != "object")
    throw new Error("no already exists and is not an object!");

// Create symbol no.nas if it doesn't exist. Throw an error if it exists but is not an object
if (!no.nas) no.nas = {};
else if (typeof no.nas != "object")
    throw new Error("no.nas already exists and is not an object!");

/**
 * Supported input:
 * new no.nas.DateTime() => "now"
 * new no.nas.DateTime("2011-01-01 23:59:50.123")
 * new no.nas.DateTime("2011-01-01 23:59:50.123+02:00")
 * new no.nas.DateTime(2011, 1, 1)
 * new no.nas.DateTime(2011, 1, 1, 23)
 * new no.nas.DateTime(2011, 1, 1, 23, 59)
 * new no.nas.DateTime(2011, 1, 1, 23, 59, 50)
 * new no.nas.DateTime(2011, 1, 1, 23, 59, 50, 123)
 */
no.nas.DateTime = function() {
    if (arguments.length == 0) {
        // Initialize all fields to "now" from a Date object
        var now  = new Date();
        this.year         = arguments[0] || now.getFullYear();
        this.month        = arguments[1] || now.getMonth() + 1;
        this.date         = arguments[2] || now.getDate();
        this.hours        = arguments[3] || now.getHours();
        this.minutes      = arguments[4] || now.getMinutes();
        this.seconds      = arguments[5] || now.getSeconds();
        this.milliseconds = arguments[6] || now.getMilliseconds();
    } else if (arguments.length >= 3) {
        // Initialize from int parameters
        this.year         = arguments[0];
        this.month        = arguments[1];
        this.date         = arguments[2];
        this.hours        = arguments[3] || 0;
        this.minutes      = arguments[4] || 0;
        this.seconds      = arguments[5] || 0;
        this.milliseconds = arguments[6] || 0;
    } else {
        throw("Invalid number of arguments " + arguments.length + "!");
    }
}

no.nas.DateTime.prototype.toString = function() {
    var zeroPad = no.nas.util.zeroPad;

    return zeroPad(this.year, 4) + "-" + zeroPad(this.month) + "-" + zeroPad(this.date) + " " + zeroPad(this.hours) +
           ":" + zeroPad(this.minutes) + ":" + zeroPad(this.seconds) + "." + zeroPad(this.milliseconds, 3);
}

no.nas.DateTime.prototype.toShortString = function() {
    var zeroPad = no.nas.util.zeroPad;

    var shortString = zeroPad(this.year, 4) + "-" + zeroPad(this.month) + "-" + zeroPad(this.date);
    if (this.hours != 0 || this.minutes != 0) {
        shortString += " " + zeroPad(this.hours) + ":" + zeroPad(this.minutes) + ":" + zeroPad(this.seconds);
    }
    return shortString;
}


// Getters / Setters
no.nas.DateTime.prototype.getYear         = function()   { return this.year; }
no.nas.DateTime.prototype.setYear         = function(y)  { this.year = parseInt(y, 10); }
no.nas.DateTime.prototype.getMonth        = function()   { return this.month; }
no.nas.DateTime.prototype.setMonth        = function(m)  { this.month = parseInt(m, 10); }
no.nas.DateTime.prototype.getDate         = function()   { return this.date; }
no.nas.DateTime.prototype.setDate         = function(d)  { this.date = parseInt(d, 10); }
no.nas.DateTime.prototype.getHours        = function()   { return this.hours; }
no.nas.DateTime.prototype.setHours        = function(h)  { this.hours = parseInt(h, 10); }
no.nas.DateTime.prototype.getMinutes      = function()   { return this.minutes; }
no.nas.DateTime.prototype.setMinutes      = function(m)  { this.minutes = parseInt(m, 10); }
no.nas.DateTime.prototype.getSeconds      = function()   { return this.seconds; }
no.nas.DateTime.prototype.setSeconds      = function(s)  { this.seconds = parseInt(s, 10); }
no.nas.DateTime.prototype.getMilliseconds = function()   { return this.milliseconds; }
no.nas.DateTime.prototype.setMilliseconds = function(ms) { this.milliseconds = parseInt(ms, 10); }
no.nas.DateTime.prototype.getOffset       = function()   { return this.offset; }
no.nas.DateTime.prototype.setOffset       = function(o)  { this.offset = o; }
//For compatibility with JS Date
no.nas.DateTime.prototype.getFullYear     = function()   { return this.getYear(); } 
no.nas.DateTime.prototype.setFullYear     = function(y)  { this.setYear(y); }

// "Static" methods

/**
 * Supported input:
 * no.nas.DateTime.parse("2011-01-01")
 * no.nas.DateTime.parse("2011-01-01 23:59")
 * no.nas.DateTime.parse("2011-01-01 23:59:50")
 * no.nas.DateTime.parse("2011-01-01 23:59:50.123")
 * no.nas.DateTime.parse("2011-01-01 23:59:50.123+02:00")
 * no.nas.DateTime.parse("2011-01-01T23:59:50.123+02:00")
 */
no.nas.DateTime.parse = function(string) {
    // Parse date string
    var dateParts = string.match(/^(\d{4})-(\d{2})-(\d{2})\s?(.*)/);
    if (!dateParts || dateParts.length < 3) {
        throw new Error("Invalid format of string: " + string);
    }

    var dt = new no.nas.DateTime(0, 0, 0, 0, 0, 0, 0);
    dt.setYear(dateParts[1]);
    dt.setMonth(dateParts[2]);
    dt.setDate(dateParts[3]);

    if (dateParts[4]) {
        // Parse time string
        var timeParts = dateParts[4].match(/([+-]?\d{2,3})/g);
        dt.setHours(timeParts[0] || 0);
        dt.setMinutes(timeParts[1] || 0);
        dt.setSeconds(timeParts[2] || 0);
        dt.setMilliseconds(timeParts[3] || 0);
        if (timeParts[4] && timeParts[5]) {
            dt.setOffset(timeParts[4] + ":" + timeParts[5]);
        } else {
            dt.setOffset("+00:00");
        }
    }
    return dt;
}

no.nas.DateTime.fromObject = function(object) {
    var dt = new no.nas.DateTime(0, 0, 0, 0, 0, 0, 0);
    dt.setYear(object.year || 0);
    dt.setMonth(object.month || 0);
    dt.setDate(object.date || 0);
    dt.setHours(object.hours || 0);
    dt.setMinutes(object.minutes || 0);
    dt.setSeconds(object.seconds || 0);
    dt.setMilliseconds(object.milliseconds || 0);
    dt.setOffset(object.offset || "+00:00");
    return dt;
}

