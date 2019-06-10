import React from 'react'
import { inject,observer } from 'mobx-react'
import { Steps, Divider, Table, Button, Icon, Modal, Input, Popconfirm } from 'antd'
import DetailSelect from './DetailSelect'
import {SUCCESS_CODE} from "../../../conf";
import GoodsCenterService from "../../../service/GoodsCenterService";
import helper from "../../../utils/helper";
import SkuTable from "./SkuTable";

const { Column } = Table;

@inject('store')
@observer
class DetailInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tableSelectData: [],
      tableSelectLoading: false,
      selectedInfoRowKeys: []
    };
  }

  formatTableSelectData = (list) => {
    list.forEach(item => item._selectRowKeys = []);

    return list;
  };

  getInfoData = async (searchData={}) => {
    this.setState({tableSelectLoading: true});
    const { code, data } = await GoodsCenterService.PreviewVisibleList.selectAll({ pageNum: 1, pageSize: 999999, ...searchData, isPutOn: 1 });
    this.setState({tableSelectLoading: false});
    if (code !== SUCCESS_CODE) {
      return;
    }
    if (data) {
      this.setState({ tableSelectData: this.formatTableSelectData(data.list), selectedInfoRowKeys: [] })
    }
  };

  showModal = () => {
    const { setCommon } = this.props.store;
    this.getInfoData();
    setCommon('globalVisible', true)
  };

  setSelectInfoData = (keys) => { // 外面的选择事件
    const { tableSelectData } = this.state;
    if (keys.length === 0) {
      this.setState({ selectedInfoRowKeys: keys, tableSelectData: this.formatTableSelectData(tableSelectData) })
    } else {
      tableSelectData.forEach(rowData => {
        keys.indexOf(rowData.hrNo) === -1 ? rowData._selectRowKeys = [] : rowData._selectRowKeys = rowData.goodsSkuList.map(item => item.hrNo)
      });
      this.setState({ selectedInfoRowKeys: keys, tableSelectData })
    }
  };

  setInfoRowData = (keys, index) => { // 设置每个子sku的选中
    const { selectedInfoRowKeys, tableSelectData } = this.state;
    const parentHrNo = tableSelectData[index].hrNo;
    if (keys.length === 0) {
      selectedInfoRowKeys.splice(selectedInfoRowKeys.indexOf(parentHrNo), 1)
    } else {
      if (selectedInfoRowKeys.indexOf(parentHrNo) === -1) {
        selectedInfoRowKeys.push(parentHrNo)
      }
    }
    tableSelectData[index]._selectRowKeys = keys;
    this.setState({ selectedInfoRowKeys, tableSelectData })
  };

  addGoodsList = async () => {
    const { tableSelectData, selectedInfoRowKeys } = this.state;
    const { setCommon } = this.props.store;
    if (selectedInfoRowKeys.length === 0 || selectedInfoRowKeys.length > 20) {
      helper.W(`请给套餐选择不超过20种的货品`);
      return;
    }
    const params = {};
    tableSelectData.forEach(rowData => rowData._selectRowKeys.length !== 0 ? params[rowData.hrNo] = rowData._selectRowKeys : null);
    setCommon('loading', true);
    const { code, msg, data } = await GoodsCenterService.MealList.formatGoodsList(params);
    setCommon('loading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    if (data) {
      if (this.props.onAddGoodsList) {
        this.props.onAddGoodsList(data)
      }
      setCommon('globalVisible', false)
    }
  };

  render() {
    const { stepList, goodsTypeList, tableDetailData } = this.props;
    const { globalVisible, setCommon, loading } = this.props.store;
    const { tableSelectData, tableSelectLoading, selectedInfoRowKeys } = this.state;
    return(
      <div>
        <Steps current={1}>
          {stepList.map(item => <Steps.Step title={item.title} key={item.title} />)}
        </Steps>
        <Divider />
        <div className="clearfix">
          <div className="fl">
            <Icon type="info-circle" style={{ color: '#f50', marginRight: '10px', fontSize: '16px' }} />
            <span style={{ color: '#f50' }}>若有历史货品记录，再次添加商品提交会覆盖历史商品套餐记录!</span>
          </div>
          <div className="fr">
            <Button type="primary" onClick={() => this.showModal()}>添加商品</Button>
          </div>
        </div>

        <section style={{ marginTop: '20px' }}>
          <Table size="small"
                 dataSource={tableDetailData}
                 title={() => <div>共{tableDetailData.length}条</div>}
                 footer={() => <div style={{ textAlign: 'right' }}><Button loading={loading} type="primary" onClick={() => this.props.updateGoodsList()}>保存</Button></div>}
                 rowKey={record => record.hrNo}
                 expandedRowRender={(record, index) => <SkuTable rowData={record} rowIndex={index} isRowSelect={false} />}
                 pagination={false}>
            <Column title="序号" dataIndex="_index" width="50px" render={(text, record, index) => index + 1} />
            <Column title="货品名称" dataIndex="name" widht="100px" />
            <Column title="货品编号" dataIndex="k3No" />
            <Column title="计价单位" dataIndex="priceUnitName" widht="100px" />
            <Column title="货品类别" dataIndex="goodsTypeList" widht="100px" render={(text) => text.map(item => item.name).join(',')} />
            <Column title="数量" dataIndex="goodsNum" widht="100px" render={(text, record, index) => <Input maxLength={8} value={text} onChange={(e) => {
              if (this.props.onGoodsNumChange) {
                if(e.target.value >= 99999999) {
                  return;
                }
                this.props.onGoodsNumChange(e.target.value.replace(/[^0-9]/ig,""), index)
              }
            }} type="number" />} />
            <Column title="操作" dataIndex="_actions" width="50px" render={(text, record, index) => [
              <Popconfirm title="确认移除吗?" onConfirm={() => this.props.removeGoodsOne(index)}>
                <Button size="small">移除</Button>
              </Popconfirm>
            ]} />
          </Table>
        </section>

        <Modal visible={globalVisible}
               title="添加商品"
               width="1000px"
               destroyOnClose
               confirmLoading={loading}
               onOk={() => this.addGoodsList()}
               onCancel={() => {
                 setCommon('globalVisible', false)
               }}>
          <DetailSelect tableSelectData={tableSelectData}
                        onRowSelectChange={(selectedInfoRowKeys, selectList) => this.setSelectInfoData(selectedInfoRowKeys, selectList)}
                        onSelectRowInfoChange={(keys, index) => this.setInfoRowData(keys, index)}
                        selectedInfoRowKeys={selectedInfoRowKeys}
                        tableSelectLoading={tableSelectLoading}
                        onSearch={searchData => this.getInfoData(searchData)}
                        goodsTypeList={goodsTypeList} />
        </Modal>
      </div>
    )
  }
}

export default DetailInfo;
