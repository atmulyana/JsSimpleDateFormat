const {JsSimpleDateFormat} = require('../JsSimpleDateFormat');

test("format day of week ('u' and 'E')", () => {
    let oDf = new JsSimpleDateFormat("'Day-'u (EEEE) in MMMM yyyy");

    expect(oDf.format(new Date(2022, 10, 1))).toBe('Day-2 (Tuesday) in November 2022');
    expect(oDf.format(new Date(2022, 10, 2))).toBe('Day-3 (Wednesday) in November 2022');
    expect(oDf.format(new Date(2022, 10, 3))).toBe('Day-4 (Thursday) in November 2022');
    expect(oDf.format(new Date(2022, 10, 4))).toBe('Day-5 (Friday) in November 2022');
    expect(oDf.format(new Date(2022, 10, 5))).toBe('Day-6 (Saturday) in November 2022');
    expect(oDf.format(new Date(2022, 10, 6))).toBe('Day-7 (Sunday) in November 2022');
    expect(oDf.format(new Date(2022, 10, 7))).toBe('Day-1 (Monday) in November 2022');
});

test("format day of week ('u' and 'E'), locale: id", () => {
    let oDf = new JsSimpleDateFormat("'Day-'u (EEEE) in MMMM yyyy", 'id');

    expect(oDf.format(new Date(2022, 10, 1))).toBe('Day-2 (Selasa) in Nopember 2022');
    expect(oDf.format(new Date(2022, 10, 2))).toBe('Day-3 (Rabu) in Nopember 2022');
    expect(oDf.format(new Date(2022, 10, 3))).toBe('Day-4 (Kamis) in Nopember 2022');
    expect(oDf.format(new Date(2022, 10, 4))).toBe('Day-5 (Jumat) in Nopember 2022');
    expect(oDf.format(new Date(2022, 10, 5))).toBe('Day-6 (Sabtu) in Nopember 2022');
    expect(oDf.format(new Date(2022, 10, 6))).toBe('Day-7 (Minggu) in Nopember 2022');
    expect(oDf.format(new Date(2022, 10, 7))).toBe('Day-1 (Senin) in Nopember 2022');
});

test("parse day of week ('u' and 'E')", () => {
    let oDf = new JsSimpleDateFormat("'Day-'u (EEEE) in MMMM yyyy");

    expect(oDf.parse('Day-2 (Tuesday) in November 2022')?.getTime()).toBe( new Date(2022, 10, 1).getTime() );
    expect(oDf.parse('Day-3 (Wednesday) in November 2022')?.getTime()).toBe( new Date(2022, 10, 2).getTime() );
    expect(oDf.parse('Day-4 (Thursday) in November 2022')?.getTime()).toBe( new Date(2022, 10, 3).getTime() );
    expect(oDf.parse('Day-5 (Friday) in November 2022')?.getTime()).toBe( new Date(2022, 10, 4).getTime() );
    expect(oDf.parse('Day-6 (Saturday) in November 2022')?.getTime()).toBe( new Date(2022, 10, 5).getTime() );
    expect(oDf.parse('Day-7 (Sunday) in November 2022')?.getTime()).toBe( new Date(2022, 10, 6).getTime() );
    expect(oDf.parse('Day-1 (Monday) in November 2022')?.getTime()).toBe( new Date(2022, 10, 7).getTime() );
});

test("parse day of week ('u' and 'E'), locale: id", () => {
    let oDf = new JsSimpleDateFormat("'Day-'u (EEEE) in MMMM yyyy", 'id');

    expect(oDf.parse('Day-2 (Selasa) in Nopember 2022')?.getTime()).toBe( new Date(2022, 10, 1).getTime() );
    expect(oDf.parse('Day-3 (Rabu) in Nopember 2022')?.getTime()).toBe( new Date(2022, 10, 2).getTime() );
    expect(oDf.parse('Day-4 (Kamis) in Nopember 2022')?.getTime()).toBe( new Date(2022, 10, 3).getTime() );
    expect(oDf.parse('Day-5 (Jumat) in Nopember 2022')?.getTime()).toBe( new Date(2022, 10, 4).getTime() );
    expect(oDf.parse('Day-6 (Sabtu) in Nopember 2022')?.getTime()).toBe( new Date(2022, 10, 5).getTime() );
    expect(oDf.parse('Day-7 (Minggu) in Nopember 2022')?.getTime()).toBe( new Date(2022, 10, 6).getTime() );
    expect(oDf.parse('Day-1 (Senin) in Nopember 2022')?.getTime()).toBe( new Date(2022, 10, 7).getTime() );
});