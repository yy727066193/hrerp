import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Collapse, Table } from 'antd';
import { SearchForm } from '../../../components/index';
import { inject, observer } from 'mobx-react';
import Columns from './columnConfig';

const Panel = Collapse.Panel;
const payMessgae = [
	{ title: '支付方式', dataIndex: 'company', formType: 'select', required: true },
	{ title: '支付状态', dataIndex: 'otherCompant', formType: 'select', required: true },
	{ title: '抹零', dataIndex: 'otherCompant', formType: 'input' },
	{ title: '实付', dataIndex: 'otherCompant', formType: 'input', required: true }
]

const memberMessage = [
	{ title: '会员姓名', dataIndex: 'company', formType: 'select', required: true },
	{ title: '手机号码', dataIndex: 'otherCompant', formType: 'input' },
	{ title: '会员卡号', dataIndex: 'otherCompant', formType: 'input', disabled: true },
	{ title: '会员注册门店', dataIndex: 'otherCompant', formType: 'input', disabled: true },
	{ title: '会员积分', dataIndex: 'otherCompant', formType: 'input', disabled: true },
	{ title: '会员等级', dataIndex: 'otherCompant', formType: 'input', disabled: true },
	{ title: '地址', dataIndex: 'otherCompant', formType: 'input', disabled: true },
];
const numberMessage = [
	{ title: '是否需要发票', dataIndex: 'company', formType: 'select', required: true, placeholder: '' },
]

@inject('store')
@observer
class CollapseForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      disCountList: []
    }
  }
  render() {
    const { tableLoading } = this.props.store;
    const { disCountList } = this.state;
    return(
      <div>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="促销信息" key="1">
            <Table
              dataSource={disCountList}
              columns={Columns.disCountTableHead}
              rowKey={record => record.key}
              loading={tableLoading}
              pagination={false}
              bordered />
          </Panel>
          <Panel header="支付信息" key="2">
            <SearchForm
              formList={payMessgae}
              formItemSpan={6}
              ref={el => this.searchForm = el}
              showSearch={false}
            >
              <div className="totalCount">
                应付金额合计：1234
              </div>
            </SearchForm>

          </Panel>
          <Panel header="会员信息" key="3">
            <SearchForm
              formList={memberMessage}
              ref={el => this.searchForm = el}
              showSearch={false}
              showSearchCount={999}
            >
            </SearchForm>
          </Panel>
          <Panel header="发票信息" key="4">
            <SearchForm
              formList={numberMessage}
              ref={el => this.searchForm = el}
              showSearch={false}
              showSearchCount={999}
            >
            </SearchForm>
          </Panel>
				</Collapse>
      </div>
    )
  }
}

export default CollapseForm;