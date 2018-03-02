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

  function findLoginPageButton () {
    return driver.findElements(webdriver.By.css('.loginButton a')).then(function (result) {
      return result[0];
    });
  }

  function findRegisterButton () {
    return driver.findElements(webdriver.By.linkText('register now!')).then(function (result) {
      return result[0];
    });
  }

  function findLoginButton () {
    return driver.findElements(webdriver.By.css('.login-form-button')).then(function (result) {
      return result[0];
    });
  }

  function findErrorText (index) {
    return driver.findElements(webdriver.By.css('.ant-form-explain')).then(function (result) {
      return result[index];
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
      .then(() => driver.wait(findLoginPageButton, 2000))
      .then(button => button.click())
      .then(() => driver.getCurrentUrl())
      .then(curUrl => curUrl.should.include('Login'))
      .then(() => done())
      .catch(error => done(error));
  });

  it('Register Button', function (done) {
    this.timeout(10000);
    driver.get('http://localhost:3000/')
      .then(() => driver.wait(findLoginPageButton, 2000))
      .then(button => button.click())
      .then(() => driver.wait(findRegisterButton, 2000))
      .then(button => button.click())
      .then(() => driver.getCurrentUrl())
      .then(curUrl => curUrl.should.include('Signup'))
      .then(() => done())
      .catch(error => done(error));
  });

  it('Empty Login', function (done) {
    this.timeout(20000);
    driver.get('http://localhost:3000/')
      .then(() => driver.wait(findLoginPageButton, 2000))
      .then(button => button.click())
      .then(() => driver.wait(findLoginButton, 2000))
      .then(button => button.click())
      .then(() => driver.wait(findErrorText(0), 2000))
      .then(errorElem => errorElem.getAttribute('innerText'))
      .then(errorText => errorText.should.equal('Please input your Email!'))
      .then(() => driver.wait(findErrorText(1), 2000))
      .then(errorElem => errorElem.getAttribute('innerText'))
      .then(errorText => errorText.should.equal('Please input your Password!'))
      .then(() => done())
      .catch(error => done(error));
  });
});

/* errorText.text.should.equal('Please input your Email!') */
