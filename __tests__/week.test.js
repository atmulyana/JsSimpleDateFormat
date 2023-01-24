const {JsSimpleDateFormat} = require('../JsSimpleDateFormat');

test("format combined week letters ('W-F-w'): 1st-3rd week of month", () => {
    let oDf = new JsSimpleDateFormat('W-F-w');

    //Focus on week of month, how to interpret the first date of month on different day of week
    expect(oDf.format(new Date(2022,  4, 1))).toBe('1-1-19'); //sunday
    expect(oDf.format(new Date(2022,  7, 1))).toBe('1-1-32'); //monday
    expect(oDf.format(new Date(2022, 10, 1))).toBe('1-1-45'); //tuesday
    expect(oDf.format(new Date(2022,  5, 1))).toBe('1-1-23'); //wednesday
    expect(oDf.format(new Date(2022,  8, 1))).toBe('1-1-36'); //thursday
    expect(oDf.format(new Date(2022,  6, 1))).toBe('1-1-27'); //friday
    expect(oDf.format(new Date(2022,  9, 1))).toBe('1-1-40'); //saturday

    //Move to the next sunday: `W` and `w` will increase, `F` will increase if the date > 7
    expect(oDf.format(new Date(2022,  4, 8))).toBe('2-2-20');
    expect(oDf.format(new Date(2022,  7, 7))).toBe('2-1-33');
    expect(oDf.format(new Date(2022, 10, 6))).toBe('2-1-46');
    expect(oDf.format(new Date(2022,  5, 5))).toBe('2-1-24');
    expect(oDf.format(new Date(2022,  8, 4))).toBe('2-1-37');
    expect(oDf.format(new Date(2022,  6, 3))).toBe('2-1-28');
    expect(oDf.format(new Date(2022,  9, 2))).toBe('2-1-41');

    //Move to the next saturday: `W` and `w` will stay, `F` will increase if before not increase
    expect(oDf.format(new Date(2022,  4, 14))).toBe('2-2-20');
    expect(oDf.format(new Date(2022,  7, 13))).toBe('2-2-33');
    expect(oDf.format(new Date(2022, 10, 12))).toBe('2-2-46');
    expect(oDf.format(new Date(2022,  5, 11))).toBe('2-2-24');
    expect(oDf.format(new Date(2022,  8, 10))).toBe('2-2-37');
    expect(oDf.format(new Date(2022,  6,  9))).toBe('2-2-28');
    expect(oDf.format(new Date(2022,  9,  8))).toBe('2-2-41');

    //Move to the next sunday: `W` and `w` will increase, `F` will increase if the date > 14
    expect(oDf.format(new Date(2022,  4, 15))).toBe('3-3-21');
    expect(oDf.format(new Date(2022,  7, 14))).toBe('3-2-34');
    expect(oDf.format(new Date(2022, 10, 13))).toBe('3-2-47');
    expect(oDf.format(new Date(2022,  5, 12))).toBe('3-2-25');
    expect(oDf.format(new Date(2022,  8, 11))).toBe('3-2-38');
    expect(oDf.format(new Date(2022,  6, 10))).toBe('3-2-29');
    expect(oDf.format(new Date(2022,  9,  9))).toBe('3-2-42');
});

test("format week of month ('W') on last date", () => {
    let oDf = new JsSimpleDateFormat("'Week-'W 'of' MMM yyyy");

    expect(oDf.format(new Date(2022,  6, 31))).toBe('Week-6 of Jul 2022'); //sunday
    expect(oDf.format(new Date(2022,  9, 31))).toBe('Week-6 of Oct 2022'); //monday
    expect(oDf.format(new Date(2022,  4, 31))).toBe('Week-5 of May 2022'); //tuesday
    expect(oDf.format(new Date(2022, 10, 30))).toBe('Week-5 of Nov 2022'); //wednesday
    expect(oDf.format(new Date(2022,  5, 30))).toBe('Week-5 of Jun 2022'); //thursday
    expect(oDf.format(new Date(2022,  8, 30))).toBe('Week-5 of Sep 2022'); //friday
    expect(oDf.format(new Date(2022,  3, 30))).toBe('Week-5 of Apr 2022'); //saturday
    expect(oDf.format(new Date(2020, 11, 31))).toBe('Week-5 of Dec 2020'); //thursday, on the next week-year
});

