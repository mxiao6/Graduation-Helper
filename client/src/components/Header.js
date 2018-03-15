import React, { Component } from "react";
import { NavLink, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as logoutActions from "containers/Logout";

import "styles/Header.css";
import { Button, Modal } from "antd";
const confirm = Modal.confirm;

class Header extends Component {
  routes = [{ link: "/", title: "Home" }];

  state = { visible: false };

  componentDidMount() {
    console.log(this.props);
  }

  componentDidUpdate() {
    console.log(this.props);
  }

  showConfirm = () => {
    const config = {
      title: "Are you sure to logout?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        console.log("logout successful");
        this.props.actions.logout();
      },
      onCancel: () => {
        console.log("Cancel logout");
      }
    };
    confirm(config);
  };

  render() {
    return (
      <div>
        <div className="nav">
          <div className="menuContainer">
            <NavLink to="/">
              <h1>Graduation Helper</h1>
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
          {this.props.loggedIn ? (
            <Button onClick={this.showConfirm} className="logoutButton">
              Logout
            </Button>
          ) : (
            <Button type="primary" className="loginButton">
              <Link to={"/Login"}>Login</Link>
            </Button>
          )}
          <Modal
            title="Logout"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <p>Are you sure?</p>
          </Modal>
        </div>
      </div>
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
    actions: bindActionCreators(logoutActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
