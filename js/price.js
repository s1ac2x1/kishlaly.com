/* $Id$ */

function mirrorLegs(element) {
    temp = element.form.departureAirportCode.value;
    element.form.departureAirportCode.value = element.form.arrivalAirportCode.value;
    element.form.arrivalAirportCode.value = temp;
}


function enableInput(fareClass) {
    document.getElementById("undefinedFareClassesToEnable").value += fareClass;
}


function setAirportCode(departureAirportCode, arrivalAirportCode) {
    if (departureAirportCode != null) {
        document.getElementById("departureAirportCode").value = departureAirportCode;
    }
    if (arrivalAirportCode != null) {
        document.getElementById("arrivalAirportCode").value = arrivalAirportCode;
    }
}


function legShortcut(departureAirportCode, arrivalAirportCode) {
    setAirportCode(departureAirportCode, arrivalAirportCode);
    document.forms.retrieveLegForm.submit();
}

function getElementsByClassName(parentElement, className) {
	if(parentElement.getElementsByClassName) {
		return parentElement.getElementsByClassName(className);
	}
	if (Prototype.BrowserFeatures.XPath) {
	    var q = ".//*[contains(concat(' ', @class, ' '), ' " + className + " ')]";
	    return document._getElementsByXPath(q, parentElement);
	} else {
	    var children = ($(parentElement) || document.body).getElementsByTagName('*');
	    var elements = [], child;
	    for (var i = 0, length = children.length; i < length; i++) {
	      child = children[i];
	      if (Element.hasClassName(child, className))
	        elements.push(Element.extend(child));
	    }
	    return elements;
	}
}

function saveScrollXY() {
    var scrollX = 0, scrollY = 0;
    if (typeof(window.pageYOffset) == 'number') {
        //Netscape compliant
        scrollY = window.pageYOffset;
        scrollX = window.pageXOffset;
    }
    else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
        //DOM compliant
        scrollY = document.body.scrollTop;
        scrollX = document.body.scrollLeft;
    }
    else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
            //IE6 standards compliant mode
            scrollY = document.documentElement.scrollTop;
            scrollX = document.documentElement.scrollLeft;
        }
    document.getElementById("scrollX").value = scrollX;
    document.getElementById("scrollY").value = scrollY;
}


function restoreScrollPosition() {
    if (document.getElementById("actionErrors") != null) {
        //do not scroll down when action errors
        return;
    }
    var scrollX, scrollY;
    scrollX = document.getElementById("scrollX");
    scrollY = document.getElementById("scrollY");
    if (scrollX && scrollY) {
        window.scrollTo(scrollX.value, scrollY.value);
    }
}

function popup(link, width, height) {
    var url = typeof (link.href) != "undefined" ? link.href : link;
    var newWin = window.open(url, 'popup', 'width=' + width + ",height=" + height + ",menubar=no,toolbar=no,scrollbars=yes,resizable=yes");
    if (window.focus) {
        newWin.focus();
    }
    return false;
}

function popupGraph(link) {
   return popup(link, 850, 625);
}

/** Used when clicking transit in tax bulk updates */
function transitChanged(event) {
    event = !event ? Event.extend(window.event) : Event.extend(event);
    var currencyBoxes = $("currencyVatTable").getElementsBySelector('input[id ^= "currency-"][type = "checkbox"]');
    var includeTransit = $("transit") ? $("transit").checked : false;
    var currencies = [];
    for (var i = 0, size = currencyBoxes.length; i < size; i++) {
        var currencyBox = currencyBoxes[i];
        if (currencyBox.checked) {
            currencies.push(currencyBox.value);
            if (includeTransit) {
                currencies.push(currencyBox.value + "_TRANSIT");
            }
        }
    }
    updateTableWithCurrencies(currencies);
}

/** Used when changing currency in bulk updates */
function currencyChanged(event) {
    event = !event ? Event.extend(window.event) : Event.extend(event);
    var currencyBoxes = $("currencyVatTable").getElementsBySelector('input[id ^= "currency-"][type = "checkbox"]');
    var isTaxForm = $("transit") ? true : false;
    var includeTransit = $("transit") ? $("transit").checked : false;
    var currencies = [];
    for (var i = 0, size = currencyBoxes.length; i < size; i++) {
        var currencyBox = currencyBoxes[i];
        if (currencyBox.checked) {
            var currency = currencyBox.value;
            if (!isTaxForm && currency == "NOK") {
                // All other forms than tax form has a mandatory NOK row
                continue;
            }

            currencies.push(currency);
            if (includeTransit) {
                currencies.push(currency + "_TRANSIT");
            }
        }
    }
    updateTableWithCurrencies(currencies);
}


function updateTableWithCurrencies(currencies) {
    var table = $("dataTable");
    var mainRow = $(table.rows[2]);
    var updateRowSpan = true;
    var isTaxForm = $("transit") ? true : false;

    if (isTaxForm && currencies.length == 0) {
        // Blank out cells in main row
        var currencyCell = $(mainRow.cells[1]);
        var inputCell = $(mainRow.cells[2]);
        currencyCell.update("");
        inputCell.update("");
    } else {
        // Create rows for currencies
        for (var i = 0, size = currencies.length; i < size; i++) {
            var currency = currencies[i];
            var currencyCell = null;
            var inputCell = null;
            if (isTaxForm && i == 0) {
                currencyCell = $(mainRow.cells[1]);
                inputCell = $(mainRow.cells[2]);
            } else {
                var newRowIndex = isTaxForm ? 2 + i : 3 + i;
                var newRow = $(table.insertRow(newRowIndex));
                newRow.addClassName("odd");
                currencyCell = $(newRow.insertCell(0));
                inputCell = $(newRow.insertCell(1));
            }
            // Set content in cells
            currencyCell.update(currency);
            var inputElement = new Element('input', {type: 'text', size: '7', name: "formRow.amountValues['" + currency + "']"});
            var imgElement = new Element('img', {src: '/price-web/images/help-about.png', onmouseover: 'amountInfo.showInfo(event)', onmouseout:'amountInfo.hideInfo(event)'});
            inputCell.update("");
            inputCell.insert(inputElement);
            inputCell.insert(imgElement);
        }
    }

    // Update rowspan attributes
    var rowSpan = (currencies.length == 0) ? 1 : currencies.length;
    if (!isTaxForm && currencies.length != 0) {
        // Other than tax form doesn't handle NOK, but NOK is "statically" handled
        rowSpan = rowSpan + 1;
    }

    for (var col = 0, size = mainRow.cells.length; col < size; col++) {
        if (col != 1 && col != 2) {
            mainRow.cells[col].rowSpan = rowSpan;
        }
    }
    // Cleanup "unused" rows
    for (var i = isTaxForm ? 2 + rowSpan : 2 + rowSpan; i < table.rows.length - 2; i++) {
        table.deleteRow(i--);
    }
}

function createHidden(name, value, className) {
	var element = new Element('input', {'type': 'hidden', 'name': name, 'value': value, 'class': className});
    return element;
}

var Price = {
    checkForPrototype: function() {
        if (typeof Prototype == 'undefined') {
            throw("price.js requires the Prototype JavaScript framework");
        }
    },

    extendPrototype: function() {
        Object.extend(Object, {
            isDateTime: function(object) {
                return (object instanceof no.nas.DateTime);
            },

            isDate: function(object) {
                return Object.prototype.toString.call(object) === "[object Date]";
            },

            isObject: function(object) {
                return !Object.isDateTime(object) && !Object.isDate(object) && (typeof object == "object");
            },

            isBoolean: function(object) {
                return (typeof object) == "boolean";
            }
        });
    },

    ajaxResponder: {
        onLoading: function() {
            if (Ajax.activeRequestCount > 0) {
                $("ajaxIndicator").show();
            }
        },

        onLoaded: function() {
            if (Ajax.activeRequestCount <= 1) {
                $("ajaxIndicator").hide();
            }
        }
    },

    message: function(containerId, msg) {
        var container = $(containerId);
        /* Create container if not exists */
        if (!container) {
            container = new Element('div', { id: containerId });
            $("messages").insert(container);
        }

        /* Create ul if not exists */
        var list = container.select("ul")[0];
        if (!list) {
            list = new Element("ul");
            container.insert(list);
        }

        /* Append to list */
        list.insert(new Element('li').update(msg));
    },

    messages: function(containerId, text) {
        var container = $(containerId);
        if (!container) {
            container = new Element('div', { id: containerId });
            $("messages").insert(container);
        }
        container.update(text);
    },

    showError: function(msg) {
        Price.message("actionErrors", msg);
    },

    showErrors: function(msg) {
        Price.messages("actionErrors", msg);
    },

    clearErrors: function() {
        if ($("actionErrors")) {
            $("actionErrors").remove();
        }
    },

    showMessage: function(msg) {
        Price.message("actionMessages", msg);
    },

    showMessages: function(msg) {
        Price.messages("actionMessages", msg);
    },

    clearMessages: function() {
        if ($("actionMessages")) {
            $("actionMessages").remove();
        }
    },

    Util: {
        onLoad: function(onLoadFunction) {
            if (typeof onLoadFunction == 'function') {
                /* TODO: dom:loaded trigger 2-3 times when used with SiteMesh, need to figure out why */
                /* document.observe('dom:loaded', onLoadFunction); */
                Event.observe(window, 'load', onLoadFunction);
            }
        },

        goToUrl: function(url) {
            location.href = url;
        },
        
        confirmAll: function(confirmAllCheckbox) {
        	console.log("here");
        	var checkboxes = $$('input.needToSave');
        	for ( var int = 0; int < checkboxes.length; int++) {
        		if (confirmAllCheckbox.checked) {
        			checkboxes[int].value = true;
        			checkboxes[int].checked = "checked";
        		} else {
        			checkboxes[int].value = false;
        			checkboxes[int].checked = false;
        		}
			}
        },
        
        change: function(element) {
        	if (element.checked) {
        		element.value = "true";
        	} else {
        		element.value = "false";
        	}
        },

        formatDate: function(date) {
            var formatted = "";
            formatted += date.getFullYear() + "-";
            formatted += Price.Util.zeroPad(date.getMonth() + 1) + "-";
            formatted += Price.Util.zeroPad(date.getDate());
            if (date.getHours() > 0 || date.getMinutes() > 0 || date.getSeconds() > 0) {
                formatted += " ";
                formatted += Price.Util.zeroPad(date.getHours()) + ":";
                formatted += Price.Util.zeroPad(date.getMinutes()) + ":";
                formatted += Price.Util.zeroPad(date.getSeconds());
            }

            return formatted;
        },

        parseDate: function(string) {
            var date = new Date(0, 0, 0, 0, 0, 0, 0);
            var dateParts = string.match(new RegExp("^(\\d{4})-(\\d{2})-(\\d{2})\\s?(.*)"));
            if (!dateParts || dateParts.length < 3) {
                return null;
            }
            date.setFullYear(dateParts[1]);
            /* Date must be set together with month or before month... */
            date.setMonth(dateParts[2] - 1, dateParts[3]);
            if (dateParts[4]) {
                var timeParts = dateParts[4].match(new RegExp("(\\d\\d\\d?)", "g"));
                if (!timeParts || timeParts.length < 2) {
                    return null;
                }
                for (var i = 0, size = timeParts.length; i < size; i++) {
                    if (i == 0) {
                        date.setHours(timeParts[i]);
                    } else if (i == 1) {
                        date.setMinutes(timeParts[i]);
                    } else if (i == 2) {
                        date.setSeconds(timeParts[i]);
                    } else if (i == 3) {
                        date.setMilliseconds(timeParts[i]);
                    }
                }
            }
            Price.Util.log("Parsed '" + string + "' to " + date);
            return date;
        },

        zeroPad: no.nas.util.zeroPad,

        Tomorrow: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 0, 0, 0, 0),
        Today: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0),
        Forever: new Date(9999, 0, 1, 0, 0, 0, 0),

        vatSelect: function(selected) {
            var callback = {
                getValue: function(vatCondition) {
                    return vatCondition.code;
                },
                getText: function(vatCondition) {
                    return vatCondition.description;
                }
            };
            return Price.Util.selectBox(vatConditions, selected, callback);
        },

        currencySelect: function(selected) {
            return Price.Util.selectBox(currencyCodes, selected);
        },

        productSelect: function(selected) {
            var callback = {
                getValue: function(product) {
                    return product.code;
                },
                getText: function(product) {
                    return product.description;
                }
            };
            return Price.Util.selectBox(products, selected, callback);
        },

        cabinSelect: function(selected) {
            var callback = {
                getValue: function(cabin) {
                    return cabin.code;
                },
                getText: function(cabin) {
                    return cabin.description;
                }
            };
            return Price.Util.selectBox(cabins, selected, callback);
        },
        
        ancillarySelect: function(selected) {
            var callback = {
                getValue: function(ancillary) {
                    return ancillary.code;
                },
                getText: function(ancillary) {
                    return ancillary.description;
                }
            };
            return Price.Util.selectBox(ancillarySelectList, selected, callback);
        },
        
        selectBox: function(data, selectedValue, callback, selectBox) {
            if (typeof selectBox == "undefined") {
                selectBox = new Element('select');
            }
            if (Object.isArray(data)) {
                for ( var index = 0, numOptions = data.length; index < numOptions; index++) {
                    var dataElement = data[index];
                    var option = new Element('option');
                    if (typeof callback != "undefined") {
                        option.value = callback.getValue(dataElement);
                        option.text = callback.getText(dataElement);
                    } else {
                        option.value = "" + dataElement;
                        option.text = "" + dataElement;
                    }
                    if (Prototype.Browser.IE) {
                        selectBox.add(option);
                    } else {
                        selectBox.add(option, null);
                    }
                    if (option.value == selectedValue) {
                        option.selected = true;
                    }
                }
            }
            return selectBox;
        },

        createNumberInput: function(value) {
            var numberInput = new Element('input', {
                'type': 'text',
                'class': 'number',
                'size': '7'
            });
            if (typeof value == 'number') {
                numberInput.value = value.toFixed(2);
            } else if (typeof value == 'string') {
                numberInput.value = value;
            }
            return numberInput;
        },
        
        log: function(value) {
        	if (this.isLogEnabled()) {
                if (Prototype.Browser.IE) {
                	value += '<br/>';
                } else {
                	value += "\n";
                }
        		$('debugLog').insert({bottom: value});
        	}
        },
        
        isLogEnabled: function() {
        	if ($('debugLog')) {
        		return true;
        	} else {
        		return false;
        	}
        },
        
        addLogListener: function() {
        	if ($('debugLog')) {
        		$('debugLog').observe('dblclick', function(event) {
    				$('debugLog').update("");
        		}.bindAsEventListener(this));
        	}
        },

        showEndPeriodForm: function(event, idToEnd) {
            event = !event ? Event.extend(window.event) : Event.extend(event);
        	Event.stop(event);
        	var skipLeg = false;
        	if (arguments.length == 3) {
        		skipLeg = arguments[2];
        	}
        	var endForm = $('endPeriodForm');
        	var offset = -5 - $(endForm.parentNode).getWidth();
        	$(endForm.parentNode).clonePosition(event.element(), {setWidth: false, setHeight:false, offsetLeft: offset});
        	$(endForm.parentNode).toggle();
        	endForm.idToEnd.value = idToEnd;
        	endForm.endDateTime.value = Price.Util.formatDate(Price.Util.Tomorrow);
        	if (!skipLeg) {
	        	endForm.departureAirportCode.value = $('departureAirportCode').value;
	        	endForm.arrivalAirportCode.value = $('arrivalAirportCode').value;
        	}
        	preventInputsObserver();
        },
        
        checkAll: function(parentNode) {
        	var parent = $(parentNode);
        	var checkboxes = parent.getElementsBySelector('input[type="checkbox"]');
        	for (var i = 0, size = checkboxes.length; i < size; i++) {
        		checkboxes[i].checked = true;
        	}
        },

        toParameters: function(value, name) {
            var hash = new Hash();
            if (Object.isArray(value)) {
                for ( var i = 0, size = value.length; i < size; i++) {
                    var valueName = name + "[" + i + "]";
                    hash.update(Price.Util.toParameters(value[i], valueName));
                }
            } else if (Object.isDate(value)) {
                hash.set(name, Price.Util.formatDate(value));
            } else if (Object.isDateTime(value)) {
                hash.set(name, value.toShortString());
            } else if (value != null && Object.isObject(value)) {
                var objectKeys = Object.keys(value);
                var objectValues = Object.values(value);
                for ( var i = 0, numKeys = objectKeys.length; i < numKeys; i++) {
                    var objectKey = objectKeys[i], objectValue = objectValues[i];
                    if (objectKey != "historic") { /* Skip 'historic' properties */
                        hash.update(Price.Util.toParameters(objectValue, name + "." + objectKey));
                    }
                }
            } else {
                hash.set(name, value);
            }
            return hash.toObject();
        },

        validateEarnFactor: function(earnFactor, warnLevelValue) {
            if (earnFactor != '') {
                earnFactor = parseFloat(earnFactor);
                if (isNaN(earnFactor)) {
                    // ...report bad earnFactorBankNorwegianValue...
                    alert('Invalid value!');
                } else if (earnFactor > warnLevelValue) {
                    alert('You have entered an earn factor of ' + (earnFactor * 100) + '%' + '\n' + 'If it was not intended please go back and change it.');
                }
            }

        },

        parseJSON: (function() {
            var dates          = ["validFromPurchaseDateTime", "validToPurchaseDateTime",
                                  "internalCreationDateTime", "internalRevisionDateTime",
                                  "validFromDepartureDate", "validToDepartureDate"];
            var dateTimes      = ["validFromDepartureDateTime", "validToDepartureDateTime"];
            var localDateTimes = [];

            function doFix(o) {
                if (!Object.isObject(o)) return;
                for (prop in o) {
                    if (o[prop] == null) { continue; }
                    dates.each(function(dtProp) {
                        if (prop === dtProp) {
                            o[prop] = Price.Util.parseDate(o[prop]);
                        }
                     });
                    dateTimes.each(function(dtProp) {
                        if (prop === dtProp) {
                            if (Object.isObject(o[prop])) { // Object when cloning via JSON
                                o[prop] = no.nas.DateTime.fromObject(o[prop]);
                            } else { // String from server
                                o[prop] = no.nas.DateTime.parse(o[prop]);
                            }
                        }
                    });
                    localDateTimes.each(function(ldtProp) {
                        if (prop === ldtProp) {
                            var a = o[prop];
                            o[prop] = new Date(a[0],a[1]-1,a[2],a[3],a[4],a[5],a[6]);
                        }
                    });
                    if (Object.isObject(o[prop])) {
                        fixDates(o[prop]);
                    }
                }
            }

            function fixDates(parsed) {
                if (Object.isArray(parsed)) {
                    parsed.each(function(o) { doFix(o); });
                } else {
                    doFix(parsed);
                }
            }

            function doParse(jsonString) {
                if (jsonString) {
                    var parsed = jsonString.evalJSON();
                    fixDates(parsed);
                    return parsed;
                }
                return undefined;
            }

            return doParse;
        })(),

        cloneObject: (function() {

            function massage(o) {
                for (prop in o) {
                    if (prop === "id" || prop === "internalCreationDateTime" || prop === "internalRevisionDateTime") {
                        // Empty known variables that we don't want in the clone
                        o[prop] = ''; //TODO: delete o[prop] instead? Empty values may cause issues in converting...
                    } else if (prop === "validFromPurchaseDateTime" || prop === "validFromDepartureDate") {
                        o[prop] = Price.Util.Tomorrow; // Set validFrom* values to tomorrow
                    } else if (prop === "validFromDepartureDateTime") {
                        o[prop] = no.nas.DateTime.parse(Price.Util.formatDate(Price.Util.Tomorrow)); // Set validFrom* values to tomorrow
                    } else if (prop === "validToPurchaseDateTime" || prop === "validToDepartureDate") {
                        o[prop] = Price.Util.Forever; // Set validTo* values to forever
                    } else if (prop === "validToDepartureDateTime") {
                        o[prop] = no.nas.DateTime.parse(Price.Util.formatDate(Price.Util.Forever)); // Set validFrom* values to tomorrow
                    } else if (prop === "historic") {
                        o[prop] = false; // Set historic property to false
                    }

                    // Recurse
                    if (Object.isObject(o[prop])) {
                        massage(o[prop]);
                    }
                }
            }

            function clone(o) {
                // Performs a deep-copy by first converting to JSON and then parsing it back into an object
                var clone = Price.Util.parseJSON(Object.toJSON(o));
                // Massage the clone
                massage(clone);

                return clone;
            }

            return clone;
        })()
    }
};

