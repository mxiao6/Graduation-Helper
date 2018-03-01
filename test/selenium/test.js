var webdriver = require('selenium-webdriver')
var By = webdriver.By;
var until = webdriver.until;
require('chromedriver');
var chai = require('chai');
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
        this.timeout(5000)
        driver.get( 'http://localhost:3000/' )
            .then(() => driver.getTitle())
            .then(title =>
            title.should.equal('React App')
            )
            .then(() => done())
            .catch(error => done(error))

        var elem = driver.findElement(By.css("a=[href=#/Login]"));
        elem.click();

        driver.wait(until.urlContains('Login'), 20000)

        driver.wait(until.elementLocated(By.className("ant-form-item-control")), 2000);
        driver.wait(until.elementLocated(By.css("input[type=text][id=email]")));
        var email = driver.findElement(By.css("input[type=text][id=email]"));
        email.sendKeys("zuyichen@hotmail.com");
        driver.wait(until.elementLocated(By.css("input[type=password]")))
        var password = driver.findElement(By.css("input[type=password"));
        password.sendKeys("pass");

    });

});