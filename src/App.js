import React, { Component } from 'react';
import { LocaleProvider } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { Provider } from 'mobx-react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import moment from "moment";
import Container from './views/Container'
import './assets/style/common/reset.less'

moment.locale('zh-cn');

class App extends Component {
  render() {
    return (
      <LocaleProvider locale={zhCN}>
        <Provider {...this.props}>
          <Router basename={process.env.NODE_ENV === 'development' ? '/' : '/stock-goods-order'}>
            <Route path="/" component={Container} />
          </Router>
        </Provider>
      </LocaleProvider>
    );
  }
}

export default App;
