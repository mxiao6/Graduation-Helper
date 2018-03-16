import React from "react";
import axios from "axios";
import _ from "lodash";
import { Link } from "react-router-dom";
import { GET_SUBJECT, GET_COURSE, } from "api";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as classActions from "containers/Classes";

import { Cascader, Spin, Button, message } from "antd";
import "styles/ClassSelection.css";

class ClassSelection extends React.Component {
  state = {
    options: undefined,
    selected: undefined,
    schedule: []
  };

  componentWillMount() {
    console.log(this.props.semester);
    axios
      .get(GET_SUBJECT, {
        params: this.props.semester
      })
      .then(res => {
        console.log(res.data);
        this.setState({
          options: _.map(res.data, item => ({
            value: item.id,
            label: item.subject,
            isLeaf: false
          }))
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
      console.log("clear selection");
      this.setState({
        selected: undefined
      });
      return;
    }
    const targetOption = selectedOptions[selectedOptions.length - 1];
    if (targetOption.isLeaf) {
      this.setState({
        selected: {
          course: value[0],
          courseId: value[1]
        }
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
          course: targetOption.value
        }
      })
      .then(res => {
        console.log(res.data);
        targetOption.loading = false;
        targetOption.children = _.map(res.data, item => ({
          label: `${item.id}: ${item.course}`,
          value: item.id,
          isLeaf: true
        }));
        this.setState({
          options: [...this.state.options]
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
    let newSchedule = schedule.slice(0);
    newSchedule.push(selected);

    this.setState({
      schedule: newSchedule
    });
  };

  _resetSemester = () => {
    this.props.actions.resetSemester();
    this.props.history.push({
      pathname: "/SemesterSelection",
      state: { next: "/GenerateSchedule" }
    });
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

  _renderSchedule = () => {
    const { schedule } = this.state;
    return (
      <div className="sectionsContainer">
        <div>{JSON.stringify(schedule)}</div>
      </div>
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
        {schedule.length !== 0 && this._renderSchedule()}
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

const _default = { year: "2018", semester: "spring" };

function mapStateToProps(state, ownProps) {
  return {
    semester: state.classes.semester ? state.classes.semester : _default
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(classActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassSelection);
