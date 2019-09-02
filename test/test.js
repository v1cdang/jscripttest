const main = require('../main.js');
const assert = require('assert');
const fs = require('fs');
const fetch = require("node-fetch");
const filename = process.argv.splice(2);

const cashInUrl = 'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in';
const cashOutNat = 'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/natural';
const cashOutJur = 'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/juridical';


describe('initialize()', function() {
    var apiData = {};
    it('initialize and get the cash in data from API', async function() {
        let res1 = await fetch(cashInUrl);
        const data1 = await res1.json();
        
        
    });
    
})