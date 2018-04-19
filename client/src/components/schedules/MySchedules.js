import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import axios from 'axios';
import { Spin } from 'antd';
import 'styles/ClassSelection.css';

import { GET_SCHEDULE } from 'api';
import {
  _parseSmallArray,
  _renderSmallSchedules,
} from 'components/schedules/SmallSchedules';

class MySchedules extends Component {
  state = {
    schedules: undefined,
    loading: false,
  };

  componentWillMount() {
    this.setState({
      loading: true,
    });

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
          smallSchedules: this._parseSchedules(res.data),
          loading: false,
        });
      })
      .catch(e => {
        console.error('GET_SCHEDULE', e.response);
      });
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
    return loading ? (
      <Spin />
    ) : (
      _renderSmallSchedules(smallSchedules, this._showBigSchedule)
    );
  };

  render() {
    const { user } = this.props;
    return (
      <div>
        <div className="bodyContainer">{this._renderSmallGrids()}</div>
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
