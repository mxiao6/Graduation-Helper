import React, { Component } from "react";
import { HashRouter as Router, Route } from "react-router-dom";

import "styles/App.css";

import Header from "Header";
import Home from "Home";
import Login from "Login";
import Signup from "Signup";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="app">
          <Header />
          <Route exact path="/" component={Home} />
          <Route path="/Login" component={Login} />
          <Route path="/Signup" component={Signup} />
        </div>
      </Router>
    );
  }
}

export default App;
