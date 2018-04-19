import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import WindowSizeListener from 'react-window-size-listener';
import {
  GET_SUBJECT,
  GET_COURSE,
  POST_GENERATE_SCHEDULE,
  POST_SAVE_SCHEDULE,
} from 'api';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as classActions from 'containers/Classes';

import { Cascader, Spin, Button, Tag, message, Modal, Row, Col } from 'antd';
import 'styles/ClassSelection.css';
import { daysMap, _parseTime } from 'utils';

import BigCalendar from 'modules/react-big-calendar';
import {
  _parseSmallArray,
  _renderSmallSchedules,
} from 'components/schedules/SmallSchedules';

class GenerateSchedule extends React.Component {
  state = {
    options: undefined,
    selected: undefined,
    schedule: [],
    generated: [],
    generatedRaw: [],
    generating: false,
    smallArray: undefined,
    scheduleIdx: 0,
    modalVisible: false,
    saving: false,
    selectedDay: undefined,
    noDaysList: [],
    selectedOption: undefined,
    noOptionsList: [],
  };

  componentWillMount() {
    const { semester, user, history } = this.props;
    console.log('semester', this.props.semester);
    console.log('user', this.props.user);

    if (!user) history.push('/');

    axios
      .get(GET_SUBJECT, {
        params: semester,
      })
      .then(res => {
        console.log(res.data);
        this.setState({
          options: _.map(res.data, item => ({
            value: item.id,
            label: item.subject,
            isLeaf: false,
          })),
        });
      })
      .catch(e => {
        // message.error(e.response.data);
        console.error(e);
      });
  }

  _onChangeTags = (value, selectedOptions) => {
    console.log(value, selectedOptions);
    if (value.length === 0) {
      console.log('clear selection');
      this.setState({
        selected: undefined,
      });
      return;
    }
    const targetOption = selectedOptions[selectedOptions.length - 1];
    if (targetOption.isLeaf) {
      this.setState({
        selected: {
          course: value[0],
          courseId: value[1],
        },
      });
    }
  };

