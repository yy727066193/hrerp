import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import './index.less';
import { inject, observer } from 'mobx-react';
import { Table, Row, Collapse, Button, Col, Upload, Icon } from 'antd';
import { SearchForm, EditSignalCellComponents} from './../../../components/index';
import Columns from './columnConfig';
import { searchList } from '../../../utils/public'
import CommonHead from './commonHead';
// import helper from '../../../utils/helper';
const Panel = Collapse.Panel;
// const rowSelection = {
//   onChange: (selectedRowKeys, selectedRows) => {
//   },
//   getCheckboxProps: record => ({
    
//   }),
// };

const { approvalReturnList, customerApprovalReturnList } = window.globalConfig;
@inject('store')
@observer
class CommonCollapse extends React.Component {

  static defaultActiveKey = '1';
  static defaultProps = {
    moneyFont: '退款金额',
    integralFont: '退款积分'
  }
  constructor(props) {
    super(props);
    this.state = {
      editingKey: '',
      editing: false,
      dataSource: [],
      canRecive: true // 是否接收父组件的数据  只有第一次允许接收componentWillReceivwProps的数据
    }
  }

  componentWillReceiveProps(nextProps) {
    const { canRecive } = this.state;
    if (canRecive) {
      nextProps.optionList.forEach((item) => {
        if (item.sign === 'search' && item.includeTable) {
          this.setState({
            dataSource: item.includeTable.dataSource
          })
        }
      })
    }
  }

  renderItem = (item) => {
    switch(item.sign) {
      case 'table':
        return this.returnTableDom(item);
      case 'search':
        return this.returnSearchDom(item);
      case 'font':
        return this.returnFontDom(item);
      case 'doubleFont':
        return this.returnDoubleDom(item);
      default: 
        return null;
    }
  }

  returnTableDom(item) {
    const { tableLoading, moneyFont, integralFont } = this.props;
    return (
      <Panel header={item.title} key={item.key}>
        <div className="page-wrapper-content">
          <Table
            size="small"
            dataSource={item.dataSource}
            columns={item.tableHead}
            rowKey={record => record.key}
            loading={tableLoading}
            // rowSelection={item.showChecked ? rowSelection: null}
            pagination={false}
            bordered />
            {
              item.showTotal? (
                <div className="mt15">
                  <span>{moneyFont}: {item.showTotal.money}</span>
                  <span className="ml_20">{integralFont}: {item.showTotal.integral}</span>
                  {
                    item.showTotal.showButton? (
                      <Button className="ml_20" onClick={() => this.props.onClick()} type="primary">申请退货</Button>
                    ): null
                  }
                </div>
              ): null
            }
          </div>
      </Panel>
    )
  }

  isEditing = record => record.key === this.state.editingKey;

