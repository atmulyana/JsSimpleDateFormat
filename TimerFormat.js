/*! ****
JsSimpleDateFormat v3.0.0
This library is for formatting and parsing date time

Copyright (C) AT Mulyana (atmulyana@yahoo.com)

This library is free software; you can redistribute it and/or modify it
under the terms of the GNU Lesser General Public License version 3.0
or later version
See http://gnu.org/licenses/lgpl.html

Visit https://github.com/atmulyana/JsSimpleDateFormat
*****/

function TimerFormatSymbols(symbols) {
	var oSymbols, oDefSymbols = TimerFormatSymbols.__symbols__.en;
    if (typeof(symbols) == 'object') {
        oSymbols = symbols;
    }
    else {
        if (!TimerFormatSymbols.__symbols__[symbols]) symbols = 'en';
	    oSymbols = TimerFormatSymbols.__symbols__[symbols];
    }
	this._symbols = {};
	for (var p in oDefSymbols) {
		this._symbols[p] = oSymbols[p] || oDefSymbols[p];
	}
}
TimerFormatSymbols.prototype = {
	getFewSeconds: function() {
		return this._symbols.fewSeconds;
	},
	getAMinute: function() {
		return this._symbols.aMinute;
	},
	getMinutes: function() {
		return this._symbols.minutes;
	},
	getAnHour: function() {
		return this._symbols.anHour;
	},
	getHours: function() {
		return this._symbols.hours;
	},
	getADay: function() {
		return this._symbols.aDay;
	},
	getDays: function() {
		return this._symbols.days;
	},
	getAMonth: function() {
		return this._symbols.aMonth;
	},
	getMonths: function() {
		return this._symbols.months;
	},
	getAYear: function() {
		return this._symbols.aYear;
	},
	getYears: function() {
		return this._symbols.years;
	},
    setFewSeconds: function(s) {
		this._symbols.fewSeconds = s;
	},
	setAMinute: function(s) {
		this._symbols.aMinute = s;
	},
	setMinutes: function(s) {
		this._symbols.minutes = s;
	},
	setAnHour: function(s) {
		this._symbols.anHour = s;
	},
	setHours: function(s) {
		this._symbols.hours = s;
	},
	setADay: function(s) {
		this._symbols.aDay = s;
	},
	setDays: function(s) {
		this._symbols.days = s;
	},
	setAMonth: function(s) {
		this._symbols.aMonth = s;
	},
	setMonths: function(s) {
		this._symbols.months = s;
	},
	setAYear: function(s) {
		this._symbols.aYear = s;
	},
	setYears: function(s) {
		this._symbols.years = s;
	}
};
TimerFormatSymbols.__symbols__ = {
	en: {
		fewSeconds: 'a few seconds',
		aMinute: 'a minute',
		minutes: '${count} minutes',
		anHour: 'an hour',
		hours: '${count} hours',
        aDay: 'a day',
        days: '${count} days',
        aMonth: 'a month',
        months: '${count} months',
        aYear: 'a year',
        years: '${count} years'
	},
	id: {
		fewSeconds: 'beberapa detik',
		aMinute: 'semenit',
		minutes: '${count} menit',
		anHour: 'satu jam',
		hours: '${count} jam',
        aDay: 'sehari',
        days: '${count} hari',
        aMonth: 'sebulan',
        months: '${count} bulan',
        aYear: 'setahun',
        years: '${count} tahun'
	}
};

