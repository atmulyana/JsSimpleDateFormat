/*! ****
JsSimpleDateFormat v3.0.2
This library is for formatting and parsing date time

Copyright (C) AT Mulyana (atmulyana@yahoo.com)

This library is free software; you can redistribute it and/or modify it
under the terms of the GNU Lesser General Public License version 3.0
or later version
See http://gnu.org/licenses/lgpl.html

Visit https://github.com/atmulyana/JsSimpleDateFormat
*****/
var DateTimeFormatInfo = {
    DateSeparator: "/",
    TimeSeparator: ":"
};

var NetDateTimeFormat;
if (typeof(JsSimpleDateFormat) == 'undefined') {
    var JsSimpleDateFormat, FormatError;
}

(function() {
    var isModule = typeof(module) == 'object' && !!module.exports;
    if (typeof(JsSimpleDateFormat) != 'function' && isModule) {
        var plugin = require('./JsSimpleDateFormat.js');
        JsSimpleDateFormat = plugin.JsSimpleDateFormat;
        FormatError = plugin.FormatError;
    }

    NetDateTimeFormat = function(sPattern, param) {
        JsSimpleDateFormat.call(this, sPattern, param);
    }
    NetDateTimeFormat.__extends__(JsSimpleDateFormat, {
        _getDefaultPattern: function() {
			return "d MMMM yyyy hh:mm tt";
		},
    });

    var _ch =  NetDateTimeFormat.prototype._ch,
        ch = {};
    NetDateTimeFormat.prototype._ch = ch;

    /** The day number in a month. If it has 3 or more letters then it's the day name like _ch.E. */
    ch.d = function() {
        _ch.d.call(this);
    }
    ch.d.__extends__(_ch.d, _ch.E.prototype, {
        name: _ch.d.prototype.name, //reverts the value overwritten by _ch.E.prototype.name
        _getParent: function() {
            return this.isNumber() ? _ch.d.prototype : _ch.E.prototype;
        },
        addCount: function() {
            _ch.d.prototype.addCount.call(this);
            this.name = this._getParent().name;
        },
        applyParseValue: function(oDate, oFields) {
            return this._getParent().applyParseValue.call(this, oDate, oFields);
        },
        getValue: function() {
            return this._getParent().getValue.call(this);
        },
        isNumber: function() {
            return this._count < 3;
        },
        isValidVal: function(iVal) {
            return iVal >= 1 && iVal <= 31;
        },
        parse: function(s) {
            return this._getParent().parse.call(this, s);
        },
        toStr: function() {
            return this._getParent().toStr.call(this);
        }
    });

    /** millisecond */
    ch.f = function() {
        _ch.S.call(this);
    }
    ch.f.__extends__(_ch.S, {
        _parseNumber: function(sVal) {
            if (sVal == "") return parseInt("NaN");
            if (sVal.length > 3) {
                //The value less than a millisecond is not supported in javascript
			    if (sVal.substring(3).replaceAll('0', '') != '') return parseInt("NaN");
                sVal = sVal.substring(0, 3);
            }
            else if (sVal.length < 3) {
                sVal = (sVal+"00").substring(0, 3);
            }
            return parseInt(sVal, 10);
		},
        toStr: function() {
            var sVal = ("000"+this.getNumber()).slice(-3);
            if (this._count < 3) sVal = sVal.substring(0, this._count);
            else if (this._count > 3) while (sVal.length < this._count) sVal = sVal + "0";
            return sVal;
        }
    });

    /** millisecond without trailing zero(s) (.100 is to be .1) */
    ch.F = function() {
        ch.f.call(this);
    }
    ch.F.__extends__(ch.f, {
        _getNumberStr: function(s) {
            if ((this.prev instanceof ch["."]) && this.prev.getParseValue() == 0 /* dec point not exist */) return ""; //the millisecond must not exist too
            return ch.f.prototype._getNumberStr.call(this, s);
        },
        _parseNumber: function(sVal) {
            if (sVal == "") return 0;
			return ch.f.prototype._parseNumber.call(this, sVal);
		},
		toStr: function() {
            return ("000"+this.getNumber()).slice(-3).substring(0, this._count).replace(/0+$/, '');
        }
    });

    /** Era designator such as AD or BC */
    ch.g = function() {
        _ch.G.call(this);
    }
    ch.g.__extends__(_ch.G);

    ch.h = _ch.h; //Hour (1-12)
    ch.H = _ch.H; //Hour (0-23)
    ch.m = _ch.m; //Minute
    ch.M = _ch.M; //Month
    ch.s = _ch.s; //Second

    /** AM/PM marker in time */
    ch.t = function() {
        _ch.a.call(this);
    }
    ch.t.__extends__(_ch.a, {
        getShortValues: function() {
            return this.fmtSb.getShortAmPmStrings();
        },
        isShort: function() {
            return this._count == 1;
        }
    });

    /** Year */
    ch.y = function() {
        _ch.y.call(this);
    }
    ch.y.__extends__(_ch.y, {
        _isTwoDigitsYear: function(iDigitCount) {
			return this._count < 3 // yy or y in pattern
                && iDigitCount < 3; // 1 or 2 digits in string
		},
		toStr: function() {
            if (this._count == 1) return (this.getNumber() % 100) + "";
            return _ch.y.prototype.toStr.call(this);
        }
    });

    /** Timezone */
    ch.z = function() {
        _ch.z.call(this);
    }
    ch.z.__extends__(_ch.z, {
        _regex: [
            /^(\+|-)(\d{1,2})/,
            /^(\+|-)(\d{2})/,
            /^(\+|-)(\d{1,2}):(\d{2})/ 
        ],
        parse: function(s) {
            var sSign = "+", sHour = "0", sMinute = "0";
            var arMatch = this._count == 1 ? this._regex[0].exec(s) :
                          this._count == 2 ? this._regex[1].exec(s) :
                                             this._regex[2].exec(s);
            if (arMatch != null) {
                sSign = arMatch[1];
                sHour = arMatch[2];
                if (arMatch[3]) sMinute = arMatch[3];
                this._setParseValue(sSign, sHour, sMinute);
                if (!isNaN(this._parseVal)) return arMatch[0].length;
            }
            return -1;
        },
        toStr: function() {
            var arComp = this._getTzComp();
            return this._count == 1 ? arComp[0] + arComp[3] :
                   this._count == 2 ? arComp[0] + arComp[1] :
                                      arComp[0] + arComp[1] + ":" + arComp[2];
        }
    });

    /** Timezone with Z for UTC time */
    ch.K = function() {
        _ch.X.call(this);
        this._count = 3; //always uses format: +/-hh:mm
    }
    ch.K.__extends__(_ch.X, {
        addCount: function() {
            this._count = 3;
        }
    });

    ch["."] = function() {
        JsSimpleDateFormat._Base.call(this);
        this._parseVal = -1;
    }
    ch["."].__extends__(JsSimpleDateFormat._Base, {
        getParseValue: function() {
			return this._parseVal;
		},
		parse: function(s) {
            this._parseVal = (s.indexOf('.') == 0)       ? 1 :
                             (this.next instanceof ch.F) ? 0 :
                                                          -1;
            return this._parseVal;
        },
        toStr: function() {
            if ((this.next instanceof ch.F) && this.next.toStr() == "") return "";
            return ".";
        }
    });

    ch["'"] = function() {
        this._isEscaped = false;
        this._isToEnd = false;
    }
    ch["'"].prototype = {
        _char: "'",
        append: function(c, oStr) {
            if (this._isToEnd) return false;
            if (this._isEscaped) {
                oStr.append(c);
                this._isEscaped = false;
            }
            else if (c == "\\") {
                this._isEscaped = true;
            }
            else if (c == this._char) {
                this._isToEnd = true;
            }
            else {
                oStr.append(c);
            }
            return true;
        },
        unterminated: function() {
            if (this._isToEnd) return; //actually reached the end (happens if the closing quote is the end of string)
            throw new FormatError("Unterminated quote `"+this._char+"`");
        }
    };

    ch['"'] = function() {
        ch["'"].call(this);
    }
    ch['"'].__extends__(ch["'"], {
        _char: '"'
    });

    ch["\\"] = function() {
        this._isToEnd = false;
    }
    ch["\\"].prototype = {
        _char: "\\",
        append: function(c, oStr) {
            if (this._isToEnd) return false;
            oStr.append(c);
            this._isToEnd = true;
            return true;
        },
        unterminated: function() {
            if (this._isToEnd) return; //the escaped char is at the end of string
            throw new FormatError("Unterminated pattern. Backslash must be followed by a character."); //it happens if backslash is at the end of string
        }
    };

    ch["/"] = function(oStr) {
        oStr.append(DateTimeFormatInfo.DateSeparator);
    }
    ch["/"].prototype = {
        _char: "/",
        append: function() {
            return false;
        },
        unterminated: function() {
        }
    };

    ch[":"] = function(oStr) {
        oStr.append(DateTimeFormatInfo.TimeSeparator);
    }
    ch[":"].prototype = {
        _char: ":",
        append: function() {
            return false;
        },
        unterminated: function() {
        }
    };

    if (isModule) module.exports = {
        DateTimeFormatInfo: DateTimeFormatInfo,
        NetDateTimeFormat: NetDateTimeFormat
    };
})();