  returnSearchDom(item) {
    const  { searchData } = this.props;
    let newColumns;
    if (item.includeTable) {
      newColumns = item.includeTable.tableHead.map((col) => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: record => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            type: col.type,
            handleSave: this.handleSave,
            options: col.options? col.options: null
          }),
        };
      })
    }

  return (
    <Panel header={item.title} key={item.key}>
      <SearchForm formList={searchData? searchData: item.searchData}
        ref={el => this.searchForm = el}
        showSearch={false}
        showSearchCount={999}
        notShowBorder={true}
        onSelect={(item, val) => this.props.onSelect(item, val)}
      />
      {
        item.canUpload? (
          <div>
            <Upload action={item.canUpload.actions}
                    listType={item.canUpload.listType}
                    accept='image/*'
                    onChange={(e) => this.uploadChange(e)}
                    >
              <Button>
                <Icon type="upload" /> 请上传附件
              </Button>
            </Upload>
          </div>
        ): null
      }
      {
        item.includeTable? (
          <div className="page-wrapper-content">
            <Table
              components={EditSignalCellComponents}
              rowClassName={() => 'editable-row'}
              bordered
              ref={el => this.table = el}
              dataSource={this.state.dataSource}
              columns={newColumns}
              pagination={false}
              />
          </div>
        ): null
      }
    </Panel>
    )
  }

  returnFontDom(item) {
    return (
      <Panel header={item.title} key={item.key}>
        <div style={{paddingTop: '20px', paddingBottom: '20px'}}>
          <Row gutter={16}>
            <CommonHead optionList={item.fontList} />
          </Row>
        </div>
      </Panel>
    )
  }

  handleSave = (row) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData }, () => {
      this.state.dataSource.forEach((item) => {
        if (Number(item.goodsNum) > Number(item.returnMoney)) {
          // item.saveGoodsNum = item.returnMoney;
          // helper.W('退货数不能大于商品总数');
          this.setState({
            bool: false
          })
          return;
        }
      })
    });
  }

  uploadChange(e) {
    if (e.file.response) {
      if (e.file.response.code === 200){
        this.props.uploadChange(e.file.response.data)
      }
    }
  }

  saveTable(form, key) {
    form.validateFields((error, row) => {
      if (error && row.goodsNum > 0) {
        return;
      }
      const newData = [...this.state.dataSource];
     
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });

      } else {
        newData.push(row);
      }
      this.setState({ dataSource: newData, editingKey: '', canRecive: false }, () => this.props.onSave(this.state.dataSource));
    });
  }



  returnDoubleDom(item) {
    const { newData } = this.props;
    return (
      <Panel header={item.title} key={item.key}>
       {
        item.fontList? item.fontList.map((headItem) => {
          switch(headItem.flowId) {
            case 1:
            return (
              <div style={{paddingTop: '20px', paddingBottom: '20px'}}>
                <Row gutter={16}>
                  <div className="f20">{headItem.departmentName}:</div>
                  <Col className="gutter-row" span={4}>
                    <div className='pr20'>
                      <span className="pr8 lh32">审批人:</span>
                      <span className="fb lh32">{headItem.auditEmployeeName}</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={4}>
                    <div className='pr20'>
                      <span className="pr8 lh32">审批时间:</span>
                      <span className="fb lh32">{headItem.createTime}</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={4}>
                    <div className='pr20'>
                      <span className="pr8 lh32">审批结果:</span>
                      <span className="fb lh32">{searchList(approvalReturnList, 'value', headItem.result).label}</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={4}>
                    <div className='pr20'>
                      <span className="pr8 lh32">备注:</span>
                      <span className="fb lh32">{headItem.remark}</span>
                    </div>
                  </Col>
                </Row>
              </div>
            )
            case 2:
            return (
              <div style={{paddingTop: '20px', paddingBottom: '20px'}}>
                <Row gutter={16}>
                  <div className="f20">{headItem.departmentName}:</div>
                  <Col className="gutter-row" span={4}>
                    <div className='pr20'>
                      <span className="pr8 lh32">审批人:</span>
                      <span className="fb lh32">{headItem.auditEmployeeName}</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={4}>
                    <div className='pr20'>
                      <span className="pr8 lh32">审批时间:</span>
                      <span className="fb lh32">{headItem.createTime}</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={4}>
                    <div className='pr20'>
                      <span className="pr8 lh32">审批结果:</span>
                      <span className="fb lh32">{headItem? searchList(customerApprovalReturnList, 'value', headItem.result).label: ''}</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={4}>
                    <div className='pr20'>
                      <span className="pr8 lh32">备注:</span>
                      <span className="fb lh32">{headItem.orderServiceCustomer? headItem.orderServiceCustomer.remark: ''}</span>
                    </div>
                  </Col>
                  
                </Row>
                {
                  headItem.result? (<Row gutter={16}>
                  <Col className="gutter-row" span={4}>
                    <div className='pr20'>
                      <span className="pr8 lh32">退款金额:</span>
                      <span className="fb lh32">{headItem.orderServiceCustomer && headItem.orderServiceCustomer.returnMoney ?(headItem.orderServiceCustomer.returnMoney / 100).toFixed(2) +'元': ''}</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={4}>
                    <div className='pr20'>
                      <span className="pr8 lh32">客服回访时间:</span>
                      <span className="fb lh32">{headItem.orderServiceCustomer?headItem.orderServiceCustomer.visitTime:''}</span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <div className='pr20'>
                      <span className="pr8 lh32">客服回访内容:</span>
                      <span className="fb lh32">{headItem.orderServiceCustomer?headItem.orderServiceCustomer.visitContent:''}</span>
                    </div>
                  </Col>
                 
                  <Col className="gutter-row" span={6}>
                    <div className='pr20'>
                      <span className="pr8 lh32">退货地址:</span>
                      <span className="fb lh32">{headItem.orderServiceCustomer?headItem.orderServiceCustomer.returnAddress:''}</span>
                    </div>
                  </Col>
                </Row>): null
                }
                
              </div>
            )
            case 3 :
              return (
                <div style={{paddingTop: '20px', paddingBottom: '20px'}}>
                  <div className="f20">{headItem.departmentName}:</div>
                  <Row gutter={16}>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">操作人:</span>
                        <span className="fb lh32">{headItem.auditEmployeeName}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">邮寄时间:</span>
                        <span className="fb lh32">{headItem.createTime}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">快递公司:</span>
                        <span className="fb lh32">{headItem.orderReturnExpress?headItem.orderReturnExpress.expressCompanyName:''}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">快递单号:</span>
                        <span className="fb lh32">{headItem.orderReturnExpress?headItem.orderReturnExpress.expressNo:''}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">备注:</span>
                        <span className="fb lh32">{headItem.orderReturnExpress?headItem.orderReturnExpress.remark:''}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">附件:</span>
                        {
                          headItem.orderReturnExpress && headItem.orderReturnExpress.attachedFile ? <a target="blank" href={headItem.orderReturnExpress.attachedFile.split(',')[0]} >点击下载</a> : <span>无</span>
                        }
                      </div>
                    </Col>
                  </Row>
                </div>
                )
              case 4 :
              return (
                <div style={{paddingTop: '20px', paddingBottom: '20px'}}>
                  <div className="f20">{headItem.departmentName}:</div>
                  <Row gutter={16}>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">审批人:</span>
                        <span className="fb lh32">{headItem.auditEmployeeName}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">审批时间:</span>
                        <span className="fb lh32">{headItem.createTime}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">审批结果:</span>
                        <span className="fb lh32">{searchList(approvalReturnList, 'value', headItem.result).label}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">退款金额:</span>
                        <span className="fb lh32">{headItem.returnMoney?(headItem.returnMoney / 100).toFixed(2) +'元':''}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">备注:</span>
                        <span className="fb lh32">{headItem.remark}</span>
                      </div>
                    </Col>
                  </Row>
                  <div className="page-wrapper-content">
                    <Table
                      size="small"
                      dataSource={newData}
                      columns={Columns.littleCustomerTableHead}
                      rowKey={record => record.key}
                      pagination={false}
                      bordered />
                  </div>
                </div>
                )
              case 5 :
              return (
                <div style={{paddingTop: '20px', paddingBottom: '20px'}}>
                  <div className="f20">{headItem.departmentName}:</div>
                  <Row gutter={16}>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">审批人:</span>
                        <span className="fb lh32">{headItem.auditEmployeeName}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">审批时间:</span>
                        <span className="fb lh32">{headItem.createTime}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">审批结果:</span>
                        <span className="fb lh32">{searchList(approvalReturnList, 'value', headItem.result).label}</span>
                      </div>
                    </Col>
                    <Col className="gutter-row" span={4}>
                      <div className='pr20'>
                        <span className="pr8 lh32">备注:</span>
                        <span className="fb lh32">{headItem.remark}</span>
                      </div>
                    </Col>
                    <div className="page-wrapper-content">
                      <Table
                        size="small"
                        dataSource={newData}
                        columns={Columns.littleLogisticsTableHead}
                        rowKey={record => record.key}
                        pagination={false}
                        bordered />
                    </div>
                  </Row>
                </div>
                )
                case 6 :
                return (
                  <div style={{paddingTop: '20px', paddingBottom: '20px'}}>
                    <div className="f20">{headItem.departmentName}:</div>
                    <Row gutter={16}>
                      <Col className="gutter-row" span={4}>
                        <div className='pr20'>
                          <span className="pr8 lh32">审批人:</span>
                          <span className="fb lh32">{headItem.auditEmployeeName}</span>
                        </div>
                      </Col>
                      <Col className="gutter-row" span={4}>
                        <div className='pr20'>
                          <span className="pr8 lh32">审批时间:</span>
                          <span className="fb lh32">{headItem.createTime}</span>
                        </div>
                      </Col>
                      <Col className="gutter-row" span={4}>
                        <div className='pr20'>
                          <span className="pr8 lh32">审批结果:</span>
                          <span className="fb lh32">{searchList(approvalReturnList, 'value', headItem.result).label}</span>
                        </div>
                      </Col>
                      <Col className="gutter-row" span={4}>
                        <div className='pr20'>
                          <span className="pr8 lh32">备注:</span>
                          <span className="fb lh32">{headItem.orderReturnFinance.remark}</span>
                        </div>
                      </Col>
                      <Col className="gutter-row" span={4}>
                        <div className='pr20'>
                          <span className="pr8 lh32">附件:</span>
                          {
                            headItem.orderReturnFinance.attachedFile? <a href={ headItem.orderReturnFinance.attachedFile.split(',')[0]} >点击下载</a> : <span>无</span>
                          }
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col className="gutter-row" span={4}>
                        <div className='pr20'>
                          <span className="pr8 lh32">退款银行:</span>
                          <span className="fb lh32">{headItem.orderReturnFinance? headItem.orderReturnFinance.bankName: ''}</span>
                        </div>
                      </Col>
                      <Col className="gutter-row" span={4}>
                        <div className='pr20'>
                          <span className="pr8 lh32">退款账号:</span>
                          <span className="fb lh32">{headItem.orderReturnFinance? headItem.orderReturnFinance.bankCardNo: ''}</span>
                        </div>
                      </Col>
                      <Col className="gutter-row" span={4}>
                        <div className='pr20'>
                          <span className="pr8 lh32">退款金额:</span>
                          <span className="fb lh32">{headItem.orderReturnFinance && headItem.orderReturnFinance.returnMoney?(headItem.orderReturnFinance.returnMoney / 100).toFixed(2) + '元':''}</span>
                        </div>
                      </Col>
                      <Col className="gutter-row" span={5}>
                        <div className='pr20'>
                          <span className="pr8 lh32">退款时间:</span>
                          <span className="fb lh32">{headItem.orderReturnFinance? headItem.orderReturnFinance.backTime: ''}</span>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  )
                default:
                return null;
              }
          
          }): null
        }
      </Panel>
    )
  }


  render() {
    const { optionList, defaultActiveKey } = this.props;
    // optionList.forEach((item) => {
    //   if (item.sign === 'search' && item.includeTable) {
    //     item.includeTable.tableHead.forEach((newItem) => {
    //       if (newItem.dataIndex === 'actions') {
    //         newItem.render = (text, record) => {
    //           return (
    //             <div>
    //                 <span>
    //                   <EditableContext.Consumer >
    //                     {form => (
    //                       <div className="cp" onClick={() => this.saveTable(form, record.key)}>保存</div>
    //                     )}
    //                   </EditableContext.Consumer>
    //                 </span>
    //             </div>
    //             )
    //         }
    //       }
    //     })
    //   }
    // })
    return (
      <div>
        <Collapse defaultActiveKey={defaultActiveKey} >
          {
            optionList.map((item) => {
              return this.renderItem(item)
            })
          }
        </Collapse>
      </div>
    )
  }
}


export default CommonCollapse;
