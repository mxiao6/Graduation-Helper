import React, { Component } from 'react';
import {
  HashRouter as Router,
  Route
} from 'react-router-dom';

import './styles/App.css';

import Header from './containers/Header';
import Home from './containers/Home';
import Login from './containers/Login';
import Signup from './containers/Signup';

class App extends Component {
  // state = {
  //   response: ''
  // };

  // componentDidMount(){
  //   this.callApi()
  //     .then(res => this.setState({ response: res.express }))
  //     .catch(err => console.log(err));
  // }

  // callApi = async () => {
  //   const response = await fetch('/api/hello');
  //   const body = await response.json();

  //   if (response.status !== 200) throw Error(body.message);
  //   return body;
  // };

  render() {
    return (
      <Router>
        <div className="app">
          <Header></Header>
          <Route exact path="/" component={Home}/>
          <Route path="/Login" component={Login}/>
          <Route path="/Signup" component={Signup}/>
        </div>
      </Router>
    );
  }
}

export default App;