var TimerFormat;
(function() {
    var isModule = typeof(module) == 'object' && !!module.exports, plugin;
    if (typeof(NetDateTimeFormat) != 'function' && isModule) {
        plugin = require('./NetDateTimeFormat.js');
        var NetDateTimeFormat = plugin.NetDateTimeFormat;
    }
    if (typeof(JsSimpleDateFormat) != 'function' && isModule) {
        plugin = require('./JsSimpleDateFormat.js');
        var JsSimpleDateFormat = plugin.JsSimpleDateFormat;
        var FormatError = plugin.FormatError;
    }

    var oTicks = {
        day: 24 * 60 * 60 * 1000,
        hour: 60 * 60 * 1000,
        minute: 60 * 1000,
        second: 1000
    };

    function Range(sName, iStart, iTicks) {
        this.name = sName;
        this.start = iStart,
        this.ticks = iTicks;
    }

    TimerFormatSymbols.__ranges__ = [
        new Range('fewSeconds', 0),
		new Range('aMinute', 45000),
		new Range('minutes', 1.5 * oTicks.minute, oTicks.minute),
		new Range('anHour', 45 * oTicks.minute),
		new Range('hours', 90 * oTicks.minute, oTicks.hour),
        new Range('aDay', 22 * oTicks.hour),
        new Range('days', 36 * oTicks.hour, oTicks.day),
        new Range('aMonth', 26 * oTicks.day),
        new Range('months', 45 * oTicks.day,  30 * oTicks.day),
        new Range('aYear', 320 * oTicks.day),
        new Range('years', 548 * oTicks.day, 365 * oTicks.day)
    ];

    function dt(oLtr) {
        if (oLtr.dt.getTime() < 0) {
            return new Date(-oLtr.dt.getTime());
        }
        return oLtr.dt;
    }

    function set(oDate, val, sFnSet) {
        if (oDate.getTime() < 0) {
            var oDt = new Date(-oDate.getTime());
            oDt[sFnSet](val);
            oDate.setTime(-oDt.getTime());
        }
        else {
            oDate[sFnSet](val);
        }
        return oDate;
    }

    TimerFormat = function(sPattern, param) {
        NetDateTimeFormat.call(this, sPattern, param);
    };
    TimerFormat.__extends__(NetDateTimeFormat, {
        _arFN: ['days', 'hour', 'minute', 'second', 'ms', 'sign'],
        _getDefaultPattern: function() {
			return "hh:mm:ss";
		},
		_getInitDate: function() {
			return new Date(0);
		},
		_setFormatSymbols: function(param) {
			if (param) {
                if (param instanceof TimerFormatSymbols) this.setTimerFormatSymbols(param);
                else this.setTimerFormatSymbols(new TimerFormatSymbols(param));
            } else {
                this.setTimerFormatSymbols(new TimerFormatSymbols('en'));
            }
		},
        approxFormat: function(oDate, sPrefix, sSuffix) {
            var iTime = Math.abs(typeof(oDate) == 'number' ? oDate : oDate.getTime());
            var arRange = TimerFormatSymbols.__ranges__;
            for (var i = 0; arRange[i+1] && arRange[i+1].start <= iTime; i++);
            var oRange = arRange[i],
                sMethod = 'get' + oRange.name.charAt(0).toUpperCase() + oRange.name.substring(1),
                s = this._fmtSb[sMethod]();
            if (oRange.ticks) {
                var iCount = Math.round(iTime / oRange.ticks);
                if (iCount < 2) iCount = 2;
                s = s.replaceAll('${count}', iCount);
            }
            if (sPrefix) {
                sPrefix = (sPrefix + "").trim();
                if (sPrefix) s = sPrefix + " " + s;
            }
            if (sSuffix) {
                sSuffix = (sSuffix + "").trim();
                s = s + " " + sSuffix;
            }
            return s;
        },
        format: function(oDate) {
            if (!(oDate instanceof Date)) oDate = new Date(oDate);
            return NetDateTimeFormat.prototype.format.call(this, oDate);
        },
		getDateFormatSymbols: function() {
			throw "Unimplemented";
		},
		getTimerFormatSymbols: function() {
			return this._fmtSb;
		},
		setDateFormatSymbols: function(oFormatSymbols) {
			throw "Unimplemented";
		},
		setTimerFormatSymbols: function(oFormatSymbols) {
			this._fmtSb = oFormatSymbols;
		}
    });

    var _ch =  TimerFormat.prototype._ch,
        ch = {};
    TimerFormat.prototype._ch = ch;

    /** Days */
    ch.d = function() {
        JsSimpleDateFormat._Number.call(this);
    }
    ch.d.__extends__(JsSimpleDateFormat._Number, {
        name: 'days',
        applyParseValue: function(oDate, oFields) {
            var iSign = 1, iTime = oDate.getTime();
            if (iTime < 0) {
                iSign = -1;
                iTime = -iTime;
            }
            var iDays = this.getParseValue(oFields),
                iTime = iTime % oTicks.day;
            oDate.setTime( iSign * iDays * oTicks.day + iTime );
            return oDate;
        },
        getValue: function() {
            return Math.floor(Math.abs(this.dt.getTime()) / oTicks.day);
        }
    });

    /** Hours (0-23) */
    ch.h = function() {
        _ch.H.call(this);
    };
    ch.h.__extends__(_ch.H, {
        applyParseValue: function(oDate, oFields) {
			return set(oDate, this.getParseValue(oFields), 'setUTCHours');
		},
		getValue: function() {
			return dt(this).getUTCHours();
		}
    });
    
    /** Minutes */
    ch.m = function() {
        _ch.m.call(this);
    };
    ch.m.__extends__(_ch.m, {
        applyParseValue: function(oDate, oFields) {
			return set(oDate, this.getParseValue(oFields), 'setUTCMinutes');
		},
		getValue: function() {
			return dt(this).getUTCMinutes();
		}
    });

    /** Seconds */
    ch.s = function() {
        _ch.s.call(this);
    };
    ch.s.__extends__(_ch.s, {
        applyParseValue: function(oDate, oFields) {
			return set(oDate, this.getParseValue(oFields), 'setUTCSeconds');
		},
		getValue: function() {
			return dt(this).getUTCSeconds();
		}
    });

    /** Millseconds */
    ch.f = function() {
        _ch.f.call(this);
    };
    ch.f.__extends__(_ch.f, {
        applyParseValue: function(oDate, oFields) {
			return set(oDate, this.getParseValue(oFields), 'setUTCMilliseconds');
		},
		getValue: function() {
			return dt(this).getUTCMilliseconds();
		}
    });

    /** Millseconds without trailing zero(s) */
    ch.F = function() {
        _ch.F.call(this);
    };
    ch.F.__extends__(_ch.F, {
        applyParseValue: ch.f.prototype.applyParseValue,
		getValue: ch.f.prototype.getValue
    });

    ch["."] = _ch["."];

    ch["-"] = function() {
        JsSimpleDateFormat._Ltr.call(this);
        this._parseVal = 0;
    }
    ch["-"].__extends__(JsSimpleDateFormat._Ltr, {
        name: "sign",
        addCount: function() {
			throw new FormatError('Sign specifier should be one');
		},
		applyParseValue: function(oDate) {
			if (this.getValue() && oDate.getTime() > 0) oDate.setTime(-oDate.getTime()); 
            return oDate;
		},
		getValue: function() {
			return this._parseVal;
		},
        parse: function(s) {
            if (s.indexOf('-') == 0) {
                this._parseVal = -1;
                return 1;
            }
            else {
                this._parseVal = 0;
                return 0;
            }
        },
        toStr: function() {
            return this.dt.getTime() < 0 ? "-" : "";
        }
    });
    
    ch["'"] = _ch["'"];
    ch["\\"] = _ch["\\"];

    if (isModule) module.exports = {
        TimerFormat: TimerFormat,
        TimerFormatSymbols: TimerFormatSymbols
    };
})();