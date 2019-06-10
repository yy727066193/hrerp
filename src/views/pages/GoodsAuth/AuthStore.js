import React from 'react'
import { Transfer, Cascader } from 'antd'
import { inject, observer } from 'mobx-react'
import helper from "../../../utils/helper";
import {AREA_DEPT_TYPE, SUCCESS_CODE} from "../../../conf";
import {getLoginInfo} from "../../../utils/public";
import BaseCenterService from '../../../service/BaseCenterService';

@inject('store')
@observer
class AuthStore extends React.Component{
  constructor(props) {
    super(props)

    this.state = {
      storeData: [],   // 门店数据
      companyAreaList: [],   // 公司片区数据
      authorizedStoreData: this.props.authorizedStoreData,
    }
  };

  setCompanyArea = () => {
    const { companyList, employeeDeptList } = this.props;
    const arr = [];

    companyList.forEach(company => {
      arr.push({ id: company.id, name: company.name, children: [] })
    });

    arr.forEach(item => {
      employeeDeptList.forEach(area => {
        if (item.id === area.companyId && area.departmentType === AREA_DEPT_TYPE) {
          item.children.push({ id: area.id, name: area.name })
        }
      })
    });

    return arr;
  };

  getData = async () => {
    const { setCommon, pageNum } = this.props.store;
    const { storeRow } = this.props;
    setCommon('loading', true);
    const { code, msg, data } = await BaseCenterService.Store.listAll({ pageNum, pageSize: 999999, companyIds: storeRow.companyId });
    setCommon('loading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    };
    
    this.setState({
      storeData: [...data],
    })
  };

  handleChange = (value) => {
    this.setState({ authorizedStoreData: [...value] }, () => {
      const { authorizedStoreData } = this.state;
      this.props.setAuthStoreIds(authorizedStoreData)
    });
  };

  renderListData = (item) => {
    return(
      <span>
        <span>{item.name}</span>
        {item.storeNo ? <span>{" -- " + item.storeNo}</span> : null}
        {item.address ? <span>{" -- " + item.address}</span> : null}
      </span>
    )
  };

  filterOption = (inputValue, option) => {
    return(
      option.name.indexOf(inputValue) > -1 || 
      option.address.indexOf(inputValue) > -1 || 
      option.storeNo.indexOf(inputValue) > -1
    )
  };

  handleAreaChange = async (e) => {
    const { pageNum } = this.props.store;
    const { subordinateStoreIds } = getLoginInfo();
    const { code, msg, data } = await BaseCenterService.Store.listAll({ pageNum, pageSize: 999999, companyId: e[0], areaId: e[1], subordinateStoreIds });
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    };
    
    this.setState({
      storeData: [...data],
    })
  };

  componentDidMount() {
    this.getData();
    this.setState({ companyAreaList: this.setCompanyArea() });
  }

  render() {
    const { storeData, authorizedStoreData, companyAreaList } = this.state;

    return(
      <div>
        <span>所属公司片区：</span>
        <Cascader placeholder=''
                  onChange={this.handleAreaChange.bind(this)}
                  style={{ width: '300px', marginBottom: '10px' }}
                  changeOnSelect
                  showSearch={true}
                  options={companyAreaList}
                  fieldNames={{ label: 'name', value: 'id', children: 'children' }} />
        <Transfer
          dataSource={storeData}
          rowKey={record => record.id}
          showSearch
          listStyle={{
            width: '47.5%',
            height: 500,
          }}
          targetKeys={authorizedStoreData}
          onChange={this.handleChange}
          filterOption={this.filterOption}
          render={item => this.renderListData(item)}
        />
      </div>
    )
  }
};

export default AuthStore;






