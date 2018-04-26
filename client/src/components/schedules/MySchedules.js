import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import axios from 'axios';
import { Button, Spin, Modal, message } from 'antd';
import WindowSizeListener from 'react-window-size-listener';

import '../../styles/Schedules.css';
import { GET_SCHEDULE, POST_DELETE_SCHEDULE } from 'api';
import {
  _parseSmallArray,
  _renderSmallSchedules,
  _parseSchedule,
  _renderGenerated,
} from 'components/schedules/SmallSchedules';

class MySchedules extends Component {
  state = {
    schedules: undefined,
    smallSchedules: undefined,
    schedulesIndex: [],
    modalVisible: false,
    scheduleIdx: 0,
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
            generated: this._parseSchedules(res.data),
            smallSchedules: this._parseSmallSchedules(res.data),
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
    let parsed = _.map(schedules, schedule =>
      _parseSchedule({ sections: schedule })
    );
    console.log('parsed', parsed);
    return parsed;
  };

  _parseSmallSchedules = schedules => {
    let smallData = {
      schedules: _.map(schedules, value => ({
        sections: value,
      })),
    };

    this.setState({
      schedulesIndex: _.map(schedules, (value, key) => key),
    });
    console.log('schedulesIndex', this.state.schedulesIndex);

    return _parseSmallArray(smallData);
  };

  _openModal = idx => {
    this.setState({
      scheduleIdx: idx,
      modalVisible: true,
    });
  };

  _handleEdit = () => {
    const { schedulesIndex, schedules, scheduleIdx } = this.state;
    const { history } = this.props;
    let idx = scheduleIdx;
    history.push({
      pathname: '/EditSchedule',
      state: {
        scheduleId: schedulesIndex[idx],
        scheduleRaw: schedules[schedulesIndex[idx]],
      },
    });
  };

  _handleDelete = () => {
    const { schedulesIndex, scheduleIdx } = this.state;
    axios
      .post(POST_DELETE_SCHEDULE, {
        scheduleId: schedulesIndex[scheduleIdx],
      })
      .then(res => {
        console.log('POST_DELETE_SCHEDULE', res.data);
        message.success('Delete successful');
        this.setState({
          modalVisible: false,
        });
        window.location.reload();
      })
      .catch(e => {
        console.error('POST_DELETE_SCHEDULE', e.response);
        this.setState({
          modalVisible: false,
        });
      });
  };

  _handleCancel = () => {
    this.setState({ modalVisible: false });
  };

  _renderSmallGrids = () => {
    const { loading, smallSchedules } = this.state;
    return !smallSchedules ? (
      <Spin />
    ) : (
      _renderSmallSchedules(smallSchedules, this._openModal)
    );
  };

  _renderModal = () => {
    const { modalVisible, height, width, generated, scheduleIdx } = this.state;
    return (
      <Modal
        visible={modalVisible}
        title="My Schedule"
        wrapClassName="scheduleModal"
        onCancel={this._handleCancel}
        width={width * 0.7}
        footer={[
          <Button key="cancel" onClick={this._handleCancel}>
            Cancel
          </Button>,
          <Button key="delete" type="danger" onClick={this._handleDelete}>
            Delete
          </Button>,
          <Button key="edit" type="primary" onClick={this._handleEdit}>
            Edit
          </Button>,
        ]}
      >
        {!_.isEmpty(generated) && _renderGenerated(generated[scheduleIdx])}
      </Modal>
    );
  };

  render() {
    const { user } = this.props;
    return (
      <div className="bodyContainer">
        <WindowSizeListener
          onResize={windowSize => {
            this.setState({
              height: windowSize.windowHeight,
              width: windowSize.windowWidth,
            });
          }}
        />
        <h1>My Schedules</h1>
        {this._renderSmallGrids()}
        {this._renderModal()}
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
