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
  _parseSchedule,
} from 'components/schedules/SmallSchedules';

class MySchedules extends Component {
  state = {
    schedules: undefined,
    schedulesIndex: [],
  };

  componentWillMount() {
    const { user, history } = this.props;
    if (!user) {
      history.push('/');
    } else {
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

    this.setState({
      schedulesIndex: _.map(schedules, (value, key) => key),
    });
    console.log('schedulesIndex', this.state.schedulesIndex);

    return _parseSmallArray(smallData);
  };

  _editSchedule = idx => {
    const { schedulesIndex, schedules } = this.state;
    const { history } = this.props;
    console.log('idx', schedulesIndex[idx], schedules[schedulesIndex[idx]]);
    history.push({
      pathname: '/ClassSelection',
      state: {
        scheduleId: schedulesIndex[idx],
        schedule: _parseSchedule({ sections: schedules[schedulesIndex[idx]] }),
      },
    });
  };

  _renderSmallGrids = () => {
    const { loading, smallSchedules } = this.state;
    return !smallSchedules ? (
      <Spin />
    ) : (
      _renderSmallSchedules(smallSchedules, this._editSchedule)
    );
  };

  // _handleDelete = () => {
  //   axios
  //     .post(POST_DELETE_SCHEDULE, {
  //       scheduleId: 4,
  //     })
  //     .then(res => {
  //       console.log('POST_DELETE_SCHEDULE', res.data);
  //     })
  //     .catch(e => {
  //       console.error('POST_DELETE_SCHEDULE', e.response);
  //     });
  // };

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
