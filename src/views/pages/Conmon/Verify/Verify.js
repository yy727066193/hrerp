import React from 'react'
import {clearLoginInfo, getLoginInfo, getUrlParams, searchList} from "../../../../utils/public";
import {HOME_URL} from "../../../../conf";

const Verify = (Comp, store, checkLogin) => {
  return class RealComp extends React.Component {

    constructor(props) {
      super(props);

      let sessionId;
      let isAction = false;

      if (getLoginInfo().sessionId || getUrlParams('sessionId')) {
        sessionId = getLoginInfo().sessionId ? getLoginInfo().sessionId : getUrlParams('sessionId');
        isAction = !!searchList(getLoginInfo().modules, 'path', this.props.location.pathname.replace('/', ''))
      }

      this.state = {
        isLogin: !!sessionId,
        isAction
      }
    }

    componentWillMount() {
      // 每个界面跳转成功初始化store
      store.setDefault();
    }

    componentDidMount() {
      if (!this.state.isLogin) {
        clearLoginInfo();
        window.location.replace(`${HOME_URL}/login?redirectUrl=${encodeURIComponent(window.location.href)}`);
      }
    }

    render() {
      const { isAction } = this.state;
      if (checkLogin) {
        if (isAction) {
          return <Comp {...this.props} />
        } else {
          return <div>无权访问</div>
        }
      } else {
        return <Comp {...this.props} />
      }
    }
  }
};

export default Verify
