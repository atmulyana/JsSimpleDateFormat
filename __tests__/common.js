function getTzComp(oDate) {
    var tzo = oDate.getTimezoneOffset();
    var arComp = [];
    arComp[0] = tzo > 0 ? "-" : "+";
    tzo = Math.abs(tzo);
    var iHour = Math.floor(tzo / 60);
    arComp[1] = ("0" + iHour).slice(-2);
    arComp[2] = ("0" + (tzo % 60)).slice(-2);
    arComp[3] = iHour;
    return arComp;
}

module.exports = {
    getTzComp,
};