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
Function.prototype.__extends__ = function(fParent,oExtMembers) {
	this.prototype = new fParent();
	for (var i = 1; i<arguments.length; i++) {
		for (var m in arguments[i]) {
			if (this.prototype[m] !== arguments[i][m]) //needs to check because assignment always creates new property on instance even if the ancestors instance already has the same property with the same value
				this.prototype[m] = arguments[i][m];
		}
	}
}

if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(/^\s+/,'').replace(/\s+$/,'');
	};
}

function FormatError(message) {
	this.message = message;
}
FormatError.prototype = new Error();

function JsDateFormatSymbols(sLocale) {
	if (!JsDateFormatSymbols.__symbols__[sLocale]) sLocale = 'en';
	var oSymbols = JsDateFormatSymbols.__symbols__[sLocale],
	    oDefSymbols = JsDateFormatSymbols.__symbols__.en;
	for (var p in oDefSymbols) {
		var ar = [].concat(oSymbols[p] || oDefSymbols[p]);
		this._setMap(ar);
		this['_'+p] = ar;
	}
	if (this._amPmStrings) {
		this._shortAmPmStrings = []
		for (var i=0; i<this._amPmStrings.length; i++) this._shortAmPmStrings.push(this._amPmStrings[i].charAt(0));
		this._setMap(this._shortAmPmStrings);
	}
}
JsDateFormatSymbols.prototype = {
	_setMap: function(arSymbols) {
		var map = {};
		for (var i=0; i<arSymbols.length; i++) map[arSymbols[i].toUpperCase()] = i;
		arSymbols.__map__ = map;
	},
	getAmPmStrings: function() {
		return this._amPmStrings;
	},
	getShortAmPmStrings: function() {
		return this._shortAmPmStrings;
	},
	getEras: function() {
		return this._eras;
	},
	getMonths: function() {
		return this._months;
	},
	getShortMonths: function() {
		return this._shortMonths;
	},
	getShortWeekdays: function() {
		return this._shortWeekdays;
	},
	getWeekdays: function() {
		return this._weekdays;
	},
	setAmPmStrings: function(arAmPmStrings) {
		this._setMap(arAmPmStrings);
		this._amPmStrings = arAmPmStrings;
		this._shortAmPmStrings = []
		for (var i=0; i<this._amPmStrings.length; i++) this._shortAmPmStrings.push(this._amPmStrings[i].charAt(0));
		this._setMap(this._shortAmPmStrings);
	},
	setEras: function(arEras) {
		this._setMap(arEras);
		this._eras = arEras;
	},
	setMonths: function(arMonths) {
		this._setMap(arMonths);
		return this._months = arMonths;
	},
	setShortMonths: function(arShortMonths) {
		this._setMap(arShortMonths);
		return this._shortMonths = arShortMonths;
	},
	setShortWeekdays: function(arShortWeekdays) {
		this._setMap(arShortWeekdays);
		return this._shortWeekdays = arShortWeekdays;
	},
	setWeekdays: function(arWeekdays) {
		this._setMap(arWeekdays);
		return this._weekdays = arWeekdays;
	}
};
JsDateFormatSymbols.__symbols__ = {
	en: {
		amPmStrings: ['AM','PM'],
		eras: ['AD','BC'],
		months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
		shortMonths: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		shortWeekdays: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
		weekdays: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
	},
	id: {
		amPmStrings: ['AM','PM'],
		eras: ['M','SM'],
		months: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','Nopember','Desember'],
		shortMonths: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nop','Des'],
		shortWeekdays: ['Min','Sen','Sel','Rab','Kam','Jum','Sab'],
		weekdays: ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
	}
};

function JsSimpleDateFormat(sPattern, param) {
	this._arPtn = [];
	this._ptn = null;
	this.flexWhiteSpace = true;
	this.isLenient = false;
	
	if (sPattern) this.applyPattern(sPattern);
	else this.applyPattern(this._getDefaultPattern());
	this._setFormatSymbols(param);
	
	var oStDt = new Date();
	try {
		oStDt.setFullYear(oStDt.getFullYear()-80); //See if error prior to 1970 GMT
	} catch (e) {
		oStDt = new Date(0);
	}
	this.set2DigitYearStart(oStDt);
}