test("parse week of month ('W') of 1st date", () => {
    let oDf = new JsSimpleDateFormat("'Week-'W 'of' MMMM yyyy");
    oDf.isLenient = true;
    function parse(s, M) {
        let oBasicDate = new Date(2022, M, 1);
        
        //The week value is always parsed to the previous sunday
        //It may cause the date falls into previous month (so, isLenient must be true)
        oBasicDate.setDate(oBasicDate.getDate() - oBasicDate.getDay());
        
        let oDate = oDf.parse(s);
        expect(oDate?.getTime()).toBe(oBasicDate.getTime());
    }

    //week values are taken from first test 
    parse('Week-1 of May 2022', 4);
    parse('Week-1 of August 2022', 7);
    parse('Week-1 of November 2022', 10);
    parse('Week-1 of June 2022', 5);
    parse('Week-1 of September 2022', 8);
    parse('Week-1 of July 2022', 6);
    parse('Week-1 of October 2022', 9);
});

test("parse week of month ('W') of last date", () => {
    let oDf = new JsSimpleDateFormat("'Week-'W 'of' MMM yyyy");
    function parse(s, M, d) {
        let oBasicDate = new Date(2022, M, d);
        //The week value is always parsed to the previous sunday
        oBasicDate.setDate(oBasicDate.getDate() - oBasicDate.getDay());
        
        let oDate = oDf.parse(s);
        expect(oDate?.getTime()).toBe(oBasicDate.getTime());
    }

    //week values are taken from second test 
    parse('Week-6 of Jul 2022',  6, 31);
    parse('Week-6 of Oct 2022',  9, 31);
    parse('Week-5 of May 2022',  4, 31);
    parse('Week-5 of Nov 2022', 10, 30);
    parse('Week-5 of Jun 2022',  5, 30);
    parse('Week-5 of Sep 2022',  8, 30);
    parse('Week-5 of Apr 2022',  3, 30);
    expect(oDf.parse('Week-5 of Dec 2020')?.getTime()).toBe(new Date(2020, 11, 27).getTime());
});

test("parse second week of month ('W') on sunday", () => {
    let oDf = new JsSimpleDateFormat("'Week-'W 'of' MMMM yyyy");
    function parse(s, M, d) {
        let oDate = oDf.parse(s);
        expect(oDate?.getDate()).toBe(d);
        expect(oDate?.getMonth()).toBe(M);
        expect(oDate?.getFullYear()).toBe(2022);
    }

    //week values are taken from first test 
    parse('Week-2 of May 2022', 4, 8);
    parse('Week-2 of August 2022', 7, 7);
    parse('Week-2 of November 2022', 10, 6);
    parse('Week-2 of June 2022', 5, 5);
    parse('Week-2 of September 2022', 8, 4);
    parse('Week-2 of July 2022', 6, 3);
    parse('Week-2 of October 2022', 9, 2);
});

test("parse second week of month ('F') on sunday", () => {
    let oDf = new JsSimpleDateFormat("'Week-'F 'of' MMMM yyyy");
    function parse(s, M, d) {
        let oDate = oDf.parse(s);
        expect(oDate?.getDate()).toBe(d);
        expect(oDate?.getMonth()).toBe(M);
        expect(oDate?.getFullYear()).toBe(2022);
    }

    //week of month by using letter `F` always interprets the first is 1..7,
    //the second is 8..14, the third is 15..21, the forth is 22..28 and
    //the fifth is the remaining dates.
    //And it is parsed to the date of sunday in the range
    parse('Week-1 of May 2022', 4, 1);
    parse('Week-2 of May 2022', 4, 8);
    parse('Week-3 of May 2022', 4, 15);
    parse('Week-4 of May 2022', 4, 22);
    parse('Week-5 of May 2022', 4, 29);

    parse('Week-1 of June 2022', 5, 5);
    parse('Week-2 of June 2022', 5, 12);
    parse('Week-3 of June 2022', 5, 19);
    parse('Week-4 of June 2022', 5, 26);
    oDf.isLenient = true; //the 5th week will fall in july
    parse('Week-5 of June 2022', 6, 3);
});

test("parse week of year: 'w'", () => {
    let oDf = new JsSimpleDateFormat("'Week-'w 'of' yyyy");
    function parse(s, M) {
        let oBasicDate = new Date(2022, M, 1);
        //The week value is always parsed to the previous sunday
        oBasicDate.setDate(oBasicDate.getDate() - oBasicDate.getDay());
        
        let oDate = oDf.parse(s);
        expect(oDate?.getTime()).toBe(oBasicDate.getTime());
    }

    //week values are taken from first test 
    parse('Week-19 of 2022', 4);
    parse('Week-32 of 2022', 7);
    parse('Week-45 of 2022', 10);
    parse('Week-23 of 2022', 5);
    parse('Week-36 of 2022', 8);
    parse('Week-27 of 2022', 6);
    parse('Week-40 of 2022', 9);
});

