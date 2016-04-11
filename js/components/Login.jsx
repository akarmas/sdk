/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React from 'react';
import UI from 'pui-react-buttons';
import DD from 'pui-react-dropdowns';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import LoginModal from './LoginModal.jsx';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
import LoginConstants from '../constants/LoginConstants.js';
import AuthService from '../services/AuthService.js';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  buttontext: {
    id: 'login.buttontext',
    description: 'Button text for login',
    defaultMessage: 'Login'
  },
  logouttext: {
    id: 'login.logouttext',
    description: 'Button text for log out',
    defaultMessage: 'Logout'
  }
});

/**
 * Button that shows a login dialog for integration with GeoServer security.
 *
 * ```xml
 * <Login />
 * ```
 */
@pureRender
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
    var me = this;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case LoginConstants.LOGIN:
          me._doLogin(action.user, action.pwd, action.failure, action.scope);
          break;
        default:
          break;
      }
    });
  }
  componentDidMount() {
    var me = this;
    AuthService.getStatus(this.props.url, function(user) {
      me.setState({user: user});
    }, function() {
      me.setState({user: null});
    });
  }
  _doLogin(user, pwd, failureCb, scope) {
    var me = this;
    AuthService.login(this.props.url, user, pwd, function() {
      me.setState({user: user});
    }, function() {
      me.setState({user: null});
      failureCb.call(scope);
    });
  }
  _showLoginDialog() {
    this.refs.loginmodal.getWrappedInstance().open();
  }
  _doLogout() {
    AuthService.logoff();
    this.setState({user: null});
  }
  render() {
    const {formatMessage} = this.props.intl;
    if (this.state.user !== null) {
      return (
        <DD.Dropdown pullRight {...this.props} title={this.state.user}>
          <DD.DropdownItem onSelect={this._doLogout.bind(this)}>{formatMessage(messages.logouttext)}</DD.DropdownItem>
        </DD.Dropdown>
      );
    } else {
      return (
        <UI.DefaultButton onClick={this._showLoginDialog.bind(this)}>{formatMessage(messages.buttontext)}
          <LoginModal ref='loginmodal' />
        </UI.DefaultButton>
      );
    }
  }
}

Login.propTypes = {
  /**
   * Url to geoserver login endpoint.
   */
  url: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Login.defaultProps = {
  url: '/geoserver/app/api/login'
};

export default injectIntl(Login);