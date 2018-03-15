import React from "react";
import axios from "axios";
import _ from "lodash";
import {
  GET_YEAR,
  GET_SEMESTER,
  GET_SUBJECT,
  GET_COURSE,
  GET_SECTION
} from "api";

import { Cascader, Spin, message } from "antd";
import "styles/ClassSelection.css";

class ClassSelection extends React.Component {
  state = {
    yearList: undefined
  };

  componentWillMount() {
    axios
      .get(GET_YEAR)
      .then(res => {
        this.setState({
          yearList: _.map(res.data, year => {
            return {
              value: year,
              label: year,
              isLeaf: false
            };
          })
        });
      })
      .catch(e => {
        message.error(e.response.data);
        console.log(e.response);
      });
  }

  onChange = (value, selectedOptions) => {
    console.log(value, selectedOptions);
  };
  loadData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    // load options lazily
    setTimeout(() => {
      targetOption.loading = false;
      targetOption.children = [
        {
          label: `${targetOption.label} Dynamic 1`,
          value: "dynamic1"
        },
        {
          label: `${targetOption.label} Dynamic 2`,
          value: "dynamic2"
        }
      ];
      this.setState({
        yearList: [...this.state.yearList]
      });
    }, 1000);
  };
  render() {
    return (
      <div className="bodyContainer">
        {this.state.yearList ? (
          <Cascader
            options={this.state.yearList}
            loadData={this.loadData}
            onChange={this.onChange}
            changeOnSelect
          />
        ) : (
          <Spin />
        )}
      </div>
    );
  }
}

export default ClassSelection;
