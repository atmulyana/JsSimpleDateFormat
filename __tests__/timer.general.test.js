const {TimerFormat} = require('../TimerFormat');

const oDate = new Date(Date.UTC(1970, 0, 3, 0, 1, 2, 10));
const iTicks = oDate.getTime();

class TestTimerFormat extends TimerFormat {
    _getInitDate() {
        return new Date(iTicks);
    }
}

test('format', () => {
    function format(sPattern) {
        return new TimerFormat(sPattern).format(oDate);
    }
    
    expect(format('h:m:s')).toBe('0:1:2');
    expect(format('-hh:mm:ss')).toBe('00:01:02');
    expect(format("d' days 'hh\\:mm\\:ss.f")).toBe("2 days 00:01:02.0");
    expect(format("d' days 'hh\\:mm\\:ss.F")).toBe("2 days 00:01:02");
    expect(format("dd' days 'hh\\:mm\\:ss\\.ff")).toBe("02 days 00:01:02.01");
    expect(format("dd' days 'hh\\:mm\\:ss\\.FF")).toBe("02 days 00:01:02.01");
    expect(format("ddd' days 'hh\\:mm\\:ss\\.fff")).toBe("002 days 00:01:02.010");
    expect(format("ddd' days 'hh\\:mm\\:ss\\.FFF")).toBe("002 days 00:01:02.01");

    expect(new TimerFormat("-d'd' hh:mm:ss").format(-Date.UTC(1970, 0, 3, 1, 2, 3))).toBe('-2d 01:02:03');
});

test('parse', () => {
    function parse(sPattern, sValue) {
        var oDate = new TestTimerFormat(sPattern).parse(sValue);
        return oDate ? oDate.getTime() : null;
    }
    
    expect(parse('h:m:s', '0:1:2')).toBe(iTicks);
    expect(parse('-hh:mm:ss', '00:01:02')).toBe(iTicks);
    expect(parse("d' days 'hh\\:mm\\:ss.f", "2 days 00:01:02.0")).toBe(iTicks - 10);
    expect(parse("d' days 'hh\\:mm\\:ss.F", "2 days 00:01:02")).toBe(iTicks - 10);
    expect(parse("dd' days 'hh\\:mm\\:ss\\.ff", "02 days 00:01:02.01")).toBe(iTicks);
    expect(parse("dd' days 'hh\\:mm\\:ss\\.FF", "02 days 00:01:02.01")).toBe(iTicks);
    expect(parse("ddd' days 'hh\\:mm\\:ss\\.fff", "002 days 00:01:02.010")).toBe(iTicks);
    expect(parse("ddd' days 'hh\\:mm\\:ss\\.FFF", "002 days 00:01:02.01")).toBe(iTicks);

    expect(new TimerFormat("-d'd' hh:mm:ss").parse('-2d 01:02:03')?.getTime()).toBe(-Date.UTC(1970, 0, 3, 1, 2, 3));
});