Price.checkForPrototype();
Price.extendPrototype();
Price.Util.onLoad(Price.Util.addLogListener);
Ajax.Responders.register(Price.ajaxResponder);

var LegFilter = Class.create({
    initialize: function (options) {
        this.options = options || { };
        this.observer = null;
        
        if (filterTypeSingleFlag) {
        	this.filter = $(this.options.filter) || $("filter");        	
        }
        if (filterTypeBulkFlag) {
        	this.filter = $(this.options.filter) || $("bulkLegsHighlight");
        }        
        this.form = $(this.filter.form);
        this.checkButton = $(this.options.checkButton) || $("checkButton");
        this.uncheckButton = $(this.options.uncheckButton) || $("uncheckButton");
        this.uncheckAllButton = $(this.options.uncheckButton) || $("uncheckAllButton");
        this.checkOppositesButton = $(this.options.checkOppositesButton) || $("checkOppositesButton");
        this.regionSelect = $(this.options.regionSelect) || $("regions");
        this.loadBox = $(this.options.loadBox) || $("loadingBox");
        this.delay = this.options.delay || 400;
        this.highlightCssClass = this.options.highlightCssClass || "highlighted";
        this.selectedCssClass = this.options.selectedCssClass || "selected";
        this.marketInputName = this.options.market || "market";
        this.marketFilter = null;
        this.flightLegPattern = /..._..-..._.._.?.?/;

        this.filter.observe('keypress', this.onKeyPress.bindAsEventListener(this));
        this.filter.observe('keyup', this.onKeyUp.bindAsEventListener(this));
        if (this.checkButton && this.uncheckButton) {
            this.checkButton.observe('click', this.onCheckButtonClicked.bindAsEventListener(this));
            this.uncheckButton.observe('click', this.onUncheckButtonClicked.bindAsEventListener(this));
            this.checkButton.disable();
            this.uncheckButton.disable();
        }
        if (this.uncheckAllButton) {
            this.uncheckAllButton.observe('click', this.onUncheckAllButtonClicked.bindAsEventListener(this));
        }
        if (this.checkOppositesButton) {
            this.checkOppositesButton.observe('click', this.onCheckOppositesButtonClicked.bindAsEventListener(this));
        }

        var checkBoxes = this.getLegCheckBoxes();
        var anyIsChecked = false;
        for (var i = 0, size = checkBoxes.length; i < size; i++) {
            var checkBox = $(checkBoxes[i]);
            if (checkBox.value.match(this.flightLegPattern)) {
	            checkBox.observe('click', this.onLegClicked.bindAsEventListener(this));
	            this.changeState(checkBox, checkBox.checked, false);
	            if (checkBox.checked && !anyIsChecked) {
	                anyIsChecked = true;
	            }
            }
        }

        if (!anyIsChecked) {
            if (this.uncheckAllButton) {
                this.uncheckAllButton.disable();
            }
            if (this.checkOppositesButton) {
                this.checkOppositesButton.disable();
            }
        }

        var marketInputs = $(this.form).getInputs('radio');
        for (var i = 0, size = marketInputs.length; i < size; i++) {
            var market = $(marketInputs[i]);
            if (market.name == this.marketInputName) {
                market.observe('click', this.onMarketChanged.bindAsEventListener(this));
            }
        }

        if (this.regionSelect) {
        	this.regionSelect.observe('change', this.onRegionSelected.bindAsEventListener(this));
        }
    },

    onMarketChanged: function (event) {
    	var radio = $(event.element());
    	if (this.marketFilter != null && radio.getValue() == this.marketFilter) {
    		this.marketFilter = null;
    		radio.checked = false;
    	} else {
    		this.marketFilter = radio.getValue();
    	}
        this.highlightSingle();
    },

    onKeyPress: function (event) {
        var key = event.keyCode || event.which;
        if (key == Event.KEY_RETURN) {
            //Event.stop(event); // Stops event and prevents form submission
        } else if (key == 48) { // 0
            Event.stop(event);
            this.toggleHighlighted(false);
        } else if (key == 49) { // 1
            Event.stop(event);
            this.toggleHighlighted(true);
        }
    },

    onKeyUp: function (event) {
        if (event.keyCode == Event.KEY_ESC) {
            this.filter.clear();
            var marketInputs = $(this.form).getInputs('radio');
            for (var i = 0, size = marketInputs.length; i < size; i++) {
            	if (marketInputs[i].id != 'filterTypeSingle' && marketInputs[i].id != 'filterTypeBulk') {
            		marketInputs[i].checked = false;
            	}
            }
            this.marketFilter = null;
        }

        if (this.observer) {
            clearTimeout(this.observer);
        }
        if (filterTypeSingleFlag) {
        	this.observer = setTimeout(this.highlightSingle.bind(this), this.delay);        	
        }
        if (filterTypeBulkFlag) {
        	this.observer = setTimeout(this.highlightBulk.bind(this), this.delay);      	
        }
    },
    
    highlightSingle: function () {
        if (this.checkButton && this.uncheckButton) {
            this.checkButton.disable();
            this.uncheckButton.disable();
        }
        var filterValue = this.filter.value.toUpperCase();
        // filterValue can filter either by airport or country; country filter is only active with - in value
        // airports are 3 characters, countries are 2
        var filterParts       = (filterValue != '') ? filterValue.split("-") : new Array();
        var originFilter      = null;
        var destinationFilter = null;
        var singleSearch      = false;
        var emptySearch       = false;

        if (filterParts.length == 0) {
          // Filter is blank
          emptySearch = true;
        } else if (filterParts.length == 1) {
        	// Filter contains one search parameter
          singleSearch = true;
        	originFilter = filterParts[0];
        	destinationFilter = originFilter;
        } else if (filterParts.length == 2) {
          // Filter contains two search parameters
        	originFilter = filterParts[0];
        	destinationFilter = filterParts[1];
        	// Filter contains '-' character, check length of parts to determine filter types
        	if (originFilter.length == 2) {
        		originFilter = '_' + originFilter; // Country matching
        	} else if (originFilter.length == 0) {
            originFilter = '*';
          }
        	if (destinationFilter.length == 2) {
        		destinationFilter = '_' + destinationFilter; // Country matching
        	} else if (destinationFilter.length == 0) {
            destinationFilter = '*';
          }
        }

        if (Price.Util.isLogEnabled()) {
          Price.Util.log("origin: '" + originFilter + "'   destination: '" + destinationFilter + "'   market: '" + this.marketFilter + "'   singleSearch = " + singleSearch + "'   emptySearch = " + emptySearch);
        }

        var checkBoxes = $(this.form).getInputs('checkbox');
        var isAnyHighlighted = false;
        // Vanilla style loops won't work in IE6
        for (var i = 0, size = checkBoxes.length; i < size; i++) {
            var box = $(checkBoxes[i]);
            if (!box.value.match(this.flightLegPattern)) {
            	continue;
            }
            // Don't highlight market boxes...
            if (box.name == this.marketInputName) {
                continue;
            }
            var boxValue = box.value;
            var origin = boxValue.slice(0, 6);
            var destination = boxValue.slice(7, 13);
            var marketValue = boxValue.slice(14);

            var originMatch = false;
            var destinationMatch = false;
            if (!emptySearch) {
              originMatch = originFilter == '*'  ||
                            origin.startsWith(originFilter) ||
                            (originFilter.length == 3 && origin.endsWith(originFilter));
              destinationMatch = destinationFilter == '*' ||
                                 destination.startsWith(destinationFilter) ||
                                 (destinationFilter.length == 3 && destination.endsWith(destinationFilter));
            }
            var marketMatch = (this.marketFilter == null) ? true : marketValue == this.marketFilter;

            if (Price.Util.isLogEnabled()) {
            	Price.Util.log("'" + origin + "' matches '" + originFilter + "' = " + originMatch + "    '" + destination + "' matches '" + destinationFilter + "' = " + destinationMatch + "    '" + marketValue + "' matches '" + this.marketFilter + "' = " + marketMatch + "  singleSearch = " + singleSearch);
            }

            if (emptySearch && this.marketFilter != null && marketMatch) {
            	// Empty search with market type => highlight matching markets
            	$(box.parentNode).addClassName(this.highlightCssClass);
            } else if (singleSearch && marketMatch && (originMatch || destinationMatch)) {
            	// Single search matching market & either origin or destination
            	$(box.parentNode).addClassName(this.highlightCssClass);
            } else if (originMatch && destinationMatch && marketMatch) {
            	// All matches => highlight
            	$(box.parentNode).addClassName(this.highlightCssClass);
            } else if (singleSearch && (originMatch || destinationMatch) && marketMatch) {
            	// Single search => highlight if any match
            	$(box.parentNode).addClassName(this.highlightCssClass);
            } else {
            	// No match => don't highlight
            	$(box.parentNode).removeClassName(this.highlightCssClass);
            }

            if (!isAnyHighlighted && $(box.parentNode).hasClassName(this.highlightCssClass)) {
                isAnyHighlighted = true;
            }
        }
        if (isAnyHighlighted && this.checkButton && this.uncheckButton) {
            this.checkButton.enable();
            this.uncheckButton.enable();
        }
        this.filter.focus();
    },    

    highlightBulk: function () {
        if (this.checkButton && this.uncheckButton) {
            this.checkButton.disable();
            this.uncheckButton.disable();
        }
        var filterValue = this.filter.value.toUpperCase();
        
        var filterItems = new Array();
        
  		var filterLines = $('bulkLegsHighlight').value.split('\n');
   		for (var a = 0, size = filterLines.length; a < size; a++) {
   			var filterParts = new Array();
   			filterValue = filterLines[a];
   			if (filterValue != '') {
  				filterParts[0] = filterValue.substring(0, 3);
   				filterParts[1] = filterValue.substring(3, 6);       			       				
   				filterItems[a] = filterParts;
   			}
   		}
        
        var originFilter      = null;
        var destinationFilter = null;
        var singleSearch      = false;
        var emptySearch       = false;
        
        
        var hl = new Array();
        
        for (var j = 0; j < filterItems.length; j++) {
       		var filterParts = filterItems[j];
       		hl[j] = filterParts[0] + filterParts[1];
        }
        
        var checkBoxes = $(this.form).getInputs('checkbox');
        var isAnyHighlighted = false;
                
        for (var i = 0, size = checkBoxes.length; i < size; i++) {
        	var box = $(checkBoxes[i]);
        	var boxValue = box.value;
        	var origin = boxValue.slice(0, 3);
        	var destination = boxValue.slice(7, 10);
        	var marketValue = boxValue.slice(14);
        	
        	var originAndDistination =  origin + destination;
        	
        	if (hl.indexOf(originAndDistination) > -1) {
        		$(box.parentNode).addClassName(this.highlightCssClass);
        	} else {
        		$(box.parentNode).removeClassName(this.highlightCssClass);
        	}
        	
        	if (!isAnyHighlighted && $(box.parentNode).hasClassName(this.highlightCssClass)) {
        		isAnyHighlighted = true;
        	}
        }

        if (isAnyHighlighted && this.checkButton && this.uncheckButton) {
            this.checkButton.enable();
            this.uncheckButton.enable();
        }
        this.filter.focus();
    },

    onCheckButtonClicked: function (event) {
        this.toggleHighlighted(true);
    },

    onUncheckButtonClicked: function (event) {
        this.toggleHighlighted(false);
    },

    onUncheckAllButtonClicked: function (event) {
        var checkBoxes = this.getLegCheckBoxes();
        this.unCheck(checkBoxes);
        this.uncheckAllButton.disable();
        this.checkOppositesButton.disable();
        this.filter.focus();
    },

    onCheckOppositesButtonClicked: function (event) {
        var allBoxes = this.getLegCheckBoxes();
        var selectedBoxes = this.getSelectedLegCheckBoxes();
        for (i = 0, numSelected = selectedBoxes.length; i < numSelected; i++) {
            var selectedBox = selectedBoxes[i];
            var leg = this.getFlightLeg(selectedBox);
            // Flip leg
            var tmp = leg.origin;
            leg.origin = leg.destination;
            leg.destination = tmp;
            var oppositeValue = leg.toValueString();
            // Loop all boxes to check matching
            for (j = 0, numBoxes = allBoxes.length; j < numBoxes; j++) {
                var box = allBoxes[j];
                if (box.value == oppositeValue) {
                    this.check(box);
                }
            }
        }
    },

    toggleHighlighted: function (checked) {
        var checkBoxes = this.getLegCheckBoxes();
        var isAnyChecked = false;
        // Vanilla style loops won't work in IE6
        for (var i = 0, size = checkBoxes.length; i < size; i++) {
            var box = checkBoxes[i];
            if (box.parentNode.hasClassName(this.highlightCssClass)) {
            	this.changeState(box, checked, false);
                box.parentNode.removeClassName(this.highlightCssClass);
            }
            if (!isAnyChecked && box.checked) {
                isAnyChecked = true;
            }
        }
        if (this.checkButton && this.uncheckButton) {
            this.checkButton.disable();
            this.uncheckButton.disable();
        }
        if (isAnyChecked && this.uncheckAllButton) {
            this.uncheckAllButton.enable();
        } else if (this.uncheckAllButton) {
            this.uncheckAllButton.disable();
        }
        if (isAnyChecked && this.checkOppositesButton) {
            this.checkOppositesButton.enable();
        } else if (this.checkOppositesButton) {
            this.checkOppositesButton.disable();
        }

        var marketInputs = $(this.form).getInputs('radio');
        for (var i = 0, size = marketInputs.length; i < size; i++) {
        	if (marketInputs[i].id != 'filterTypeSingle' && marketInputs[i].id != 'filterTypeBulk') {
        		marketInputs[i].checked = false;        		
        	}
        }
        this.marketFilter = null;

        this.filter.clear();
        this.filter.focus();
    },

    onLegClicked: function(event) {
        var clickedBox = event.element();
        // clickedBox is also returned in matchingBoxes
        var matchingBoxes = this.findMatchingBoxes(clickedBox);

        if (clickedBox.checked) {
            this.uncheckAllButton.enable();
            this.checkOppositesButton.enable();
            this.check(matchingBoxes, true);
        } else {
        	this.unCheck(matchingBoxes, true);
            // Update uncheckAllButton
            var anyIsChecked = false;
            var legBoxes = this.getLegCheckBoxes();
            for (var i = 0, size = legBoxes.length; i < size; i++) {
                var box = legBoxes[i];
                if (box.checked) {
                    anyIsChecked = true;
                    break;
                }
            }
            if (!anyIsChecked) {
                this.uncheckAllButton.disable();
                this.checkOppositesButton.disable();
            }
        }
    },
    
    onRegionSelected: function(event) {
    	var value = event.element().getValue();
    	if (value == '') return;

    	this.loadBox.toggle();
    	this.regionSelect.selectedIndex = 0;
    	new Ajax.Request('/price-web/ajax/region.action', {
    		method: 'get',
    		parameters: { id: value },
    		onSuccess: this.onRegionLoaded.bindAsEventListener(this),
    		onFailure: function(transport) { alert('Failure: ' + transport.status); } 
    	});
    }, 
    
    onRegionLoaded: function (transport) {
    	var region = Price.Util.parseJSON(transport.responseText);
    	var checkBoxes = this.getLegCheckBoxes();
        for (var i = 0, numBoxes = checkBoxes.length; i < numBoxes; i++) {
            checkBox = $(checkBoxes[i]);
            var boxLeg = this.getFlightLeg(checkBox);
            for (var j = 0, numLegs = region.legs.length; j < numLegs; j++) {
            	var leg = region.legs[j];
            	if (boxLeg.origin.code == leg.departureAirportCode && boxLeg.destination.code == leg.arrivalAirportCode) {
            		this.check(checkBox);
            		if (this.uncheckAllButton) this.uncheckAllButton.enable();
            		if (this.checkOppositesButton) this.checkOppositesButton.enable();
            		break;
            	}
            }
        }
    	this.loadBox.toggle();
    },

    getFlightLeg: function(checkBox) {
    	var valueString = checkBox.value;
    	var leg = {};
    	leg.origin = {};
    	leg.destination = {};
    	if (valueString.match(this.flightLegPattern)) {
    		leg.origin.code         = checkBox.value.slice(0, 3);
    		leg.origin.country      = checkBox.value.slice(4, 6);
    		leg.destination.code    = checkBox.value.slice(7, 10);
    		leg.destination.country = checkBox.value.slice(11, 13);
    		leg.market              = checkBox.value.slice(14);
    	}
    	leg.toValueString = function() {
    	  return this.origin.code + "_" + this.origin.country + "-" + this.destination.code + "_" + this.destination.country + "_" + this.market;
    	};
        return leg;
    },

    toggleGroup: function(event) {
        Price.Util.log("Entering toggleGroup...");
        event = !event ? Event.extend(window.event) : Event.extend(event);
        Price.Util.log("Getting button reference");
        var button = event.element();
        Price.Util.log("Got button reference");
        var check = button.getValue().startsWith("Check");
        // button is inside legend/div element, so we need to get element.parentNode to get to container for entire group
        var group = $(button.parentNode.parentNode);
        // Get all checkboxes in group
        var checkBoxes = this.getLegCheckBoxes(group);
    	if (check) {
            if (Prototype.Browser.IE) {
        		this.check(checkBoxes, false); // Performance is horrible in IE so disabled for now...
            } else {
        		this.check(checkBoxes, true);
            }
    	} else {
            if (Prototype.Browser.IE) {
        		this.unCheck(checkBoxes, false); // Performance is horrible in IE so disabled for now...
            } else {
        		this.unCheck(checkBoxes, true);
            }
    	}
        // Change behaviour to opposite
        if (check) {
        	button.value = "Uncheck all";
        } else {
        	button.value = "Check all";
        }
    },

    check: function(checkBox) {
    	var checkDupes = false;
    	if (arguments.length == 2) {
    		// Optional argument
    		checkDupes = arguments[1];
    	}
    	this.changeState(checkBox, true, checkDupes);
    },

    unCheck: function(checkBox) {
    	var checkDupes = false;
    	if (arguments.length == 2) {
    		// Optional argument
    		checkDupes = arguments[1];
    	}
    	this.changeState(checkBox, false, checkDupes);
    },

    changeState: function(checkBox, checkedState, checkDupes) {
    	var startTime = new Date().getTime();
    	var array = null;
    	if (Object.isArray(checkBox)) {
    		array = checkBox;
    	} else {
    		array = [ checkBox ];
    	}

    	for (var i = 0, size = array.length; i < size; i++) {
    		var boxes = null;
    		if (checkDupes) {
    			boxes = this.findMatchingBoxes(array[i]);
    		} else {
    			boxes = [ array[i] ];
    		}

    		for (var j = 0, numBoxes = boxes.length; j < numBoxes; j++) {
    			var box = boxes[j];
    			box.checked = checkedState;
    			if (checkedState) {
    				$(box.parentNode).addClassName(this.selectedCssClass);
    			} else {
    				$(box.parentNode).removeClassName(this.selectedCssClass);
    			}
    		}
		}
    	var endTime = new Date().getTime();
    	Price.Util.log("Changed state in " + (endTime - startTime) + "ms");
    },

    getLegCheckBoxes: function() {
    	var parentElement = null;
    	if (arguments.length == 0) {
    		parentElement = this.form;
    	} else {
    		parentElement = arguments[0];
    	}
        return parentElement.getElementsBySelector('input[id ^= "leg-"][type = "checkbox"]');
    },

    getSelectedLegCheckBoxes: function() {
        var allLegBoxes = this.getLegCheckBoxes();
        var selected = [];
        for (var i = 0, numBoxes = allLegBoxes.length; i < numBoxes; i++) {
            var box = allLegBoxes[i];
            if (box.checked) {
                selected.push(box);
            }
        }
        return selected;
    },

    findMatchingBoxes: function(checkBox) {
    	return this.form.getElementsBySelector('input[id ^= "leg-"][type = "checkbox"][value = "' + checkBox.value + '"]');
    }
});


