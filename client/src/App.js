import React, { Component } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux/configureStore';
import { PersistGate } from 'redux-persist/integration/react';

import Header from 'components/home/Header';
import Home from 'components/home/Home';
import Login from 'components/auth/Login';
import Signup from 'components/auth/Signup';
import ResetPassword from 'components/auth/ResetPassword';
import SemesterSelection from 'components/schedules/SemesterSelection';
import EditSchedule from 'components/schedules/EditSchedule';
import GenerateSchedule from 'components/schedules/GenerateSchedule';
import MySchedules from 'components/schedules/MySchedules';

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
              <Route path="/EditSchedule" component={EditSchedule} />
              <Route path="/GenerateSchedule" component={GenerateSchedule} />
              <Route path="/MySchedules" component={MySchedules} />
            </div>
          </Router>
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
