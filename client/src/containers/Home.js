import React, { Component } from 'react';
import WindowSizeListener from 'react-window-size-listener';
import { Link } from 'react-router-dom';

import '../styles/Home.css';

import { Button } from 'antd';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = { height: 0 };
  }

  render() {
    return (
      <div>
        <WindowSizeListener onResize={windowSize => {
          this.setState({ height: windowSize.windowHeight });
        }} />

        <div className="bodyContainer">
          <div className="loginContainer">
            <div className="intro">
              <h1>The calendar <br /> reinvented for students.</h1>
              <p>
                Graduation Helper is a calendar app designed for the modern college student.
                Using Graduation Helper, you can add your class schedule in seconds, discover
                interesting events around campus, and see at a glance what your
                friends are up to.
              </p>
            </div>
            <Button
              type="primary"
              className="loginButton"
            >
              <Link to={'/Login'}>Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
