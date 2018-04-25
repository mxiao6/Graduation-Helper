import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import axios from 'axios';
import { Button, Spin } from 'antd';
import 'styles/ClassSelection.css';

import { GET_SCHEDULE, POST_DELETE_SCHEDULE } from 'api';
import {
  _parseSmallArray,
  _renderSmallSchedules,
} from 'components/schedules/SmallSchedules';

class MySchedules extends Component {
  state = {
    schedules: undefined,
  };

  componentWillMount() {
    const { user, history } = this.props;
    if (!user) history.push('/');

    axios
      .get(GET_SCHEDULE, {
        params: {
          userId: user.userId,
        },
      })
      .then(res => {
        console.log('MySchedules', res.data);
        this.setState({
          schedules: res.data,
          smallSchedules: this._parseSchedules(res.data),
        });
      })
      .catch(e => {
        console.error('GET_SCHEDULE', e.response);
      });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.user) this.props.history.push('/');
  }

  _parseSchedules = schedules => {
    let smallData = {
      schedules: _.map(schedules, (value, key) => ({
        sections: value,
      })),
    };

    return _parseSmallArray(smallData);
  };

  _showBigSchedule = scheduleIdx => {
    console.log('scheduleIdx', scheduleIdx);
    this.setState({
      scheduleIdx,
      modalVisible: true,
    });
  };

  _renderSmallGrids = () => {
    const { loading, smallSchedules } = this.state;
    return !smallSchedules ? (
      <Spin />
    ) : (
      _renderSmallSchedules(smallSchedules, this._showBigSchedule)
    );
  };

  render() {
    const { user } = this.props;
    return (
      <div>
        <div className="bodyContainer">
          <h1>My Schedules</h1>
          {this._renderSmallGrids()}
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