var InfoBox = Class.create({
    initialize: function (options) {
        this.options = options || { };
        this.ajaxOptions = {
            method: 'get',
            onSuccess: this.onSuccess.bind(this),
            onFailure: this.onFailure.bind(this)
        };

        // Info is provided in hidden div on page
        this.infoBox = $(this.options.div) || $("info-box");
        if (this.infoBox) this.infoBox.addClassName('info-box');
        // Info is provided from an url and loaded via Ajax
        this.infoUrl = this.options.url;
        // Wrapper element to insert info box into, when created from ajax call
        this.wrapper = $(this.options.wrapper) || $("wrapper");
    },

    showInfo: function (event) {
        event = !event ? Event.extend(window.event) : Event.extend(event);
        if (this.infoUrl && !this.infoBox) {
            // Show spinner
            var spinner = new Element('img', { 'src': '/price-web/images/spinner.gif' });
            this.infoBox = new Element('div', { 'class': 'info-box' }).update(spinner);
            this.wrapper.insert(this.infoBox, { position: 'bottom' });
            // Load content
            new Ajax.Request(this.infoUrl, this.ajaxOptions);
        }
        this.infoBox.style.left = event.pointerX() + event.element().getWidth() + 'px';
        this.infoBox.style.top = event.pointerY() - (this.infoBox.getHeight() / 2) + 'px';
        this.infoBox.show();
    },

    hideInfo: function (event) {
        this.infoBox.hide();
    },

    onSuccess: function (transport) {
        this.infoBox.update(transport.responseText);
    },

    onFailure: function () {
        this.infoBox.update('<p>Failed to load info!</p>');
    }
});


var ConditionForm = Class.create({
    initialize: function(options) {
        this.options = options || { };
        this.form = $(this.options.form) || $("postBack");
        this.table = $(this.options.table);
        this.newConditionInput = $(this.options.newConditionInput);
        this.addConditionButton = $(this.options.addConditionButton);
        this.namePrefix = this.options.prefix || "conditions";
        this.amountPrefix = this.options.amountPrefix || "amounts";
        this.earnFactorWarningLevelInput = this.options.earnFactorWarningLevelInput;

        this.numConditions = 0; // Used for indexing conditions for submit
        this.newConditionInput.observe('keypress', function (event) {
            var key = event.keyCode | event.which;
            if (key == Event.KEY_RETURN) {
                this.addNewCondition(event);
            }
        }.bindAsEventListener(this));
        this.addConditionButton.observe('click', this.addNewCondition.bindAsEventListener(this));
    },

    render: function (conditions) {
        for (var i = 0, size = conditions.length; i < size; i++) {
            this.renderCondition(conditions[i]);
        }
    },

    addPeriodAfter: function (rowIndex, conditionId) {
        var condition = this.getCondition(rowIndex);
        condition.closePeriod = "true";
        condition.closePeriodId = conditionId;
        condition.closePeriodDate = Price.Util.formatDate(Price.Util.Tomorrow);
        // Remove id as we will be cloning the condition by rendering it again
        condition.id = '';
        // Update dates
        condition.validFromPurchaseDateTime = Price.Util.formatDate(Price.Util.Tomorrow);
        condition.validToPurchaseDateTime = Price.Util.formatDate(Price.Util.Forever);
        condition.validFromDepartureDateTime = Price.Util.formatDate(Price.Util.Tomorrow);
        condition.validToDepartureDateTime = Price.Util.formatDate(Price.Util.Forever);
        var insertIndex = rowIndex + 1;
        if (typeof condition.amounts != 'undefined') {
            insertIndex += condition.amounts.length - 1;
        }
        this.renderCondition(condition, insertIndex);
        this.highlightCondition(insertIndex);
        preventInputsObserver();
    },

    addCurrencyToCondition: function (rowIndex) {
        var conditionRow = $(this.table.rows[rowIndex]);
        var condition = this.getCondition(rowIndex);
        var numAmountsAfterInsert = condition.amounts.length + 1;
        // Update rowSpan
        for (var i = 0, size = conditionRow.cells.length; i < size; i++) {
            if (i == 1 || i == 2) {
                continue;
            }
            conditionRow.cells[i].rowSpan = numAmountsAfterInsert;
        }
        var insertIndex = rowIndex + condition.amounts.length;

        // Insert row
        var row = $(this.table.insertRow(insertIndex));
        var rowClass = (conditionRow.rowIndex % 2 != 0) ? "odd" : "even";
        row.addClassName(rowClass);
        row.addClassName("amount");
        // Create cells
        var amountCell = $(row.insertCell(0));
        var currencyCell = $(row.insertCell(1));
        // Crete input elements
        var amountInput = Price.Util.createNumberInput();
        amountCell.update(amountInput);
        var currencySelect = Price.Util.currencySelect();
        currencyCell.update(currencySelect);
        // To name input elements we must find the index of the taxcondition
        var conditionIndex = conditionRow.cells[1].firstChild.name.match(/\[(\d+)]/)[1];
        var amountIndex = numAmountsAfterInsert - 1;

        amountInput.name = this.namePrefix + '[' + conditionIndex + '].' + this.amountPrefix + '[' + amountIndex + '].netAmount';
        currencySelect.name = this.namePrefix + '[' + conditionIndex + '].' + this.amountPrefix + '[' + amountIndex + '].currencyCode';
        preventInputsObserver();
    },
    
    highlightCondition: function(rowIndex) {
        var row = $(this.table.rows[rowIndex]);
        if (row.hasClassName("condition")) {
            row.addClassName("highlighted");
            // Move on to next row to get all amounts
            for (var i = rowIndex + 1, size = this.table.rows.length; i < size; i++) {
                row = $(this.table.rows[i]);
                if (!row.hasClassName("amount")) {
                    break;
                }
                row.addClassName("highlighted");
            }
        }
    },

    getValueFromCell: function (cell) {
        var x = cell.firstChild || {};
        if (x.nodeType == 3) { // Text node
            return x.nodeValue;
        } else if (x.tagName == "INPUT" || x.tagName == "SELECT") {
            return x.value;
        } else if (x.tagName == "ACRONYM") {
            return x.firstChild.nodeValue;
        }
        return null;
    },
    
    setValueInCell: function (cell, value) {
        var x = cell.cleanWhitespace().firstChild;
        if (x.nodeType == 3) { // Text node
            cell.update(value);
        } else if (x.tagName == "INPUT") {
            x.value = value;
        } else if (x.tagName == "SELECT") {
            for (var i = 0, size = x.options.length; i < size; i++) {
                var option = x.options[i];
                if (option.value == value) {
                    option.selected = true;
                    break;
                }
            }
        }
    },

    addNewCondition: function(event) {
        // Prevent form submission
        Event.stop(event);
        if (!this.newConditionInput.value) {
            return;
        }
        var newCondition = this.createNewCondition();
        this.renderCondition(newCondition);
        this.highlightCondition(this.table.rows.length - 1);
        this.newConditionInput.clear();
        this.newConditionInput.blur();
        preventInputsObserver();
    },

    createButton: function(type) {
        var button = null;
        if (type == 'period') {
            button = new Element('input', {'type': 'image', 'title': 'Add period', 'src': '/price-web/images/edit-copy.png'});
        } else if (type == 'currency') {
            button = new Element('input', {'type': 'image', 'title': 'Add currency', 'src': '/price-web/images/document-new.png'});
        } else if (type == 'delete') {
            button = new Element('input', {'type': 'image', 'title': 'Delete period', 'src': '/price-web/images/edit-delete.png'});
        } else if (type == 'end') {
            button = new Element('input', {'type': 'image', 'title': 'End period', 'src': '/price-web/images/media-playback-stop.png'});
        }
        return button;
    }
});

