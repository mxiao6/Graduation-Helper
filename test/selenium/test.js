var webdriver = require('selenium-webdriver')
var By = webdriver.By
var until = webdriver.until
require('chromedriver')
var chai = require('chai')
var should = chai.should();

describe( 'Test Suite' , function(){

    var driver = new webdriver.Builder().forBrowser('chrome').build();

    before(function(){

        driver.get( 'http://localhost:3000/' );
    });

    after(function(){
        driver.quit();
    });

    it( 'App Title' , function(done){
        this.timeout(10000)
        driver.get( 'http://www.google.com/' )
            .then(() => driver.getTitle())

            .then(title =>
            title.should.equal('Google')
        )
            .then(() => done())
            .catch(error => done(error))

    });

});