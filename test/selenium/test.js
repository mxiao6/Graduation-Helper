var webdriver = require('selenium-webdriver');
require('chromedriver');
require('chai').should();

var chromeCapabilities = webdriver.Capabilities.chrome();
var chromeOptions = {
  'args': ['--no-sandbox', '--headless']
};
chromeCapabilities.set('chromeOptions', chromeOptions);
var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).build();

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

function findLogoutButton () {
  return driver.findElements(webdriver.By.css('.logoutButton')).then(function (result) {
    return result[0];
  });
}

function findYesButton () {
  return driver.findElements(webdriver.By.css('.ant-btn-danger')).then(function (result) {
    return result[0];
  });
}

function findErrorText (index) {
  return driver.findElements(webdriver.By.css('.ant-form-explain')).then(function (result) {
    return result[index];
  });
}

function findErrorMessage (index) {
  return driver.findElements(webdriver.By.css('.ant-message-error span')).then(function (result) {
    return result[index];
  });
}

function findEmailEntry () {
  return driver.findElements(webdriver.By.css('#email')).then(function (result) {
    return result[0];
  });
}

function findUsernameEntry () {
  return driver.findElements(webdriver.By.css('#username')).then(function (result) {
    return result[0];
  });
}

function findPasswordEntry () {
  return driver.findElements(webdriver.By.css('#password')).then(function (result) {
    return result[0];
  });
}

function findTitleText () {
  return driver.findElements(webdriver.By.css('.intro h1')).then(function (result) {
    return result[0];
  });
}

function goToLoginPage () {
  return driver.get('http://localhost:3000/')
    .then(() => driver.wait(findLoginPageButton, 2000))
    .then(button => button.click());
}

describe('Home and Login Tests', function () {
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
    driver.get('http://localhost:3000/');
    goToLoginPage()
      .then(() => driver.getCurrentUrl())
      .then(curUrl => curUrl.should.include('Login'))
      .then(() => done())
      .catch(error => done(error));
  });

  it('Register Button', function (done) {
    this.timeout(10000);
    goToLoginPage()
      .then(() => driver.wait(findRegisterButton, 2000))
      .then(button => button.click())
      .then(() => driver.getCurrentUrl())
      .then(curUrl => curUrl.should.include('Signup'))
      .then(() => done())
      .catch(error => done(error));
  });

  it('Empty Login', function (done) {
    this.timeout(20000);
    goToLoginPage()
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

  it('Successful Registration', function (done) {
    this.timeout(20000);
    goToLoginPage()
      .then(button => button.click())
      .then(() => driver.wait(findRegisterButton, 2000))
      .then(button => button.click())
      .then(() => driver.wait(findEmailEntry(), 2000))
      .then(input => input.sendKeys('admin@gmail.com'))
      .then(() => driver.wait(findUsernameEntry(), 2000))
      .then(input => input.sendKeys('admin'))
      .then(() => driver.wait(findPasswordEntry(), 2000))
      .then(input => input.sendKeys('test'))
      .then(() => driver.wait(findLoginButton, 2000))
      .then(button => button.click())
      .then(() => driver.sleep(2000))
      .then(() => driver.getCurrentUrl())
      .then(url => url.should.equal('http://localhost:3000/#/'))
      .then(() => driver.wait(findTitleText(), 2000))
      .then(textElem => textElem.getAttribute('innerText'))
      .then(titleText => titleText.should.equal('Hello, \nadmin!'))
      .then(() => done())
      .catch(error => done(error));
  });

  it('Register with Same Email', function (done) {
    this.timeout(20000);
    goToLoginPage()
      .then(() => driver.wait(findRegisterButton, 2000))
      .then(button => button.click())
      .then(() => driver.wait(findEmailEntry(), 2000))
      .then(input => input.sendKeys('admin@gmail.com'))
      .then(() => driver.wait(findUsernameEntry(), 2000))
      .then(input => input.sendKeys('admin'))
      .then(() => driver.wait(findPasswordEntry(), 2000))
      .then(input => input.sendKeys('test'))
      .then(() => driver.wait(findLoginButton, 2000))
      .then(button => button.click())
      .then(() => driver.sleep(2000))
      .then(() => driver.getCurrentUrl())
      .then(curUrl => curUrl.should.include('Signup'))
      .then(() => driver.wait(findErrorMessage(0), 2000))
      .then(textElem => textElem.getAttribute('innerText'))
      .then(errorText => errorText.should.equal('Email already registered!'))
      .then(() => done())
      .catch(error => done(error));
  });

  it('Successful Login', function (done) {
    this.timeout(20000);
    goToLoginPage()
      .then(() => driver.wait(findEmailEntry(), 2000))
      .then(input => input.sendKeys('admin@gmail.com'))
      .then(() => driver.wait(findPasswordEntry(), 2000))
      .then(input => input.sendKeys('test'))
      .then(() => driver.wait(findLoginButton, 2000))
      .then(button => button.click())
      .then(() => driver.sleep(2000))
      .then(() => driver.getCurrentUrl())
      .then(url => url.should.equal('http://localhost:3000/#/'))
      .then(() => driver.wait(findTitleText(), 2000))
      .then(textElem => textElem.getAttribute('innerText'))
      .then(titleText => titleText.should.equal('Hello, \nadmin!'))
      .then(() => done())
      .catch(error => done(error));
  });

  it('Successful Logout', function (done) {
    this.timeout(20000);
    goToLoginPage()
      .then(() => driver.wait(findEmailEntry(), 2000))
      .then(input => input.sendKeys('admin@gmail.com'))
      .then(() => driver.wait(findPasswordEntry(), 2000))
      .then(input => input.sendKeys('test'))
      .then(() => driver.wait(findLoginButton, 2000))
      .then(button => button.click())
      .then(() => driver.sleep(2000))
      .then(() => driver.wait(findLogoutButton(), 2000))
      .then(button => button.click())
      .then(() => driver.sleep(1000))
      .then(() => driver.wait(findYesButton(), 2000))
      .then(button => button.click())
      .then(() => driver.wait(findTitleText(), 2000))
      .then(textElem => textElem.getAttribute('innerText'))
      .then(titleText => titleText.should.equal('The calendar \nreinvented for students.'))
      .then(() => done())
      .catch(error => done(error));
  });
});

