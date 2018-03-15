import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as loginActions from "containers/Login";

import { Form, Icon, Input, Button, Checkbox } from "antd";

import "styles/Login.css";

const FormItem = Form.Item;

class NormalLoginForm extends React.Component {
  state = {};

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.loginError && !this.props.loginError) {
    }
    if (nextProps.loggedIn) {
      this.props.history.push("/");
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        this.props.actions.login({
          email: values.email,
          password: values.password
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="login-form">
        <FormItem>
          {getFieldDecorator("email", {
            rules: [{ required: true, message: "Please input your Email!" }]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Email"
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator("password", {
            rules: [{ required: true, message: "Please input your Password!" }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="Password"
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator("remember", {
            valuePropName: "checked",
            initialValue: true
          })(<Checkbox>Remember me</Checkbox>)}
          <a className="login-form-forgot" href="">
            Forgot password
          </a>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Log in
          </Button>
          Or <Link to={"/Signup"}>register now!</Link>
        </FormItem>
      </Form>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    loginError: state.auth.loginFailed,
    loggedIn: state.auth.user !== undefined
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(loginActions, dispatch)
  };
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);
export default connect(mapStateToProps, mapDispatchToProps)(
  WrappedNormalLoginForm
);
