import React from 'react';
import _ from 'lodash';
import randomColor from 'randomcolor';
import 'styles/ClassSelection.css';
import { daysMap, _parseTime } from 'utils';

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