function findSelectClassButton () {
  return driver.findElements(webdriver.By.linkText('Select Class')).then(function (result) {
    return result[0];
  });
}

function findSemesterDropdown () {
  return driver.findElements(webdriver.By.css('.ant-cascader-input')).then(function (result) {
    return result[0];
  });
}

function findElementByTitle (title) {
  return driver.findElements(webdriver.By.css('*[title="' + title + '"]')).then(function (result) {
    return result[0];
  });
}

function findNextButton () {
  return driver.findElements(webdriver.By.linkText('Next')).then(function (result) {
    return result[0];
  });
}

function findAddOrGenerateButton (index) {
  return driver.findElements(webdriver.By.css('.nextButton')).then(function (result) {
    return result[index];
  });
}

function findSelectedSemester () {
  return driver.findElements(webdriver.By.css('.contentContainer div')).then(function (result) {
    return result[0];
  });
}

function findHomeButton () {
  return driver.findElements(webdriver.By.linkText('HOME')).then(function (result) {
    return result[0];
  });
}

function findGenerateScheduleButton () {
  return driver.findElements(webdriver.By.linkText('Generate Schedule')).then(function (result) {
    return result[0];
  });
}

function findSectionsText () {
  return driver.findElements(webdriver.By.css('.sectionsContainer div')).then(function (result) {
    return result[0];
  });
}

