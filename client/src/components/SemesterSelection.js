import React from "react";
import axios from "axios";
import _ from "lodash";
import { Link } from "react-router-dom";
import { GET_YEAR, GET_SEMESTER } from "api";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as classActions from "containers/Classes";

import { Cascader, Spin, Button, message } from "antd";
import "styles/ClassSelection.css";

class SemesterSelection extends React.Component {
  state = {
    options: undefined,
    selected: false
  };

  componentWillMount() {
    if (this.props.selected) {
      this.props.history.push("/ClassSelection");
    } else {
      axios
        .get(GET_YEAR)
        .then(res => {
          this.setState({
            options: _.map(res.data, year => ({
              value: year,
              label: year,
              isLeaf: false
            }))
          });
        })
        .catch(e => {
          message.error(e.response.data);
          console.error(e.response);
        });
    }
  }

  onChange = (value, selectedOptions) => {
    console.log(value, selectedOptions);
    if (value.length === 0) {
      console.log("clear selection");
      this.setState({
        selected: false
      });
      return;
    }
    const targetOption = selectedOptions[selectedOptions.length - 1];
    if (targetOption.isLeaf) {
      this.props.actions.setSemester({
        year: value[0],
        semester: value[1]
      });
      this.setState({
        selected: true
      });
    }
  };

  loadData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    axios
      .get(GET_SEMESTER, {
        params: {
          year: targetOption.value
        }
      })
      .then(res => {
        console.log(res.data);
        targetOption.loading = false;
        targetOption.children = _.map(res.data, item => ({
          label: `${item} ${targetOption.label}`,
          value: item,
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

  _renderCascader = () => {
    return (
      <div className="cascaderContainer">
        <Cascader
          options={this.state.options}
          loadData={this.loadData}
          onChange={this.onChange}
          placeholder="Select Semester"
          changeOnSelect
        />
        <Button
          type="primary"
          className="nextButton"
          disabled={!this.state.selected}
        >
          <Link to={"/ClassSelection"}>Next</Link>
        </Button>
      </div>
    );
  };

  render() {
    return (
      <div className="bodyContainer">
        {this.state.options ? this._renderCascader() : <Spin />}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    selected: state.classes.semester !== undefined
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(classActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SemesterSelection);
