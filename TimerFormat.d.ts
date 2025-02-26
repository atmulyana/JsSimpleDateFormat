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
import {JsSimpleDateFormat} from './JsSimpleDateFormat';

interface TimerSymbols {
    fewSeconds: string;
    aMinute: string;
    minutes: string;
    anHour: string;
    hours: string;
    aDay: string;
    days: string;
    aMonth: string;
    months: string;
    aYear: string;
    years: string;
}

export class TimerFormatSymbols {
    constructor(symbols: TimerSymbols | string);
    getFewSeconds(): string;
    getAMinute(): string;
    getMinutes(): string;
    getAnHour(): string;
    getHours(): string;
    getADay(): string;
    getDays(): string;
    getAMonth(): string;
    getMonths(): string;
    getAYear(): string;
    getYears(): string;
    setFewSeconds(s: string): void;
    setAMinute(s: string): void;
    setMinutes(s: string): void;
    setAnHour(s: string): void;
    setHours(s: string): void;
    setADay(s: string): void;
    setDays(s: string): void;
    setAMonth(s: string): void;
    setMonths(s: string): void;
    setAYear(s: string): void;
    setYears(s: string): void;
}

export class TimerFormat extends JsSimpleDateFormat {
    constructor(sPattern: string, param?: TimerFormatSymbols | string);
    approxFormat(oDate: Date | number, sPrefix?: string, sSuffix?: string): string;
    format(oDate: Date | number): string;
    getTimerFormatSymbols(): TimerFormatSymbols;
    setTimerFormatSymbols(oFormatSymbols: TimerFormatSymbols): void;
}