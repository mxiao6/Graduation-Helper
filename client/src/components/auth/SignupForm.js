import React from "react";
import axios from "axios";
import { POST_SIGNUP } from "api";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as loginActions from "containers/Login";

import { Form, Icon, Input, Button, message } from "antd";

import "styles/Login.css";

const FormItem = Form.Item;

class NormalSignupForm extends React.Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log("Received values of form: ", values);
        var email_addr = (values.email).split("@")
        if (email_addr[1] === 'illinois.edu'){
          if (values.password1 === values.password2) {
            if ((values.password1).length >= 10){
              axios
                .post(POST_SIGNUP, {
                  username: values.username,
                  email: values.email,
                  password: values.password1
                })
                .then(res => {
                  console.log(res);
                  message.success(res.data);
                  this.props.history.push("/");
                })
                .catch(e => {
                  message.error(e.response.data);
                  console.log(e.response);
                });
            } else{
              message.error(
                'Password must be at least 10 characters.'
              );
            }
          } else {
            message.error(
              'Passwords do not match. Please try again.'
            );
          }
        } else{
          message.error(
            'You must sign up with an illinois.edu email. Please try again.'
          );
        }
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="signup-form">
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
          {getFieldDecorator("username", {
            rules: [{ required: true, message: "Please input your Username!" }]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Username"
            />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator("password1", {
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
          {getFieldDecorator("password2", {
            rules: [{ required: true, message: "Please input your Password!" }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="Confirm Password"
            />
          )}
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Sign up
          </Button>
        </FormItem>
      </Form>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    loggedIn: state.auth.user !== undefined
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(loginActions, dispatch)
  };
}

const WrappedNormalSignupForm = Form.create()(NormalSignupForm);

export default connect(mapStateToProps, mapDispatchToProps)(
  WrappedNormalSignupForm
);
