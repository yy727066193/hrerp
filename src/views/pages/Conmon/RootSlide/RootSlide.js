import React from 'react'
import { Menu } from 'antd'
import { Link } from 'react-router-dom'
import './index.less'
import {formatModulesToTree, getFirstModulesPath, getLoginInfo, searchList} from "../../../../utils/public";

const SubMenu = Menu.SubMenu;

class RootSlide extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openKeys: [],
      selectedKeys: [],
      list: formatModulesToTree() ? formatModulesToTree() : []
    };
  };

  handleMenuClick = ({ key }) => {
    if (!key) {
      return;
    }
    this.setState({ selectedKeys: [key] })
  };

  setMenuKeys = (path) => {
    const module = path ? searchList(getLoginInfo().modules, 'path', path) : getFirstModulesPath();
    const openKeys = [`${module.parentId ? module.parentId + '' : ''}`];
    this.setState({
      selectedKeys: [path ? searchList(getLoginInfo().modules, 'path', path).id + '' || '' : getFirstModulesPath().id + ''],
      openKeys
    })
  };

  componentDidMount() {
    const path = this.props.location.pathname.replace('/', '');
    this.setMenuKeys(path)
  }

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps;
    if (location){
      const path = location.pathname.replace('/', '');
      this.setMenuKeys(path)
    }
  }

  render() {
    const { list, selectedKeys, openKeys } = this.state;
    return(
      <div className="root-slide">
        <Menu mode="inline"
              openKeys={openKeys}
              selectedKeys={selectedKeys}
              onOpenChange={openKeys => this.setState({ openKeys })}
              onClick={this.handleMenuClick} className="root-slide-info">
          {list.map((item) => {
            if (item.path) {
              return(
                <Menu.Item key={item.id + ''}>
                  <Link to={item.path}>{item.name}</Link>
                </Menu.Item>
              )
            } else { // 带有二级的菜单
              return(
                <SubMenu key={item.id + ''} title={item.name}>
                  {item.modules && Array.isArray(item.modules) && item.modules.length !== 0 ?
                    item.modules.map(module => {
                      if (!module.path) {
                        return null;
                      }
                      return(
                        <Menu.Item key={module.id + ''}>
                          <Link to={module.path}>{module.name}</Link>
                        </Menu.Item>
                      )
                    }) : null
                  }
                </SubMenu>
              )
            }
          })}
        </Menu>
      </div>
    )
  }
}

export default RootSlide
