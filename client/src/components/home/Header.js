import React, { Component } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as logoutActions from 'containers/Logout';

import 'styles/Header.css';
import { Button, Modal, Menu, Dropdown, Icon } from 'antd';
const confirm = Modal.confirm;

class Header extends Component {
  routes = [{ link: '/', title: 'Home' }];

  state = { visible: false };

  componentDidMount() {
    console.log(this.props);
  }

  componentDidUpdate() {
    console.log(this.props);
  }

  showConfirm = () => {
    const config = {
      title: 'Are you sure to logout?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        console.log('logout successful');
        this.props.actions.logout();
      },
      onCancel: () => {
        console.log('Cancel logout');
      },
    };
    confirm(config);
  };

  menu = (
    <Menu>
      <Menu.Item>
        <Link to={'/MySchedules'}>My Schedules</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item>
        <a onClick={this.showConfirm}>Logout</a>
      </Menu.Item>
    </Menu>
  );

  render() {
    const { user, loggedIn } = this.props;

    return (
      <div>
        <div className="nav">
          <div className="menuContainer">
            <NavLink to="/">
              <h1 style={{ margin: 0 }}>Graduation Helper</h1>
            </NavLink>
            <div className="menu">
              {this.routes.map(({ link, title }) => (
                <NavLink
                  exact
                  activeClassName="linkActive"
                  key={link}
                  to={link}
                >
                  {title}
                </NavLink>
              ))}
            </div>
          </div>
          {loggedIn ? (
            <div className="buttonContainer">
              <Dropdown overlay={this.menu} trigger={['click']}>
                <a className="ant-dropdown-link" href="#">
                  {user.username} <Icon type="down" />
                </a>
              </Dropdown>
            </div>
          ) : (
            <Button type="primary" className="loginButton">
              <Link to={'/Login'}>Login</Link>
            </Button>
          )}
          <Modal title="Logout" visible={this.state.visible}>
            <p>Are you sure?</p>
          </Modal>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    loggedIn: state.auth.user !== undefined,
    user: state.auth.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(logoutActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
