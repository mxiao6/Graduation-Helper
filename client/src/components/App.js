import React, { Component } from "react";
import { HashRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux/configureStore";
import Header from "components/Header";
import Home from "components/Home";
import Login from "components/Login";
import Signup from "components/Signup";
import SemesterSelection from "components/SemesterSelection";
import ClassSelection from "components/ClassSelection";
import "styles/App.css";

const store = configureStore();
class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="app">
            <Header />
            <Route exact path="/" component={Home} />
            <Route path="/Login" component={Login} />
            <Route path="/Signup" component={Signup} />
            <Route path="/SemesterSelection" component={SemesterSelection} />
            <Route path="/ClassSelection" component={ClassSelection} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
