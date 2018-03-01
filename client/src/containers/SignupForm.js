import React from 'react';
import axios from 'axios';

import '../styles/Login.css';

import { Form, Icon, Input, Button } from 'antd';
const FormItem = Form.Item;

class NormalSignupForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);

        axios.post('/register', {
          username: values.username,
          email: values.email,
          password: values.password
        })
        .then(function (res) {
          console.log(res);
        })
        .catch(function (error) {
          console.log(error);
        });

      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="signup-form">
        <FormItem>
          {getFieldDecorator('email', {
            rules: [{ required: true, message: 'Please input your Email!' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please input your Username!' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" className="login-form-button">
            Sign up
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const WrappedNormalSignupForm = Form.create()(NormalSignupForm);

export default WrappedNormalSignupForm;