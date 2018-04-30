import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {
  GET_SUBJECT,
  GET_COURSE,
  GET_SECTION,
  GET_SECTION_DETAILS,
  POST_EDIT_SCHEDULE,
} from 'api';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as classActions from 'containers/Classes';
import WindowSizeListener from 'react-window-size-listener';

import { Cascader, Spin, Button, Table, Tag, message } from 'antd';
import '../../styles/Schedules.css';
import {
  _renderGenerated,
  _parseSchedule,
} from 'components/schedules/SmallSchedules';

class EditSchedule extends React.Component {
  state = {
    options: undefined,
    selected: undefined,
    sectionList: undefined,
    selectedRowKeys: [],
    selectedRows: [],
    tableLoading: false,
    sections: [],
  };

  componentWillMount() {
    const { user, history, location } = this.props;
    if (!user) {
      history.push('/');
    } else if (!location.state) {
      history.goBack();
    } else {
      this._retrieveSubject();
      this._fillSelectedSections();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.user) this.props.history.push('/');
  }

  _saveEdit = () => {
    const { semester, location } = this.props;
    const { scheduleId } = location.state;
    const { selectedRows } = this.state;
    if (_.isEmpty(selectedRows)) {
      message.error('The schedule cannot be empty.');
    } else {
      axios
        .post(POST_EDIT_SCHEDULE, {
          scheduleId,
          sections: _.map(selectedRows, sec => ({
            ...sec,
            ...semester,
          })),
        })
        .then(res => {
          console.log('POST_EDIT_SCHEDULE', res.data);
          message.success('Schedule edited successfully.');
        })
        .catch(e => {
          console.error('POST_EDIT_SCHEDULE', e.response);
        });
    }
  };

  _fillSelectedSections = () => {
    const { scheduleRaw } = this.props.location.state;
    this.setState({
      selectedRowKeys: _.map(scheduleRaw, section => {
        const { subjectId, courseId, sectionNumber, sectionId } = section;
        return `${subjectId}${courseId} ${sectionNumber} ${sectionId}`;
      }),
      selectedRows: scheduleRaw,
      sections: _parseSchedule({ sections: scheduleRaw }).sections,
    });
  };

  _retrieveSubject = () => {
    const { semester } = this.props;
    axios
      .get(GET_SUBJECT, {
        params: semester,
      })
      .then(res => {
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
  };

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

  _showSections = () => {
    const { selected } = this.state;
    const { semester } = this.props;

    this.setState({
      tableLoading: true,
    });

    axios
      .get(GET_SECTION, {
        params: {
          ...semester,
          ...selected,
        },
      })
      .then(res => {
        console.log('simple sections', res.data);
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
          sectionId: section.id,
        },
      });
    });

    axios
      .all(promises)
      .then(
        axios.spread((...results) => {
          console.log('detailed sections', results);
          this.setState({
            sectionList: _.map(results, res => {
              const {
                subjectId,
                courseId,
                sectionNumber,
                sectionId,
              } = res.data;
              return {
                ...res.data,
                key: `${subjectId}${courseId} ${sectionNumber} ${sectionId}`,
              };
            }),
          });
        })
      )
      .then(res => {
        this.setState({
          tableLoading: false,
        });
      })
      .catch(es => {
        console.error(es);
      });
  }

  _resetSemester = () => {
    this.props.actions.resetSemester();
    this.props.history.push({
      pathname: '/SemesterSelection',
      state: { next: '/EditSchedule' },
    });
  };

  _closeTag = removedTag => {
    const selectedRowKeys = this.state.selectedRowKeys.filter(
      tag => tag !== removedTag
    );
    const selectedRows = this.state.selectedRows.filter(
      sec => sec.sectionId !== removedTag.slice(-5)
    );
    this.setState({
      selectedRowKeys,
      selectedRows,
      sections: _parseSchedule({ sections: selectedRows }).sections,
    });
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
                className="tagContent"
              >
                {tag}
              </Tag>
            );
          })}
        </div>
      )
    );
  };

  _filter = (inputValue, path) => {
    return path.some(
      option =>
        option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );
  };

  _renderCascader = () => {
    return (
      <div className="cascaderContainer" style={{ margin: 0 }}>
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
          onClick={this._showSections}
          disabled={this.state.selected === undefined}
        >
          Choose
        </Button>
        <Button type="primary" className="nextButton" onClick={this._saveEdit}>
          Save
        </Button>
      </div>
    );
  };

  _onSelectChange = (selectedRowKeys, selectedRows) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys, selectedRows);
    let newSelectedRows = this.state.selectedRows.slice();
    let sectionIds = _.map(selectedRowKeys, key => key.slice(-5));
    newSelectedRows.push(...selectedRows);
    newSelectedRows = _.chain(newSelectedRows)
      .uniqBy('sectionId')
      .filter(sec => sectionIds.indexOf(sec.sectionId) > -1)
      .value();
    this.setState({
      selectedRowKeys,
      selectedRows: newSelectedRows,
      sections: _parseSchedule({ sections: newSelectedRows }).sections,
    });
  };

  _renderSections = () => {
    const { sectionList, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this._onSelectChange,
    };
    return (
      <div>
        <Table
          rowSelection={rowSelection}
          columns={sectionColumns}
          dataSource={sectionList}
        />
      </div>
    );
  };

  _renderTable = () => {
    const { tableLoading, sectionList } = this.state;
    return (
      <div className="sectionsContainer">
        {tableLoading ? <Spin /> : sectionList && this._renderSections()}
      </div>
    );
  };

  _renderContent = () => {
    const { semester } = this.props;
    const { width, sections } = this.state;

    return (
      <div className="contentContainer">
        <div>
          Selected Semester: {semester.semester} {semester.year}
          &nbsp; &nbsp;
          <a onClick={this._resetSemester}>reset</a>
        </div>
        <div style={{ width: width * 0.65, marginTop: 20 }}>
          {_renderGenerated({ sections })}
        </div>
        <div className="editContainer">
          <div className="selectedSections">
            <div className="selectedTitle">Select sections:</div>
            <div className="tagsBox" style={{ width: width * 0.2 }}>
              {this._renderCRNs()}
            </div>
          </div>
          <div className="tableConainter" style={{ width: width * 0.45 }}>
            {this._renderCascader()}
            {this._renderTable()}
          </div>
        </div>
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

const sectionColumns = [
  {
    title: 'Status',
    dataIndex: 'enrollmentStatus',
  },
  {
    title: 'CRN',
    dataIndex: 'sectionId',
  },
  {
    title: 'Type',
    dataIndex: 'type',
  },
  {
    title: 'Section',
    dataIndex: 'sectionNumber',
  },
  {
    title: 'Start Time',
    dataIndex: 'startTime',
  },
  {
    title: 'End Time',
    dataIndex: 'endTime',
  },
  {
    title: 'Day',
    dataIndex: 'daysOfWeek',
  },
];

function mapStateToProps({ auth, classes }) {
  return {
    user: auth.user,
    semester: classes.semester ? classes.semester : _default,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(classActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditSchedule);
