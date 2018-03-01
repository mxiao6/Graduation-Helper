var webdriver = require('selenium-webdriver');
require('chromedriver');
require('chai').should();

describe('Test Suite', function () {
  var chromeCapabilities = webdriver.Capabilities.chrome();
  var chromeOptions = {
    'args': ['--no-sandbox', '--headless']
  };
  chromeCapabilities.set('chromeOptions', chromeOptions);
  var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();

  after(function () {
    driver.quit();
  });

  function findLoginButton () {
    return driver.findElements(webdriver.By.css('.loginButton a')).then(function (result) {
      return result[0];
    });
  }

  it('Page Title', function (done) {
    this.timeout(10000);
    driver.get('http://localhost:3000/')
      .then(() => driver.getTitle())
      .then(title =>
        title.should.equal('Graduation Helper')
      )
      .then(() => done())
      .catch(error => done(error));
  });

  it('Login Button on Home Page', function (done) {
    this.timeout(10000);
    driver.get('http://localhost:3000/')
      .then(() => driver.wait(findLoginButton, 2000))
      .then(button => button.click())
      .then(() => driver.getCurrentUrl())
      .then(curUrl => curUrl.should.include('Login'))
      .then(() => done())
      .catch(error => done(error));
  });
});
