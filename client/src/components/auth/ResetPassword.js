import React, { Component } from 'react';
import WindowSizeListener from 'react-window-size-listener';
import 'styles/Login.css';

import { Card } from 'antd';

import ResetPWForm from './ResetPWForm';

class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = { height: 0 };
  }
  render() {
    return (
      <div>
        <WindowSizeListener
          onResize={windowSize => {
            this.setState({ height: windowSize.windowHeight });
          }}
        />
        <div className="bodyContainer">
          <div
            className="formContainer"
          >
            <Card title="Reset Password" bordered={true} className="cardStyle">
              <ResetPWForm history={this.props.history} />
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default ResetPassword;
