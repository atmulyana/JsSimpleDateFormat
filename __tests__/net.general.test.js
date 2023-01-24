const {NetDateTimeFormat} = require('../NetDateTimeFormat');
const {getTzComp} = require('./common');

const oDate = new Date(2002, 7, 1, 0, 1, 2);
oDate.setMilliseconds(10);
const iTicks = oDate.getTime();
const arTzo = getTzComp(oDate);

class TestNetDateTimeFormat extends NetDateTimeFormat {
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
        return new NetDateTimeFormat(sPattern).format(oDate);
    }

    expect(format('M/d/yyyy hh:mm:ss tt')).toBe('8/1/2002 12:01:02 AM');
    expect(format('MMMM d, yyyy g h:m:s t')).toBe('August 1, 2002 AD 12:1:2 A');
    expect(format('ddd, MMM d, yy H:m:s')).toBe('Thu, Aug 1, 02 0:1:2');
    expect(format('MMMM d, y HH:mm:ss z')).toBe('August 1, 2 00:01:02 ' + arTzo[0] + arTzo[3]);
    expect(format('MMMM dd, yy HH:mm:ss.f zz')).toBe('August 01, 02 00:01:02.0 ' + arTzo[0] + arTzo[1]);
    expect(format('MMMM dd, yy HH:mm:ss.F zz')).toBe('August 01, 02 00:01:02 ' + arTzo[0] + arTzo[1]);
    expect(format('MMMM d, yyy HH:mm:ss.ff zzz')).toBe('August 1, 2002 00:01:02.01 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2]);
    expect(format('MMMM d, yyy HH:mm:ss.FF zzz')).toBe('August 1, 2002 00:01:02.01 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2]);
    expect(format('MMMM d, yyyy HH:mm:ss.fff K')).toBe('August 1, 2002 00:01:02.010 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2]);
    expect(format('MMMM d, yyyy HH:mm:ss.FFF K')).toBe('August 1, 2002 00:01:02.01 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2]);
    expect(format('yyyyMMdd HHmmss K')).toBe('20020801 000102 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2]);
    expect(format("a't' H o\\'clock on dddd")).toBe("at 0 o'clock on Thursday");
    expect(format(`"He said \\"at" h o\\'clock on dddd'"'`)).toBe(`He said "at 12 o'clock on Thursday"`);
});

test('format, locale: id', () => {
    function format(sPattern) {
        return new NetDateTimeFormat(sPattern, 'id').format(oDate);
    }

    expect(format('MMMM d, yyyy g h:m:s t')).toBe('Agustus 1, 2002 M 12:1:2 A');
    expect(format('ddd, MMM d, yy H:m:s')).toBe('Kam, Agu 1, 02 0:1:2');
    expect(format("a't' H o\\'clock on dddd")).toBe("at 0 o'clock on Kamis");
});

test('parsing', () => {
    function parse(sPattern, sValue) {
        var oDate = new TestNetDateTimeFormat(sPattern).parse(sValue);
        return oDate ? oDate.getTime() : null;
    }

    expect(parse('M/d/yyyy hh:mm:ss tt', '8/1/2002 12:01:02 AM')).toBe(iTicks);
    expect(parse('MMMM d, yyyy g h:m:s t', 'August 1, 2002 AD 12:1:2 A')).toBe(iTicks);
    expect(parse('ddd, MMM d, yy H:m:s', 'Thu, Aug 1, 02 0:1:2')).toBe(iTicks);
    expect(parse('MMMM d, y HH:mm:ss z', 'August 1, 2 00:01:02 ' + arTzo[0] + arTzo[3])).toBe(iTicks);
    expect(parse('MMMM dd, yy HH:mm:ss.f zz', 'August 01, 02 00:01:02.0 ' + arTzo[0] + arTzo[1])).toBe(iTicks - 10);
    expect(parse('MMMM dd, yy HH:mm:ss.F zz', 'August 01, 02 00:01:02 ' + arTzo[0] + arTzo[1])).toBe(iTicks - 10);
    expect(parse('MMMM d, yyy HH:mm:ss.ff zzz', 'August 1, 2002 00:01:02.01 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2])).toBe(iTicks);
    expect(parse('MMMM d, yyy HH:mm:ss.FF zzz', 'August 1, 2002 00:01:02.01 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2])).toBe(iTicks);
    expect(parse('MMMM d, yyyy HH:mm:ss.fff K', 'August 1, 2002 00:01:02.010 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2])).toBe(iTicks);
    expect(parse('MMMM d, yyyy HH:mm:ss.FFF K', 'August 1, 2002 00:01:02.01 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2])).toBe(iTicks);
    expect(parse('yyyyMMdd HHmmss K', '20020801 000102 ' + arTzo[0] + arTzo[1] + ':' + arTzo[2])).toBe(iTicks);
    expect(parse("a't' H o\\'clock on dddd", "at 0 o'clock on Thursday")).toBe(iTicks);
    expect(parse(`"He said \\"at" h o\\'clock on dddd'"'`, `He said "at 12 o'clock on Thursday"`)).toBe(iTicks);
});

test('parsing, locale: id', () => {
    function format(sPattern, sValue) {
        var oDate = new TestNetDateTimeFormat(sPattern, 'id').parse(sValue);
        return oDate ? oDate.getTime() : null;
    }

    expect(format('MMMM d, yyyy g h:m:s t', 'Agustus 1, 2002 M 12:1:2 A')).toBe(iTicks);
    expect(format('ddd, MMM d, yy H:m:s', 'Kam, Agu 1, 02 0:1:2')).toBe(iTicks);
    expect(format("a't' H o\\'clock on dddd", "at 0 o'clock on Kamis")).toBe(iTicks);
});

test('format hour', () => {
    let oDate = new Date();
    let oDf = new JsSimpleDateFormat('H h a');
    
    oDate.setHours(0);
    expect(oDf.format(oDate)).toBe('0 12 AM');
    
    oDate.setHours(12);
    expect(oDf.format(oDate)).toBe('12 12 PM');
});

test('parse hour', () => {
    let oDf = new JsSimpleDateFormat('H h a');
    expect( oDf.parse('0 12 AM')?.getHours() ).toBe(0);
    expect( oDf.parse('12 12 PM')?.getHours() ).toBe(12);
});