  loadData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    axios
      .get(GET_COURSE, {
        params: {
          ...this.props.semester,
          course: targetOption.value,
        },
      })
      .then(res => {
        console.log(res.data);
        targetOption.loading = false;
        targetOption.children = _.map(res.data, item => ({
          label: `${item.id}: ${item.course}`,
          value: item.id,
          isLeaf: true,
        }));
        this.setState({
          options: [...this.state.options],
        });
      })
      .catch(e => {
        targetOption.loading = false;
        console.error(e.response);
      });
  };

  _displayRender = (labels, selectedOptions) =>
    _.map(selectedOptions, (option, i) => {
      if (i === selectedOptions.length - 1) {
        return <span key={option.value}>{option.value}</span>;
      }
      return <span key={option.value}>{option.value} </span>;
    });

  _addCourse = () => {
    const { selected, schedule } = this.state;
    let tag = selected.course + selected.courseId;
    if (schedule.indexOf(tag) !== -1) {
      message.error('Course exists');
      return;
    }
    let newSchedule = schedule.slice(0);
    newSchedule.push(tag);

    this.setState({
      schedule: newSchedule,
    });
  };

  _generateSchedule = () => {
    const { semester } = this.props;
    const { schedule } = this.state;
    this.setState({
      generating: true,
    });
    axios
      .post(POST_GENERATE_SCHEDULE, {
        ...semester,
        courses: schedule,
      })
      .then(res => {
        console.log('raw data', res.data);
        this.setState({
          generatedRaw: res.data,
          generated: this._parseSchedules(res.data),
          smallArray: _parseSmallArray(res.data),
          generating: false,
        });
      })
      .catch(e => {
        console.error('_generateSchedule', e);
      });
  };

  _parseSchedules = data => {
    let parsed = _.map(data.schedules, schedule => {
      return {
        score: schedule.score,
        sections: _.flatMap(schedule.sections, section => {
          let retval = [];
          if (!section.daysOfWeek || !section.endTime) return retval;
          for (let day of section.daysOfWeek) {
            let date = 1 + daysMap[day];
            let startTime = _parseTime(section.startTime);
            let endTime = _parseTime(section.endTime);
            retval.push({
              title: `${section.subjectId} ${section.courseId}-${
                section.sectionNumber
              }\n${section.sectionId}`,
              start: new Date(2018, 3, date, startTime.hour, startTime.mins, 0),
              end: new Date(2018, 3, date, endTime.hour, endTime.mins, 0),
            });
          }
          return retval;
        }),
      };
    });
    console.log('parsed', parsed);
    return parsed;
  };

  _resetSemester = () => {
    this.props.actions.resetSemester();
    this.props.history.push({
      pathname: '/SemesterSelection',
      state: { next: '/GenerateSchedule' },
    });
  };

  _closeTag = removedTag => {
    const schedule = this.state.schedule.filter(tag => tag !== removedTag);
    console.log(schedule);
    this.setState({ schedule });
  };

  _filter = (inputValue, path) => {
    return path.some(
      option =>
        option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );
  };

  _renderCascader = () => {
    return (
      <div className="cascaderContainer">
        <Cascader
          options={this.state.options}
          loadData={this.loadData}
          onChange={this._onChangeTags}
          displayRender={this._displayRender}
          placeholder="Select Class"
          changeOnSelect
          showSearch={{ filter: this._filter }}
        />
        <Button
          type="primary"
          className="nextButton"
          onClick={this._addCourse}
          disabled={this.state.selected === undefined}
        >
          Add
        </Button>
        <Button
          type="primary"
          className="nextButton"
          onClick={this._generateSchedule}
          disabled={this.state.schedule.length === 0}
        >
          Generate
        </Button>
      </div>
    );
  };

  _renderSmallGrids = () => {
    const { generating, smallArray } = this.state;
    return generating ? (
      <Spin />
    ) : (
      _renderSmallSchedules(smallArray, this._showBigSchedule)
    );
  };

  _showBigSchedule = scheduleIdx => {
    this.setState({
      scheduleIdx,
      modalVisible: true,
    });
  };

  _handleSave = () => {
    const { user, semester } = this.props;
    const { scheduleIdx, generatedRaw: { schedules } } = this.state;
    this.setState({ saving: true });

    console.log('saving schedule', schedules[scheduleIdx]);

    let sections = schedules[scheduleIdx].sections;
    console.log(sections);

    axios
      .post(POST_SAVE_SCHEDULE, {
        ...semester,
        userId: user.userId,
        sections,
      })
      .then(res => {
        console.log(res.data);
        this.setState({
          saving: false,
          modalVisible: false,
        });
        message.success(res.data);
      })
      .catch(e => {
        console.error(e.response);
        this.setState({
          saving: false,
        });
      });
  };

  _handleCancel = () => {
    this.setState({ modalVisible: false });
  };

  _renderModal = () => {
    const { modalVisible, saving, height, width } = this.state;
    return (
      <Modal
        visible={modalVisible}
        title="Generated Schedule"
        onOk={this._handleSave}
        onCancel={this._handleCancel}
        wrapClassName="scheduleModal"
        width={width * 0.7}
        footer={[
          <Button key="cancel" onClick={this._handleCancel}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={saving}
            onClick={this._handleSave}
          >
            Save
          </Button>,
        ]}
      >
        {this._renderGenerated()}
      </Modal>
    );
  };

  _renderGenerated = () => {
    const { scheduleIdx, generated } = this.state;
    return (
      generated.length !== 0 && (
        <BigCalendar
          min={new Date(2018, 3, 1, 8, 0, 0)}
          max={new Date(2018, 3, 1, 21, 0, 0)}
          toolbar={false}
          selectable
          events={generated[scheduleIdx].sections}
          step={30}
          timeslots={2}
          defaultView="week"
          defaultDate={new Date(2018, 3, 1)}
          onSelectEvent={event => alert(event.title)}
          onSelectSlot={slotInfo =>
            alert(
              `selected slot: \n\nstart ${slotInfo.start.toLocaleString()} ` +
                `\nend: ${slotInfo.end.toLocaleString()}` +
                `\naction: ${slotInfo.action}`
            )
          }
        />
      )
    );
  };

  _renderTags = () => {
    const { schedule } = this.state;
    return (
      <div className="tagsContainer">
        {schedule.map((tag, index) => {
          return (
            <Tag
              color="blue"
              closable
              key={tag}
              afterClose={() => this._closeTag(tag)}
            >
              {tag}
            </Tag>
          );
        })}
      </div>
    );
  };

  _onChangeDays = value => {
    console.log('no class days', value);
    this.setState({
      selectedDay: value,
    });
  };

  _addDays = () => {
    const { selectedDay, noDaysList } = this.state;
    if (noDaysList.indexOf(selectedDay) !== -1) {
      message.error('Day exists');
      return;
    }
    let newDaysList = noDaysList.slice(0);
    newDaysList.push(selectedDay);

    this.setState({
      noDaysList: newDaysList,
    });
  };

  _onChangeOptions = () => {};

  _addOptions = () => {};

  _showSelectTimeModel = () => {};

  daysList = [
    {
      value: 'M',
      label: 'Monday',
    },
    {
      value: 'T',
      label: 'Tuesday',
    },
  ];

  _renderPreference = () => {
    const { width } = this.state;
    return (
      <div className="prefContainer">
        <Row style={{ width: width * 0.8 }} className="prefRow">
          <Col span={8}>
            <div className="prefCascaderContainer">
              <Cascader
                className="prefCascader"
                options={this.daysList}
                onChange={this._onChangeDays}
                placeholder="No Class Days"
                changeOnSelect
              />
              <Button
                type="primary"
                className="nextButton"
                onClick={this._addDays}
                disabled={this.state.selectedDay === undefined}
              >
                Add
              </Button>
            </div>
          </Col>
          <Col span={8}>
            <div className="prefCascaderContainer">
              <Cascader
                options={this.state.options}
                onChange={this._onChangeOptions}
                placeholder="No Class Options"
                changeOnSelect
              />
              <Button
                type="primary"
                className="nextButton"
                onClick={this._addOptions}
                disabled={this.state.noOptionsList === undefined}
              >
                Add
              </Button>
            </div>
          </Col>
          <Col span={8}>
            <Button
              type="primary"
              className="nextButton"
              onClick={this._showSelectTimeModel}
            >
              Select No Class Time
            </Button>
          </Col>
        </Row>
      </div>
    );
  };

  _renderContent = () => {
    const { semester } = this.props;
    return (
      <div className="contentContainer">
        <div>
          Selected Semester: {semester.semester} {semester.year}
          &nbsp; &nbsp;
          <a onClick={this._resetSemester}>reset</a>
        </div>
        {this._renderCascader()}
        {this._renderTags()}
        {this._renderPreference()}
        {this._renderSmallGrids()}
        {this._renderModal()}
      </div>
    );
  };

  render() {
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
        {this.state.options ? this._renderContent() : <Spin />}
      </div>
    );
  }
}

const _default = { year: '2018', semester: 'fall' };

function mapStateToProps(state, ownProps) {
  return {
    semester: state.classes.semester ? state.classes.semester : _default,
    user: state.auth.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(classActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GenerateSchedule);
