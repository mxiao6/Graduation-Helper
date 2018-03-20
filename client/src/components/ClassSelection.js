import React from "react";
import axios from "axios";
import _ from "lodash";
import { Link } from "react-router-dom";
import { GET_SUBJECT, GET_COURSE, GET_SECTION, GET_SECTION_DETAILS } from "api";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as classActions from "containers/Classes";

import { Cascader, Spin, Button, Table, Tag, message } from "antd";
import "styles/ClassSelection.css";

const sectionColumns = [
  {
    title: "Status",
    dataIndex: "enrollmentStatus"
  },
  {
    title: "CRN",
    dataIndex: "sectionId"
  },
  {
    title: "Type",
    dataIndex: "type"
  },
  {
    title: "Section",
    dataIndex: "sectionNumber"
  },
  {
    title: "Start Time",
    dataIndex: "startTime"
  },
  {
    title: "End Time",
    dataIndex: "endTime"
  },
  {
    title: "Day",
    dataIndex: "daysOfWeek"
  }
];

class ClassSelection extends React.Component {
  state = {
    options: undefined,
    selected: undefined,
    sectionList: undefined,
    selectedRowKeys: [],
    tableLoading: false
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

  _showSections = () => {
    const { selected } = this.state;
    const { semester } = this.props;

    this.setState({
      tableLoading: true
    });

    axios
      .get(GET_SECTION, {
        params: {
          ...semester,
          ...selected
        }
      })
      .then(res => {
        console.log("simple sections", res.data);
        this._retrieceSectionDetails(res.data);
      })
      .catch(e => {
        console.error(e.response);
      });
  };

  _retrieceSectionDetails(sections) {
    const { selected } = this.state;
    const { semester } = this.props;

    let promises = _.map(sections, section => {
      return axios.get(GET_SECTION_DETAILS, {
        params: {
          ...selected,
          ...semester,
          sectionId: section.id
        }
      });
    });

    axios
      .all(promises)
      .then(
        axios.spread((...results) => {
          console.log("detailed sections", results);
          this.setState({
            sectionList: _.map(results, res => ({
              ...res.data,
              key: res.data.sectionId
            }))
          });
        })
      )
      .then(res => {
        this.setState({
          tableLoading: false
        });
      })
      .catch(es => {
        console.error(es);
      });
  }

  _resetSemester = () => {
    this.props.actions.resetSemester();
    this.props.history.push({
      pathname: "/SemesterSelection",
      state: { next: "/ClassSelection" }
    });
  };

  _closeTag = removedTag => {
    const selectedRowKeys = this.state.selectedRowKeys.filter(
      tag => tag !== removedTag
    );
    console.log(selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  _renderCRNs = () => {
    const { selectedRowKeys } = this.state;
    return (
      selectedRowKeys.length !== 0 && (
        <div className="tagsContainer">
          {selectedRowKeys.map((tag, index) => {
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
          onClick={this._showSections}
          disabled={this.state.selected === undefined}
        >
          Choose
        </Button>
      </div>
    );
  };

  _onSelectChange = selectedRowKeys => {
    console.log("selectedRowKeys changed: ", selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  _renderSections = () => {
    const { sectionList, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this._onSelectChange
    };
    return (
      <div className="sectionsContainer">
        <Table
          rowSelection={rowSelection}
          columns={sectionColumns}
          dataSource={sectionList}
        />
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
        {this._renderCRNs()}
        {this.state.tableLoading ? (
          <Spin />
        ) : (
          this.state.sectionList && this._renderSections()
        )}
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
