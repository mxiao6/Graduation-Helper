import React, { Component } from "react";
import WindowSizeListener from "react-window-size-listener";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { Button } from "antd";
import "styles/Home.css";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = { height: 0 };
  }

  render() {
    const { user } = this.props;
    return (
      <div>
        <WindowSizeListener
          onResize={windowSize => {
            this.setState({ height: windowSize.windowHeight });
          }}
        />

        <div className="bodyContainer">
          <div className="mainContainer">
            <div className="intro">
              {user ? (
                <h1>
                  Hello, <br /> {user.username}!
                </h1>
              ) : (
                <h1>
                  The calendar <br /> reinvented for students.
                </h1>
              )}
              <p>
                Graduation Helper is a calendar app designed for the modern
                college student. Using Graduation Helper, you can add your class
                schedule in seconds, discover interesting events around campus,
                and see at a glance what your friends are up to.
              </p>
              {user && (
                <Button type="primary" className="tempButton">
                  <Link to={"/ClassSelection"}>Select Class</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.auth.user
  };
}

export default connect(mapStateToProps)(Home);
