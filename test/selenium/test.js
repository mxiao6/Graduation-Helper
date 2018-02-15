var webdriver = require('selenium-webdriver')
var By = webdriver.By
var until = webdriver.until
var chrome = require('chromedriver')

describe( 'Test Suite' , function(){

    var driver = new webdriver.Builder().forBrowser('chrome').build();

    before(function(){

        driver.get( 'https://www.google.com/' );
    });

    after(function(){
        driver.quit();
    });

    it( 'bad login' , function(){

        driver.getTitle().then(function (title) {
            console.log(title)
        })

    });

});