var FeeForm = Class.create(ConditionForm, {
    initialize: function(options) {
        this.options = options || { };
        this.form = $(this.options.form) || $("postBack");
        this.table = $(this.options.table);
        this.newConditionInput = $(this.options.newConditionInput);
        this.addConditionButton = $(this.options.addConditionButton);
        this.newBundleInput = $(this.options.newBundleInput);
        this.addBundleButton = $(this.options.addBundleButton);
        this.namePrefix = this.options.prefix || "conditions";
        this.amountPrefix = this.options.amountPrefix || "amounts";
        this.earnFactorWarningLevelInput = this.options.earnFactorWarningLevelInput;

        this.numConditions = 0; // Used for indexing conditions for submit
        this.newConditionInput.observe('keypress', function (event) {
            var key = event.keyCode | event.which;
            if (key == Event.KEY_RETURN) {
                this.addNewCondition(event);
            }
        }.bindAsEventListener(this));
        this.newBundleInput.observe('keypress', function (event) {
            var key = event.keyCode | event.which;
            if (key == Event.KEY_RETURN) {
                this.addNewBundle(event);
            }
        }.bindAsEventListener(this));        
        this.addConditionButton.observe('click', this.addNewCondition.bindAsEventListener(this));
        this.addBundleButton.observe('click', this.addNewBundle.bindAsEventListener(this));
    },
	
    renderCondition: function(condition, index) {
        if (!index) {
            index = this.table.rows.length;
        }
        // Create new table row
        var row = $(this.table.insertRow(index));
        var rowClass = (row.rowIndex % 2 != 0) ? "odd" : "even";
        row.addClassName(rowClass);
        row.addClassName("condition");
        row.setAttribute("id", condition.id);
        
        // Create table cells
        var codeCell = $(row.insertCell(row.cells.length));
        codeCell.rowSpan = condition.amounts.length;
        //codeCell.colSpan = 1;
        codeCell.vAlign = 'top';
        codeCell.addClassName("keyCell");
        var childFactorCell = null;
        if (typeof condition.childFactor != 'undefined') {
            childFactorCell = $(row.insertCell(row.cells.length));
            childFactorCell.rowSpan = condition.amounts.length;
            childFactorCell.vAlign = 'top';
        }
        var infantFactorCell = null;
        if (typeof condition.infantFactor != 'undefined') {
            infantFactorCell = $(row.insertCell(row.cells.length));
            infantFactorCell.rowSpan = condition.amounts.length;
            infantFactorCell.vAlign = 'top';
        }
        var vatCodeCell = $(row.insertCell(row.cells.length));
        vatCodeCell.rowSpan = condition.amounts.length;
        vatCodeCell.vAlign = 'top';
        var validFromPurchaseCell = $(row.insertCell(row.cells.length));
        validFromPurchaseCell.addClassName("dateCell");
        validFromPurchaseCell.rowSpan = condition.amounts.length;
        validFromPurchaseCell.vAlign = 'top';
        var validToPurchaseCell = $(row.insertCell(row.cells.length));
        validToPurchaseCell.addClassName("dateCell");
        validToPurchaseCell.rowSpan = condition.amounts.length;
        validToPurchaseCell.vAlign = 'top';
        var validFromDepartureCell = $(row.insertCell(row.cells.length));
        validFromDepartureCell.addClassName("dateCell");
        validFromDepartureCell.rowSpan = condition.amounts.length;
        validFromDepartureCell.vAlign = 'top';
        var validToDepartureCell = $(row.insertCell(row.cells.length));
        validToDepartureCell.addClassName("dateCell");
        validToDepartureCell.rowSpan = condition.amounts.length;
        validToDepartureCell.vAlign = 'top';

        if (condition.closePeriod) {
        	var closePrevPeriodCell = $(row.insertCell(row.cells.length));
        	closePrevPeriodCell.addClassName("dateCell");
        	closePrevPeriodCell.rowSpan = condition.amounts.length;
        	closePrevPeriodCell.vAlign = 'top';        	
        }
        
        var buttonsCell = $(row.insertCell(row.cells.length));
        buttonsCell.addClassName('buttonCell');
        buttonsCell.rowSpan = condition.amounts.length;
        buttonsCell.vAlign = 'top';
        
        if (condition.historic) {
            // Render cells without possibility to make changes
            var acronym = new Element('acronym', {'title': condition.ancillary.description});
            acronym.update(condition.ancillary.code);
            codeCell.update(acronym);
            if (childFactorCell != null) {
                childFactorCell.update(condition.childFactor);
            }
            if (infantFactorCell != null) {
                infantFactorCell.update(condition.infantFactor);
            }
            vatCodeCell.update(condition.vatCode);
            validFromPurchaseCell.update(condition.validFromPurchaseDateTime);
            validToPurchaseCell.update(condition.validToPurchaseDateTime);
            if (typeof condition.validFromDepartureDateTime.getOffset == "function") {
                validFromDepartureCell.update('<acronym title="' + condition.validFromDepartureDateTime.getOffset() + '">' + condition.validFromDepartureDateTime.toShortString() + '</acronym>');
                validToDepartureCell.update('<acronym title="' + condition.validToDepartureDateTime.getOffset() + '">' + condition.validToDepartureDateTime.toShortString() + '</acronym>');
            } else {
                validFromDepartureCell.update(condition.validFromDepartureDateTime);
                validToDepartureCell.update(condition.validToDepartureDateTime);
            }
            codeCell.insert(createHidden(null, condition.type, 'hiddenType'));
        } else {
            // Render cells to be able to make changes
            // Code cell
            codeCell.update(condition.ancillary.code);
            var hiddenCode = new Element('input', {'type': 'hidden', 'value': condition.ancillary.code});
            var hiddenId = new Element('input', {'type': 'hidden', 'value': condition.id});
            var hiddenDeparture = new Element('input', {'type': 'hidden', 'value': $("departureAirportCode").value});
            var hiddenArrival = new Element('input', {'type': 'hidden', 'value': $("arrivalAirportCode").value});
            codeCell.insert(hiddenCode);
            codeCell.insert(hiddenId);
            codeCell.insert(hiddenDeparture);
            codeCell.insert(hiddenArrival);
            // Child factor cell
            if (childFactorCell != null) {
                var childFactorInput = Price.Util.createNumberInput(condition.childFactor);
                childFactorCell.update(childFactorInput);
            }
            // Infant factor cell
            if (infantFactorCell != null) {
                var infantFactorInput = Price.Util.createNumberInput(condition.infantFactor);
                infantFactorCell.update(infantFactorInput);
            }
            // VAT cell
            var vatSelect = Price.Util.vatSelect(condition.vatCode);
            vatCodeCell.update(vatSelect);
            // Valid from purchase cell
            var validFromPurchaseInput = new Element('input', {'type': 'text', 'size': '10', 'value': condition.validFromPurchaseDateTime});
            validFromPurchaseCell.update(validFromPurchaseInput);
            // Valid to purchase cell
            var validToPurchaseInput = new Element('input', {'type': 'text', 'size': '10', 'value': condition.validToPurchaseDateTime});
            validToPurchaseCell.update(validToPurchaseInput);
            // Valid to/from departure cells
            var validFromDepartureInput = new Element('input', {'type': 'text', 'size': '10', 'value': condition.validFromDepartureDateTime});
            var validToDepartureInput = new Element('input', {'type': 'text', 'size': '10', 'value': condition.validToDepartureDateTime});
            if (typeof condition.validFromDepartureDateTime.getOffset == "function") {
                validFromDepartureInput.setAttribute('value', condition.validFromDepartureDateTime.toShortString());
                validToDepartureInput.setAttribute('value', condition.validToDepartureDateTime.toShortString());
            } else {
                validFromDepartureInput.setAttribute('value', condition.validFromDepartureDateTime);
                validToDepartureInput.setAttribute('value', condition.validToDepartureDateTime);
            }
            validFromDepartureCell.update(validFromDepartureInput);
            validToDepartureCell.update(validToDepartureInput);

            // Name input fields
            hiddenCode.name = this.namePrefix + '[' + this.numConditions + '].ancillaryCode';
            hiddenId.name = this.namePrefix + '[' + this.numConditions + '].id';
            hiddenDeparture.name = this.namePrefix + '[' + this.numConditions + '].departureAirportCode';
            hiddenArrival.name = this.namePrefix + '[' + this.numConditions + '].arrivalAirportCode';
            if (childFactorCell != null) {
                childFactorInput.name = this.namePrefix + '[' + this.numConditions + '].childFactor';
            }
            if (infantFactorCell != null) {
                infantFactorInput.name = this.namePrefix + '[' + this.numConditions + '].infantFactor';
            }
            vatSelect.name = this.namePrefix + '[' + this.numConditions + '].vatCode';
            validFromPurchaseInput.name = this.namePrefix + '[' + this.numConditions + '].validFromPurchaseDateTime';
            validToPurchaseInput.name = this.namePrefix + '[' + this.numConditions + '].validToPurchaseDateTime';
            validFromDepartureInput.name = this.namePrefix + '[' + this.numConditions + '].validFromDepartureDateTime';
            validToDepartureInput.name = this.namePrefix + '[' + this.numConditions + '].validToDepartureDateTime';
            codeCell.insert(createHidden(this.namePrefix + '[' + this.numConditions + '].type', condition.type, 'hiddenType'));
            if (condition.closePeriod) {
            	closePrevPeriodCell.insert("<input type='checkbox' name='" + this.namePrefix + "[" + this.numConditions + "].closePeriod' value='true' checked='checked' onclick='isClosePeriod(this);'>End previous");
            	closePrevPeriodCell.insert(createHidden(this.namePrefix + '[' + this.numConditions + '].closePeriodId', condition.closePeriodId, 'hiddenType'));
            	closePrevPeriodCell.insert(createHidden(this.namePrefix + '[' + this.numConditions + '].closePeriodDate', condition.closePeriodDate, 'hiddenType'));
                validFromPurchaseInput.observe('keyup', function (event) {
                	$$("[name='" + this.namePrefix + "[" + (this.numConditions - 1) + "].closePeriodDate']")[0].value = validFromPurchaseInput.value;
                }.bindAsEventListener(this));        	
            }
        }


        if(this.isBundle(condition)) {
        	var bundleElement = new Element('ul', {'class': 'bundleContents editBundleItems'});
            if (!condition.historic) {
            	var buttonAddBundleItem = new Element('input', {'type': 'image', 'title': 'Add Bundle Item', 'src': '/price-web/images/document-new.png'});
            	codeCell.insert(buttonAddBundleItem);
            	
            	var bnPrefix = this.namePrefix + '[' + this.numConditions + '].bundleItems[';
            	buttonAddBundleItem.observe('click', function(event) {
                    Event.stop(event);
                    var nextIdx = bundleElement.getElementsByTagName('li').length;
                    var bn = bnPrefix + nextIdx + ']';
                	var itemElement = this.getNewBundleItemElement(this.getDefaultBundleItem(), bn, false);
                	bundleElement.insert(itemElement);
                	preventInputsObserver();
                }.bindAsEventListener(this));
            	
            	// title
            	var bundleElementCaption = new Element('table', {'class': 'bundleContentsTitle'});
	        	bundleElementCaption.update('<tr><td>Quantity</td><td>Ancillary</td><td>Cabin</td><td>Product</td></tr>');
	        	codeCell.insert(bundleElementCaption);
            }
        	for (var i = 0, size = condition.bundleItems.length; i < size; i++) {
            	var bn = this.namePrefix + '[' + this.numConditions + '].bundleItems[' + i + ']';
            	var itemElement = this.getNewBundleItemElement(condition.bundleItems[i], bn, condition.historic);
            	bundleElement.insert(itemElement);
            }            	
            codeCell.insert(bundleElement);
            preventInputsObserver();
        }
        
        // These buttons are not bound to historic, but should always appear
        var addPeriodButton = this.createButton('period');
        buttonsCell.insert(addPeriodButton);
        var addCurrencyButton = this.createButton('currency');
        buttonsCell.insert(addCurrencyButton);
        // Bind event listeners on buttons
        addPeriodButton.observe('click', function(event) {
            Event.stop(event);
            this.addPeriodAfter(row.rowIndex, condition.id);
        }.bindAsEventListener(this));

        addCurrencyButton.observe('click', function(event) {
            Event.stop(event);
            var conditionIndex = row.rowIndex;
            if (condition.historic) {
                // Condition is historic so we clone it first
                this.addPeriodAfter(row.rowIndex, condition.id);
                conditionIndex = row.rowIndex + condition.amounts.length;
            }
            this.addCurrencyToCondition(conditionIndex);
            this.highlightCondition(conditionIndex);
        }.bindAsEventListener(this));

        if (condition.historic) {
            var endButton = this.createButton('end');
            buttonsCell.insert(endButton);
            endButton.observe('click', function(event) {
            	Event.stop(event);
            	Price.Util.showEndPeriodForm(event, condition.id);
            }.bindAsEventListener(this));
        }

        if (!condition.historic && condition.id != '') {
            var deleteButton = this.createButton('delete');
            buttonsCell.insert(deleteButton);
            deleteButton.observe('click', function(event) {
            	if (confirm('Do you really want to delete this period?')) {
            		this.form.idToDelete.value = condition.id;
            		this.form.action = '../write/deletePeriodByLeg.action';
            	} else {
            		// Not confirmed => stop form submission
            		Event.stop(event);
            	}
            }.bindAsEventListener(this));
        }

        // Add tax amount rows
        for (var i = 0, size = condition.amounts.length; i < size; i++) {
            var amount = condition.amounts[i];
            var amountCell = null;
            var amountCurrencyCell = null;
            var amountCabinCell = null;
            var amountProductCell = null;
            if (i == 0) {
                // Row already created, insert cells
                amountCell = $(row.insertCell(1));
                amountCurrencyCell = $(row.insertCell(2));
                amountCabinCell = $(row.insertCell(3));
                amountProductCell = $(row.insertCell(4));
            } else {
                // Create row
                var amountRow = $(this.table.insertRow(index + i));
                amountRow.addClassName(rowClass);
                amountRow.addClassName("amount");
                // Create cells
                amountCell = $(amountRow.insertCell(amountRow.cells.length));
                amountCurrencyCell = $(amountRow.insertCell(amountRow.cells.length));
                amountCabinCell = $(amountRow.insertCell(amountRow.cells.length));
                amountProductCell = $(amountRow.insertCell(amountRow.cells.length));
            }
            amountCell.vAlign = 'top';
            amountCurrencyCell.vAlign = 'top';
            amountCabinCell.vAlign = 'top';
            amountProductCell.vAlign = 'top';

            // Set values
            var netAmountSize = amount.netAmounts.length;
            if (condition.historic) {
            	for (var ordinal = 1; ordinal < netAmountSize + 1; ordinal++) {
            		if(netAmountSize > 1) {
            			amountCell.insert(ordinal + ': ');
            		}
            		amountCell.insert(amount.netAmounts[ordinal-1]);
            		amountCell.insert(createHidden(null, amount.netAmounts[ordinal-1], 'hiddenAmountValue-' + ordinal));
            		if(netAmountSize > 1 && ordinal != netAmountSize) {
            			amountCell.insert(' , ');
            		}
            	}
                amountCurrencyCell.update(amount.currencyCode);
                amountCabinCell.update(amount.cabin.description);
                amountCabinCell.insert(createHidden(null, amount.cabin.code, 'hiddenAmountCabin'));
                amountProductCell.update(amount.product.description);
                amountProductCell.insert(createHidden(null, amount.product.code, 'hiddenAmountProduct'));
            } else {
                var an =  this.namePrefix + '[' + this.numConditions + '].' + this.amountPrefix + '[' + i + ']';
            	for (var ordinal = 1; ordinal < netAmountSize + 1; ordinal++) {
            		if(netAmountSize > 1) {
            			amountCell.insert(ordinal + ': ');
            		}
                	var amountInput = Price.Util.createNumberInput(amount.netAmounts[ordinal-1]);
                    amountCell.insert(amountInput);
                    amountInput.name = an + '.netAmounts[' + (ordinal-1) + ']';
                    amountInput.addClassName('hiddenAmountValue-' + ordinal);
            		if(netAmountSize > 1 && ordinal != netAmountSize) {
            			amountCell.insert(',<br/>');
            		}
            	}
                
                var amountId = new Element('input', {'type': 'hidden', 'value': amount.id});
                amountCell.insert(amountId);
                var amountCurrencySelect = Price.Util.currencySelect(amount.currencyCode);
                amountCurrencyCell.update(amountCurrencySelect);

                // Name input elements
                amountId.name = an + '.id';
                amountCurrencySelect.name = an + '.currencyCode';
                var amountCabinInput = Price.Util.cabinSelect(amount.cabin.code);
                amountCabinInput.addClassName("hiddenAmountCabin cabinSelectSmall");
                amountCabinCell.update(amountCabinInput);
                amountCabinInput.name = an + '.cabinCode';
                var amountProductSelect = Price.Util.productSelect(amount.product.code);
                amountProductSelect.addClassName("hiddenAmountProduct productSelectSmall");
                amountProductCell.update(amountProductSelect);
                amountProductSelect.name = an + '.productCode';
            }
        }

        if (!condition.historic) {
            this.numConditions++;
        }
    },
    
	getDefaultBundleItem: function() {
    	return {id: '', ancillary: {code:''}, quantity: 1, cabin: {code:'', description: ''}, product: {code:'', description: ''}};
    },
    
    getNewBundleItemElement: function(bundleItem, bn, readonly) {
    	var itemElement = new Element('li');
    	if(readonly) {
        	var itemAcronym = new Element('acronym', {'title': bundleItem.ancillary.description});
        	itemAcronym.update(bundleItem.ancillary.code);
        	itemElement.insert(bundleItem.quantity + ' x ');
        	itemElement.insert(itemAcronym);
            if(bundleItem.cabin.code != null && bundleItem.cabin.code != '') {
            	itemElement.insert(' (Cabin ' + bundleItem.cabin.code + ')');
            }
            if(bundleItem.product.code != null && bundleItem.product.code != '') {
            	itemElement.insert(',' + bundleItem.product.description);
            }
            itemElement.insert(createHidden(null, bundleItem.id, 'hiddenBundleId'));
        	itemElement.insert(createHidden(null, bundleItem.quantity, 'hiddenBundleQuantity'));
        	itemElement.insert(createHidden(null, bundleItem.ancillary.code, 'hiddenBundleAncillary'));
        	itemElement.insert(createHidden(null, bundleItem.cabin.code, 'hiddenBundleCabin'));
        	itemElement.insert(createHidden(null, bundleItem.product.code, 'hiddenBundleProduct'));

    	} else {
    		itemElement.insert(createHidden(bn + '.id', bundleItem.id, 'hiddenBundleId'));
    		var quantityInput = new Element('input', { 'type': 'text', 'class': 'number hiddenBundleQuantity', 'size': '2', 'value': bundleItem.quantity, 'name': bn + '.quantity'});
            var ancillaryInput = Price.Util.ancillarySelect(bundleItem.ancillary.code);
            ancillaryInput.className = 'hiddenBundleAncillary ancillarySelectSmall';
            ancillaryInput.setAttribute('name', bn + '.ancillaryCode');
            var cabinInput = Price.Util.cabinSelect(bundleItem.cabin.code);
            cabinInput.className = 'hiddenBundleCabin cabinSelectSmall';
            cabinInput.setAttribute('name', bn + '.cabinCode');
    		var productInput = Price.Util.productSelect(bundleItem.product.code);
    		productInput.className = 'hiddenBundleProduct productSelectSmall';
    		productInput.setAttribute('name', bn + '.productCode');
    		itemElement.insert(quantityInput);
    		itemElement.insert(ancillaryInput);
    		itemElement.insert(cabinInput);
    		itemElement.insert(productInput);
    		var buttonDeleteBundleItem = new Element('input', {'type': 'image', 'title': 'Delete Item', 'src': '/price-web/images/edit-delete.png'});
    		buttonDeleteBundleItem.observe('click', function(event) {
                Event.stop(event);
            	if (confirm('Do you really want to delete this bundle item?')) {
            		event.target.parentElement.remove();
            	} 
            }.bindAsEventListener(this));
    		
    		itemElement.insert(buttonDeleteBundleItem);
    	}
    	return itemElement;
    },
    
    getCondition: function(rowIndex) {
        var row = $(this.table.rows[rowIndex]);
        if (!row.hasClassName("condition")) {
            return null;
        }
        var condition = {};
        var cellIndex = 0;
        condition.amounts = new Array();
        condition.bundleItems = new Array();
        var codeCell = row.cells[cellIndex++];
        condition.ancillary = {code: this.getValueFromCell(codeCell)};
        var numAmountValues = ancillaryAmountMap[condition.ancillary.code];    	
        var firstAmountValueCell = row.cells[cellIndex++];
        var firstAmount = {id: '', netAmounts: new Array(numAmountValues)};
        for(var ordinal=1;ordinal < numAmountValues+1; ordinal++) {
        	firstAmount.netAmounts[ordinal-1] = getElementsByClassName(firstAmountValueCell, 'hiddenAmountValue-' + ordinal)[0].value;
        }
        
        firstAmount.currencyCode = this.getValueFromCell(row.cells[cellIndex++]);
        var firstCabinCell = row.cells[cellIndex++];
        var firstCabinCode = getElementsByClassName(firstCabinCell, 'hiddenAmountCabin')[0].value;
        firstAmount.cabin = {code: firstCabinCode};
        var firstProductCell = row.cells[cellIndex++];
        var firstProducCode = getElementsByClassName(firstProductCell, 'hiddenAmountProduct')[0].value;
        firstAmount.product = {code: firstProducCode};
        
        condition.amounts[0] = firstAmount;
        condition.vatCode = this.getValueFromCell(row.cells[cellIndex++]);
        condition.description = this.getValueFromCell(row.cells[cellIndex++]);
        condition.validFromPurchaseDateTime = this.getValueFromCell(row.cells[cellIndex++]);
        condition.validToPurchaseDateTime = this.getValueFromCell(row.cells[cellIndex++]);
        condition.validFromDepartureDateTime = this.getValueFromCell(row.cells[cellIndex++]);
        condition.validToDepartureDateTime = this.getValueFromCell(row.cells[cellIndex++]);
        condition.type = getElementsByClassName(codeCell,"hiddenType")[0].value;
       
        // Move on to next row to get all amounts
        row = $(this.table.rows[rowIndex + 1]);
        var idx = 1;
        for (var i = rowIndex + 1, size = this.table.rows.length; i < size; i++) {
            row = $(this.table.rows[i]);
            if (!row.hasClassName("amount")) {
                break;
            }
            var amountValueCell = row.cells[0];
            var amount = {id: '', netAmounts: new Array(numAmountValues)};
            for(var ordinal=1;ordinal < numAmountValues+1; ordinal++) {
            	amount.netAmounts[ordinal-1] = getElementsByClassName(amountValueCell, 'hiddenAmountValue-' + ordinal)[0].value;
            }
            amount.currencyCode = this.getValueFromCell(row.cells[1]);
            var cabinCell = row.cells[2];
            var cabinCode = getElementsByClassName(cabinCell, 'hiddenAmountCabin')[0].value;
            amount.cabin = {code: cabinCode};
            var productCell = row.cells[3];
            var producCode = getElementsByClassName(productCell, 'hiddenAmountProduct')[0].value;
            amount.product = {code: producCode};
            condition.amounts[idx++] = amount;
        }
        if(this.isBundle(condition)) {
            var bundleUL = getElementsByClassName(codeCell, "bundleContents")[0];
            var bundleLIs = bundleUL.childNodes;
            idx = 0;
            for(var i = 0,size = bundleLIs.length; i < size; i++) {
            	var li = bundleLIs[i];
            	var item = {id: ''};
            	item.quantity = getElementsByClassName(li, "hiddenBundleQuantity")[0].value;
            	item.ancillary = {code: getElementsByClassName(li, "hiddenBundleAncillary")[0].value};
            	item.cabin = {code: getElementsByClassName(li, "hiddenBundleCabin")[0].value};
            	item.product = {code: getElementsByClassName(li, "hiddenBundleProduct")[0].value};
            	condition.bundleItems[idx++] = item;
            }
        }
        return condition;
    },
    
    addCurrencyToCondition: function (rowIndex) {
        var conditionRow = $(this.table.rows[rowIndex]);
        var condition = this.getCondition(rowIndex);
        var numAmountsAfterInsert = condition.amounts.length + 1;
        // Update rowSpan
        for (var i = 0, size = conditionRow.cells.length; i < size; i++) {
            if (i > 0 && i < 5) {
                continue;
            }
            conditionRow.cells[i].rowSpan = numAmountsAfterInsert;
        }
        var insertIndex = rowIndex + condition.amounts.length;

        // Insert row
        var row = $(this.table.insertRow(insertIndex));
        var rowClass = (conditionRow.rowIndex % 2 != 0) ? "odd" : "even";
        row.addClassName(rowClass);
        row.addClassName("amount");
        // Create cells
        var amountCell = $(row.insertCell(0));
        var amountCurrencyCell = $(row.insertCell(1));
        var amountCabinCell = $(row.insertCell(2));
        var amountProductCell = $(row.insertCell(3));
        amountCell.vAlign = 'top';
        amountCurrencyCell.vAlign = 'top';
        amountCabinCell.vAlign = 'top';
        amountProductCell.vAlign = 'top';
        
        // Crete input elements
        var currencySelect = Price.Util.currencySelect();
        amountCurrencyCell.update(currencySelect);
        // To name input elements we must find the index of the taxcondition
        
        var conditionIndex = getElementsByClassName(conditionRow.cells[1], 'hiddenAmountValue-1')[0].name.match(/\[(\d+)]/)[1];
        var amountIndex = numAmountsAfterInsert - 1;

        var netAmountSize = ancillaryAmountMap[condition.ancillary.code];
        for(var ordinal=1; ordinal < netAmountSize+1; ordinal++) {
	        if(netAmountSize > 1) {
	        	amountCell.insert(ordinal + ': ');
	        }
	        var amountInput = Price.Util.createNumberInput();
	        amountInput.name = this.namePrefix + '[' + conditionIndex + '].' + this.amountPrefix + '[' + amountIndex + '].netAmounts[' + (ordinal-1) + ']';
	        amountInput.addClassName('hiddenAmountValue-' + ordinal);
	        amountCell.insert(amountInput);
    		if(netAmountSize > 1 && ordinal != netAmountSize) {
    			amountCell.insert(',<br/>');
    		}
        }
        currencySelect.name = this.namePrefix + '[' + conditionIndex + '].' + this.amountPrefix + '[' + amountIndex + '].currencyCode';
        //TODO reuse super
              
        var amountCabinSelect = Price.Util.cabinSelect();
        amountCabinSelect.addClassName("hiddenAmountCabin cabinSelectSmall");
        amountCabinCell.update(amountCabinSelect);
        amountCabinSelect.name = this.namePrefix + '[' + conditionIndex + '].' + this.amountPrefix + '[' + amountIndex + '].cabinCode';
        
        var amountProductSelect = Price.Util.productSelect();
        amountProductSelect.addClassName("hiddenAmountProduct productSelectSmall");
        amountProductCell.update(amountProductSelect);
        amountProductSelect.name = this.namePrefix + '[' + conditionIndex + '].' + this.amountPrefix + '[' + amountIndex + '].productCode';
        preventInputsObserver();
    },
    
    isBundle: function(condition) {
    	return condition.type == 'BUNDLE';
    },
    
    createNewCondition: function() {
        return this.createNewObjet('ANCILLARY', this.newConditionInput.value.toUpperCase(), new Array());
    },

    createNewBundle: function() {
        return this.createNewObjet('BUNDLE', this.newBundleInput.value.toUpperCase(), new Array(this.getDefaultBundleItem()));
    },
    
    addNewBundle: function(event) {
        // Prevent form submission
        Event.stop(event);
        if (!this.newBundleInput.value) {
            return;
        }
        var newCondition = this.createNewBundle();
        this.renderCondition(newCondition);
        this.highlightCondition(this.table.rows.length - 1);
        this.newBundleInput.clear();
        this.newBundleInput.blur();
        prepareExpandableSelects('postBackByLeg');
        preventInputsObserver();
    },
    
    createNewObjet: function(type, ancillaryCode, bundleItems) {
    	var numAmountValues = ancillaryAmountMap[ancillaryCode];
    	var amountValues = new Array(numAmountValues);
    	for(var i=0; i<numAmountValues; i++) {
    		amountValues[i] = 0.0;
    	}
        var newCondition = {
            'id'                        : '',
            'ancillary'                 : {code: ancillaryCode},
            'amounts'                   : new Array({id: '', cabin: {code: ''}, product: {code: ''}, netAmounts: amountValues, currencyCode: 'NOK'}),
            'bundleItems'               : bundleItems,
            'type'						: type,
            'cabin'						: {code: ''},
            'product'					: {code: ''},
            'vatCode'                   : 'NV2',
            'description'               : '',
            'validFromPurchaseDateTime' : Price.Util.formatDate(Price.Util.Tomorrow),
            'validToPurchaseDateTime'   : Price.Util.formatDate(Price.Util.Forever),
            'validFromDepartureDateTime': no.nas.DateTime.parse(Price.Util.formatDate(Price.Util.Tomorrow)),
            'validToDepartureDateTime'  : no.nas.DateTime.parse(Price.Util.formatDate(Price.Util.Forever))
        };
        return newCondition;
    }
});

