var webdriver = require('selenium-webdriver')
var By = webdriver.By
var until = webdriver.until
require('chromedriver')
var chai = require('chai')
var should = chai.should();

describe( 'Test Suite' , function(){

    var chromeCapabilities = webdriver.Capabilities.chrome();
    var chromeOptions = {
        'args': ['--no-sandbox', '--headless']
    };
    chromeCapabilities.set('chromeOptions', chromeOptions);
    var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();

    after(function(){
        driver.quit();
    });

    it( 'App Title' , function(done){
        this.timeout(30000)
        driver.get( 'http://localhost:3000/' )
            .then(() => driver.getTitle())
            .then(title =>
            title.should.equal('React App')
            )
            .then(() => done())
            .catch(error => done(error))

    });

});