test("format week of week-year (`w of YYYY`) on January 1st", () => {
    let oDf = new JsSimpleDateFormat("'Week-'w 'of' YYYY");
    function format(y, s) {
        let oDate = new Date(y, 0, 1);
        expect(oDf.format(oDate)).toBe(s);
    }

    //Jan 1st is always in the first week and YYYY is the same as yyyy 
    format(2017, 'Week-1 of 2017'); //sunday
    format(2018, 'Week-1 of 2018'); //monday
    format(2019, 'Week-1 of 2019'); //tuesday
    format(2014, 'Week-1 of 2014'); //wednesday
    format(2015, 'Week-1 of 2015'); //thursday
    format(2021, 'Week-1 of 2021'); //friday
    format(2022, 'Week-1 of 2022'); //saturday
});

test("format week of week-year (`w 'of' YYYY`) on December 31st", () => {
    let oDf = new JsSimpleDateFormat("'Week-'w 'of' YYYY");
    function format(y, s) {
        let oDate = new Date(y, 11, 31);
        expect(oDf.format(oDate)).toBe(s);
    }

    //Dec 31st is in the first week if not saturday; YYYY is the next year if saturday in the week is in the next year
    format(2017, 'Week-1 of 2018'); //sunday
    format(2018, 'Week-1 of 2019'); //monday
    format(2019, 'Week-1 of 2020'); //tuesday
    format(2014, 'Week-1 of 2015'); //wednesday
    format(2015, 'Week-1 of 2016'); //thursday
    format(2021, 'Week-1 of 2022'); //friday
    format(2022, 'Week-53 of 2022'); //saturday
});

test("parse week of week-year (`w 'of' YYYY`) on Jan 1st and Dec 31st", () => {
    let oDf = new JsSimpleDateFormat("'Week-'w 'of' YYYY");
    
    function parse1(s, y) {
        let oBasicDate = new Date(y, 0, 1);
        //The week value is always parsed to the previous sunday
        //It may cause the date falls into previous month (isLenient needs not to be true becuse we use weekYear pattern)
        oBasicDate.setDate(oBasicDate.getDate() - oBasicDate.getDay());
        
        let oDate = oDf.parse(s);
        expect(oDate?.getTime()).toBe(oBasicDate.getTime());
    }

    //The week in which Jan 1st exists
    parse1('Week-1 of 2017', 2017);
    parse1('Week-1 of 2018', 2018);
    parse1('Week-1 of 2019', 2019);
    parse1('Week-1 of 2014', 2014);
    parse1('Week-1 of 2015', 2015);
    parse1('Week-1 of 2021', 2021);
    parse1('Week-1 of 2022', 2022);

    function parse2(s, y) {
        let oBasicDate = new Date(y, 11, 31);
        //The week value is always parsed to the previous sunday
        oBasicDate.setDate(oBasicDate.getDate() - oBasicDate.getDay());
        
        let oDate = oDf.parse(s);
        expect(oDate?.getTime()).toBe(oBasicDate.getTime());
    }

    //The week in which Dec 31st exists
    parse2('Week-1 of 2018',  2017);
    parse2('Week-1 of 2019',  2018);
    parse2('Week-1 of 2020',  2019);
    parse2('Week-1 of 2015',  2014);
    parse2('Week-1 of 2016',  2015);
    parse2('Week-1 of 2022',  2021);
    parse2('Week-53 of 2022', 2022);
});

test("parsing week doesn't change the date if the day has been specified and is still in its range", () => {
    function parse(sPattern, sVal, oDate) {
        let oDf = new JsSimpleDateFormat(sPattern);
        expect(oDf.parse(sVal)?.getTime()).toBe(oDate.getTime());
    }

    parse("MMMM d, yyyy 'is' W'th week in the month'", 'January 23, 2023 is 4th week in the month', new Date(2023, 0, 23));
    parse("D'th' 'day of' yyyy 'is' w'th week in the year'", '34th day of 2023 is 5th week in the year', new Date(2023, 1, 3));
    parse("'The first' EEEE 'in' MMMM yyyy 'is certainly in the' F'st week in the month'",
          'The first Tuesday in February 2023 is certainly in the 1st week in the month',
          new Date(2023, 1, 7)
    );
});



test("parsing week does change the date if not in its range", () => {
    let oDf = new JsSimpleDateFormat("MMMM d, yyyy 'is' W'th week in the month'");
    let sVal = 'January 16, 2023 is 4th week in the month';
    
    let oPos = {index: 0};
    let oDate = oDf.parse(sVal, oPos);
    expect(oDate).toBeNull();
    expect(oPos).toEqual({index: 0, errorIndex: sVal.length});

    oDf.isLenient = true;
    oPos = {index: 0};
    oDate = oDf.parse(sVal, oPos);
    expect(oDate?.getTime()).toBe(new Date(2023, 0, 22).getTime());
    expect(oPos).toEqual({index: sVal.length});
});