var RewardForm = Class.create(ConditionForm, {
    renderCondition: function(rewardCondition, index) {
        if (!index) {
            index = this.table.rows.length;
        }
        // Create new table row
        var row = $(this.table.insertRow(index));
        var rowClass = (row.rowIndex % 2 != 0) ? "odd" : "even";
        row.addClassName(rowClass);
        row.addClassName("condition");

        // Create table cells

        var productCell = $(row.insertCell(row.cells.length));
        productCell.vAlign = 'top';
        var earnFactorBankNorwegianCell = $(row.insertCell(row.cells.length));
        earnFactorBankNorwegianCell.vAlign = 'top';
        var earnFactorFrequentFlyerCell = $(row.insertCell(row.cells.length));
        earnFactorFrequentFlyerCell.vAlign = 'top';
        var validFromPurchaseCell = $(row.insertCell(row.cells.length));
        validFromPurchaseCell.addClassName("dateCell");
        validFromPurchaseCell.vAlign = 'top';
        var validToPurchaseCell = $(row.insertCell(row.cells.length));
        validToPurchaseCell.addClassName("dateCell");
        validToPurchaseCell.vAlign = 'top';
        var validFromDepartureCell = $(row.insertCell(row.cells.length));
        validFromDepartureCell.addClassName("dateCell");
        validFromDepartureCell.vAlign = 'top';
        var validToDepartureCell = $(row.insertCell(row.cells.length));
        validToDepartureCell.addClassName("dateCell");
        validToDepartureCell.vAlign = 'top';
        var buttonsCell = $(row.insertCell(row.cells.length));
        buttonsCell.vAlign = 'top';
        buttonsCell.addClassName('buttonCell');

        if (rewardCondition.historic) {
            // Render cells without possibility to make changes
        	var hiddenProductCode = new Element('input', {'type': 'hidden', 'value': rewardCondition.productCode});
        	productCell.update(hiddenProductCode);
            productCell.insert(rewardCondition.productDescription);
            
            earnFactorBankNorwegianCell.update(rewardCondition.earnFactorBankNorwegian);
            earnFactorFrequentFlyerCell.update(rewardCondition.earnFactorFrequentFlyer);
            validFromPurchaseCell.update(rewardCondition.validFromPurchaseDateTime);
            validToPurchaseCell.update(rewardCondition.validToPurchaseDateTime);
            validFromDepartureCell.update(rewardCondition.validFromDepartureDateTime);
            validToDepartureCell.update(rewardCondition.validToDepartureDateTime);
        } else {
            // Render cells to be able to make changes
            // Code cell
            var hiddenId = new Element('input', {'type': 'hidden', 'value': rewardCondition.id});
            var hiddenDeparture = new Element('input', {'type': 'hidden', 'value': $("departureAirportCode").value});
            var hiddenArrival = new Element('input', {'type': 'hidden', 'value': $("arrivalAirportCode").value});

            // Product
            var productInput = Price.Util.productSelect(rewardCondition.productCode);
            productCell.update(productInput);
            productCell.insert(hiddenId);
            productCell.insert(hiddenDeparture);
            productCell.insert(hiddenArrival);

            // Earn factor cell
            var earnFactorBankNorwegianInput = Price.Util.createNumberInput(rewardCondition.earnFactorBankNorwegian);
            earnFactorBankNorwegianInput.observe('change', function(event) {
                Event.stop(event);
                this.validateEarnFactorOnChange(row.rowIndex, earnFactorBankNorwegianCell.cellIndex, this.earnFactorWarningLevelInput);
            }.bindAsEventListener(this));
            earnFactorBankNorwegianCell.update(earnFactorBankNorwegianInput);

            var imgElement = new Element('img', {src: '/price-web/images/help-about.png', onmouseover: 'rewardInfo.showInfo(event)', onmouseout:'rewardInfo.hideInfo(event)'});
            earnFactorBankNorwegianCell.insert(imgElement);

            // Earn factor cell
            var earnFactorFrequentFlyerInput = Price.Util.createNumberInput(rewardCondition.earnFactorFrequentFlyer);
            earnFactorFrequentFlyerInput.observe('change', function(event) {
                Event.stop(event);
                this.validateEarnFactorOnChange(row.rowIndex, earnFactorFrequentFlyerCell.cellIndex, this.earnFactorWarningLevelInput);
            }.bindAsEventListener(this));
            earnFactorFrequentFlyerCell.update(earnFactorFrequentFlyerInput);

            var imgElement = new Element('img', {src: '/price-web/images/help-about.png', onmouseover: 'rewardInfo.showInfo(event)', onmouseout:'rewardInfo.hideInfo(event)'});
            earnFactorFrequentFlyerCell.insert(imgElement);

            // Valid from purchase cell
            var validFromPurchaseInput = new Element('input', {'type': 'text', 'size': '10', 'value': rewardCondition.validFromPurchaseDateTime});
            validFromPurchaseCell.update(validFromPurchaseInput);

            // Valid to purchase cell
            var validToPurchaseInput = new Element('input', {'type': 'text', 'size': '10', 'value': rewardCondition.validToPurchaseDateTime});
            validToPurchaseCell.update(validToPurchaseInput);

            // Valid from departure cell
            var validFromDepartureInput = new Element('input', {'type': 'text', 'size': '10', 'value': rewardCondition.validFromDepartureDateTime});
            validFromDepartureCell.update(validFromDepartureInput);

            // Valid to departure cell
            var validToDepartureInput = new Element('input', {'type': 'text', 'size': '10', 'value': rewardCondition.validToDepartureDateTime});
            validToDepartureCell.update(validToDepartureInput);

            // Name input fields
            hiddenId.name = 'rewardConditions[' + this.numConditions + '].id';
            hiddenDeparture.name = 'rewardConditions[' + this.numConditions + '].departureAirportCode';
            hiddenArrival.name = 'rewardConditions[' + this.numConditions + '].arrivalAirportCode';
            productInput.name = 'rewardConditions[' + this.numConditions + '].productString';
            earnFactorBankNorwegianInput.name = 'rewardConditions[' + this.numConditions + '].earnFactorBankNorwegian';
            earnFactorFrequentFlyerInput.name = 'rewardConditions[' + this.numConditions + '].earnFactorFrequentFlyer';
            validFromPurchaseInput.name = 'rewardConditions[' + this.numConditions + '].validFromPurchaseDateTime';
            validToPurchaseInput.name = 'rewardConditions[' + this.numConditions + '].validToPurchaseDateTime';
            validFromDepartureInput.name = 'rewardConditions[' + this.numConditions + '].validFromDepartureDateTime';
            validToDepartureInput.name = 'rewardConditions[' + this.numConditions + '].validToDepartureDateTime';
        }

        // These buttons are not bound to historic, but should always appear
        var addPeriodButton = this.createButton('period');
        buttonsCell.insert(addPeriodButton);
        // Bind event listeners on buttons
        addPeriodButton.observe('click', function(event) {
            Event.stop(event);
            this.addPeriodAfter(row.rowIndex);
        }.bindAsEventListener(this));
        if (rewardCondition.historic) {
            var endButton = this.createButton('end');
            endButton.observe('click', function(event) {
            	Event.stop(event);
            	Price.Util.showEndPeriodForm(event, rewardCondition.id);
            }.bindAsEventListener(this));
            buttonsCell.insert(endButton);
        }
        if (!rewardCondition.historic && rewardCondition.id != '') {
            var deleteButton = this.createButton('delete');
            deleteButton.observe('click', function(event) {
            	if (confirm('Do you really want to delete this period?')) {
            		this.form.idToDelete.value = rewardCondition.id;
            		this.form.action = '../write/deletePeriodByLeg.action';
            	} else {
            		// Not confirmed => stop form submission
            		Event.stop(event);
            	}
            }.bindAsEventListener(this));
            buttonsCell.insert(deleteButton);
        }

        if (!rewardCondition.historic) {
            this.numConditions++;
        }
    },

    validateEarnFactorOnChange: function(rowIndex, cellIndex, warnLevelValue) {
        var row = $(this.table.rows[rowIndex]);
        var earnFactor = this.getValueFromCell(row.cells[cellIndex]);

        Price.Util.validateEarnFactor(earnFactor, warnLevelValue);

//        if (earnFactor != '') {
//            earnFactor = parseFloat(earnFactor);
//            if (isNaN(earnFactor)) {
//                // ...report bad earnFactorBankNorwegianValue...
//                alert('Invalid value!');
//            } else if (earnFactor > warnLevelValue) {
//                alert('You have entered an earn factor of ' + (earnFactor * 100) + '%' + '\n' + 'If it was not intended please go back and change it.');
//            }
//        }
    },

    getCondition: function(rowIndex) {
        var row = $(this.table.rows[rowIndex]);
        if (!row.hasClassName("condition")) {
            return null;
        }
        var condition = {};
        var cellIndex = 0;
        condition.productCode = this.getValueFromCell(row.cells[cellIndex++]);
        condition.earnFactorBankNorwegian = this.getValueFromCell(row.cells[cellIndex++]);
        condition.earnFactorFrequentFlyer = this.getValueFromCell(row.cells[cellIndex++]);
        condition.validFromPurchaseDateTime = this.getValueFromCell(row.cells[cellIndex++]);
        condition.validToPurchaseDateTime = this.getValueFromCell(row.cells[cellIndex++]);
        condition.validFromDepartureDateTime = this.getValueFromCell(row.cells[cellIndex++]);
        condition.validToDepartureDateTime = this.getValueFromCell(row.cells[cellIndex++]);
        return condition;
    },

    createNewCondition: function() {
        var newCondition = {
            'id'                        : '',
            'productCode'                : this.newConditionInput.value.toUpperCase(),
            'earnFactorBankNorwegian'                : 0.0,
            'earnFactorFrequentFlyer'                : 0.0,
            'validFromPurchaseDateTime' : Price.Util.formatDate(Price.Util.Tomorrow),
            'validToPurchaseDateTime'    : Price.Util.formatDate(Price.Util.Forever),
            'validFromDepartureDateTime': Price.Util.formatDate(Price.Util.Tomorrow),
            'validToDepartureDateTime'    : Price.Util.formatDate(Price.Util.Forever)
        };
        return newCondition;
    }
});


var AjaxBasedForm = Class.create({

    initialize: function(options) {
        this.options = options || {};
        this.newInput = $(this.options.newInput) || $("newInput");
        this.addButton = $(this.options.addButton) || $("addButton");
        this.saveButton = $(this.options.saveButton) || $("saveButton");
        this.confirmBox = $(this.options.confirmBox) || $("confirmBox");
        this.editButton = $(this.options.editButton) || $("editButton");
        this.dataTable = new DataTable( {
            form: this,
            renderer      : this.options.renderer || new CellRenderer(),
            editor        : this.options.editor || new CellEditor(),
            editActions   : this.options.editActions,
            defaultActions: this.options.defaultActions
        });
        this.dataUrls = this.options.dataUrls || {};
        this.data = {};

        this.newInput.observe('keypress', function (event) {
            var key = event.keyCode | event.which;
            if (key == Event.KEY_RETURN) {
                event.element().blur();
                this.onAddButtonClicked(event);
            }
        }.bindAsEventListener(this));
        this.addButton.observe('click', this.onAddButtonClicked.bindAsEventListener(this));
        this.saveButton.observe('click', this.onSaveButtonClicked.bindAsEventListener(this));
        if (this.editButton) {
            this.editButton.observe('click', this.onEditButtonClicked.bindAsEventListener(this));
        }

        this.loadData();
    },

    loadData: function() {
        var urlMap = {};
        /* Optional key argument used for reloading a set of data */
        if (arguments.length == 1) {
            var key = arguments[0];
            urlMap[key] = this.dataUrls[key];
        } else {
            urlMap = this.dataUrls;
        }

        for (var key in urlMap) {
            var url = urlMap[key];
            new Ajax.Request(url, {
                method: 'get',
                parameters: this.getLoadDataParameters(key),
                onSuccess: this.handleLoadDataSuccess.bindAsEventListener(this, key),
                onFailure: this.handleLoadDataFailure.bindAsEventListener(this, key)
            });
        }
    },

    getLoadDataParameters: function(key) {
        return {};
    },

    handleLoadDataSuccess: function(transport, key) {
        /* Parse JSON response and store in internal hash and as global variable */
        var loadedData = Price.Util.parseJSON(transport.responseText);
        this.data[key] = $A(loadedData);
        if (!window[key]) {
        	window[key] = $A(loadedData);	
        }

        /* Call handler method if defined e.g onConditionsLoaded */
        var handlerName = this.keyToHandler(key) + "Loaded";
        (this[handlerName] || Prototype.emptyFunction).call(this, loadedData);

        /* If all data is loaded then call dataLoadingFinished */
        if (Object.keys(this.dataUrls).length == Object.keys(this.data).length) {
            this.dataLoadingFinished();
        }
    },

    handleLoadDataFailure: function(transport, key) {
        Price.showError("Failed to load data from '" + this.dataUrls[key] + "'");

        /* Call handler method if defined */
        var handlerName = this.keyToHandler(key) + "Failed";
        (this[handlerName] || Prototype.emptyFunction).call(this, transport);
    },

    dataLoadingFinished: function() {
        this.dataTable.setModel(this.model);
        this.enable();
    },

    doAction: function(key) {
        this.disable();
        var args = $A(arguments);
        new Ajax.Request(this.options.actionUrls[key], {
            parameters: this.getActionParameters.apply(this, args),
            onSuccess: this.handleActionSuccess.bindAsEventListener(this, args),
            onFailure: this.handleActionFailure.bindAsEventListener(this, args)
        });
    },

    getActionParameters: function(key) {
        if (key == 'save') {
            return this.model.serialize();
        } else if (key == 'remove') {
            return { idToDelete: arguments[1] };
        } else if (key == 'end') {
            return { idToEnd: arguments[1], endDateTime: arguments[2] };
        }
        return {};
    },

    handleActionSuccess: function(transport, args) {
        var key = args.shift();
        this.enable();
        Price.clearErrors();
        Price.showMessages(transport.responseText);

        /* Call handler method if defined */
        var handlerName = this.keyToHandler(key) + "Finished";
        (this[handlerName] || Prototype.emptyFunction).apply(this, [transport].concat(args));
    },

    handleActionFailure: function(transport, args) {
        var key = args.shift();
        this.enable();
        Price.showErrors(transport.responseText);

        /* Call handler method if defined */
        var handlerName = this.keyToHandler(key) + "Failed";
        Price.Util.log("Calling " + handlerName);
        (this[handlerName] || Prototype.emptyFunction).apply(this, [transport].concat(args));
    },

    disable: function() {
        this.dataTable.disable();
        this.saveButton.disable();
        this.addButton.disable();
        this.newInput.disable();
        if (this.confirmBox) {
            this.confirmBox.disable();
        }
        if (this.editButton) {
            this.editButton.disable();
        }
    },

    enable: function() {
        this.dataTable.enable();
        this.saveButton.enable();
        this.addButton.enable();
        this.newInput.enable();
        if (this.confirmBox) {
            this.confirmBox.checked = false;
            this.confirmBox.enable();
        }
        if (this.editButton) {
            this.editButton.enable();
        }
    },

    onSaveButtonClicked: function() {
        Price.clearMessages();
        Price.clearErrors();
        var confirmed = true;
        if (this.confirmBox) {
            confirmed = this.confirmBox.checked;
        }

        if (!confirmed) {
            Price.showError('Please check the "Confirm" checkbox');
            return false;
        }

        this.doAction('save');
    },

    onEditButtonClicked: function(event) {
        Event.stop(event);
        var editable = (this.editButton.getValue() == "Edit");
        this.setEditable(editable);

        if (!editable) {
            Price.clearMessages();
            Price.clearErrors();
            this.disable();
            this.loadData('conditions');
        }
    },

    setEditable: function(editable) {
        // If the user dont have permission to edit, the button is not part of the form, ie a nullpointer occured here..
        if (this.editButton) {
            this.editButton.setValue(editable ? "Cancel" : "Edit");
        }
        this.dataTable.setEditable(editable);
        $("wrapper").select(".editContainer").invoke(editable ? 'show' : 'hide');
    },

    onSaveFinished: function(transport) {
        this.setEditable(false);
        this.loadData('conditions');
    },

    onRemoveFinished: function(transport, deletedId, row) {
        this.model.deleteRow(row);
    },

    onEndFinished: function(transport, endedId, endDate, row) {
        this.loadData('conditions');
    },

    onCloneRowClicked: function(event, row) {
        Event.stop(event);
        this.model.cloneRow(row);
    },

    onDeleteRowClicked: function(event, row) {
        Event.stop(event);
        if (confirm("Do you really want to remove this period?")) {
            var idToDelete = this.model.rowId(row);
            if (idToDelete) {
                this.doAction('remove', idToDelete, row);
            } else {
                this.model.deleteRow(row);
                Price.clearErrors();
                Price.clearMessages();
                Price.showMessage("Deleted unsaved condition");
            }
        }
    },

    onEndRowClicked: function(event, row) {
        Event.stop(event);
        var prompt = new Prompt({
            onAccept: this.onEndRowAccepted.bind(this)
        });
        prompt.show(event, row, "Purchase date to end: ", Price.Util.formatDate(Price.Util.Tomorrow));
    },

    onEndRowAccepted: function(row, endDate) {
        if (!Price.Util.parseDate(endDate)) {
            Price.clearMessages();
            Price.clearErrors();
            Price.showError("Invalid dateformat: '" + endDate + "'");
        } else {
            this.doAction('end', this.model.rowId(row), endDate, row);
        }
    },

    dataLoadingFinished: function() {
        this.dataTable.setModel(this.model);
        this.enable();
    },

    keyToHandler: function(key) {
        return "on" + key.charAt(0).toUpperCase() + key.substring(1);
    },

    onAddAmountRowClicked: function(event, row) {
        Event.stop(event);
        this.model.addAmount(row);
        this.dataTable.renderRow(row);
    },

    onShowGraphClicked: function(event, row) {
        Event.stop(event);
    }

});



