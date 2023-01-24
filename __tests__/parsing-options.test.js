const {JsSimpleDateFormat} = require('../JsSimpleDateFormat');

test("isLenient", () => {
    let oDf = new JsSimpleDateFormat('EEE, MMM d, yyyy');
    let oPos = {index: 0, errorIndex: -1};
    
    let oDate = oDf.parse("Mon, Feb 1, 2008", oPos);
    expect(oDate).toBe(null);
    expect(oPos).toEqual({
        index: 0,
        errorIndex: "Mon, Feb 1, 2008".length
    });
    
    oDf.isLenient = true;
    oPos.errorIndex = -1;
    oDate = oDf.parse("Mon, Feb 1, 2008", oPos);
    expect(oDate?.getTime()).toBe(new Date(2008, 1, 1).getTime());
    expect(oPos).toEqual({
        index: "Mon, Feb 1, 2008".length,
        errorIndex: -1,
    });

    oDf = new JsSimpleDateFormat("'The first' EEEE or u'-th day in' MMMM yyyy");
    oPos.index = 0;
    oDate = oDf.parse("The first Saturday or 7-th day in November 2022", oPos);
    expect(oDate).toBe(null);
    expect(oPos).toEqual({
        index: 0,
        errorIndex: "The first Saturday or ".length
    });

    oDf.isLenient = true;
    oPos.errorIndex = -1;
    oDate = oDf.parse("The first Saturday or 7-th day in November 2022", oPos);
    expect(oDate?.getTime()).toBe(new Date(2022, 10, 6).getTime());
    expect(oPos).toEqual({
        index: "The first Saturday or 7-th day in November 2022".length,
        errorIndex: -1,
    });
});

test("flexWhiteSpace", () => {
    let oDf = new JsSimpleDateFormat("'This game was played on' EEEE, MMMM d, yyyy");
    let oPos = {index: 0, errorIndex: -1};
    const str = "This game   was played on Friday,   February 1,   2008";

    oDf.flexWhiteSpace = false;
    let oDate = oDf.parse(str, oPos);
    expect(oDate).toBe(null);
    expect(oPos).toEqual({
        index: 0,
        errorIndex: 0
    });
    
    oDf.flexWhiteSpace = true;
    oPos.errorIndex = -1;
    oDate = oDf.parse(str, oPos);
    expect(oDate?.getTime()).toBe(new Date(2008, 1, 1).getTime());
    expect(oPos).toEqual({
        index: str.length,
        errorIndex: -1,
    });
});

test("start of 2 digits year", () => {
    let oDf = new JsSimpleDateFormat("d/M/yy");
    const str = "23/8/85";

    oDf.set2DigitYearStart(new Date(1980, 0, 1));
    let oDate = oDf.parse(str);
    expect(oDate?.getTime()).toBe(new Date(1985, 7, 23).getTime());
    
    oDf.set2DigitYearStart(new Date(1986, 2, 1));
    oDate = oDf.parse(str);
    expect(oDate?.getTime()).toBe(new Date(2085, 7, 23).getTime());
});

test("pos index", () => {
    let oDf = new JsSimpleDateFormat("'The first' EEEE or u'-th day in' MMMM yyyy");
    let oPos = {index: 0, errorIndex: -1};
    let oDate = oDf.parse("The first Sunday or 7-th day in November 2022", oPos);
    expect(oDate?.getTime()).toBe(new Date(2022, 10, 6).getTime());
    expect(oPos).toEqual({
        index: "The first Sunday or 7-th day in November 2022".length,
        errorIndex: -1
    });

    oDf = new JsSimpleDateFormat("MMM d, yyyy");
	oPos = {index: 12, errorIndex: -1};
	oDate = oDf.parse("The date of Jan 3, 2008 is Thursday", oPos);
    expect(oDate?.getTime()).toBe(new Date(2008, 0, 3).getTime());
    expect(oPos).toEqual({
        index: 23,
        errorIndex: -1
    });
});