function selectSemester () {
  return driver.get('http://localhost:3000/')
    .then(() => driver.wait(findLoginPageButton, 2000))
    .then(button => button.click())
    .then(() => driver.wait(findEmailEntry(), 2000))
    .then(input => input.sendKeys('admin@gmail.com'))
    .then(() => driver.wait(findPasswordEntry(), 2000))
    .then(input => input.sendKeys('test'))
    .then(() => driver.wait(findLoginButton, 2000))
    .then(button => button.click())
    .then(() => driver.sleep(2000))
    .then(() => driver.wait(findSelectClassButton, 2000))
    .then(button => button.click())
    .then(() => driver.getCurrentUrl())
    .then(url => url.should.contain('SemesterSelection'))
    .then(() => driver.sleep(2000))
    .then(() => driver.wait(findSemesterDropdown(), 2000))
    .then(dropdown => dropdown.click())
    .then(() => driver.wait(findElementByTitle('2018'), 2000))
    .then(element => element.click())
    .then(() => driver.sleep(2000))
    .then(() => driver.wait(findElementByTitle('Fall 2018'), 2000))
    .then(element => element.click())
    .then(() => driver.wait(findNextButton(), 2000))
    .then(button => button.click())
    .then(() => driver.sleep(2000));
}

describe('Schedule Generation Tests', function () {
  it('Select Semester', function (done) {
    this.timeout(20000);
    selectSemester()
      .then(() => driver.getCurrentUrl())
      .then(url => url.should.contain('ClassSelection'))
      .then(() => driver.wait(findSelectedSemester(), 2000))
      .then(textElem => textElem.getAttribute('innerText'))
      .then(titleText => titleText.should.contain('Selected Semester: Fall 2018'))
      .then(() => done())
      .catch(error => done(error));
  });

  it('Semester Already Selected', function (done) {
    this.timeout(20000);
    selectSemester()
      .then(() => driver.wait(findHomeButton(), 2000))
      .then(button => button.click())
      .then(() => driver.wait(findGenerateScheduleButton(), 2000))
      .then(button => button.click())
      .then(() => driver.sleep(2000))
      .then(() => driver.getCurrentUrl())
      .then(url => url.should.contain('GenerateSchedule'))
      .then(() => driver.wait(findSelectedSemester(), 2000))
      .then(textElem => textElem.getAttribute('innerText'))
      .then(titleText => titleText.should.contain('Selected Semester: Fall 2018'))
      .then(() => done())
      .catch(error => done(error));
  });

  it('Generate Schedule', function (done) {
    this.timeout(30000);
    driver.get('http://localhost:3000/')
      .then(() => driver.wait(findLoginPageButton, 2000))
      .then(button => button.click())
      .then(() => driver.wait(findEmailEntry(), 2000))
      .then(input => input.sendKeys('admin@gmail.com'))
      .then(() => driver.wait(findPasswordEntry(), 2000))
      .then(input => input.sendKeys('test'))
      .then(() => driver.wait(findLoginButton, 2000))
      .then(button => button.click())
      .then(() => driver.sleep(2000))
      .then(() => driver.wait(findGenerateScheduleButton(), 2000))
      .then(button => button.click())
      .then(() => driver.sleep(2000))
      .then(() => driver.wait(findSemesterDropdown(), 2000))
      .then(dropdown => dropdown.click())
      .then(() => driver.wait(findElementByTitle('2018'), 2000))
      .then(element => element.click())
      .then(() => driver.sleep(2000))
      .then(() => driver.wait(findElementByTitle('Fall 2018'), 2000))
      .then(element => element.click())
      .then(() => driver.wait(findNextButton(), 2000))
      .then(button => button.click())
      .then(() => driver.sleep(2000))
      .then(() => driver.wait(findSemesterDropdown(), 2000))
      .then(dropdown => dropdown.click())
      .then(() => driver.wait(findElementByTitle('Asian American Studies'), 2000))
      .then(element => element.click())
      .then(() => driver.sleep(2000))
      .then(() => driver.wait(findElementByTitle('200: U.S. Race and Empire'), 2000))
      .then(element => element.click())
      .then(() => driver.wait(findAddOrGenerateButton(0), 2000))
      .then(button => button.click())
      .then(() => driver.wait(findAddOrGenerateButton(1), 2000))
      .then(button => button.click())
      .then(() => driver.sleep(2000))
      .then(() => driver.wait(findSectionsText(), 2000))
      .then(textElem => textElem.getAttribute('innerText'))
      .then(sectionText => sectionText.should.contain('67473'))
      .then(() => done())
      .catch(error => done(error));
  });
});