var DefaultRewardForm = Class.create(AjaxBasedForm, {

    initialize: function($super, options) {
        options.renderer = new DefaultRewardRenderer();
        options.editor = new DefaultRewardEditor();

        this.history = $(options.historyList) || $("history");

        $super(options);
    },

    onConditionsLoaded: function(conditions) {
        this.model = new DefaultRewardModel(conditions);
    },

    onProductsLoaded: function(loadedProducts) {
        /* Products are put in global variable so Price.Util.productSelect can re-use data */
        products = loadedProducts;
        var callback = {
            getValue: function(product) {
                return product.code;
            },
            getText: function(product) {
                return product.description;
            }
        };
        Price.Util.selectBox(loadedProducts, 'FF', callback, this.newInput);
    },

    onMarketsLoaded: function(loadedMarkets) {
        marketTypes = loadedMarkets;
    },

    onAddButtonClicked: function(event) {
        var newCondition = {};
        newCondition.historic = false;
        newCondition.product = {};
        newCondition.product.code = this.newInput.getValue().escapeHTML();
        newCondition.marketTypeString = 'INTERNATIONAL';
        newCondition.earnFactorBankNorwegian = 0;
        newCondition.earnFactorFrequentFlyer = 0;
        newCondition.validFromPurchaseDateTime = Price.Util.Tomorrow;
        newCondition.validToPurchaseDateTime = Price.Util.Forever;
        newCondition.validFromDepartureDate = Price.Util.Tomorrow;
        newCondition.validToDepartureDate = Price.Util.Forever;
        Price.clearMessages();
        Price.clearErrors();
        this.model.addRow(newCondition);
    },

    onShowGraphClicked: function(event, row) {
        Event.stop(event);
        var product = this.model.valueAt(row, 0);
        var marketType = this.model.valueAt(row, 1);
        var url = 'showGraph.action?type=defaultReward&code=' + product.code + "&marketType=" + marketType;
        popupGraph(url);
    },

    onHistoryLoaded: function(rewardCodes) {
        this.history.hide();
        this.history.update();
        for (productCode in rewardCodes) {
            for (var i = 0, size = rewardCodes[productCode].length; i < size; i++) {
                var market = rewardCodes[productCode][i];
                var url = 'defaultRewardHistory.action?productCode=' + productCode + "&marketType=" + market;
                var link = new Element('a', {href: url}).update(productCode + "-" + market);
                this.history.insert(new Element('li').update(link));
            }
        }
/*        for (var i = 0, size = rewardCodes.length; i < size; i++) {
            var code = taxCodes[i];
            var url = 'showHistory.action?productCode=' + code + "&departureAirportCode=" + this.departureSelect.getValue() + "&arrivalAirportCode=" + this.arrivalSelect.getValue();
            var title = 'History for ' + this.departureSelect.getValue() + '-' + this.arrivalSelect.getValue() + ": " + code;
            var link = new Element('a', {href: url, title: title}).update(code);
            this.history.insert(new Element('li').update(link));
        }*/
    }
});



var DataTable = Class.create( {

    initialize: function(options) {
        this.options = options;

        this.form = this.options.form;
        this.editable = false;
        this.table = $(this.options.table) || $("dataTable");
        this.renderer = this.options.renderer || new CellRenderer();
        this.editor = this.options.editor || new CellEditor();
        this.startRow = this.table.rows.length;
        this.enabled = true;
        this.nonEditableActions = ['graph'];
        this.editActions = this.options.editActions || ['clone', 'delete'];
        this.defaultActions = this.options.defaultActions || ['clone', 'end'];

        this.table.addClassName("dataTable");
        if (this.model) {
            this.setModel(this.model);
        }
    },

    setModel: function(model) {
        /* Shrink table if necessary */
        if (this.model && this.model.rowCount() > model.rowCount()) {
            for (var i = this.startRow + model.rowCount(); i < this.table.rows.length; i++) {
                this.table.deleteRow(i--);
            }
        }
        this.model = model;
        this.model.setDataTable(this);
        this.render();
    },

    render: function() {
        var rowCount = this.model.rowCount();
        for ( var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            this.renderRow(rowIndex);
        }
    },
    
    renderClosePrevCheck: function(row) {
    	var closePrevCheckbox = new Element('input', {'type': 'checkbox'});
    	closePrevCheckbox.observe('change', function(event, row) {
    		if (closePrevCheckbox.checked) {
    			this.model.setValueAt(true, row, 13); 			
    		} else {
    			this.model.setValueAt(false, row, 13);
    		}
        }.bindAsEventListener(this, row));
    	return closePrevCheckbox;
    },
    
    renderRow: function(row) {
        var rowIndex = row + this.startRow;
        var tr = $(this.table.rows[rowIndex]);
        if (!tr) {
            tr = $(this.table.insertRow(rowIndex));
        }
        var rowClass = (row % 2 == 0) ? "even" : "odd";
        tr.setAttribute('class', rowClass);

        for ( var col = 0, colCount = this.model.colCount(); col < colCount; col++) {
            var td = $(tr.cells[col]);
            if (!td) {
                td = $(tr.insertCell(col));
            }
            td.vAlign = 'top';
            var value = this.model.valueAt(row, col);
            if (this.editable && this.model.isEditable(row, col)) {
                this.editor.render(td, value, row, col);
                /* Bind change listeners to input elements */
                var inputs = td.select('input', 'select');
                for (var i = 0, size = inputs.length; i < size; i++) {
                    inputs[i].observe('change', function(event, row, col) {
                        var oldValue = this.model.valueAt(row, col);
                        var newValue;
                        if (Object.isArray(oldValue)) {
                            newValue = new Array();
                            $(event.element().parentNode.parentNode).select('input', 'select').each(function(i, index) { newValue[index] = i.getValue(); });
                        } else {
                            newValue = event.element().getValue().escapeHTML();
                        }
                        this.model.setValueAt(newValue, row, col);
                    }.bindAsEventListener(this, row, col));
                }
            } else {
            	if (col == 12 && value == "") {
            		var id = this.model.rowId(row-1);
            		this.renderer.render(td, this.renderClosePrevCheck(row), row, col);
            		td.insert("&nbsp;Close previous");
            		this.model.setValueAt(id, row, col);
            		this.model.setValueAt(false, row, 13);
            	} else {
           			this.renderer.render(td, value, row, col);
            	}
            }
        }

        var actionCell = $(tr.cells[this.model.colCount()]);
        if (!actionCell) {
            actionCell = $(tr.insertCell(this.model.colCount()));
            actionCell.vAlign = 'top';
            actionCell.addClassName("actions");
        }
        actionCell.update();
        if (this.editable) {
            var actions = this.model.isEditable(row) ? this.editActions : this.defaultActions;
            for (var i = 0, size = actions.length; i < size; i++) {
                var button = this.createAction(actions[i], row);
                actionCell.insert(button);
            }
        } else {
            for (var i = 0, size = this.nonEditableActions.length; i < size; i++) {
                var button = this.createAction(this.nonEditableActions[i], row);
                actionCell.insert(button);
            }
        }
    },

    deleteRow: function(row) {
        var rowIndex = row + this.startRow;
        this.table.deleteRow(rowIndex);
    },

    disable: function() {
        this.enabled = false;
        this.table.select('input', 'select').invoke('disable');
    },

    enable: function() {
        this.enabled = true;
        this.table.select('input', 'select').invoke('enable');
    },

    createAction: function(type, row) {
        var button = null;
        if (type == 'clone') {
            button = new Element('input', {'type': 'image', 'title': 'Add period', 'src': '/price-web/images/edit-copy.png'});
            button.observe('click', this.form.onCloneRowClicked.bindAsEventListener(this.form, row));
        } else if (type == 'delete') {
            button = new Element('input', {'type': 'image', 'title': 'Delete period', 'src': '/price-web/images/edit-delete.png'});
            button.observe('click', this.form.onDeleteRowClicked.bindAsEventListener(this.form, row));
        } else if (type == 'end') {
            button = new Element('input', {'type': 'image', 'title': 'End period', 'src': '/price-web/images/media-playback-stop.png'});
            button.observe('click', this.form.onEndRowClicked.bindAsEventListener(this.form, row));
        } else if (type == 'amount') {
            button = new Element('input', {'type': 'image', 'title': 'Add amount', 'src': '/price-web/images/document-new.png'});
            button.observe('click', this.form.onAddAmountRowClicked.bindAsEventListener(this.form, row));
        } else if (type == 'graph') {
            button = new Element('input', {'type': 'image', 'title': 'Show graph', 'src': '/price-web/images/graph.png'});
            button.observe('click', this.form.onShowGraphClicked.bindAsEventListener(this.form, row));
        }
        return button;
    },

    setEditable: function(editable) {
        this.editable = editable;
        if (this.model) {
            this.render();
        }
    }
});



var DataModel = Class.create( {

    initialize: function(data, options) {
        this.data = data || [];
        this.options = options || {};

        this.prefix = this.options.serializePrefix || "data";
    },

    setDataTable: function(table) {
        this.table = table;
    },

    rowCount: function() {
        return this.data.length;
    },

    colCount: function() {
        return 1;
    },

    valueAt: function(row, col) {
        return this.data[row];
    },

    setValueAt: function(value, row, col) {
        Price.Util.log("[DataModel.setValueAt] Setting value (" + row + ", " + col + ") - " + Object.inspect(value));
    },

    isEditable: function(row, col) {
        return false;
    },

    addRow: function(value) {
        this.insertRow(this.data.length, value);
    },

    insertRow: function(rowIndex, value) {
        this.data.splice(rowIndex, 0, value);

        for (var i = rowIndex, size = this.rowCount(); i < size; i++) {
            this.table.renderRow(i);
        }
    },

    cloneRow: function(rowIndex) {
        var object = this.data[rowIndex];
        var clone = this.cloneDataObject(object);

        this.insertRow(rowIndex + 1, clone);
    },

    cloneDataObject: function(object) {
        return Price.Util.cloneObject(object);
    },

    serialize: function() {
        return Price.Util.toParameters(this.data, this.prefix);
    },

    deleteRow: function(rowIndex) {
        this.data.splice(rowIndex, 1);
        this.table.deleteRow(rowIndex);

        for (var i = rowIndex, size = this.rowCount(); i < size; i++) {
            this.table.renderRow(i);
        }
    },

    rowId: function(row) {
        return this.data[row].id;
    },
    
    addAmount: function(row) {
        Price.Util.log("Add amount to value in row #" + row);
    }
});



var CellRenderer = Class.create( {

    initialize: function(options) {
        this.options = options || {};
    },

    render: function(cell, value, row, col) {
        var cellContents = "";
        if (Object.isArray(value)) {
            for (var i = 0, size = value.length; i < size; i++) {
                cellContents += this.formatValue(cell, value[i], row, col);
                if ((i + 1) != size) {
                    cellContents += "<br/>";
                }
            }
        } else {
            cellContents = this.formatValue(cell, value, row, col);
            if (Object.isDateTime(value)) {
                cellContents = "<acronym title='" + value.getOffset() + "'>" + cellContents + "</acronym>";
            }
        }
        return cell.update(cellContents);
    },

    formatValue: function(cell, value, row, col) {
        if (Object.isDate(value)) {
            return Price.Util.formatDate(value);
        } else if (Object.isDateTime(value)) {
            return value.toShortString();
        } else if (Object.isNumber(value)) {
            cell.setStyle({ 'text-align': 'right' });
            return value.toFixed(2);
        } else {
            return value;
        }
    }
});



var CellEditor = Class.create(CellRenderer, {

    render: function(cell, value, row, col) {
        if (Object.isArray(value)) {
            var width = cell.getWidth();
            for (var i = 0, size = value.length; i < size; i++) {
                var editor = this.getEditorComponent(cell, value[i], row, col);
                var block = new Element('div', {'class': 'cell'}).update(editor);
                block.setStyle({'width': width + "px"});
                if (i > 0) {
                    cell.insert(block);
                } else {
                    cell.update(block);
                }
                if ((i + 1) != size) {
                    cell.insert(new Element('div', {'class': 'break'}));
                }
            }
        } else {
            var editor = this.getEditorComponent(cell, value, row, col);

            editor.observe('keypress', function(event) {
                var key = event.keyCode | event.which;
                if (key == Event.KEY_RETURN) {
                    Event.stop(event);
                    input.blur();
                }
            }.bind());
            cell.update(editor);
        }
    },

    getEditorComponent: function(cell, value, row, col) {
        var input;
        var formattedValue = this.formatValue(cell, value, row, col);
        if (Object.isDateTime(value) || Object.isDate(value)) {
            input = new Element('input', { type: 'text', value: formattedValue, size: 10 });
        } else if (Object.isNumber(value)) {
            input = new Element('input', { type: 'text', value: formattedValue, size: 7 });
            input.addClassName('number');
        } else if (Object.isBoolean(value)) {
            input = new Element('input', { type: 'checkbox', value: 'true', checked: value });
            input.addClassName('boolean');
        } else {
            input = new Element('input', { type: 'text', 'value': formattedValue });
        }
        /*input.observe('keypress', function(event) {
            var key = event.keyCode | event.which;
            if (key == Event.KEY_RETURN) {
                Event.stop(event);
                input.blur();
            }
        }.bind());*/
        return input;
    },

    formatValue: function($super, cell, value, row, col) {
        var formatted = $super(cell, value, row, col);
        return formatted;
    }
});



var DefaultRewardModel = Class.create(DataModel, {

    initialize: function($super, data) {
        $super(data, { serializePrefix: "conditions" });
    },

    colCount: function() {
        return 8;
    },

    valueAt: function(row, col) {
        var reward = this.data[row];
        if (col == 0)
            return reward.product;
        else if (col == 1)
            return reward.marketTypeString;
        else if (col == 2)
            return reward.earnFactorBankNorwegian;
        else if (col == 3)
            return reward.earnFactorFrequentFlyer;
        else if (col == 4)
            return reward.validFromPurchaseDateTime;
        else if (col == 5)
            return reward.validToPurchaseDateTime;
        else if (col == 6)
            return reward.validFromDepartureDate;
        else if (col == 7)
            return reward.validToDepartureDate;
    },

    setValueAt: function(value, row, col) {
        var reward = this.data[row];
        if (col == 0)
            reward.product = { code: value };
        else if (col == 1)
            reward.marketTypeString = value;
        else if (col == 2)
            reward.earnFactorBankNorwegian = parseFloat(value);
        else if (col == 3)
            reward.earnFactorFrequentFlyer = parseFloat(value);
        else if (col == 4)
            reward.validFromPurchaseDateTime = Price.Util.parseDate(value);
        else if (col == 5)
            reward.validToPurchaseDateTime = Price.Util.parseDate(value);
        else if (col == 6)
            reward.validFromDepartureDate = Price.Util.parseDate(value);
        else if (col == 7)
            reward.validToDepartureDate = Price.Util.parseDate(value);
    },

    isEditable: function(row, col) {
        return !this.data[row].historic;
    },

    cloneDataObject: function($super, object) {
        var clone = $super(object);
//        var productCode = clone.product.code;
//        clone.product = {code: productCode};
        return clone;
    }
});