test('approxFormat', () => {
    function format(oDate) {
        return new TimerFormat().approxFormat(oDate);
    }
    
    expect(format(Date.UTC(1970, 0, 1,  0,  0, 44, 999))).toBe('a few seconds');
    expect(format(Date.UTC(1970, 0, 1,  0,  0, 45))).toBe('a minute');
    expect(format(Date.UTC(1970, 0, 1,  0,  1, 29, 999))).toBe('a minute');
    expect(format(Date.UTC(1970, 0, 1,  0,  1, 30))).toBe('2 minutes');
    expect(format(Date.UTC(1970, 0, 1,  0,  2, 29, 999))).toBe('2 minutes');
    expect(format(Date.UTC(1970, 0, 1,  0,  2, 30))).toBe('3 minutes');
    expect(format(Date.UTC(1970, 0, 1,  0, 45))).toBe('an hour');
    expect(format(Date.UTC(1970, 0, 1,  1, 29, 59, 999))).toBe('an hour');
    expect(format(Date.UTC(1970, 0, 1,  1, 30))).toBe('2 hours');
    expect(format(Date.UTC(1970, 0, 1,  2, 29, 59, 999))).toBe('2 hours');
    expect(format(Date.UTC(1970, 0, 1,  2, 30))).toBe('3 hours');
    expect(format(Date.UTC(1970, 0, 1, 22))).toBe('a day');
    expect(format(Date.UTC(1970, 0, 2, 12))).toBe('2 days');
    expect(format(Date.UTC(1970, 0, 3, 12))).toBe('3 days');
    expect(format(Date.UTC(1970, 0, 27))).toBe('a month');
    expect(format(Date.UTC(1970, 1, 15))).toBe('2 months');
    expect(format(Date.UTC(1970, 2, 17))).toBe('3 months');
    expect(format(Date.UTC(1970, 10, 17))).toBe('a year');
    expect(format(Date.UTC(1971, 6, 3))).toBe('2 years');
    expect(format(Date.UTC(1972, 6, 3))).toBe('3 years');
});

test('approxFormat, locale: id', () => {
    function format(oDate) {
        return new TimerFormat(null, 'id').approxFormat(oDate);
    }
    
    expect(format(Date.UTC(1970, 0, 1,  0,  0, 44, 999))).toBe('beberapa detik');
    expect(format(Date.UTC(1970, 0, 1,  0,  0, 45))).toBe('semenit');
    expect(format(Date.UTC(1970, 0, 1,  0,  1, 29, 999))).toBe('semenit');
    expect(format(Date.UTC(1970, 0, 1,  0,  1, 30))).toBe('2 menit');
    expect(format(Date.UTC(1970, 0, 1,  0,  2, 29, 999))).toBe('2 menit');
    expect(format(Date.UTC(1970, 0, 1,  0,  2, 30))).toBe('3 menit');
    expect(format(Date.UTC(1970, 0, 1,  0, 45))).toBe('satu jam');
    expect(format(Date.UTC(1970, 0, 1,  1, 29, 59, 999))).toBe('satu jam');
    expect(format(Date.UTC(1970, 0, 1,  1, 30))).toBe('2 jam');
    expect(format(Date.UTC(1970, 0, 1,  2, 29, 59, 999))).toBe('2 jam');
    expect(format(Date.UTC(1970, 0, 1,  2, 30))).toBe('3 jam');
    expect(format(Date.UTC(1970, 0, 1, 22))).toBe('sehari');
    expect(format(Date.UTC(1970, 0, 2, 12))).toBe('2 hari');
    expect(format(Date.UTC(1970, 0, 3, 12))).toBe('3 hari');
    expect(format(Date.UTC(1970, 0, 27))).toBe('sebulan');
    expect(format(Date.UTC(1970, 1, 15))).toBe('2 bulan');
    expect(format(Date.UTC(1970, 2, 17))).toBe('3 bulan');
    expect(format(Date.UTC(1970, 10, 17))).toBe('setahun');
    expect(format(Date.UTC(1971, 6, 3))).toBe('2 tahun');
    expect(format(Date.UTC(1972, 6, 3))).toBe('3 tahun');
});

test('approxFormat with prefix and suffix', () => {
    function format(oDate, sPrefix, sSuffix) {
        return new TimerFormat().approxFormat(oDate, sPrefix, sSuffix);
    }
    
    expect(format(Date.UTC(1972, 6, 3), undefined, '   ago')).toBe('3 years ago');
    expect(format(Date.UTC(1972, 6, 3), 'in  ')).toBe('in 3 years');
    expect(format(Date.UTC(1972, 6, 3), ' since  ', '  ago ')).toBe('since 3 years ago');
});

test('get/setDateFormatSymbols throw an exception', () => {
    expect(() => {
        new TimerFormat().getDateFormatSymbols();
    }).toThrow();
    expect(() => {
        new TimerFormat().setDateFormatSymbols('id');
    }).toThrow();
});