(function() {

	function Base() {
	}
	JsSimpleDateFormat._Base = Base;
	Base.prototype = {
		/** next component in the pattern string */
		next: null,
		/** previous component in the pattern string */
		prev: null,
		/** does this component have numeric value? */
		isNumber: function() {
			return false;
		},
		/** parses a string to get the value of this component */
		parse: function(s) {
			return -1;
		},
		/** returns a string that represents this component */
		toStr: function() {
			return "";
		}
	};

	/** Represents the part in pattern that will not be interpreted (in parsing or fromatting) */
	function Str(sInitVal) {
		Base.call(this);
		this._vals = [];
		if (sInitVal) this.append(sInitVal);
	}
	JsSimpleDateFormat._Str = Str;
	Str.__extends__(Base, {
		flexWhiteSpace: false,
		append: function(s) {
			this._vals.push(s);
		},
		parse: function(s) {
			var sVal = this.toStr();
			if (this.flexWhiteSpace) {
				var sRe = sVal.replace(/\s+/g," ");
				if (sRe == " ") sRe = "\\s+";
				else sRe = "\\s*" + sRe.trim().replace(/([^a-zA-Z0-9\s])/g,"\\$1").replace(/\s+/g,"\\s+") + "\\s*";
				var reVal = new RegExp("^("+sRe+")"),
				    arMatch = reVal.exec(s);
				if (arMatch != null) return arMatch[0].length;
			} else {
				if (s.indexOf(sVal) == 0) return sVal.length;
			}
			return -1;
		},
		toStr: function() {
			return this._vals.join("");
		}
	});

	/** Base class for letters that have meaning in pattern  */
	function Ltr() {
		Base.call(this);
		this._count = 1;
		this._parseVal = parseInt("NaN");
	}
	JsSimpleDateFormat._Ltr = Ltr;
	Ltr.__extends__(Base, {
		/** name of date-time component (day, month, year etc.) */
		name: "",
		/** the contained Date object */
		dt: new Date(),
		/** localized names of date-time component */
		fmtSb: new JsDateFormatSymbols('en'),
		/** to add the count of letter in pattern string. Called when applying a pattern string */
		addCount: function() {
			this._count++;
		},
		/** after parsing and get the parsed value for this date-time component, it's to set the new value to the Date object  */
		applyParseValue: function(oDate, oFields) {
			return oDate;
		},
		/** The value of this date-time component yielded by the parsing process. It should be the same as `getValue` if valid.  */
		getParseValue: function(oFields) {
			return this._parseVal;
		},
		/** value of this date-time component returned by the contained Date object */
		getValue: function() {
			return -1;
		}
	});

	/** Base class for pattern letters which represent the text such as day name, month name, am/pm and era designator. */
	function Text() {
		Ltr.call(this);
	}
	JsSimpleDateFormat._Text = Text;
	Text.__extends__(Ltr, {
		/** array index for the value of this date-time component if sought in the array of names (getLongValues/getShortValues)  */
		getIndex: function() {
			return -1;
		},
		/** text representation in long format */
		getLong: function() {
			var i = this.getIndex(), arVals = this.getLongValues();
			if (i >= 0 && i < arVals.length) return arVals[i];
			return "";
		},
		/** array of all possible names for this date-time component in long format */
		getLongValues: function() {
			return [];
		},
		/** text representation in short format */
		getShort: function() {
			var i = this.getIndex(), arVals = this.getShortValues();
			if (i >= 0 && i < arVals.length) return arVals[i];
			return "";
		},
		/** array of all possible names for this date-time component in short format */
		getShortValues: function() {
			return [];
		},
		getValue: function() {
			return this.getIndex();
		},
		/** is pattern using short format? */
		isShort: function() {
			return this._count < 4;
		},
		parse: function(s) {
			this._parseVal = parseInt("NaN");
			var arLong = this.getLongValues(), arShort = this.getShortValues();
			var re = new RegExp("^("+arLong.join("|")+"|"+arShort.join("|")+")", "i"),
			    arMatch = re.exec(s);
			if (arMatch == null) return -1;
			var sVal = arMatch[0].toUpperCase();
			if (arLong.__map__[sVal] !== undefined) {
				this._parseVal = arLong.__map__[sVal];
				return sVal.length;
			}
			if (arShort.__map__[sVal] !== undefined) {
				this._parseVal = arShort.__map__[sVal];
				return sVal.length;
			}
		},
		toStr: function() {
			if (this.isShort()) return this.getShort();
			return this.getLong();
		}
	});


	/** Base class for pattern letters which represent the number such as day of month, hour, minute etc. */
	function Numb() {
		Ltr.call(this);
	}
	JsSimpleDateFormat._Number = Numb;
	Numb.__extends__(Ltr, {
		/** gets the numeric text from the parsed string that fits for this date-time component */
		_getNumberStr: function(s) {
			var i = 0, c = s.charAt(0), sVal = "";
			if (this._isNN()) while(i < this._count && c >= '0' && c <= '9') {
				sVal += c;
				if (++i < s.length) c = s.charAt(i); else break;
			}
			else while(c >= '0' && c <= '9') { //If next pattern is not number, include all the rest numeric character (this._count is ignored)
				sVal += c;
				if (++i < s.length) c = s.charAt(i); else break;
			}
			return sVal;
		},
		/** is the next component is Number component? */
		_isNN: function() {
			return this.next && this.next.isNumber();
		},
		/** converts the text representation for this date-time component to the number value */
		_parseNumber: function(sVal) {
			return parseInt(sVal, 10);
		},
		/** number representation of this date-time component. It may be different from `getValue`.
		 *  For example: for month, `getValue` of January returns 0 but `getNumber` returns 1. */
		getNumber: function() {
			return this.getValue();
		},
		isNumber: function() {
			return true;
		},
		/** Checks the validity of `iVal` in the parsing process. For example: for minute, `iVal` is valid if between 0 and 59 */
		isValidVal: function(iVal) {
			return true;
		},
		parse: function(s) {
			this._parseVal = parseInt("NaN");
			var sVal = this._getNumberStr(s);
			var iVal = this._parseNumber(sVal);
			if (this.isValidVal(iVal)) this._parseVal = iVal||0; else return -1;
			return sVal.length;
		},
		toStr: function() {
			var sVal = this.getNumber()+"", s = "";
			if (sVal.charAt(0) == '-') { sVal = sVal.substring(1); s = "-"; }
			while (sVal.length < this._count) sVal = "0" + sVal;
			return s+sVal;
		}
	});

	/** Base class for pattern letters which represent the month. The month can be written as a text (January, February etc.) or as a number (1, 2 etc.). */
	function Month() {
		Numb.call(this);
		Text.call(this);
	}
	Month.__extends__(Numb, Text.prototype, {
		name: "month",
		isNumber: function() {
			return this._count < 3;
		},
		isValidVal: function(iVal) {
			return iVal >= 1 && iVal <= 12;
		},
		parse: function(s) {
			if (this.isNumber()) return Numb.prototype.parse.call(this, s);
			return Text.prototype.parse.call(this, s);
		},
		toStr: function() {
			if (this.isNumber()) return Numb.prototype.toStr.call(this);
			return Text.prototype.toStr.call(this);
		}
	});

	/** Base class for pattern letters which represent the year. */
	function Year() {
		Numb.call(this);
	}
	Year.__extends__(Numb, {
		name: "year",
		stC: 1900, //The century for two digits year
		stY: 1970, //The begin of year for two digits year. Starts from this year up to 100 years later.
		_adjustCentury: function() {
			var iY = this.stC + this._parseVal;
			if (iY <= this.stY) iY += 100;
			this._parseVal = iY;
		},
		_isTwoDigitsYear: function(iDigitCount) {
			return this._count < 3/*yy or y in pattern*/ && iDigitCount == 2/*exactly 2 digits in string, not less/more*/;
		},
		getParseValue: function(oFields) {
			if (oFields.era && oFields.era.getParseValue(oFields) == 1) { //BC
				return -this._parseVal + 1;
			}
			return this._parseVal;
		},
		parse: function(s) {
			var i = Numb.prototype.parse.call(this, s);
			if (isNaN(this._parseVal)) return -1;
			if (this._isTwoDigitsYear(i)) {
				this._adjustCentury();
			}
			else if (this._parseVal <= 0) {
				return -1;
			}
			return i;
		},
		toStr: function() {
			if (this._count == 2) {
				var sVal = (this.getNumber() % 100) + "";
				if (sVal.length < 2 && this._count == 2) return "0"+sVal;
				return sVal;
			}
			return Numb.prototype.toStr.call(this);
		}
	});
	
	var ch = {};
	
	/** Era designator such as AD or BC */
	ch.G = function() {
		Text.call(this);
	}
	ch.G.__extends__(Text, {
		name: "era",
		getIndex: function() {
			return (this.dt.getFullYear() > 0 ? 0 : 1);
		},
		getLongValues: function() {
			return this.fmtSb.getEras();
		},
		getShortValues: function() {
			return this.getLongValues();
		}
	});
	
	ch.y = function() {
		Year.call(this);
	}
	ch.y.__extends__(Year, {
		applyParseValue: function(oDate, oFields) {
			oDate.setFullYear(this.getParseValue(oFields));
			return oDate;
		},
		getNumber: function() {
			var iVal = this.getValue();
			return (iVal <= 0) ? (-iVal + 1) : iVal;
		},
		getValue: function() {
			return this.dt.getFullYear();
		}
	});
	
	/** Week year. It may be different from y pattern at the last week of the year. */
	ch.Y = function() {
		ch.y.call(this);
	}
	ch.Y.getSaturday = function(oDate) {
		return new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate() - oDate.getDay() + 6);
	};
	ch.Y.__extends__(ch.y, {
		name: "weekYear",
		applyParseValue: function(oDate, oFields) {
			if (!oFields.year) {
				var iYear = this.getParseValue(oFields);
				if (oDate.getMonth() < 11 || oDate.getMonth() == 11 && oDate.getDate() < 25) //not last week of the year
					oDate.setFullYear(iYear);
				else {
					oDate.setFullYear(iYear - 1);
					var iWY = ch.Y.getSaturday(oDate).getFullYear();
					if (iWY < iYear) oDate.setFullYear(iYear);
				}
			}
			return oDate;
		},
		getValue: function() {
			return ch.Y.getSaturday(this.dt).getFullYear();
		}
	});
	
	/** Month */
	ch.L = function() {
		Month.call(this);
	}
	ch.L.__extends__(Month, {
		applyParseValue: function(oDate, oFields) {
			var iVal = this.getParseValue(oFields);
			oDate.setMonth(iVal);
			if (iVal < oDate.getMonth()) oDate.setDate(0); //if the day exceeds the last day of the month then set it to the last day
			return oDate;
		},
		getIndex: function() {
			return this.dt.getMonth();
		},
		getLongValues: function() {
			return this.fmtSb.getMonths();
		},
		getNumber: function() {
			return this.dt.getMonth() + 1;
		},
		getParseValue: function(oFields) {
			return this.isNumber() ? this._parseVal-1 : this._parseVal;
		},
		getShortValues: function() {
			return this.fmtSb.getShortMonths();
		}
	});
	
	/** Month */
	ch.M = function() {
		ch.L.call(this);
	}
	ch.M.__extends__(ch.L); //It should overrides L to support context-sensitive form
	
	/** The day sequence number (day-th) in the specified year. Starting at Jan 1 which is numbered as 1 and so on until Dec 31 that will be numbered as 365 (366 in leap year). */
	ch.D = function() {
		Numb.call(this);
	}
	ch.D.__extends__(Numb, {
		_ends: [31,28,31,30,31,30,31,31,30,31,30,31],
		name: "dayOfYear",
		_checkLeapYear: function(oDate) {
			//I dont trust year % 4
			var oDt = new Date(oDate.getTime());
			oDt.setDate(1); oDt.setMonth(1); oDt.setDate(29); //Set to Feb 29 of this year if exists
			if (oDt.getDate() == 29) this._ends[1] = 29; else this._ends[1] = 28; //If date doesnt change then Feb 29 of this year exists
		},	
		applyParseValue: function(oDate, oFields) {
			//if (oFields.year) if (oFields.year.applyParseValue(oDate,oFields) == null) return null;
			this._checkLeapYear(oDate);
			var arEnds = this._ends, iD = this.getParseValue(oFields), iM = 0;
			while (iD > arEnds[iM] && iM < arEnds.length) iD -= arEnds[iM++];
			if (iM >= arEnds.length) return null;
			oDate.setDate(1);
			oDate.setMonth(iM);
			oDate.setDate(iD);
			return oDate;
		},
		getDay: function() {
			this._checkLeapYear(this.dt);
			var arEnds = this._ends;
			var iMonth = this.dt.getMonth(), iDay = 0;
			for (var i=0; i<iMonth; i++) iDay += arEnds[i];
			return iDay + this.dt.getDate();
		},
		getValue: function() {
			return this.getDay();
		},
		isValidVal: function(iVal) {
			return iVal >= 1 && iVal <= 366;
		}
	});
	
	/** Day name in a week such as Sunday, Monday, Tue etc. */
	ch.E = function() {
		Text.call(this);
	}
	ch.E.__extends__(Text, {
		name: "dayOfWeek",
		applyParseValue: function(oDate, oFields) {
			if (oFields.day || oFields.dayOfYear) return oDate; //day has been set
			oDate.setDate(1);
			oDate.setTime(oDate.getTime() + ((this.getParseValue(oFields) - oDate.getDay() + 7) % 7) * 86400000);
			return oDate;
		},
		getIndex: function() {
			return this.dt.getDay();
		},
		getLongValues: function() {
			return this.fmtSb.getWeekdays();
		},
		getShortValues: function() {
			return this.fmtSb.getShortWeekdays();
		}
	});
	
	/** The day number in a month. */
	ch.d = function() {
		ch.D.call(this);
	}
	ch.d.__extends__(ch.D, {
		name: "day",
		applyParseValue: function(oDate, oFields) {
			//if (oFields.year) if (oFields.year.applyParseValue(oDate,oFields) == null) return null;
			this._checkLeapYear(oDate);
			//if (oFields.month) if (oFields.month.applyParseValue(oDate,oFields) == null) return null;
			var arEnds = this._ends, iD = this.getParseValue(oFields), iM = oDate.getMonth();
			if (iD < 1 || iD > arEnds[iM]) return null;
			oDate.setDate(iD);
			return oDate;
		},
		getDay: function() {
			return this.dt.getDate();
		},
		isValidVal: function(iVal) {
			return iVal >= 1 && iVal <= 31;
		}
	});
	
	/** The week sequence number (week-th) in the specified year */
	ch.w = function() {
		ch.D.call(this);
	}
	ch.w.needsToSet = function(oDate, oNewDate, oFields) {
		var iFirstTime = oNewDate.getTime(),
		    iLastTime = iFirstTime + 6 * 86400000, //86400000 == ms per day
			iTime = oDate.getTime();

		if (
			(oFields.day || oFields.dayOfYear || oFields.dayOfWeek) //the date is specified
			&& iFirstTime <= iTime && iTime <= iLastTime //the date is still in range of the week
		) {
			return false;
		}
		return true;
	};
	ch.w.__extends__(ch.D, {
		name: "weekOfYear",
		_resetMonth: function(oDate) {
			oDate.setMonth(0);
		},
		applyParseValue: function(oDate, oFields) {
			var oDate2 = new Date(oDate.getTime());
			oDate2.setDate(1);  //counted from the first day
			this._resetMonth(oDate2);
			oDate2.setDate(1 - oDate2.getDay() + (this.getParseValue(oFields) - 1) * 7); //set to sunday in the week

			//needs not to set to the new date if current date is still in range of the week
			if (ch.w.needsToSet(oDate, oDate2, oFields)) return oDate2;
			return oDate;
		},
		getValue: function() {
			if (ch.Y.getSaturday(this.dt).getFullYear() > this.dt.getFullYear()) return 1;
			return this.getWeek();
		},
		getWeek: function() {
			/*** It's my magic formula for getting the week number. Hope no bug at all. ***/
			var iDay = this.getDay();
			var iWeek = Math.ceil(iDay/7);
			iDay = iDay % 7;
			iDay = (iDay ? iDay : 7) - 1;
			return ((this.dt.getDay() < iDay) ? (iWeek+1) : iWeek);
		},
		isValidVal: function(iVal) {
			return iVal >= 1 && iVal <= 54;
		}
	});
	
	/** The week sequence number (week-th) in the specified month */
	ch.W = function() {
		ch.w.call(this);
	}
	ch.W.__extends__(ch.w, {
		name: "weekOfMonth",
		_resetMonth: function(oDate) {
		},
		applyParseValue: function(oDate, oFields) {
			var oDate2 = ch.w.prototype.applyParseValue.call(this, oDate, oFields);
			if (oDate2.getMonth() != oDate.getMonth()) {
				var W = new ch.W();
				W.dt = oDate2;
				this._parseVal = W.getWeek();
			}
			return oDate2;
		},
		getDay: function() {
			return this.dt.getDate();
		},
		getValue: function() {
			return this.getWeek();
		},
		isValidVal: function(iVal) {
			return iVal >= 1 && iVal <= 6;
		}
	});
	

	/** The week-th in the month: the first seven days in that month is the first week, the eightth day up to the forteenth day is the second week and so on. */
	ch.F = function() {
		Numb.call(this);
	}
	ch.F.__extends__(Numb, {
		name: "dayOfWeekInMonth",
		applyParseValue: function(oDate, oFields) {
			var oDate2 = new Date(oDate.getTime());
			oDate2.setDate((this.getParseValue(oFields) - 1) * 7 + 1);
			
			//needs not to set to the new date if current date is still in range of the week
			if (ch.w.needsToSet(oDate, oDate2, oFields)) {
				//day is set to sunday in the week
				if (oDate2.getDay() > 0) oDate2.setDate(oDate2.getDate() + 7 - oDate2.getDay());
				return oDate2;
			}
			return oDate;
		},
		isValidVal: function(iVal) {
			return iVal >= 1 && iVal <= 5;
		},
		getValue: function() {
			return Math.ceil(this.dt.getDate() / 7);
		}
	});
	
	/** Day number of week (1 = Monday, ..., 7 = Sunday) */
	ch.u = function() {
		Numb.call(this);
	}
	ch.u.__extends__(Numb, {
		name: "dayOfWeek",
		applyParseValue: function(oDate, oFields) {
			return ch.E.prototype.applyParseValue.call(this, oDate, oFields);
		},
		getNumber: function() {
			var iDay = this.dt.getDay();
			return iDay == 0 ? 7 : iDay;
		},
		getParseValue: function(oFields) {
			return this._parseVal == 7 ? 0 : this._parseVal;
		},
		getValue: function() {
			return this.dt.getDay();
		},
		isValidVal: function(iVal) {
			return 1 <= iVal && iVal <= 7;
		}
	});
	
	/** AM/PM marker in time */
	ch.a = function() {
		Text.call(this);
	}
	ch.a.__extends__(Text, {
		name: "ampm",
		getIndex: function() {
			return (this.dt.getHours() < 12 ? 0 : 1);
		},
		getLongValues: function() {
			return this.fmtSb.getAmPmStrings();
		},
		getShortValues: function() {
			return this.getLongValues();
		},
		isShort: function() {
			return false;
		}
	});
	
	/** Hour (0-23) */
	ch.H = function() {
		Numb.call(this);
	}
	ch.H.__extends__(Numb, {
		name: "hour",
		applyParseValue: function(oDate, oFields) {
			oDate.setHours(this.getParseValue(oFields));
			return oDate;
		},
		getValue: function() {
			return this.dt.getHours();
		},
		isValidVal: function(iVal) {
			return iVal >= 0 && iVal <= 23;
		}
	});
	
	/** Hour (1-24) */
	ch.k = function() {
		ch.H.call(this);
	}
	ch.k.__extends__(ch.H, {
		getParseValue: function(oFields) {
			return this._parseVal == 24 ? 0 : this._parseVal;
		},
		getNumber: function() {
			var iH = this.getValue();
			return (iH > 0 ? iH : 24);
		},
		isValidVal: function(iVal) {
			return iVal >= 1 && iVal <= 24;
		}
	});
	
	/** Hour (0-11). Should be accompanied by AM/PM */
	ch.K = function() {
		ch.H.call(this);
	}
	ch.K.__extends__(ch.H, {
		getParseValue: function(oFields) {
			var iVal = this._parseVal;
			if (oFields.ampm && oFields.ampm.getParseValue(oFields) == 1) iVal += 12;
			return iVal;
		},
		getNumber: function() {
			return this.getValue() % 12;
		},
		isValidVal: function(iVal) {
			return iVal >= 0 && iVal <= 11;
		}
	});
	
	/** Hour (1-12). Should be accompanied by AM/PM */
	ch.h = function() {
		ch.K.call(this);
	}
	ch.h.__extends__(ch.K, {
		getParseValue: function(oFields) {
			var iVal = this._parseVal == 12 ? 0 : this._parseVal;
			if (oFields.ampm && oFields.ampm.getParseValue(oFields) == 1) iVal += 12;
			return iVal;
		},
		getNumber: function() {
			var iH = ch.K.prototype.getNumber.apply(this);
			return (iH > 0 ? iH : 12);
		},
		isValidVal: function(iVal) {
			return iVal >= 1 && iVal <= 12;
		}
	});
	
	/** Minute */
	ch.m = function() {
		Numb.call(this);
	}
	ch.m.__extends__(Numb, {
		name: "minute",
		applyParseValue: function(oDate, oFields) {
			oDate.setMinutes(this.getParseValue(oFields));
			return oDate;
		},
		getValue: function() {
			return this.dt.getMinutes();
		},
		isValidVal: function(iVal) {
			return iVal >= 0 && iVal <= 59;
		}
	});
	
	/** second */
	ch.s = function() {
		Numb.call(this);
	}
	ch.s.__extends__(Numb, {
		name: "second",
		applyParseValue: function(oDate, oFields) {
			oDate.setSeconds(this.getParseValue(oFields));
			return oDate;
		},
		getValue: function() {
			return this.dt.getSeconds();
		},
		isValidVal: function(iVal) {
			return iVal >= 0 && iVal <= 59;
		}
	});
	
	/** millisecond */
	ch.S = function() {
		Numb.call(this);
	}
	ch.S.__extends__(Numb, {
		name: "ms",
		applyParseValue: function(oDate, oFields) {
			oDate.setMilliseconds(this.getParseValue(oFields));
			return oDate;
		},
		getValue: function() {
			return this.dt.getMilliseconds();
		},
		isValidVal: function(iVal) {
			return iVal >= 0 && iVal <= 999;
		}
	});
	
	/** General time zone */
	ch.z = function() {
		Text.call(this);
	}
	ch.z.__extends__(Text, {
		name: "timezone",
		_regex: /^(UTC|GMT[^+-]|GMT$)|^(GMT)((\+|-)(\d{1,2}):(\d{2}))|^(\+|-)(\d{2})(\d{2})/i,
		_getTzComp: function() {
			var tzo = this.dt.getTimezoneOffset();
			var arComp = [];
			arComp[0] = tzo > 0 ? "-" : "+";
			tzo = Math.abs(tzo);
			var iHour = Math.floor(tzo / 60);
    		arComp[1] = ("0" + iHour).slice(-2);
			arComp[2] = ("0" + (tzo % 60)).slice(-2);
			arComp[3] = iHour;
			return arComp;
		},
		_setParseValue: function(sSign, sHour, sMinute) {
			this._parseVal = parseInt("NaN");
			var iHour = parseInt(sHour), iMinute = parseInt(sMinute);
			if (iHour > 23 || iMinute > 59) return;
			var iDiff = iHour * 60 + iMinute;
			if (sSign == "-") iDiff = -iDiff;
			if (iDiff < -780 || iDiff > 840) return;
			this._parseVal = iDiff;
		},
		applyParseValue: function(oDate, oFields) {
			var diffTime = (oDate.getTimezoneOffset() + this.getParseValue(oFields)) * 60000;
			oDate.setTime(oDate.getTime() - diffTime);
			return oDate;
		},
		getValue: function() {
			return this._parseVal;
		},
		parse: function(s) {
			var arMatch = this._regex.exec(s);
			var sSign = "+", sHour = "0", sMinute = "0";
			if (arMatch == null) return -1;
			if (arMatch[1]) { // UTC/GMT
				//this._parseVal = 0;
			} else if (arMatch[2]) { // GMT+/-hh:mm
				if (arMatch[3]) {
					sSign = arMatch[4];
					sHour = arMatch[5];
					sMinute = arMatch[6];
				}
			} else { // +/-hhmm
				sSign = arMatch[7];
				sHour = arMatch[8];
				sMinute = arMatch[9];
			}
			this._setParseValue(sSign, sHour, sMinute);
			return isNaN(this._parseVal) ? -1 : arMatch[0].length;
		},
		toStr: function() {
			var s = "GMT";
			if (this.dt.getTimezoneOffset() != 0) {
				var arComp = this._getTzComp();
				s += arComp[0] + arComp[1] + ":" + arComp[2];
			}
			return s;
		}
	});
	
	/** RFC 822 time zone */
	ch.Z = function() {
		ch.z.call(this);
	}
	ch.Z.__extends__(ch.z, {
		toStr: function() {
			var arComp = this._getTzComp();
			return arComp[0] + arComp[1] + arComp[2];
		}
	});
	
	/** ISO 8601 time zone */
	ch.X = function() {
		ch.z.call(this);
	}
	ch.X.__extends__(ch.z, {
		_regex: [
			/^(\+|-)(\d{2})/,
			/^(\+|-)(\d{2})(\d{2})/,
			/^(\+|-)(\d{2}):(\d{2})/
		],
		addCount: function() {
			ch.z.prototype.addCount.call(this);
			if (this._count > 3) throw new FormatError("X letter must not be more than 3.");
		},
		parse: function(s) {
			var sSign = "+", sHour = "0", sMinute = "0", arMatch = null;
			if (s.indexOf('Z') == 0) {
                this._setParseValue(sSign, sHour, sMinute);
                return 1;
            }
            if (this._count == 1) {
				arMatch = this._regex[0].exec(s);
			} else if (this._count == 2) {
				arMatch = this._regex[1].exec(s);
			} else {
				arMatch = this._regex[2].exec(s);
			}
			if (arMatch != null) {
				sSign = arMatch[1];
				sHour = arMatch[2];
				sMinute = arMatch[3] || "0";
				this._setParseValue(sSign, sHour, sMinute);
				return arMatch[0].length;
			}
			return -1;
		},
		toStr: function() {
			if (this.dt.getTimezoneOffset() == 0) return 'Z';
			var arComp = this._getTzComp();
			switch (this._count) {
				case 1: return arComp[0] + arComp[1];
				case 2: return arComp[0] + arComp[1] + arComp[2];
			}
			return arComp[0] + arComp[1] + ":" + arComp[2];
		}
	});

	ch["'"] = function() {
		this._flag = 0; //0: Begin, 1: Continue, 2: May be End, 3: Really End
	}
	ch["'"].prototype = {
		_char: "'",
		append: function(c, oStr) {
			if (this._flag == 3) return false;
			if (c == this._char) {
				if (this._flag == 0 || this._flag == 2) {
					oStr.append(c); //escaped quote
					this._flag = this._flag == 0 ? 3 : 1;
				}
				else /*if (this._flag == 1)*/ this._flag = 2;
			}
			else {
				if (this._flag == 2) return false;
				oStr.append(c);
				this._flag = 1;
			}
			return true;
		},
		unterminated: function() {
			if (this._flag == 2 || this._flag == 3) return; //actually reached the end (happens if the closing quote is the end of string)
			throw new FormatError("Unterminated quote");
		},
	};

	JsSimpleDateFormat.prototype = {
		_ch: ch,
		_getDefaultPattern: function() {
			return "d MMMM yyyy hh:mm a";
		},
		_getInitDate: function() {
			var oDt = new Date(0);
			oDt.setTime(oDt.getTime() + oDt.getTimezoneOffset()*60000);
			return oDt;
		},
		_setFormatSymbols: function(param) {
			if (param) {
				if (param instanceof JsDateFormatSymbols) this.setDateFormatSymbols(param);
				else this.setDateFormatSymbols(new JsDateFormatSymbols(param));
			} else {
				this.setDateFormatSymbols(new JsDateFormatSymbols('en'));
			}
		},
		applyPattern: function(sPattern) {
			this._arPtn = [];
			this._arPtn.pushNext = function(oPtn) {
				if (this.length > 0) {
					var oLastPtn = this[this.length - 1];
					oLastPtn.next = oPtn;
					oPtn.prev = oLastPtn;
				}
				this.push(oPtn);
			};
			var s = new Str(""), c = '', oChar = this._ch, oPtn = null, oStr = null, clsPtn, i = -1;
			while (++i < sPattern.length) {
				var c1 = sPattern.charAt(i);
				if (oStr != null && oStr.append(c1, s) || (oStr = null)) {
				} else if (c1 == c && (oPtn instanceof Ltr)) {
					oPtn.addCount();
				} else if (clsPtn = oChar[c1]) {
					if (clsPtn.prototype instanceof Base) {
						oPtn = new clsPtn();
						if (s.toStr() != "") this._arPtn.pushNext(s);
						s = new Str("");
						this._arPtn.pushNext(oPtn);
						c = c1;
					}
					else {
						oStr = new clsPtn(s);
						c = '';
					}
				} else {
					s.append(c1);
					c = '';
				}
			}
			if (oStr != null) oStr.unterminated(s); 
			if (s.toStr() != "") this._arPtn.pushNext(s);
			this._ptn = sPattern;
		},
		format: function(oDate) {
			Ltr.prototype.fmtSb = this._fmtSb;
			Ltr.prototype.dt = oDate;
			var s = "", arPtn = this._arPtn;
			for (var i=0; i<arPtn.length; i++) s += arPtn[i].toStr();
			return s;
		},
		get2DigitYearStart: function() {
			return this._stDt;
		},
		getDateFormatSymbols: function() {
			return this._fmtSb;
		},
		//The order of date-time components that must be applied to the Date object as the result of parsing value
		_arFN: [
			"year", "dayOfYear", //safe combination to set first (will set year-month-day)
			"month", //day will be adjusted if exceeds the last date of month that will make sure we get the month we want
			"day",
			"dayOfWeek", //set if no `day` or `dayOfYear`. It sets the date indirectly to one of 1-7.
			"weekYear", //set if no `year`. It's clear to set if `month` and `day` has been specified 
			"dayOfWeekInMonth", "weekOfMonth", "weekOfYear", //week: needs not to set to the new date if `day` is still in the week
			"hour", "minute", "second", "ms" //time: will no conflict
		],
		//The date-time component names that affect the calculation of other component value.
		_mapFNMark: {
			ampm: true,
			era: true
		},
		parse: function(s, oPos) {
			Ltr.prototype.fmtSb = this._fmtSb;
			Str.prototype.flexWhiteSpace = this.flexWhiteSpace;
			Year.prototype.stY = this._stY;
			Year.prototype.stC = this._stC;
			
			if (!oPos) oPos = {index:0, errorIndex:-1};
			var i = oPos.index, j = 0, arPtn = this._arPtn, oFields = {}, arDupl = [];
			while (j < arPtn.length) {
				var oPtn = arPtn[j++];
				var k = oPtn.parse(s.substring(i));
				if (k == -1) {
					oPos.errorIndex = i;
					return null;
				}
				oPtn.__idx__ = i;
				
				var iFIdx = 1;
				//Collects all date-time components inside the parsed string for consistency checks
				if (oPtn instanceof Ltr) { 
					var sFN = oPtn.name;
					if (!sFN) sFN = '_' + iFIdx++;
					if (!this.isLenient && oFields[sFN]/*There has been the component whose the same name*/) {
						//Collects the duplicate components to check later. In strict mode all the same components must have the same value 
						if (this._mapFNMark[sFN]) arDupl.unshift(oPtn); //The markers will be checked first.
						else arDupl.push(oPtn); 
					} else {
						oFields[sFN] = oPtn; //If there are duplicate components then the last one will be used
					}
				}
				i += k;
			}
			/* At this point, the string matches the pattern */

			//Checks consitency all duplicate components
			for (var j = 0; j < arDupl.length; j++) {
				var oPtn = arDupl[j];
				if (oFields[oPtn.name].getParseValue(oFields) != oPtn.getParseValue(oFields)) { //Both components must have the same value (consistent)
					oPos.errorIndex = oPtn.__idx__;
					return null;
				}
			}
			
			var oDate = this._getInitDate();
			/* Applies all parsing values to the Date object that will returned */
			for (j = 0; j < this._arFN.length; j++) {
				var sFN = this._arFN[j];
				if (oFields[sFN]) {
					oDate = oFields[sFN].applyParseValue(oDate, oFields);
					if (oDate == null) { //Error in applying the parsing value
						oPos.errorIndex = oPos.index + i; //Consider the index after the pattern is the error index
						return null;
					}
				}
			}
			
			Ltr.prototype.dt = oDate; //The date object as the final result
			if (!this.isLenient) {
				/* Checks the consistency between the parsing value (getParseValue) and the final value (getValue) of all components.
				The final value becomes different because the later component changes it. */
				for (var sFN in oFields) if (oFields[sFN].getParseValue(oFields) != oFields[sFN].getValue()) { //Error if not consistent
					oPos.errorIndex = oPos.index + i; //Consider the index after the pattern is the error index
					return null;
				}
			}
			if (oFields.timezone) oFields.timezone.applyParseValue(oDate,oFields); //timezone must be the last because it can change the other
			                                                                       // components' values which influences the consistency checking
			oPos.index = i;
			return oDate;
		},
		set2DigitYearStart: function(oStartDate) {
			this._stDt = oStartDate;
			var iY = Math.abs(oStartDate.getFullYear());
			this._stY = iY;
			this._stC = iY - (iY%100);
		},
		setDateFormatSymbols: function(oFormatSymbols) {
			this._fmtSb = oFormatSymbols;
		},
		toPattern: function() {
			return this._ptn;
		}
	};
})();


if (typeof(module) == 'object' && !!module.exports) {
	module.exports = {
		FormatError: FormatError,
		JsDateFormatSymbols: JsDateFormatSymbols,
		JsSimpleDateFormat: JsSimpleDateFormat
	};
}
