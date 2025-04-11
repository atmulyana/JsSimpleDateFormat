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
export class FormatError extends Error {
}

export class JsDateFormatSymbols {
    constructor(sLocale: string);
    getAmPmStrings(): string[];
    getShortAmPmStrings(): string[];
    getEras(): string[];
    getMonths(): string[];
    getShortMonths(): string[];
    getShortWeekdays(): string[];
    getWeekdays(): string[];
    setAmPmStrings(arAmPmStrings: string[]): void;
    setEras(arEras: string[]): void;
    setMonths(arMonths: string[]): void;
    setShortMonths(arShortMonths: string[]): void;
    setShortWeekdays(arShortWeekdays: string[]): void;
    setWeekdays(arWeekdays: string[]): void;
}

interface ParsingPosition {
    index: number;
    errorIndex?: number;
}

export class JsSimpleDateFormat {
    constructor(sPattern: string, param?: JsDateFormatSymbols | string);
    applyPattern(sPattern: string): void;
    format(oDate: Date): string;
    get2DigitYearStart(): Date;
    getDateFormatSymbols(): JsDateFormatSymbols;
    parse(s: string, oPos?: ParsingPosition): Date | null;
    set2DigitYearStart(oStartDate: Date): void;
    setDateFormatSymbols(oFormatSymbols: JsDateFormatSymbols): void;
    toPattern(): string;
}