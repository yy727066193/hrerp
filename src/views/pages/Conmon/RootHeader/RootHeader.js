import React from 'react'
import { Menu, Icon } from 'antd'
import { inject, observer } from 'mobx-react'
import './index.less';
import {HOME_URL, NOTICE_URL, SUCCESS_CODE, SYS_ID} from "../../../../conf";
import { getLoginInfo } from '../../../../utils/public'
import NotifCenterService from "../../../../service/NotifCenterService";

@inject('store')
@observer
class RootHeader extends React.Component {
  static defaultProps = {
    list: [],
  };

  constructor(props) {
    super(props);

    this.state = {
      employee: null,
    };
  }

  getNoticeCount = async () => {
    const { employee, companyId } = getLoginInfo();
    const { setCommon } = this.props.store;
    const { code, data } = await NotifCenterService.NotifCenter.getNotifyCount({ userId: employee.id, companyId, deptId: employee.departmentId });
    if (code !== SUCCESS_CODE) {
      return;
    }
    setCommon('notifyCount', data || 0);
  };

  addReadNotice = async () => {
    const { noticeCount } = this.props.store;
    const { sessionId, employee, companyId } = getLoginInfo();
    if (noticeCount <= 0) {
      window.location.href = `${NOTICE_URL}?sessionId=${sessionId}`
    } else {
      await NotifCenterService.NotifCenter.clickBell({ companyId, userId: employee.id, userName: employee.name });
      window.location.href = `${NOTICE_URL}?sessionId=${sessionId}`
    }
  };

  componentDidMount() {
    const { employee } = getLoginInfo();
    if (employee) {
      this.setState({ employee })
    }
    this.getNoticeCount();
  }

  render() {
    const { list } = this.props;
    const { employee } = this.state;
    const { noticeCount } = this.props.store;
    return(
      <div className="root-header">
        <div className="root-header-logo">
          <img src="//hrlb-online.oss-cn-beijing.aliyuncs.com/web/imgs/logo-2018-12-13.png" alt="logo" />
        </div>
        <Menu mode="horizontal"
              className="root-header-info"
              onClick={this.handleClick}
              selectedKeys={[SYS_ID + '']}>
          <Menu.Item key="0" className="root-header-info-line">
            <a href={HOME_URL}>首页</a>
          </Menu.Item>
          {list.map((item, index) => {
            if (!item || !item.systemManager) {
              return null;
            }
            const isLast = index === (list.length - 1);
            const href = item.systemManager.sysHref ?
              (`${item.systemManager.sysHref.indexOf('?') === -1 ?
                item.systemManager.sysHref + `?sessionId=${getLoginInfo().sessionId}` : item.systemManager.sysHref + `&sessionId=${getLoginInfo().sessionId}`}`)
              : `javascript:void(0)`;
            return(
              <Menu.Item key={item.systemManager.id ? item.systemManager.id + '' : Date.now() + ''} className={isLast ? '' : 'root-header-info-line'}>
                <a href={item.systemManager.id === SYS_ID ? `javascript:void(0)` : href}>
                  {item.systemManager.name}
                </a>
              </Menu.Item>
            )
          })}
        </Menu>
        <div className="root-header-right">
          <div className="root-header-right-notice" onClick={() => this.addReadNotice()}>
            {noticeCount ? <i className="root-header-right-notice-count">{noticeCount}</i> : null}
            <Icon type="alert" />
          </div>
          <div className="root-header-right-user">
            <Icon type="user" />
            <span>{employee && employee.name ? employee.name : ''}</span>
          </div>
          <span className="root-header-right-out" onClick={(e) => this.props.onLoginOut(e)}>
            退出
          </span>
        </div>
      </div>
    )
  }
}

export default RootHeader
