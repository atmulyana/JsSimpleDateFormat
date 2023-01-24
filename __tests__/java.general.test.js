const {JsSimpleDateFormat} = require('../JsSimpleDateFormat');
const {getTzComp} = require('./common');

const oDate = new Date(2002, 7, 1, 0, 1, 2);
oDate.setMilliseconds(10);
const iTicks = oDate.getTime();
const arTzo = getTzComp(oDate);

class TestSimpleDateFormat extends JsSimpleDateFormat {
    constructor(sPattern, param) {
        super(sPattern, param);
        this.set2DigitYearStart(new Date(2000, 0 , 1));
    }

    _getInitDate() {
        return new Date(iTicks);
    }
}
    
test('format', () => {
    function format(sPattern) {
        return new JsSimpleDateFormat(sPattern).format(oDate);
    }

    expect(format('M/d/yyyy hh:mm:ss aa')).toBe('8/1/2002 12:01:02 AM');
    expect(format('MMMM d, YYYY G K:m:s a')).toBe('August 1, 2002 AD 0:1:2 AM');
    expect(format('EEE, MMM d, yy k:m:s')).toBe('Thu, Aug 1, 02 24:1:2');
    expect(format('MMMM d, y HH:mm:ss z')).toBe('August 1, 2002 00:01:02 GMT' + arTzo[0] + arTzo[1] + ':' + arTzo[2]);
    expect(format('MMMM dd, yy HH:mm:ss.SSS zz')).toBe('August 01, 02 00:01:02.010 GMT' + arTzo[0] + arTzo[1] + ':' + arTzo[2]);
    expect(format('MMMM ddd, yyy HH:mm:ss.SSS zzz')).toBe('August 001, 2002 00:01:02.010 GMT' + arTzo[0] + arTzo[1] + ':' + arTzo[2]);
    expect(format('MMMM dddd, yyyy HH:mm:ss.SSS Z')).toBe('August 0001, 2002 00:01:02.010 ' + arTzo[0] + arTzo[1] + arTzo[2]);
    expect(format('yyyy-MM-dd HH:mm:ss X')).toBe('2002-08-01 00:01:02 ' + arTzo[0] + arTzo[1]);
    expect(format('yyyy-MM-dd HH:mm:ss XX')).toBe('2002-08-01 00:01:02 ' + arTzo[0] + arTzo[1] + arTzo[2]);
    expect(format('yyyyMMdd HHmmss XXX')).toBe('20020801 000102 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2]);
    expect(format("'at' k o''cloc'k' on EEEE")).toBe("at 24 o'clock on Thursday");
    expect(format("W'(st/nd/rd/th) week in this month'")).toBe("1(st/nd/rd/th) week in this month");
    expect(format("w'(st/nd/rd/th) week in this year'")).toBe("31(st/nd/rd/th) week in this year");
    expect(format("'DDD': DDD, 'FFF': FFF")).toBe("DDD: 213, FFF: 001");
});

test('format, locale: id', () => {
    function format(sPattern) {
        return new JsSimpleDateFormat(sPattern, 'id').format(oDate);
    }

    expect(format('MMMM d, YYYY G K:m:s a')).toBe('Agustus 1, 2002 M 0:1:2 AM');
    expect(format('EEE, MMM d, yy k:m:s')).toBe('Kam, Agu 1, 02 24:1:2');
    expect(format("'at' k o''cloc'k' on EEEE")).toBe("at 24 o'clock on Kamis");
});

test('parsing', () => {
    function parse(sPattern, sValue) {
        var oDate = new TestSimpleDateFormat(sPattern).parse(sValue);
        return oDate ? oDate.getTime() : null;
    }

    expect(parse('M/d/yyyy hh:mm:ss aa', '8/1/2002 12:01:02 AM')).toBe(iTicks);
    expect(parse('MMMM d, YYYY G K:m:s a', 'August 1, 2002 AD 0:1:2 AM')).toBe(iTicks);
    expect(parse('EEE, MMM d, yy k:m:s', 'Thu, Aug 1, 02 24:1:2')).toBe(iTicks);
    expect(parse('MMMM d, y HH:mm:ss z', 'August 1, 2002 00:01:02 GMT' + arTzo[0] + arTzo[1] + ':' + arTzo[2])).toBe(iTicks);
    expect(parse('MMMM dd, yy HH:mm:ss.SSS zz', 'August 01, 02 00:01:02.010 GMT' + arTzo[0] + arTzo[1] + ':' + arTzo[2])).toBe(iTicks);
    expect(parse('MMMM ddd, yyy HH:mm:ss.SSS zzz', 'August 001, 2002 00:01:02.010 GMT' + arTzo[0] + arTzo[1] + ':' + arTzo[2])).toBe(iTicks);
    expect(parse('MMMM dddd, yyyy HH:mm:ss.SSS Z', 'August 0001, 2002 00:01:02.010 ' + arTzo[0] + arTzo[1] + arTzo[2])).toBe(iTicks);
    expect(parse('yyyy-MM-dd HH:mm:ss X', '2002-08-01 00:01:02 ' + arTzo[0] + arTzo[1])).toBe(iTicks);
    expect(parse('yyyy-MM-dd HH:mm:ss XX', '2002-08-01 00:01:02 ' + arTzo[0] + arTzo[1] + arTzo[2])).toBe(iTicks);
    expect(parse('yyyyMMdd HHmmss XXX', '20020801 000102 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2])).toBe(iTicks);
    expect(parse("'at' k o''cloc'k' on EEEE", "at 24 o'clock on Thursday")).toBe(iTicks);
    expect(parse("W'(st/nd/rd/th) week in this month'", "1(st/nd/rd/th) week in this month")).toBe(iTicks - oDate.getDay() * 86400000);
    expect(parse("w'(st/nd/rd/th) week in this year'", "31(st/nd/rd/th) week in this year")).toBe(iTicks - oDate.getDay() * 86400000);
    expect(parse("'DDD': DDD, 'FFF': FFF", "DDD: 213, FFF: 001")).toBe(iTicks);
});

test('parsing, locale: id', () => {
    function parse(sPattern, sValue) {
        var oDate = new TestSimpleDateFormat(sPattern, 'id').parse(sValue);
        return oDate ? oDate.getTime() : null;
    }

    expect(parse('MMMM d, YYYY G K:m:s a', 'Agustus 1, 2002 M 0:1:2 AM')).toBe(iTicks);
    expect(parse('EEE, MMM d, yy k:m:s', 'Kam, Agu 1, 02 24:1:2')).toBe(iTicks);
    expect(parse("'at' k o''cloc'k' on EEEE", "at 24 o'clock on Kamis")).toBe(iTicks);
});

test('format: focus on era BC', () => {
    let oDf = new JsSimpleDateFormat('MMMM d, y G');
    let oDate = new Date(0, 0 , 1);
    oDate.setFullYear(0);
    expect(oDf.format(oDate)).toBe('January 1, 1 BC');
    oDate.setFullYear(-1);
    expect(oDf.format(oDate)).toBe('January 1, 2 BC');
});

test('format: focus on era BC, locale: id', () => {
    let oDf = new JsSimpleDateFormat('MMMM d, y G', 'id');
    let oDate = new Date(0, 0 , 1);
    oDate.setFullYear(0);
    expect(oDf.format(oDate)).toBe('Januari 1, 1 SM');
    oDate.setFullYear(-1);
    expect(oDf.format(oDate)).toBe('Januari 1, 2 SM');
});

test('parse: focus on era BC', () => {
    let oDf = new JsSimpleDateFormat('MMMM d, y G');
    
    let oDate = oDf.parse('January 1, 1 BC');
    expect(oDate?.getFullYear()).toBe(0);
    expect(oDate?.getMonth()).toBe(0);
    expect(oDate?.getDate()).toBe(1);
    
    oDate = oDf.parse('January 1, 2 BC');
    expect(oDate?.getFullYear()).toBe(-1);
    expect(oDate?.getMonth()).toBe(0);
    expect(oDate?.getDate()).toBe(1);
});

test('parse: focus on era BC, locale: id', () => {
    let oDf = new JsSimpleDateFormat('MMMM d, y G', 'id');
    
    let oDate = oDf.parse('Januari 1, 1 SM');
    expect(oDate?.getFullYear()).toBe(0);
    expect(oDate?.getMonth()).toBe(0);
    expect(oDate?.getDate()).toBe(1);
    
    oDate = oDf.parse('Januari 1, 2 SM');
    expect(oDate?.getFullYear()).toBe(-1);
    expect(oDate?.getMonth()).toBe(0);
    expect(oDate?.getDate()).toBe(1);
});

test('format hour', () => {
    let oDate = new Date();
    let oDf = new JsSimpleDateFormat('H k K h a');
    
    oDate.setHours(0);
    expect(oDf.format(oDate)).toBe('0 24 0 12 AM');
    
    oDate.setHours(12);
    expect(oDf.format(oDate)).toBe('12 12 0 12 PM');
});

test('parse hour', () => {
    let oDf = new JsSimpleDateFormat('H k K h a');
    expect( oDf.parse('0 24 0 12 AM')?.getHours() ).toBe(0);
    expect( oDf.parse('12 12 0 12 PM')?.getHours() ).toBe(12);
});