var DefaultRewardRenderer = Class.create(CellRenderer, {

    render: function($super, cell, value, row, col) {
        if (col == 0) {
            return $super(cell, value.description, row, col); /* product */
        }

        return $super(cell, value, row, col);
    }
});



var DefaultRewardEditor = Class.create(CellEditor, {

    getEditorComponent: function($super, cell, value, row, col) {
        if (col == 0)
            return Price.Util.productSelect(value.code); /* product */
        if (col == 1) {
            return Price.Util.selectBox(marketTypes, value); /* market */
        }

        return $super(cell, value, row, col);
    }
});


var Prompt = Class.create( {

    initialize: function(options) {
        this.options = options || {};
        this.onAccept = options.onAccept || Prototype.emptyFunction;

        this.container = $("prompt");
        this.label = $("promptLabel");
        this.input = $("promptInput");
        this.acceptButton = $("promptAccept");
        this.cancelButton = $("promptCancel");

        if (!this.container) {
            this.container = new Element('div', { id: "prompt" });
            var div = new Element('div');
            this.label = new Element('label', { id: "promptLabel", 'for': "promptInput"});
            this.input = new Element('input', { id: "promptInput", type: "text" });
            div.insert(this.label);
            div.insert(this.input);
            this.container.insert(div);
            div = new Element('div');
            this.acceptButton = new Element('input', {id: "promptAccept", type: "button", value: "OK"});
            this.cancelButton = new Element('input', {id: "promptCancel", type: "button", value: "Cancel"});
            this.cancelButton.observe('click', this.hide.bindAsEventListener(this));
            div.insert(this.cancelButton);
            div.insert(this.acceptButton);
            this.container.insert(div);
            this.hide();
            $("wrapper").insert(this.container);
        }
    },

    hide: function() {
        this.container.hide();
        this.acceptButton.stopObserving('click');
        this.input.stopObserving('keypress');
    },

    show: function(event, row, msg, value) {
        this.acceptButton.observe('click', this.handleAccept.bindAsEventListener(this, row));
        this.label.update(msg);
        this.input.setValue(value);
        this.input.observe('keypress', function(event) {
            var key = event.keyCode | event.which;
            if (key == Event.KEY_RETURN) {
                this.handleAccept(event, row);
            }
        }.bind(this));
        this.container.clonePosition(event.element(), {setWidth: false, setHeight:false, offsetLeft: -10 - this.container.getWidth()});
        this.container.show();
        this.input.activate();
    },

    handleAccept: function(event, row) {
        Event.stop(event);
        this.hide();
        (this.onAccept)(row, this.input.getValue());
    }

});


var TaxesForm = Class.create(AjaxBasedForm, {

    initialize: function($super, options) {
        options.renderer = new TaxesRenderer();
        options.editor = new TaxesEditor();
        options.editActions = ['clone', 'amount', 'delete'];

        this.loadButton = $(options.loadButton) || $("retrieveLeg_0");
        this.loadOppositeButton = $(options.loadButton) || $("retrieveLeg_2");
        this.departureSelect = $(options.departureSelect) || $("departureSelect");
        this.arrivalSelect = $(options.arrivalSelect) || $("arrivalSelect");
        this.history = $(options.historyList) || $("history");

        this.loadButton.observe('click', this.onLoadButtonClicked.bindAsEventListener(this));
        this.loadOppositeButton.observe('click', this.onLoadOppositeButtonClicked.bindAsEventListener(this));

        $super(options);
    },

    onAddButtonClicked: function(event) {
        Event.stop(event);
        var code = this.newInput.getValue().toUpperCase().escapeHTML();
        if (code != "") {
            this.newInput.setValue("");
            var newCondition = {
                id                        : '',
                code                      : code,
                departureAirportCode      : this.departureSelect.getValue(),
                arrivalAirportCode        : this.arrivalSelect.getValue(),
                childFactor               : 1.0,
                infantFactor              : 0.0,
                vatCode                   : 'NV2',
                description               : '',
                validFromPurchaseDateTime : Price.Util.Tomorrow,
                validToPurchaseDateTime   : Price.Util.Forever,
                validFromDepartureDateTime: Price.Util.Tomorrow,
                validToDepartureDateTime  : Price.Util.Forever,
                internalCreationDateTime  : null,
                historic: false,
                closePrevPeriodID: '',
                closePrevPeriodIDFlag: false,
                taxAmounts: [ {
                    id: '',
                    currencyCode: 'NOK',
                    netAmount: 0,
                    transit: false
                } ]
            };
            this.model.addRow(newCondition);
        }
    },

    getLoadDataParameters: function($super, key) {
        if (key == 'conditions' || key == 'taxCodes') {
            return { departure: this.departureSelect.getValue(), arrival: this.arrivalSelect.getValue() };
        } else {
            return $super(key);
        }
    },

    onLoadButtonClicked: function(event) {
        Event.stop(event);
        this.setEditable(false);
        Price.clearErrors();
        Price.clearMessages();
        this.loadData('conditions');
    },

    onLoadOppositeButtonClicked: function(event) {
        Event.stop(event);
        var departure = this.departureSelect.getValue();
        var arrival = this.arrivalSelect.getValue();

        this.departureSelect.setValue(arrival);
        this.arrivalSelect.setValue(departure);
        this.setEditable(false);
        this.loadData('conditions');
    },

    onConditionsLoaded: function(conditions) {
        this.model = new TaxesModel(conditions);
        $("legLabel").update(this.departureSelect.getValue() + " - " + this.arrivalSelect.getValue());
        $("pricesLink").href = "../../price/read/retrieveLeg.action?departureAirportCode=" + this.departureSelect.getValue() + "&arrivalAirportCode=" + this.arrivalSelect.getValue();
        $("feesLink").href = "../../fee/read/retrieveLeg.action?departureAirportCode=" + this.departureSelect.getValue() + "&arrivalAirportCode=" + this.arrivalSelect.getValue();
        $("rewardLink").href = "../../reward/read/retrieveLeg.action?departureAirportCode=" + this.departureSelect.getValue() + "&arrivalAirportCode=" + this.arrivalSelect.getValue();
        this.loadData('taxCodes');
    },

    onShowGraphClicked: function(event, row) {
        Event.stop(event);
        var code = this.model.valueAt(row, 0);
        var url = 'showGraph.action?type=tax&code=' + code + "&departureAirport=" + this.departureSelect.getValue() + "&arrivalAirport=" + this.arrivalSelect.getValue();
        popupGraph(url);
    },

    onTaxCodesLoaded: function(taxCodes) {
        this.history.hide();
        this.history.update();
        for (var i = 0, size = taxCodes.length; i < size; i++) {
            var code = taxCodes[i];
            var url = 'showHistory.action?taxCode=' + code + "&departureAirportCode=" + this.departureSelect.getValue() + "&arrivalAirportCode=" + this.arrivalSelect.getValue();
            var title = 'History for ' + this.departureSelect.getValue() + '-' + this.arrivalSelect.getValue() + ": " + code;
            var link = new Element('a', {href: url, title: title}).update(code);
            this.history.insert(new Element('li').update(link));
        }
    }
});



var TaxesModel = Class.create(DataModel, {

    initialize: function($super, data) {
        $super(data, { serializePrefix: "taxes" });
    },

    colCount: function() {
        return 13;
    },

    valueAt: function(row, col) {
        var tax = this.data[row];
        if (col == 0)
            return tax.code;
        else if (col == 1) {
            var values = new Array();
            tax.taxAmounts.each(function(taxAmount, index) {
                values[index] = taxAmount.netAmount;
            });
            return values;
        } else if (col == 2) {
            var values = new Array();
            tax.taxAmounts.each(function(taxAmount, index) {
                values[index] = taxAmount.currencyCode;
            });
            return values;
        } else if (col == 3) {
            var values = new Array();
            tax.taxAmounts.each(function(taxAmount, index) {
                values[index] = taxAmount.transit;
            });
            return values;
        }
        else if (col == 4)
            return tax.childFactor;
        else if (col == 5)
            return tax.infantFactor;
        else if (col == 6)
            return tax.vatCode;
        else if (col == 7)
            return tax.description;
        else if (col == 8)
            return tax.validFromPurchaseDateTime;
        else if (col == 9)
            return tax.validToPurchaseDateTime;
        else if (col == 10)
            return tax.validFromDepartureDateTime;
        else if (col == 11)
            return tax.validToDepartureDateTime;
        else if (col == 12)
            return tax.internalCreationDateTime;
    },

    setValueAt: function(value, row, col) {
        var tax = this.data[row];
        if (col == 0) {
            tax.code = value;
        } else if (col == 1) {
            value.each(function(newValue, index) {
                tax.taxAmounts[index].netAmount = parseFloat(newValue);
            });
        } else if (col == 2) {
            value.each(function(newValue, index) {
                tax.taxAmounts[index].currencyCode = newValue;
            });
        } else if (col == 3) {
            value.each(function(newValue, index) {
                tax.taxAmounts[index].transit = newValue ? true : false;
            });
        }
        else if (col == 4) {
            tax.childFactor = parseFloat(value);
        } else if (col == 5) {
            tax.infantFactor = parseFloat(value);
        } else if (col == 6) {
            tax.vatCode = value;
        } else if (col == 7) {
            tax.description = value;
        } else if (col == 8) {
            tax.validFromPurchaseDateTime = Price.Util.parseDate(value);
        } else if (col == 9) {
            tax.validToPurchaseDateTime = Price.Util.parseDate(value);
        } else if (col == 10) {
            tax.validFromDepartureDateTime = no.nas.DateTime.parse(value);
        } else if (col == 11) {
            tax.validToDepartureDateTime = no.nas.DateTime.parse(value);
        } else if (col == 12) {
            tax.closePrevPeriodID = value;
	    } else if (col == 13) {
	        tax.closePrevPeriodIDFlag = value;
	    }
    },

    isEditable: function(row, col) {
        if (col == 0 || col == 12) {
            return false;
        }
        return !this.data[row].historic;
    },

    addAmount: function(row) {
        var tax = this.data[row];
        var amount = {netAmount: 0, currencyCode: 'NOK', transit: false};
        tax.taxAmounts[tax.taxAmounts.length] = amount;
    }
});



var TaxesRenderer = Class.create(CellRenderer, {

    render: function($super, cell, value, row, col) {
        if (col == 6) {
            var vat = vats.find(function(n) { return n.code == value; });
            return $super(cell, vat.code + ' - ' + vat.description + ' - ' + (vat.rate / 100) + '%', row, col);
        }

        return $super(cell, value, row, col);
    }
});



var TaxesEditor = Class.create(CellEditor, {

    getEditorComponent: function($super, cell, value, row, col) {
        if (col == 2) {
            return Price.Util.selectBox(currencies, value);
        } else if (col == 6) {
            var callback = {
                getValue: function(vat) {
                    return vat.code;
                },
                getText: function(vat) {
                    return vat.code + ' - ' + vat.description + ' - ' + (vat.rate / 100) + "%";
                }
            };
            return Price.Util.selectBox(vats, value, callback);
        } else {
            return $super(cell, value, row, col);
        }
    }

});


var RegionsPage = Class.create({
    initialize: function(options) {
        this.options = options || {};
        this.deleteRegionUrl = this.options.deleteRegionUrl;
        this.editRegionUrl = this.options.editRegionUrl;
        this.editPricesUrl = this.options.editPricesUrl;
        this.editTaxesUrl = this.options.editTaxesUrl;
        this.editFeesUrl = this.options.editFeesUrl;
        this.editRewardUrl = this.options.editRewardUrl;
        this.dupeCheckUrl = this.options.dupeCheckUrl;
        this.missingLegsUrl = this.options.missingLegsUrl;

        this.list = $(this.options.list) || $("regionList");
        this.deleteButton = $(this.options.deleteButton) || $("deleteButton");
        this.legsButton = $(this.options.legsButton) || $("legsButton");
        this.newButton = $(this.options.newButton) || $("newButton");
        this.pricesButton = $(this.options.pricesButton) || $("pricesButton");
        this.taxesButton = $(this.options.taxesButton) || $("taxesButton");
        this.feesButton = $(this.options.feesButton) || $("feesButton");
        this.rewardButton = $(this.options.rewardButton) || $("rewardButton");
        this.missingLegsButton = $(this.options.missingLegsButton) || $("missingLegsButton");
        this.duplicateLegsButton = $(this.options.duplicateLegsButton) || $("duplicateLegsButton");

        this.list.observe('change', this.listValueChanged.bindAsEventListener(this));
        this.deleteButton.observe('click', this.deleteButtonClicked.bindAsEventListener(this));
        this.legsButton.observe('click', this.legsButtonClicked.bindAsEventListener(this));
        this.newButton.observe('click', this.newButtonClicked.bindAsEventListener(this));
        this.pricesButton.observe('click', this.pricesButtonClicked.bindAsEventListener(this));
        this.taxesButton.observe('click', this.taxesButtonClicked.bindAsEventListener(this));
        this.feesButton.observe('click', this.feesButtonClicked.bindAsEventListener(this));
        this.rewardButton.observe('click', this.rewardButtonClicked.bindAsEventListener(this));
        this.missingLegsButton.observe('click', this.missingLegsButtonButtonClicked.bindAsEventListener(this));
        this.duplicateLegsButton.observe('click', this.duplicateLegsButtonClicked.bindAsEventListener(this));

        var missingLegsInfo = new InfoBox({'div': this.missingLegsButton.id + "Info"});
        $(this.missingLegsButton.id + "InfoImg").observe('mouseover', missingLegsInfo.showInfo.bind(missingLegsInfo));
        $(this.missingLegsButton.id + "InfoImg").observe('mouseout', missingLegsInfo.hideInfo.bind(missingLegsInfo));
        var duplicateLegsInfo = new InfoBox({'div': this.duplicateLegsButton.id + "Info"});
        $(this.duplicateLegsButton.id + "InfoImg").observe('mouseover', duplicateLegsInfo.showInfo.bind(duplicateLegsInfo));
        $(this.duplicateLegsButton.id + "InfoImg").observe('mouseout', duplicateLegsInfo.hideInfo.bind(duplicateLegsInfo));
    },

    listValueChanged: function (event) {
        var selectCount = 0;
        for (var i = 0, size = this.list.options.length; i < size; i++) {
            var option = this.list.options[i];
            if (option.selected) selectCount++;
        }
        Price.Util.log("Select count: " + selectCount);

        if (selectCount > 0) {
            if (selectCount > 1) {
                [this.deleteButton, this.legsButton, this.pricesButton,
                 this.taxesButton, this.feesButton, this.rewardButton].each(Form.Element.disable);
                this.duplicateLegsButton.enable();
            } else { 
                [this.deleteButton, this.legsButton, this.taxesButton, this.feesButton,
                 this.rewardButton, this.missingLegsButton].each(Form.Element.enable);
                this.duplicateLegsButton.disable();
            }
        } else {
            // Disable form elements
            [this.deleteButton, this.legsButton, this.taxesButton, this.feesButton, this.rewardButton, this.pricesButton, this.missingLegsButton, this.duplicateLegsButton]
             .each(Form.Element.disable);
        }
    },

    deleteButtonClicked: function(event) {
        if (confirm("Do you really want to delete selected region?")) { 
            Price.Util.goToUrl(this.deleteRegionUrl + "?id=" + this.list.value);
        }
    },

    legsButtonClicked: function(event) {
        Price.Util.goToUrl(this.editRegionUrl + "?id=" + this.list.value);
    },

    newButtonClicked: function(event) {
        Price.Util.goToUrl(this.editRegionUrl);
    },
    
    multipleFareClassesRequestString: function() {
        var requestString = "";
        var fareClassesCheckboxes = $$('input[name="selectedFareClasses"]');
        for ( var i = 0; i < fareClassesCheckboxes.length; i++) {
			var fareClass = fareClassesCheckboxes[i];
			if (fareClass.checked) {
				requestString += "&selectedFareClasses=" + fareClass.value;	
			}
		}
        return requestString;
    },    
    
    pricesButtonClicked: function(event) {
        Price.Util.goToUrl(this.editPricesUrl + "?id=" + this.list.value + this.multipleFareClassesRequestString());
    },

    taxesButtonClicked: function(event) {
        Price.Util.goToUrl(this.editTaxesUrl + "?id=" + this.list.value);
    },

    feesButtonClicked: function(event) {
        Price.Util.goToUrl(this.editFeesUrl + "?id=" + this.list.value);
    },

    rewardButtonClicked: function(event) {
        Price.Util.goToUrl(this.editRewardUrl + "?id=" + this.list.value);
    },

    missingLegsButtonButtonClicked: function(event) {
        var url = this.missingLegsUrl;
        var selectCount = 0;
        for (var i = 0, size = this.list.options.length; i < size; i++) {
            var option = this.list.options[i];
            if (option.selected) {
                if (selectCount++ === 0) url += "?";
                else url += "&";
                url += "regionId=" + option.value;
            }
        }
        Price.Util.goToUrl(url);
    },

    duplicateLegsButtonClicked: function(event) {
        var url = this.dupeCheckUrl;
        var selectCount = 0;
        for (var i = 0, size = this.list.options.length; i < size; i++) {
            var option = this.list.options[i];
            if (option.selected) {
                if (selectCount++ === 0) url += "?";
                else url += "&";
                url += "regionId=" + option.value;
            }
        }
        Price.Util.goToUrl(url);
    }
});


function selectBox(data, selectedValue, callback, name, onchangevalue, class_, id_, selectBox) {
    if (typeof selectBox == "undefined") {
        selectBox = new Element('select');
        if (name != "") {
        	selectBox.setAttribute("name", name);     	
        }
        selectBox.setAttribute("class", class_);
        selectBox.setAttribute("onchange", onchangevalue);
        if (id_) {
        	selectBox.setAttribute("id", id_);        	
        }
    }
    if (Object.isArray(data)) {
        for ( var index = 0, numOptions = data.length; index < numOptions; index++) {
            var dataElement = data[index];
            var option = new Element('option');
            if (typeof callback != "undefined") {
           		option.value = callback.getValue(dataElement);
           		option.text = callback.getText(dataElement);           		
            } else {
                option.value = "" + dataElement;
                option.text = "" + dataElement;
            }
            if (Prototype.Browser.IE) {
                selectBox.add(option);
            } else {
                selectBox.add(option, null);
            }
            if (option.value == selectedValue) {
                option.selected = true;
            }
        }
    }
    return selectBox;
}

var newStartInd = 4;
var formRowStartWith = 1;

