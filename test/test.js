'use strict';

require('mocha');
var assert = require('assert');
var main = require('../main.js');
const fs = require('fs');
const fetch = require("node-fetch");
const config = require('../config/config.json');
const filename = config.filename;
const cashInUrl = 'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in';
const cashOutNat = 'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/natural';
const cashOutJur = 'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/juridical';

describe('initialize()', async function() {
    const apiData = {};
    it('Get the cash in data from API', async function() {
        let res1 = await fetch(cashInUrl);
        const data1 = await res1.json();
        apiData.cashInApiData = data1
    });
    it('Get the cash out natural data from API', async function () {
        let res2 = await fetch(cashOutNat);
        const data2 = await res2.json();
        apiData.cashOutNatApiData = data2
    });
    it('Get the cash out juridical data from API', async function () {
        let res3 = await fetch(cashOutJur);
        const data3 = await res3.json();
        apiData.cashOutJurApiData = data3
    });

    fs.readFile(filename, 'utf-8', (error, data) => {
        if (error) throw error;
        var data = JSON.parse(data);
    });
        
})