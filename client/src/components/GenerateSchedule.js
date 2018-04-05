import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { GET_SUBJECT, GET_COURSE, POST_GENERATE_SCHEDULE } from 'api';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as classActions from 'containers/Classes';

import { Cascader, Spin, Button, Tag, message, Row, Col } from 'antd';
import 'styles/ClassSelection.css';

import BigCalendar from 'modules/react-big-calendar';

class ClassSelection extends React.Component {
  state = {
    options: undefined,
    selected: undefined,
    schedule: [],
    generated: [],
    generating: false,
    smallArray: undefined,
  };

  componentWillMount() {
    console.log(this.props.semester);
    axios
      .get(GET_SUBJECT, {
        params: this.props.semester,
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
        message.error(e.response.data);
        console.error(e.response);
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
    let hour = parseInt(time.substr(0, 2));
    let mins = parseInt(time.substr(3, 2));

    if (time.slice(-2) === 'PM' && hour !== 12) hour += 12;

    return { hour, mins };
  };

  _generateEmptyArray = () => {
    let array = [];
    for (let i = 0; i < 24; i++) {
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
        for (let day of section.daysOfWeek) {
          let colIdx = daysMap[day] - 1; // 0 - 4
          let startTime = this._parseTime(section.startTime);
          let endTime = this._parseTime(section.endTime);
          let rowStart = (startTime.hour - 8) * 2;
          let rowEnd = (endTime.hour + 1 - 8) * 2;
          for (let r = rowStart; r < rowEnd; r++) {
            oneImg[r][colIdx] = true;
          }
        }
      }
      parsed.push(oneImg);
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

  /**
   * fake data
   * @type {[Object]}
   */
  events = [
    {
      id: 1,
      title: 'Birthday Party',
      start: new Date(2018, 3, 1, 7, 0, 0),
      end: new Date(2018, 3, 1, 10, 30, 0),
    },
  ];

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
    const { smallArray } = this.state;
    return !smallArray ? (
      <Spin />
    ) : (
      <div style={{ width: 250, height: 240 }}>
        {_.map(smallArray[0], row => {
          return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {_.map(row, col => {
                return col ? (
                  <div
                    style={{
                      width: 50,
                      height: 10,
                      backgroundColor: 'skyblue',
                    }}
                  />
                ) : (
                  <div
                    style={{ width: 50, height: 10, backgroundColor: 'white' }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  _renderGenerated = () => {
    const { generating, generated } = this.state;
    return (
      <div className="sectionsContainer">
        {generating ? (
          <Spin />
        ) : (
          generated.length !== 0 && (
            <div style={{ width: 1200, height: 600 }}>
              <BigCalendar
                min={new Date(2018, 3, 1, 8, 0, 0)}
                max={new Date(2018, 3, 1, 21, 0, 0)}
                toolbar={false}
                selectable
                events={generated[0].sections}
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
            </div>
          )
        )}
      </div>
    );
  };

  // _renderGenerated = () => {
  //   const { generating, generated } = this.state;
  //   return (
  //     <div className="sectionsContainer">
  //       {generating ? (
  //         <Spin />
  //       ) : (
  //         generated.length !== 0 && <div>{JSON.stringify(generated)}</div>
  //       )}
  //     </div>
  //   );
  // };

  _renderSchedule = () => {
    const { schedule } = this.state;
    return (
      schedule.length !== 0 && (
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
      )
    );
  };

  _renderContent = () => {
    const { semester } = this.props;
    const { schedule } = this.state;
    return (
      <div className="contentContainer">
        <div>
          Selected Semester: {semester.semester} {semester.year}
          &nbsp; &nbsp;
          <a onClick={this._resetSemester}>reset</a>
        </div>
        {this._renderCascader()}
        {this._renderSchedule()}
        {this._renderSmallGrids()}
        {this._renderGenerated()}
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
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(classActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassSelection);
