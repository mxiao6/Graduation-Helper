import React from 'react';
import _ from 'lodash';
import randomColor from 'randomcolor';
import '../../styles/Schedules.css';
import { daysMap, _parseTime } from 'utils';
import BigCalendar from 'modules/react-big-calendar';

export const _parseSchedule = schedule => {
  return {
    score: schedule.score || 0,
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
};

export const _renderGenerated = schedule => {
  return (
    <BigCalendar
      min={new Date(2018, 3, 1, 8, 0, 0)}
      max={new Date(2018, 3, 1, 21, 0, 0)}
      toolbar={false}
      events={schedule.sections}
      step={30}
      timeslots={2}
      defaultView="week"
      defaultDate={new Date(2018, 3, 1)}
    />
  );
};

export const _generateEmptyArray = () => {
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

export const _parseSmallArray = data => {
  let parsed = [];
  for (let schedule of data.schedules) {
    let oneImg = _generateEmptyArray();
    for (let section of schedule.sections) {
      if (!section.daysOfWeek) continue;
      let color = randomColor();
      for (let day of section.daysOfWeek) {
        let colIdx = daysMap[day] - 1; // 0 - 4
        let startTime = _parseTime(section.startTime);
        let endTime = _parseTime(section.endTime);
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

export const _renderSmallSchedules = (smallArray, _onClickGrid) => {
  return (
    <div className="gridsContainer">
      {_.map(smallArray, (smallGrid, gIdx) => {
        return (
          <a onClick={() => _onClickGrid(gIdx)} key={gIdx}>
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
