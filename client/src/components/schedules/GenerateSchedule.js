import React from 'react';
import axios from 'axios';
import _ from 'lodash';
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
import BigCalendar from 'modules/react-big-calendar';
import '../../styles/Schedules.css';
import { daysMapRev } from 'utils';

import {
  _parseSmallArray,
  _renderSmallSchedules,
  _renderGenerated,
  _parseSchedule,
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
    noTimeList: [],
    timeModalVisible: false,
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
        console.error(e);
      });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.user) this.props.history.push('/');
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
      message.error('Course already exists.');
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
    const { schedule, noDaysList, noOptionsList, noTimeList } = this.state;
    this.setState({
      generating: true,
    });
    axios
      .post(POST_GENERATE_SCHEDULE, {
        ...semester,
        courses: schedule,
        preferences: {
          noClassDays: noDaysList,
          noClassOptions: noOptionsList,
          noClassTime: noTimeList,
        },
        range: {
          offset: 0,
          limit: 16,
        },
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
        console.error('_generateSchedule', e.response);
      });
  };

  _parseSchedules = data => {
    let parsed = _.map(data.schedules, schedule => _parseSchedule(schedule));
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

  _renderModal = () => {
    const { modalVisible, saving, width, scheduleIdx, generated } = this.state;

    return (
      <Modal
        visible={modalVisible}
        title="Generated Schedule"
        onCancel={() => this.setState({ modalVisible: false })}
        wrapClassName="scheduleModal"
        width={width * 0.7}
        footer={[
          <Button
            key="cancel"
            onClick={() => this.setState({ modalVisible: false })}
          >
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
        {generated.length !== 0 && _renderGenerated(generated[scheduleIdx])}
      </Modal>
    );
  };

  _renderTags = () => {
    const { schedule, noDaysList, noOptionsList, noTimeList } = this.state;
    return (
      <div>
        <Row className="tagsContainerGen">
          <Col span={8} className="tagsTitle">
            Selected Courses:
          </Col>
          <Col span={16}>
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
          </Col>
        </Row>
        <Row className="tagsContainerGen">
          <Col span={8} className="tagsTitle">
            No Class Days:
          </Col>
          <Col span={16}>
            {noDaysList.map((tag, index) => {
              return (
                <Tag
                  color="red"
                  closable
                  key={tag}
                  afterClose={() => this._closeDaysTag(tag)}
                >
                  {tag}
                </Tag>
              );
            })}
          </Col>
        </Row>
        <Row className="tagsContainerGen">
          <Col span={8} className="tagsTitle">
            No Class Options:
          </Col>
          <Col span={16}>
            {noOptionsList.map((tag, index) => {
              return (
                <Tag
                  color="orange"
                  closable
                  key={tag}
                  afterClose={() => this._closeOptionsTag(tag)}
                >
                  {tag}
                </Tag>
              );
            })}
          </Col>
        </Row>
        <Row className="tagsContainerGen">
          <Col span={8} className="tagsTitle">
            No Class Time:
          </Col>
          <Col span={16}>
            {noTimeList.map((tag, index) => {
              return (
                <Tag
                  color="green"
                  closable
                  key={tag.day + tag.start + tag.end}
                  afterClose={() => this._closeTimeTag(tag)}
                >
                  {`${tag.day} ${tag.start} - ${tag.end}`}
                </Tag>
              );
            })}
          </Col>
        </Row>
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
      message.error('Day already exists.');
      return;
    }
    let newDaysList = noDaysList.slice(0);
    newDaysList.push(selectedDay);

    this.setState({
      noDaysList: newDaysList,
    });
  };

  _closeDaysTag = removedTag => {
    let noDaysList = this.state.noDaysList.filter(tag => tag !== removedTag);
    console.log('noDaysList', noDaysList);
    this.setState({ noDaysList });
  };

  _onChangeOptions = value => {
    console.log('no class options', value);
    this.setState({
      selectedOption: value,
    });
  };

  _addOptions = () => {
    const { selectedOption, noOptionsList } = this.state;
    if (noOptionsList.indexOf(selectedOption) !== -1) {
      message.error('Option already exists.');
      return;
    }
    let newOptionsList = noOptionsList.slice(0);
    newOptionsList.push(selectedOption);

    this.setState({
      noOptionsList: newOptionsList,
    });
  };

  _closeOptionsTag = removedTag => {
    let noOptionsList = this.state.noOptionsList.filter(
      tag => tag !== removedTag
    );
    console.log('noOptionsList', noOptionsList);
    this.setState({ noOptionsList });
  };

  _closeTimeTag = removedTag => {
    let noTimeList = this.state.noTimeList.filter(
      tag => tag.start !== removedTag.start || tag.end !== removedTag.end
    );
    console.log('removed noTimeList', noTimeList);
    this.setState({ noTimeList });
  };

  _showSelectTimeModal = () => {
    this.setState({
      timeModalVisible: true,
    });
  };

  _renderPreference = () => {
    return (
      <div>
        <div className="cascaderContainer">
          <Cascader
            options={daysList}
            onChange={this._onChangeDays}
            placeholder="No Class Days"
            changeOnSelect
          />
          <Button
            type="primary"
            className="nextButton"
            onClick={this._addDays}
            disabled={_.isEmpty(this.state.selectedDay)}
          >
            Add
          </Button>
        </div>
        <div className="cascaderContainer">
          <Cascader
            options={optionsList}
            onChange={this._onChangeOptions}
            placeholder="No Class Options"
            changeOnSelect
          />
          <Button
            type="primary"
            className="nextButton"
            onClick={this._addOptions}
            disabled={_.isEmpty(this.state.selectedOption)}
          >
            Add
          </Button>
        </div>
        <div className="cascaderContainer">
          <Button
            type="primary"
            className="nextButton"
            onClick={this._showSelectTimeModal}
          >
            Select No Class Time
          </Button>
        </div>
      </div>
    );
  };

  _renderGenerateButton = () => {
    return (
      <div className="cascaderContainer">
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

  _handleSelectTime = slotInfo => {
    let diff = slotInfo.start - new Date(2018, 3, 1);
    let diffDay = Math.floor(diff / 1000 / 60 / 60 / 24);
    let newTime = {
      day: daysMapRev[diffDay],
      start: slotInfo.start.getHours(),
      end: slotInfo.end.getHours(),
    };
    if (newTime.start === newTime.end || !newTime.day) return;
    let newNoTimeList = this.state.noTimeList.slice();
    newNoTimeList.push(newTime);
    newNoTimeList = _.uniqWith(newNoTimeList, _.isEqual);
    this.setState({
      noTimeList: newNoTimeList,
      timeModalVisible: false,
    });
    console.log('newNoTimeList', newNoTimeList);
  };

  _renderTimeModal = () => {
    const { timeModalVisible, width } = this.state;
    return (
      <Modal
        visible={timeModalVisible}
        title="Drag to Select No Class Time"
        onCancel={() => this.setState({ timeModalVisible: false })}
        wrapClassName="scheduleModal"
        width={width * 0.7}
        footer={[
          <Button
            key="cancel"
            onClick={() => this.setState({ timeModalVisible: false })}
          >
            Cancel
          </Button>,
        ]}
      >
        <BigCalendar
          min={new Date(2018, 3, 1, 8, 0, 0)}
          max={new Date(2018, 3, 1, 21, 0, 0)}
          toolbar={false}
          selectable
          events={[]}
          step={30}
          timeslots={2}
          defaultView="week"
          defaultDate={new Date(2018, 3, 1)}
          onSelectSlot={slotInfo => this._handleSelectTime(slotInfo)}
        />
      </Modal>
    );
  };

  _renderContent = () => {
    const { semester } = this.props;
    const { width } = this.state;
    return (
      <div className="contentContainer">
        <div style={{ marginBottom: 30 }}>
          Selected Semester: {semester.semester} {semester.year}
          &nbsp; &nbsp;
          <a onClick={this._resetSemester}>reset</a>
        </div>
        <Row style={{ width: width * 0.6 }}>
          <Col span={12}>
            {this._renderCascader()}
            {this._renderPreference()}
          </Col>
          <Col span={12}>
            {this._renderTags()}
            {this._renderGenerateButton()}
          </Col>
        </Row>
        {this._renderSmallGrids()}
        {this._renderModal()}
        {this._renderTimeModal()}
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
const daysList = [
  {
    value: 'M',
    label: 'Monday',
  },
  {
    value: 'T',
    label: 'Tuesday',
  },
  {
    value: 'W',
    label: 'Wednesday',
  },
  {
    value: 'R',
    label: 'Thursday',
  },
  {
    value: 'F',
    label: 'Friday',
  },
];
const optionsList = [
  {
    value: 'morning',
    label: 'Morning',
  },
  {
    value: 'lunch',
    label: 'Lunch',
  },
  {
    value: 'evening',
    label: 'Evening',
  },
];

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
