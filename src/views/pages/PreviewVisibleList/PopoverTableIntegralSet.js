import React from 'react';
import {inject, observer} from 'mobx-react'
import { Table, InputNumber } from 'antd';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from "../../../utils/helper";

const Columns = [
  {title: '公司名称', dataIndex: 'companyId'},
  {title: '门市价格', dataIndex: 'marketPrice'},
  {title: '兑换所需积分', dataIndex: 'integralNeed'}
];

@inject('store')
@observer
class PopoverTableIntegralSet extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tableDataList: [],
      countNum: null,
    }
  };

  getCountNum = async () => {   // 获取积分换算数值
    const { data, code, msg } = await GoodsCenterService.GiveIntSet.selectAll({ type: 2 });
    if(code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    this.setState({countNum: data.list[0].integral}, () => this.getData())
  };

  getData = async () => {
    const { companyData, rowData, rowDataSon } = this.props;
    const { countNum } = this.state;
    const { data, code, msg } = await GoodsCenterService.PreviewVisibleList.setIntegralList({ skuHrNo: rowDataSon.hrNo });
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    const tableDataList = [];
    companyData.forEach(item => {
      tableDataList.push({ 
        companyId: item.id,
        companyName: item.name,
        skuHrNo: rowDataSon.hrNo,
        parentHrNo: rowData.hrNo,
        marketPrice: 0, 
        integralNeed: 0 
      }) 
    })
    tableDataList.forEach((itemOne, indexOne) => {
      data.list.forEach(itemTow => {
        if(itemOne.companyId === itemTow.companyId) {
          tableDataList[indexOne].marketPrice = (itemTow.marketPrice / 100).toFixed(2) * 1;
          tableDataList[indexOne].integralNeed = (itemTow.marketPrice / 100 / countNum).toFixed(0) * 1;
        }
      })
    })
    this.setState({tableDataList})
  };

  priceChange = (text, record, index, e) => {
    const { tableDataList, countNum } = this.state;

    tableDataList[index].marketPrice = e;
    tableDataList[index].integralNeed = (e / countNum).toFixed(0) * 1;
    this.setState({tableDataList})
  };

  priceSubmitOne = async (text, record, index) => {   // 提交
    const params = { companyId: record.companyId,
                      companyName: record.companyName, 
                      skuHrNo: record.skuHrNo, 
                      parentHrNo: record.parentHrNo,
                      marketPrice: (record.marketPrice * 100).toFixed(0), 
                      integralNeed: record.integralNeed, 
                    };
    const { code, msg } = await GoodsCenterService.PreviewVisibleList.setIntegral(params);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
  };

  setCounterPrice = (text, record, index) => {   // 设置门市价格
    return(
      <span>
        <InputNumber onChange={this.priceChange.bind(this, text, record, index)} 
                     onBlur={() => this.priceSubmitOne(text, record, index)}
                     defaultValue={record.marketPrice} 
                     min={0.01} max={999999} precision={2} />
      </span>
    )
  };

  setWantIntegral = (text, record, index) => {   // 展示该礼品所需兑换积分数
    return(
      <span>{ record.integralNeed }</span>
    )
  };

  componentDidMount() {
    this.getCountNum();
  };

  render() {
    const { tableDataList } = this.state;

    const columns = () => {
      const arr = [];
      Columns.forEach(item => {
        const { dataIndex } = item;
        if(dataIndex === 'companyId') {
          item.render = (text, record, index) => <span>{record.companyName}</span>;
        } else if (dataIndex === 'marketPrice') {
          item.render = (text, record, index) => this.setCounterPrice(text, record, index);
        } else if (dataIndex === 'integralNeed') {
          item.render = (text, record, index) => this.setWantIntegral(text, record, index);
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
               rowKey={record => record.companyId}
               columns={columns()}
               bordered
               pagination={false} />
      </div>
    )
  }
} 

export default PopoverTableIntegralSet;