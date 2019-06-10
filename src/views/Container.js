import React from 'react'
import { inject, observer } from 'mobx-react'
import { Layout } from 'antd'
import router from './pages/index'
import Verify from "./pages/Conmon/Verify/Verify";
import BaseCenterService from "../service/BaseCenterService";
import {HOME_URL, SUCCESS_CODE, SYS_ID} from "../conf";
import '../assets/style/common/index.less'
import RootHeader from './pages/Conmon/RootHeader/RootHeader'
import RootSlide from './pages/Conmon/RootSlide/RootSlide'
import SkeletonScreen from './pages/Conmon/SkeletonScreen/SkeletonScreen'
import {clearLoginInfo, getFirstModulesPath, getLoginInfo, getUrlParams, saveLoginInfo} from "../utils/public";
import helper from "../utils/helper";
import { Switch, Redirect, Route } from 'react-router-dom'

const { Header, Content, Sider } = Layout;

@inject('store')
@observer
class Container extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contentHeight: document.documentElement.clientHeight - 64
    };
  }

  goToHome = (isLogin=true, showRedirectUrl=true) => {
    if (isLogin) { // 去登录页
      clearLoginInfo();
      showRedirectUrl ? window.location.replace(`${HOME_URL}/login?redirectUrl=${encodeURIComponent(window.location.href)}`) :
        window.location.replace(`${HOME_URL}/login`);
    } else { // 去系统首页
      window.location.replace(`${HOME_URL}/home?redirectUrl=${encodeURIComponent(window.location.href)}`);
    }
  };

  setSession = async () => {
    const sessionId = getUrlParams('sessionId');
    const sessionSessionId = getLoginInfo().sessionId;
    if (!sessionId && !sessionSessionId) { // 除非2个都不存在
      this.goToHome();
      return;
    }
    const { code, msg, data } = await BaseCenterService.SelectSessionId({ sessionId: sessionId ? sessionId : sessionSessionId });
    if (code !== SUCCESS_CODE) {
      this.goToHome();
      helper.W(msg);
      return;
    }
    if (data && data.systemList && Array.isArray(data.systemList)) {
      const findArr = data.systemList.filter(s => s.sysId === SYS_ID);
      if (findArr.length !== 0) {
        saveLoginInfo(data);
        this.props.store.setCommon('sessionData', data);
      } else { // 系统权限不存在
        this.goToHome(false);
      }
    } else {
      this.goToHome(false);
    }
  };

  componentDidMount() {
    this.setSession();
    // this.props.store.setCommon('sessionData', '5a03ed8b4bd14349a6536f235a818c64')
  }

  render() {
    const { store } = this.props;
    return(
      <Layout>
        {!store.sessionData ? <SkeletonScreen /> :
          [
            <Header>
              <RootHeader onLoginOut={() => this.goToHome(true, false)} list={store.sessionData && store.sessionData.systemList ? store.sessionData.systemList : []} />
            </Header>,
            <Layout>
              <Sider style={{ height: `${this.state.contentHeight}px` }}>
                <RootSlide location={this.props.location} />
              </Sider>
              <Content style={{ height: `${this.state.contentHeight}px` }}>
                <Switch>
                  {router.map(item => {
                    return(
                      <Route path={item.path} key={item.path} exact={item.exact} component={Verify(item.comp, store, item.checkLogin)} />
                    )
                  })}
                  <Redirect to={getFirstModulesPath().path} />
                </Switch>
              </Content>
            </Layout>
          ]
        }
      </Layout>
    )
  }
}

export default Container;