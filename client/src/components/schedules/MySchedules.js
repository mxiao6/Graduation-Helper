import React, { Component } from 'react';
import WindowSizeListener from 'react-window-size-listener';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'antd';
import 'styles/ClassSelection.css';

import { GET_SCHEDULE } from 'api';

class MySchedules extends Component {
  state = { height: 0 };

  componentWillMount() {
    axios
      .get(GET_SCHEDULE, {
        params: {
          userId: this.props.user.userId,
        },
      })
      .then(res => {
        console.log('MySchedules', res.data);
        this.setState({
          schedules: res.data,
        });
      })
      .catch(e => {
        console.error(e.response);
      });
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
          <div />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.auth.user,
  };
}

export default connect(mapStateToProps)(MySchedules);
