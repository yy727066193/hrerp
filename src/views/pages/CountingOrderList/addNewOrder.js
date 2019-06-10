import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import './index.less';
import { Steps, Button, Tabs, Select, DatePicker, Table, Icon, Upload } from 'antd';
import { Bread}  from './../../../components/index';
import { inject, observer } from 'mobx-react';
import Columns from './columnConfig';
import GoodsCenterService from '../../../service/GoodsCenterService';
import Api from '../../../service/api.js';
import { SUCCESS_CODE } from '../../../conf';
import helper from '../../../utils/helper';
import moment from 'moment';
import { searchList, getLoginInfo } from '../../../utils/public';
const Step = Steps.Step;
const TabPane = Tabs.TabPane;
const breadCrumbList = ['盘点单列表', '新增盘点单']
@inject('store')
@observer
class AddNewOrder extends React.Component {

  state = {
    currentStep: 0,
    activeTab: "1",
    storeOptions: [],
    tableDataList: [],
    totalData: {}, // 总数据
    posCount: 0,
    negCount: 0,
    importResult: true,
    isUpload: false,  // 是否已经上传过
    time: moment(new Date(), 'YYYY-MM-DD'),
    countingOrderNumber: '', // 导入成功后返回的盘点单单号
    depotId: '',
  };
  render() {
    const { currentStep, activeTab, storeOptions, tableDataList, totalData, time, depotId, importResult } = this.state;
    const { tableLoading } = this.props.store;
    const depotLabel = searchList(storeOptions, 'value', depotId).label;
    return (
      <div className="page-wrapper addNewOrder">
       <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['CountingOrderList']}/>
        </div>
       <Steps current={currentStep}>
          <Step title="上传导入文件" />
          <Step title="导入文件预览"  />
          <Step title="导入完成" />
        </Steps>
        <Tabs activeKey={activeTab}>
          <TabPane tab="Tab 1" key="1">
            <div className="formStyle">
              <div className="form-item">
                <span>1.选择盘点仓库:</span>
                <div className="blockWrapper">
                  <Select style={{ width: '100%',paddingLeft: '10px' }}
                   placeholder="请选择仓库"
                    showSearch
                    onSelect={(val) => this.onSelect(val)}
                    >
                    {
                      storeOptions.map((item) => {
                        return (
                          <Select.Option key={item['value']}
                              value={item['value']}>
                              {item['label']}
                          </Select.Option>
                        )
                      })
                    }
                  </Select>

                </div>
              </div>
              <div className="form-item">
                <span>2.模板下载:</span>
                  <div className="blockWrapper">
                  <Button style={{marginLeft: '10px',marginTop: '10px'}} onClick={() => this.downFile()} type="primary">立即下载</Button>
                </div>
              </div>
              <div className="form-item">
                <span>3.添加盘点数据:</span>
                <div className="blockWrapper">
                  <Upload name="file" showUploadList={true}
                        accept=".xls,.xlsx"
                        className="avatar-uploader"
                        onChange={(e) => this.uploadFile(e)}
                        action={Api.boundOrders.uploadFile}>
                        <Button>
                          <Icon type="upload" /> 请选择导入文件
                        </Button>
                  </Upload>
                </div>
              </div>
            </div>
          </TabPane>
          <TabPane tab="Tab 2" key="2" style={{marginTop: '20px'}}>
            <div>
              <div className="form-item">
                <span>盘点仓库: {depotLabel}</span>
                <span className="ml_20">盘点日期:</span>
                <DatePicker value={time} allowClear={false} style={{marginLeft: '10px'}} onChange={(e) => this.onChange(e)} />
                <span className="ml_20">盘盈合计: <span style={{fontWeight: 'bold'}}> {totalData.pyNum}</span> </span>
                <span className="ml10">盘亏合计:  <span style={{fontWeight: 'bold'}}> {totalData.pkNum}</span></span>
                <div className="page-wrapper-content scrollContent mt20">
                  <Table  dataSource={tableDataList}
                          size="small"
                          columns={Columns.addOrderHead}
                          rowKey={record => record.key}
                          loading={tableLoading}
                          pagination={false}
                          bordered />
                </div>
                <div className="mt20">共 {tableDataList.length} 条数据</div>
              </div>
            </div>
          </TabPane>
          <TabPane tab="Tab 3" key="3">
            <div className="resultPage">
              <div className="successPage">
                {
                  importResult? (
                    <div>
                      <div className="font30 mt20 mb20">导入成功</div>
                      <div className="importNum">共有 {tableDataList.length} 条数据成功导入 </div>
                    </div>
                  ): (
                    <div>
                      <div className="font30 mt20 mb20">导入失败</div>
                      <div className="importNum">导入失败的可能有: </div>
                      <div className="textCenter">1.系统中没有指定商品存在</div>
                      <div className="textCenter">2.盘点数量不能为空</div>
                      <div className="textCenter">3.存在商品编码/商品名称/商品规格完全相同的多条商品</div>
                    </div>
                  )
                }
              </div>
            </div>
          </TabPane>
        </Tabs>

        {
          currentStep === 2 && importResult? (
            <div className="w320MarginAuto">
              <Button type="primary" style={{marginRight: '10px'}} onClick={() => this.goNext(true)} ghost>继续上传</Button>
              <Button type="primary" style={{marginRight: '10px'}} onClick={() => this.viewDetail()} ghost>查看明细</Button>
              <Button type="primary" style={{marginRight: '10px'}} onClick={() => this.props.history.push({ pathname: '/CountingOrderList'}) }>进入盘点列表</Button>
            </div>
          ) : (
            <div className="operateMarginAuto">
              {
                importResult? (
                  <div>
                    <Button type="primary" onClick={() => this.goBack()} style={{marginRight: '10px'}} ghost>取消</Button>
                    <Button onClick={() => this.goNext()} type="primary"> {currentStep === 1 ? '确定导入' : '下一步'}</Button>
                  </div>
                ): (
                  <Button type="primary" onClick={() => this.goNext(true)} style={{marginLeft: '100px',marginRight: '10px'}} ghost>重新上传</Button>
                )
              }
              
            </div>
          )
        }
      </div>
    )
  }

  componentDidMount() {
    this.getStoreList();
  }

  async getStoreList() {
    const params = {}
    const { employee, subordinateStoreIds, companyIds } = getLoginInfo();
    if (employee.roleId === 1 || employee.roleId === 2) {
      params.storeIds = subordinateStoreIds
    } else {
      params.storeIds = subordinateStoreIds;
      params.companyIds = companyIds;
    }
    const { data, code } = await GoodsCenterService.boundOrders.getStoreList(params);
    if (code !== SUCCESS_CODE) return;
    const arr = [];
    data.list.forEach((item) => {
      arr.push({
        value: item.id,
        label: item.depotName
      });
    });
    this.setState({
      storeOptions: arr
    });
  }

  goNext(bool) {
    const { depotId } = this.state;
    if (bool) {
      this.setState({
        currentStep: 0,
        activeTab: '1',
        isUpload: false
      });
      return;
    }
    let { currentStep, activeTab, isUpload } = this.state;
    if(currentStep === 1) {
      this.getResult();
    }
    if (depotId.length === 0) {
      helper.W('请选择仓库');
    }else if (currentStep === 0 && isUpload === false) {
      helper.W('请先上传文件')
    } else {
      if (currentStep <= 2) {
        this.setState({
          currentStep: ++ currentStep,
          activeTab: ++ activeTab + ''
        })
      }
    }
  }

  goBack() {
    let { currentStep, activeTab } = this.state;
    if (currentStep >= 1) {
      this.setState({
        currentStep: -- currentStep,
        activeTab: -- activeTab + ''
      })
    }
  }

  onSelect(val) {
    this.setState({
      depotId: val
    });
  }

  async getResult() {
    const list = [];
    const { tableDataList, time, depotId, storeOptions } = this.state;
    const { id, name } = getLoginInfo().employee;
    const depotLabel = searchList(storeOptions, 'value', depotId).label;
    tableDataList.forEach((item) => {
      list.push({
        goodsCode: item.goodsCode,
        goodsName: item.goodsName,
        shelvesId: item.shelvesId,
        spec: item.spec,
        unit: item.unit,
        barCode: item.barCode,
        sysNum: item.sysNum,
        pdNum: item.pdNum,
        remark: item.remark
      })
    })
    const { code, data } = await GoodsCenterService.boundOrders.getResult({
      pdUser: name,
      pdUserid: id,
      depotName: depotLabel,
      depotId: depotId,
      inDate: moment(time).format('YYYY-MM-DD'),
      list
    });
    if (code !== SUCCESS_CODE){
      this.setState({
        importResult: false,
      })
      return;
    }
    this.setState({
      countingOrderNumber: data.pdOrderNumber,
      importResult: true
    })
    helper.S('导入成功');  
  }

  uploadFile(e) {
    if (e.file.response) {
      const { code, data, msg } = e.file.response;
      if (code !== SUCCESS_CODE) {
        helper.W(msg);
        e.file.name = ''
        return;
      }
      this.setState({
        isUpload: true
      });
      let index = 0;
      data.list.forEach((item) => {
        index ++;
        item.serialNum = index;
        item.key = index;
      })
      this.setState({
        tableDataList: data.list,
        totalData: data
      })
    }

  }

  downFile() {
    const { depotId } = this.state;
    if (depotId) {
      window.location.href= Api.boundOrders.downTemplate + '?depotId='+ depotId;
    } else {
      helper.W('请选择仓库');
    }

  }

  onChange(e) {
    this.setState({
      time: moment(e, 'YYYY-MM-DD')
    })
  }

  viewDetail() {
    this.props.history.push({pathname: 'CountingOrderDetail', state: {orderNumber: this.state.countingOrderNumber}});
  }
}

export default AddNewOrder
