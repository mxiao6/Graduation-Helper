import React, { Component } from 'react';
import {
  NavLink,
  withRouter
} from 'react-router-dom';
import '../styles/Header.css';

class Header extends Component {
  routes = [
    { link: '/', title: 'Home' }
  ]

  componentDidMount() {
    console.log(this.props);
  }

  componentDidUpdate() {
    console.log(this.props);
  }

  render() {
    return (
      <div>
        <div className="nav">
          <NavLink to="/"><h1>Graduation Helper</h1></NavLink>

          <div className="menu">
            {this.routes.map(({ link, title }) => (
              <NavLink
                exact
                activeClassName="linkActive"
                key={link}
                to={link}>
                {title}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }
};

export default withRouter(props => <Header {...props}/>);
