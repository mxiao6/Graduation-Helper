import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import randomColor from 'randomcolor';
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

import { Cascader, Spin, Button, Tag, message, Modal } from 'antd';
import 'styles/ClassSelection.css';

import BigCalendar from 'modules/react-big-calendar';

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

  onChange = (value, selectedOptions) => {
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
          smallArray: this._parseSmallArray(res.data),
          generating: false,
        });
      })
      .catch(e => {
        console.error('_generateSchedule', e);
      });
  };

  _parseTime = time => {
    let hour = parseInt(time.substr(0, 2), 10);
    let mins = parseInt(time.substr(3, 2), 10);

    if (time.slice(-2) === 'PM' && hour !== 12) hour += 12;

    return { hour, mins };
  };

  _generateEmptyArray = () => {
    let array = [];
    for (let i = 0; i < 26; i++) {
      let row = [];
      for (let j = 0; j < 5; j++) {
        row.push(false);
      }
      array.push(row);
    }
    return array;
  };

  _parseSmallArray = data => {
    let parsed = [];
    for (let schedule of data.schedules) {
      let oneImg = this._generateEmptyArray();
      for (let section of schedule.sections) {
        if (!section.daysOfWeek) continue;
        let color = randomColor();
        for (let day of section.daysOfWeek) {
          let colIdx = daysMap[day] - 1; // 0 - 4
          let startTime = this._parseTime(section.startTime);
          let endTime = this._parseTime(section.endTime);
          let rowStart = (startTime.hour - 8) * 2;
          let rowEnd = (endTime.hour + 1 - 8) * 2;
          for (let r = rowStart; r < rowEnd; r++) {
            oneImg[r][colIdx] = color;
          }
        }
      }
      parsed.push({
        schedule,
        array: oneImg,
      });
    }
    return parsed;
  };

  _parseSchedules = data => {
    let parsed = _.map(data.schedules, schedule => {
      return {
        score: schedule.score,
        sections: _.flatMap(schedule.sections, section => {
          let retval = [];
          if (!section.daysOfWeek) return retval;
          for (let day of section.daysOfWeek) {
            let date = 1 + daysMap[day];
            let startTime = this._parseTime(section.startTime);
            let endTime = this._parseTime(section.endTime);
            retval.push({
              title: section.subjectId + section.courseId,
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
          onChange={this.onChange}
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
      <div className="gridsContainer">
        {_.map(smallArray, (smallGrid, gIdx) => {
          return (
            <a onClick={() => this._showBigSchedule(gIdx)} key={gIdx}>
              <div className="smallGrid" key={gIdx}>
                {_.map(smallGrid.array, (row, rIdx) => {
                  return (
                    <div className="smallRow" key={rIdx}>
                      {_.map(row, (col, cIdx) => {
                        return col ? (
                          <div
                            className="smallColActive"
                            style={{ backgroundColor: col }}
                            key={cIdx}
                          />
                        ) : (
                          <div className="smallCol" key={cIdx} />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </a>
          );
        })}
      </div>
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

    axios
      .post(POST_SAVE_SCHEDULE, {
        ...semester,
        userId: user.userId,
        subjects: _.chain(sections)
          .map(s => s.subjectId)
          .uniq()
          .value(),
        courseNumbers: _.chain(sections)
          .map(s => s.courseId)
          .uniq()
          .value(),
        crns: _.chain(sections)
          .map(s => s.sectionId)
          .uniq()
          .value(),
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

  _renderSchedule = () => {
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

  _renderContent = () => {
    const { semester } = this.props;
    return (
      <div className="contentContainer">
        <WindowSizeListener
          onResize={windowSize => {
            this.setState({
              height: windowSize.windowHeight,
              width: windowSize.windowWidth,
            });
          }}
        />
        <div>
          Selected Semester: {semester.semester} {semester.year}
          &nbsp; &nbsp;
          <a onClick={this._resetSemester}>reset</a>
        </div>
        {this._renderCascader()}
        {this._renderSchedule()}
        {this._renderSmallGrids()}
        {this._renderModal()}
      </div>
    );
  };

  render() {
    return (
      <div className="bodyContainer">
        {this.state.options ? this._renderContent() : <Spin />}
      </div>
    );
  }
}

const daysMap = {
  M: 1,
  T: 2,
  W: 3,
  R: 4,
  F: 5,
};

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
