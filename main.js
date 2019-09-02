'use strict';
/**
 * 
 * The resulted data seems to be flawed, or I made a mistake checking the date
 * Anyway, it was still fun working on this, although I had not enough time working
 * on the unit testing
 */

const fs = require('fs');
const fetch = require("node-fetch");
const config = require('./config/config.json');
//const filename = process.argv.splice(2);
const filename = config.filename;
var cashInApiData, cashOutNatApiData, cashOutJurApiData;

const cashInUrl = 'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in';
const cashOutNat = 'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/natural';
const cashOutJur = 'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/juridical';

let settings = { method: "Get" };

async function initialize() {
    var apiData = {};
    try {
        let res1 = await fetch(cashInUrl);
        const data1 =  await res1.json();
        apiData.cashInApiData = data1

    } catch (error) {
        throw Error(error)
    }
    try {
        let res2 = await fetch(cashOutNat);
        const data2 = await res2.json();
        apiData.cashOutNatApiData =  data2
    } catch (error) {
        throw Error(error)
    }
    try {
        let res3 = await fetch(cashOutJur);
        const data3 = await res3.json();
        apiData.cashOutJurApiData =  data3
    } catch (error) {
        throw Error(error)
    }
    
    return apiData;
}

Date.prototype.getWeek = function (dowOffset) {
        dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
        var newYear = new Date(this.getFullYear(),0,1);
        var day = newYear.getDay() - dowOffset; //the day of week the year begins on
        day = (day >= 0 ? day : day + 7);
        var daynum = Math.floor((this.getTime() - newYear.getTime() - 
        (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
        var weeknum;
         if(day < 4) {
            weeknum = Math.floor((daynum+day-1)/7) + 1;
            if(weeknum > 52) {
                nYear = new Date(this.getFullYear() + 1,0,1);
                nday = nYear.getDay() - dowOffset;
                nday = nday >= 0 ? nday : nday + 7;
                weeknum = nday < 4 ? 1 : 53;
            }
        }
        else {
            weeknum = Math.floor((daynum+day-1)/7);
        }
        return weeknum;
    };

initialize()
    .then(function (apiData) {
        fs.readFile(filename, 'utf-8', (error, data) => {
            if (error) throw error;
            var data = JSON.parse(data);

//            var groupedData = groupBy(data, ['user_id']);

            var users = Array.from(new Set(data.map(s => s.user_id)))
                .map(user_id => {
                    var d = {
                        userId: user_id,
                        data: [{
                            weekNum: 0,
                            totalOpAmount: 0.00,
                            deducted: false
                        }]
                    };
                    
                    return {
                        d
                    }
                });
            data.forEach(function(inputData) {
                var xdate = new Date(inputData.date);
                var weekNum = xdate.getWeek();
                var userId =  inputData.user_id;
                var userType = inputData.user_type;
                var type = inputData.type;
                var operationAmount = Number(inputData.operation.amount);
                var operationCurrency = inputData.operation.currency;
                

                if (type == 'cash_in') {
                    var comm = operationAmount * (apiData.cashInApiData.percents / 100);
                    if (comm > apiData.cashInApiData.max.amount) {
                        comm = apiData.cashInApiData.max.amount;
                    }
                }
                if (type == 'cash_out') {

                    if (userType=='natural') {
                        var comm;
                        var weekLimit = apiData.cashOutNatApiData.week_limit.amount
                        
                        users.find((o,i) => {
                            if (o.d.userId === userId) {
                                if (o.d.data[0].weekNum === 0) {
                                    o.d.data = [{
                                        'weekNum': weekNum,
                                        'totalOpAmount': operationAmount,
                                        'deducted': false
                                    }];
                                } else {
                                    o.d.data.find((w) => {
                                        if (w.weekNum == weekNum) {
                                            w.totalOpAmount = w.totalOpAmount + operationAmount;
                                        } else {
                                            w = [{
                                                'weekNum': weekNum,
                                                'totalOpAmount': operationAmount,
                                                'deducted': false
                                            }];
                                            o.d.data[0] = w;
                                        }
                                    })
                                }
                                if(o.d.data[0].totalOpAmount <= weekLimit) {
                                    comm = 0;
                                } else {
                                    
                                    if (!o.d.data[0].deducted) {
                                        comm = (operationAmount - weekLimit) * (apiData.cashOutNatApiData.percents / 100);
                                        o.d.data[0].deducted = true;
                                    } else {
                                        comm = (operationAmount) * (apiData.cashOutNatApiData.percents / 100);
                                    }
                                    if (!isNaN(comm) && comm <   0) {
                                        comm = 0;
                                    }
                                    
                                }
                            }
                         });
                    }
                    if (userType == 'juridical') {
                        var comm = operationAmount * (apiData.cashOutJurApiData.percents / 100);
                    }
                }
                
                console.log(comm.toFixed(2));
            });
        });
    })
    .catch(e => console.error(e));