var callback = {
		getValue: function(element) {
			return element.code;
		},
		getText: function(element) {
			return element.description;
		}
};
var callback2 = {
		getValue: function(element) {
			return element.code;
		},
		getText: function(element) {
			return element.code;
		}
};
var callback3 = {
		getValue: function(element) {
			return element.code + " - " + element.description;
		},
		getText: function(element) {
			return element.code + " - " + element.description;
		}
};

function addBulkUpdateFeeCurrencyRow(tableId, type) {
	if (type == 'fee') {
		inputNamePrefix = "formRow.keys";
	}
	if (type == 'bundle') {
		inputNamePrefix = "bundleRow.keys";
	}
	var table = $(tableId);
	var newRow = $(table.insertRow(3));
	newRow.setAttribute('id', type + '_new_curr_main_' + formRowStartWith);
	newRow.setAttribute('type', type + '-row');
	var empty1 = $(newRow.insertCell(0));
	empty1.update("");
	var currencyCell = $(newRow.insertCell(1));
	currencyCell.update(selectBox(currencyCodes, "", callback2, type + "_curr_select_" + formRowStartWith, "setCurrency(" + formRowStartWith + ", '" + type + "');", ""));
	var cabinCell = $(newRow.insertCell(2));
	cabinCell.update(selectBox(cabins, "", callback, inputNamePrefix + "[" + formRowStartWith + "].cabin", "", "cabin_" + type));
	var productCell = $(newRow.insertCell(3));
	productCell.update(selectBox(products, "", callback, inputNamePrefix + "[" + formRowStartWith + "].product", "", "product_" + type));
	var amountCell = $(newRow.insertCell(4));
	amountCell.update("<input type='text' onkeypress=\"return feeAmountInputValidation(event);\" class='amount_" + type + "' value='' size='7' name='" + inputNamePrefix + "[" + formRowStartWith + "].amount'><input id='" + type + "_curr_hidden_" + formRowStartWith + "' type='hidden' name='" + inputNamePrefix + "[" + formRowStartWith + "].currency' value='' class='curr_" + type + "'><img src='" + pageContext + "/images/help-about.png' onmouseover='amountInfo.showInfo(event)' onmouseout='amountInfo.hideInfo(event)'/>");
	var removeCell = $(newRow.insertCell(5));
	removeCell.update("<img title='Remove currency' src='/price-web/images/edit-delete.png' onclick=\"removeRow('" + formRowStartWith + "', '" + type + "');formRowStartWith--;\">");
	$$('[id="' + type + '_curr_hidden_' + formRowStartWith + '"]')[0].value = $$('[name="' + type + '_curr_select_' + formRowStartWith + '"]')[0].value;
	newStartInd++;
	formRowStartWith++;
}

function addPriceCurrencyRow(index) {
	var table = $('dataTable');
	var currentRowIndex = $('row-' + index).rowIndex;
	var newRowIndex = currentRowIndex + 1;
	var newRow = $(table.insertRow(newRowIndex));
	var rowIdGuid = guid();
	newRow.setAttribute("id", 'price_new_curr_main_' + newRowIndex);
	var cellEmpty = $(newRow.insertCell(0));
	cellEmpty.insert("");
	var currencyCell = $(newRow.insertCell(1));
	var currencySelectBox = selectBox(currencyCodes, "", callback2, "", "updateCurrencyCode(this, '" + rowIdGuid + "', " + index + ");", "");
	currencyCell.insert(currencySelectBox);
	var priceCell = $(newRow.insertCell(2));
	priceCell.insert("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input class=\"currencyAmount\" id=\"" + rowIdGuid + "\" type=\"text\" name=\"formRows[" + index + "].amountValues['" + currencySelectBox.value + "']\" size=7><img src=\"/price-web/images/help-about.png\" onmouseover=\"amountInfo.showInfo(event)\" onmouseout=\"amountInfo.hideInfo(event)\"/>");
	priceCell.insert("<img title='Remove currency' src='/price-web/images/edit-delete.png' onclick=\"removeRow('" + newRowIndex + "', 'price');\">");
}

function updateCurrencyCode(selectBox, guid, index) {
	var boxValue = selectBox.value;
	$(guid).name = "formRows[" + index + "].amountValues['" + boxValue + "']";
}

function removeRow(num, type) {
	$(type + "_new_curr_main_" + num).remove();
}

function setCurrency(id, type) {
	$$('[id="' + type + '_curr_hidden_' + id + '"]')[0].value = $$('[name="' + type + '_curr_select_' + id + '"]')[0].value;
}

function guid() {
    var S4 = function () {
        return Math.floor(Math.random() * 0x10000).toString(16);
    };
    return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
}

var BEGIN_OF_NUMBERS = 48;
var END_OF_NUMBERS = 57;

function feeAmountInputValidation(event) {
	var charCode = (event.which) ? event.which : event.keyCode;
	if ( (charCode >= BEGIN_OF_NUMBERS && charCode <= END_OF_NUMBERS)
      || charCode == 43
      || charCode == 45
      || charCode == 37
      || charCode == 61
      || charCode == 8
      || charCode == 59) return true;
	return false;
}

function bundleQuantityInputValidation(event) {
	var charCode = (event.which) ? event.which : event.keyCode;
	if ( (charCode >= BEGIN_OF_NUMBERS && charCode <= END_OF_NUMBERS)
		|| charCode == 8) return true;
	return false;
}

function validateSubmitFeeBulkUpdate(type) {
	var vatCode = $$('[name="vatCode"]')[0].value;
	var hasErrors = false;
	var errors = "";
	
	if (!$$('[name="formRow.feeBulkCancel"]')[0].checked && !$$('[name="bundleRow.bundleBulkCancel"]')[0].checked) {
		if (vatCode == '') {
			errors += "You have to select a VAT code<br>";
			hasErrors = true;
		}
		var currBunk = new Array();
		var currencies = $$('.curr_' + type);
		var duplicatesCurr = new Array();
		for (var i = 0; i < currencies.size(); i++) {
			if (!currBunk[currencies[i].value]) {
				currBunk[currencies[i].value] = true;			
			} else {
				if ((duplicatesCurr.indexOf(currencies[i].value) == -1)) {				
					duplicatesCurr.push(currencies[i].value);
				}
			}
		}
		
		var amountElements = $$('.amount_' + type);
		for (var i = 0; i < amountElements.size(); i++) {
			var amount = amountElements[i].value;
			var currCode = $$('.curr_' + type)[i].value;
			if (amount == '') {
				hasErrors = true;
				errors += "Amount can't be empty for " + currCode + "<br>";
			}
		}
		var currencies = $$('.curr_' + type);
		var cabins = $$('.cabin_' + type);
		var products = $$('.product_' + type);
		var bunk = new Array();
		var duplicatesIndexes = new Array();
		for (var i = 0; i < currencies.size(); i++) {
			if (cabins[i] != null && products[i] != null && currencies[i] != null) {
				if (cabins[i].value == '') {
					var cabin = 'Any';
				} else {
					var cabin = cabins[i].value;
				}
				if (products[i].value == '') {
					var product = 'Any';
				} else {
					var product = products[i].value;
				}
				if (!bunk[currencies[i].value + "-" + cabin + "-" + product]) {
					bunk[currencies[i].value + "-" + cabin + "-" + product] = true;			
				} else {
					if ((duplicatesIndexes.indexOf(currencies[i].value) == -1)) {				
						duplicatesIndexes.push(currencies[i].value);
					}
				}
			}
		}
		
		for (var i = 0; i < duplicatesIndexes.size(); i++) {
			if (duplicatesIndexes[i] != "undefined") {
				hasErrors = true;
				errors += "Duplicate cabin and product for " + duplicatesIndexes[i] + "<br>";
			}
		}
	}
	if (hasErrors) {
		$("messages").update("<div id='actionErrors'>" + errors + "</div>");
		return;		
	} else {
		$("messages").update("");
		document.forms.previewFeesForm.submit();
	}
}

function validateSubmitPricesUpdate() {
	var vatCode = $$('[name="vatCode"]')[0].value;
	var hasErrors = false;
	var errors = "";
	if (vatCode == '') {
		errors += "You have to select a VAT code<br>";
		hasErrors = true;
	}	
	if (hasErrors) {
		$("messages").update("<div id='actionErrors'>" + errors + "</div>");
		return;		
	} else {
		$("messages").update("");
		document.forms.previewPrices.submit();
	}	
}

function switchToFee() {
	$("bundle_table").setAttribute("style", "display:none");
	$("fee_table").setAttribute("style", "display:inline;");
	$("fee_selector").setAttribute("style", "margin:3px;padding:3px;background-color:rgb(209,209,209);cursor:pointer;");
	$("bundle_selector").setAttribute("style", "margin:3px;padding:3px;cursor:pointer;");
	$$('[name="ancillaryType"]')[0].value = "fee";
}

function switchToBundle() {
	$("fee_table").setAttribute("style", "display:none");
	$("bundle_table").setAttribute("style", "display:inline;");
	$("fee_selector").setAttribute("style", "margin:3px;padding:3px;cursor:pointer;");
	$("bundle_selector").setAttribute("style", "margin:3px;padding:3px;background-color:rgb(209,209,209);cursor:pointer;");
	$$('[name="ancillaryType"]')[0].value = "bundle";
}

var bundleItem = 0;

function addBundleItem() {
	var table = $('addBundleItemTable');
	if ( table.children[0].children.length === 1) {
		var captionRow = $(table.insertRow(1));
		captionRow.setAttribute('id', 'bundle_items_title');

		var quantityCell = $(captionRow.insertCell(0));
		quantityCell.setAttribute("align", "center");
		quantityCell.update("Quantity");
		
		var ancillaryCell = $(captionRow.insertCell(1));
		ancillaryCell.setAttribute("align", "center");
		ancillaryCell.update("Ancillary");
		
		var cabinCell = $(captionRow.insertCell(2));
		cabinCell.setAttribute("align", "center");
		cabinCell.update("Cabin");
		
		var productCell = $(captionRow.insertCell(3));
		productCell.setAttribute("align", "center");
		productCell.update("Product");
	}	
	
	var row = $(table.insertRow(2));
	row.setAttribute('id', 'bundle_item_row_' + bundleItem);
	row.setAttribute('type', 'bundle-row');
	row.setAttribute('align', 'left');
	
	var line0 = $(row.insertCell(0));
	line0.update("<input type=\"text\" name=\"bundleRow.bundleItems[" + bundleItem + "].quantity\" onkeypress=\"return bundleQuantityInputValidation(event);\" value=\"1\" size=\"3\" style=\"text-align: right;\">");
	
	var line1 = $(row.insertCell(1));
	line1.update(selectBox(feeAncillaries, "", callback3, "", "setAncillaryCodeDesc(" + bundleItem + ");", "", "bundle_item_ancillary_" + bundleItem));
	
	var line2 = $(row.insertCell(2));
	line2.update(selectBox(cabins, "", callback, "bundleRow.bundleItems[" + bundleItem + "].cabinCode", "", ""));
	
	var line3 = $(row.insertCell(3));
	line3.update(selectBox(products, "", callback, "bundleRow.bundleItems[" + bundleItem + "].productCode", "", ""));
	
	var line4 = $(row.insertCell(4));
	line4.update("<img title='Remove item' src='/price-web/images/edit-delete.png' onclick='onClickBundleItemRemove("+bundleItem+")'><input id=\"bundle_item_ancillary_code_" + bundleItem + "\" type=\"hidden\" name=\"bundleRow.bundleItems[" + bundleItem + "].ancillaryCode\" value=\"\"><input id=\"bundle_item_ancillary_desc_" + bundleItem + "\" type=\"hidden\" name=\"bundleRow.bundleItems[" + bundleItem + "].ancillaryDescription\" value=\"\">");
	
	bundleItem++;
	
	for (var i = 0; i <= bundleItem; i++) {
		setAncillaryCodeDesc(i);
	}	
	
}

function onClickBundleItemRemove(bundleItemNumber) {
	$('bundle_item_row_' + bundleItemNumber).remove();
	if ($('addBundleItemTable').children[0].children.length === 2)
		{$('bundle_items_title').remove();}
}

function setAncillaryCodeDesc(index) {
	var selectBox = document.getElementById('bundle_item_ancillary_' + index);
	if (selectBox) {
		document.getElementById('bundle_item_ancillary_code_' + index).value = selectBox.value.split(' - ')[0];
		document.getElementById('bundle_item_ancillary_desc_' + index).value = selectBox.value.split(' - ')[1];	
	}
}

function disableEnableBulkUpdateControls(type, value, tableId) {
	var inputs = $(tableId).getElementsBySelector('input');
	inputs.each(function(input) {
		if ((input.name != type + ".endPreviousValues") && (input.name != "formRow.feeBulkCancel") && (input.name != "bundleRow.bundleBulkCancel") && (input.type != "button")) {			
			input.disabled = value;
		}
	});
	var selects = $(tableId).getElementsBySelector('select');
	selects.each(function(select) {
		if (select.name != type + ".feeCodeDesc") {			
			select.disabled = value;
		}
	});	
}

function bulkFeeCancelOnchange() {
	if ($$('[name="formRow.feeBulkCancel"]')[0].checked) {
		$$('[name="formRow.feeBulkCancel"]')[0].value = "true";
		disableEnableBulkUpdateControls("formRow", "disabled", "feeDataTable");
	} else {
		$$('[name="formRow.feeBulkCancel"]')[0].value = "false";
		disableEnableBulkUpdateControls("formRow", false, "feeDataTable");
	}
}

function bulkBundleCancelOnchange() {
	if ($$('[name="bundleRow.bundleBulkCancel"]')[0].checked) {
		$$('[name="bundleRow.bundleBulkCancel"]')[0].value = "true";
		disableEnableBulkUpdateControls("bundleRow", "disabled", "bundleDataTable");
	} else {
		$$('[name="bundleRow.bundleBulkCancel"]')[0].value = "false";
		disableEnableBulkUpdateControls("bundleRow", false, "bundleDataTable");
	}
}

var filterTypeSingleFlag = true;
var filterTypeBulkFlag = false;

function filterTypeOnchange() {
	if ($('filterTypeSingle').checked) {
		filterTypeSingleFlag = true;
		filterTypeBulkFlag = false;
		$('filterTypeSingleDiv').setAttribute("style", "display:inline");
		$('filterTypeBulkDiv').setAttribute("style", "display:none");
		legFilter = new LegFilter();
	}
	if ($('filterTypeBulk').checked) {
		filterTypeSingleFlag = false;
		filterTypeBulkFlag = true;		
		$('filterTypeSingleDiv').setAttribute("style", "display:none");
		$('filterTypeBulkDiv').setAttribute("style", "display:inline");
		legFilter = new LegFilter();
	}
}

// for IE 8..
function prepareExpandableSelects(parentElement) {
	if (Prototype.Browser.IE) {
		var maxWidth = 500;
		
		var selects = $(parentElement).getElementsBySelector('select');
		
		selects.each(function(element) {
			if(element.wrapped == undefined) {
				var span = new Element('span', { 'class': 'select-wrapper' });
				span.setAttribute("style", "display:inline-block;float:" + element.getStyle('float') + ";width:" + element.getStyle('width') + ";height:19px;");
			 	element.wrap(span);
			 	
			 	element.setAttribute('init_width', element.getStyle('width'));
			 	element.setAttribute('init_position', element.getStyle('position'));
			 	
			    element.observe('mousedown', function() {
			    	
			    	var elementOptions = [];
			    	for (var i = 0, n = element.options.length; i < n; i++) {
			    		if (element.options[i].text) elementOptions.push(element.options[i].text);
			    	}			    	
			    	var longestOptionString = elementOptions.sort(function (a, b) { return b.length - a.length; })[0];
			    	var longestOptionStringInPixels = parseInt(longestOptionString.length) * 15;
			    	
		    		element.setAttribute("style", "width:" + longestOptionStringInPixels + "px; position:relative;top:0px;");
			    });
			    
			    element.observe('blur', function() { 
			    	selectReset(element);
			    });
		
			    element.observe('change', function() {
			    	selectReset(element);
			    });
					
				element.setAttribute('wrapped', 'true');
			}	
		});
	}
} 

function selectReset(_select) {
	_select.setAttribute("style", "width:" + _select.init_width + "; position:" + _select.init_position + "; right:" + _select.init_right);
}


function preventInputsObserver() {
	$$(":input").each(function(input) {
		preventObserver(input);
	});
}

function preventObserver(element) {
	$(element).observe('keypress', function(event) {
	    if ( event.keyCode == Event.KEY_RETURN  || event.which == Event.KEY_RETURN ) {
	        Event.stop(event);
	    }
	});		
}

function isClosePeriod(element) {
	if (element.checked) {
		element.value = "true";
	} else {
		element.value = "false";
	}
}

function checkPriceButton() {
	var anyChecked = false;
    var fareClassesCheckboxes = $$('input[name="selectedFareClasses"]');
    for ( var i = 0; i < fareClassesCheckboxes.length; i++) {
 		if (fareClassesCheckboxes[i].checked) {
			anyChecked = true;			
		}
	}
    if (anyChecked) {
    	$("pricesButton").enable();
    } else {
    	$("pricesButton").disable();
    }
}

function checkAllFareClasses() {
	var action = $('checkAllFareClasses').checked;
    var fareClassesCheckboxes = $$('input[name="selectedFareClasses"]');
    for ( var i = 0; i < fareClassesCheckboxes.length; i++) {
    	if (action) {
    		fareClassesCheckboxes[i].checked = "checked";
    	} else {
    		fareClassesCheckboxes[i].checked = false;
    	}
	}
    checkPriceButton();
}

function toggleSearchHelp() {
	var div = document.getElementById("search-docs");
	if(div.style.display == 'none') {
		div.style.display = 'block';	
	} else {
		div.style.display = 'none';	
	}
}

function submitSearchSortingForm(columnName, isAscending) {
	document.getElementById("hiddenSearchName").setAttribute("value", columnName);
	document.getElementById("form").submit();
}

function sortFeesBy(column, ascending) {
	var departure = document.getElementById('departureSelect').value;
	var arrival = document.getElementById('arrivalSelect').value;
	Price.Util.goToUrl('/price-web/fee/read/retrieveLeg.action?departureAirportTmp=' + departure + '&arrivalAirportTmp=' + arrival + '&sortColumn=' + column + '&sortDirection=' + ascending);
}

function sortDefaultFeesBy(column, ascending) {
	Price.Util.goToUrl('/price-web/fee/read/viewDefaultFees.action?sortColumn=' + column + '&sortDirection=' + ascending);
}