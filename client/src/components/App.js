import React, { Component } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux/configureStore';
import { PersistGate } from 'redux-persist/integration/react';
import Header from 'components/Header';
import Home from 'components/Home';
import Login from 'components/Login';
import Signup from 'components/Signup';
import ResetPassword from 'components/ResetPassword';
import SemesterSelection from 'components/SemesterSelection';
import ClassSelection from 'components/ClassSelection';
import GenerateSchedule from 'components/GenerateSchedule';
import 'styles/App.css';

const { store, persistor } = configureStore();
class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router>
            <div className="app">
              <Header />
              <Route exact path="/" component={Home} />
              <Route path="/Login" component={Login} />
              <Route path="/Signup" component={Signup} />
              <Route path="/ResetPassword" component={ResetPassword} />
              <Route path="/SemesterSelection" component={SemesterSelection} />
              <Route path="/ClassSelection" component={ClassSelection} />
              <Route path="/GenerateSchedule" component={GenerateSchedule} />
            </div>
          </Router>
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
