import React, { Component } from 'react';
import WindowSizeListener from 'react-window-size-listener';
import '../styles/Login.css';

import { Card } from 'antd';

import LoginForm from './LoginForm';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = { height: 0 };
  }
  render() {
    return (
      <div>
        <WindowSizeListener onResize={windowSize => {
          this.setState({ height: windowSize.windowHeight });
        }} />
        <div className="bodyContainer">
          <div className="formContainer" /*style={{ marginTop: this.state.height/10 }}*/>
            <Card title="Login" bordered={true} className="cardStyle">
              <LoginForm history={this.props.history} />
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;