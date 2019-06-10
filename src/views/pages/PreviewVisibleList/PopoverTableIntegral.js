import React from 'react';
import {inject, observer} from 'mobx-react'
import { Table, Switch } from 'antd';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from "../../../utils/helper";

const Columns = [
  {title: '公司', dataIndex: 'companyName'},
  {title: '是否购买送积分', dataIndex: 'exchangeIntegral'},
];

@inject('store')
@observer
class PopoverTableUp extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      tableDataList: []
    }
  }

  getData = async () => {
    const { companyData, rowData } = this.props;
    const { data, code, msg } = await GoodsCenterService.PreviewVisibleList.selectStartStop({ hrNo: rowData.hrNo });
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }

    const tableDataList = [];
    companyData.forEach(item => {
      tableDataList.push({ id: item.id, 
        companyId: item.id, 
        companyName: item.name, 
        exchangeIntegral: 0, 
        hrNo: rowData.hrNo, 
        brandId: rowData.brandId,
        providerId: rowData.providerId,
        k3No: rowData.k3No,
        goodsTypeIds: rowData.goodsTypeIds,
        categoriesId: rowData.categoriesId })
    })

    tableDataList.forEach((itemOne, indexOne) => {
      data.list.forEach(itemTow => {
        if(itemOne.id === itemTow.companyId) {
          tableDataList[indexOne].exchangeIntegral = itemTow.exchangeIntegral;
        }
      })
    })

    this.setState({
      tableDataList
    })
  };

  changeStartStop = async (text, record, index) => {
    const { tableDataList } = this.state;
    const params = [{ companyId: record.companyId, 
                     hrNo: record.hrNo, 
                     brandId: record.brandId,
                     providerId: record.providerId,
                     k3No: record.k3No,
                     goodsTypeIds: record.goodsTypeIds,
                     categoriesId: record.categoriesId,
                     exchangeIntegral: record.exchangeIntegral ? 0 : 1, 
                     goodsGenre: 1 
                    }];
    const { data, code, msg } = await GoodsCenterService.PreviewVisibleList.updateStartStop(params);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
    tableDataList[index].exchangeIntegral = data[0].exchangeIntegral;
  };

  componentDidMount() {
    this.getData()
  }

  render() {
    const { tableDataList } = this.state;

    const columns = () => {
      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } = item;
        if(dataIndex === 'companyId') {
          item.render = (text, record, index) => <span>{record.companyName}</span>;
        } else if(dataIndex === 'exchangeIntegral') {
          item.render = (text, record, index) => <Switch checkedChildren="是" 
                                                         unCheckedChildren="否" 
                                                         onClick={() => this.changeStartStop(text, record, index)}
                                                         defaultChecked={record.exchangeIntegral ? true : false} />;
        }
        arr.push(item)
      })
      return arr;
    };
    return (
      <div className="root-item-pop-tab-wrapper">
        <Table dataSource={tableDataList}
               style={{ width: '300px', textAlign: 'center' }}
               size="small"
               rowKey={record => record.id}
               columns={columns()}
               bordered
               pagination={false} />
      </div>
    )
  }
} 

export default PopoverTableUp;