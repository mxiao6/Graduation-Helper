import React from "react";
import axios from "axios";
import _ from "lodash";
import { Link } from "react-router-dom";
import { GET_SUBJECT, GET_COURSE, GET_SECTION } from "api";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as classActions from "containers/Classes";

import { Cascader, Spin, Button, message } from "antd";
import "styles/ClassSelection.css";

class ClassSelection extends React.Component {
  state = {
    options: undefined,
    selected: undefined,
    sectionList: undefined
  };

  componentWillReceiveProps(nextProps) {}

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

  _renderCascader = () => {
    return (
      <div className="cascaderContainer">
        <Cascader
          options={this.state.options}
          loadData={this.loadData}
          onChange={this.onChange}
          displayRender={this._displayRender}
          changeOnSelect
        />
        <Button
          type="primary"
          className="nextButton"
          onClick={this._showSections}
          disabled={this.state.selected === undefined}
        >
          Choose
        </Button>
      </div>
    );
  };

  _renderSections = () => {
    return (
      <div className="sectionsContainer">
        <div>{JSON.stringify(this.state.selected)}</div>
      </div>
    );
  };

  _renderContent = () => {
    return (
      <div className="contentContainer">
        {this._renderCascader()}
        {this.state.selected && this._renderSections()}
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
