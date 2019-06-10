import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import './index.less';
import { Bread, SearchForm, Components, EditableContext}  from '../../../components/index';
import { Table, Divider, Popconfirm, Icon, Button} from 'antd';
import ReturnInputForm from './ReturnInputForm';
import Columns from './columnConfig';
import { setAction, getLoginInfo } from "../../../utils/public";
import { inject, observer } from 'mobx-react';
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";
import helper from '../../../utils/helper';
import CommonCollapse from './commonCollapse';
import moment from 'moment';

const breadCrumbList = ['商品订单列表', '新增退货单'];
const PATH = 'AddNewReturnOrder';
const { returnResult, returnMethod } = window.globalConfig
const STATIC_TABLE_ROW = {key: 0, goodsCode: '', goodsName: '', size: '', unit: '', shelfNum: '', num: '', batch: '', time: '', remark: ''};
const searchData = [
  {title: '申请门店名称', dataIndex: 'storeName', formType: 'input', disabled: true},
  {title: '创建人', dataIndex: 'createMan', formType: 'input', required: true, disabled: true},
  {title: '关联订单编号', dataIndex: 'relvantionOrder', formType: 'input', required: true, disabled: true},
  {title: '关联销售出库单编号', dataIndex: 'relvantionSaleOrder', formType: 'input', required: true,  disabled: true },
];

let returnSearchData = [
  {title: '退货结果', dataIndex: 'result', formType: 'select', required: true, options: returnResult, bindChange: true},
  {title: '下一审批步骤', dataIndex: 'SingalNum', formType: 'input', disabled: true},
  {title: '退回公司', dataIndex: 'returnCompany', formType: 'input', disabled: true},
  {title: '备注', dataIndex: 'remark', formType: 'input'},
]

// const fontList = [
//   {title: '促销类型', value: 1, itemSpan: 4},
//   {title: '促销名称', value: 123, itemSpan: 4},
//   {title: '促销详情', value: 42, itemSpan: 4}
// ];

@inject('store')
@observer
class AddNewReturnOrder extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: [STATIC_TABLE_ROW],
      item: {},
      tableDataList: [],
      tableRowData: {}, 
      submitLoading: false, // 提交按钮是否loading状态
      countPrice: 0, // 抹零金额
      total: 0, // 退款积分
      returnMoney: 0, // 退款金额
      userMessage: {}, // 门店用户信息
      totalMessage: {}, // 查询到的详情所有信息
      defaultMoney: '', // input框默认金额 等于计算出来的金额
      nextDept: {}, // 下一审批部门
      optionList: [
        // {key: 1, title: '促销信息', sign: 'font', fontList},
        // {key: 4, title: '赠品信息', sign: 'table', tableHead: Columns.disCountTableHead, dataSource: []},
        {key: 2, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: []},
        {key: 3, title: '退货信息', sign: 'search', searchData: returnSearchData},     
      ],
    }
    this.index = 0;
  }
                                                                   
  isEditing = record => record.key === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: '' });
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      if (row.returnMoney > row.goodsNum) {
        row.returnMoney = row.goodsNum;
        helper.W('退货数不能大于可退数量');
        return;
      }
      row['subtotal'] = (row.returnMoney * row.unitPrice).toFixed(2);
      row['returnIntegral'] = row.returnIntegral * row.goodsNum;
      const newData = [...this.state.data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        this.setState({ data: newData, editingKey: '' });
      } else {
        newData.push(row);
        this.setState({ data: newData, editingKey: '' });
      }
      let total = 0;
      let returnMoney = 0;
      newData.forEach((item) => {
        total += Number(item.returnIntegral);
        returnMoney += Number(item.subtotal);
      });
      this.formDom.props.form.setFieldsValue({
        resultMoney: returnMoney
      })
      this.setState({
        total: Number(total),
        returnMoney: Number(returnMoney).toFixed(2)
      })
    });
  }

  edit(key) {
    this.setState({ editingKey: key });
  }

  addLineData(record) {
    const data = this.state.data;
    const obj = {};
    for(const key in STATIC_TABLE_ROW) {
      obj[key] = STATIC_TABLE_ROW[key];
    }
    obj.key = ++ this.index;
    data.push(obj);
    this.setState({
      data
    });
  }

  deleteLineData(record) {
    const data = this.state.data;
    data.forEach((item, index) => {
      if (record.key === item.key && data.length > 1) {
        data.splice(index, 1);
      }
    })
    let total = 0;
    let returnMoney = 0;
    data.forEach((item) => {
      total += Number(item.returnIntegral);
      returnMoney += Number(item.subtotal);
    });
    this.formDom.props.form.setFieldsValue({
      resultMoney: returnMoney.toFixed(2)
    })
    
    this.setState({
      data,
      total: Number(total),
      returnMoney: Number(returnMoney).toFixed(2)
    });
  }

  render() {
    const { optionList, returnMoney, total, submitLoading, countPrice } = this.state;
    const newColumns = Columns.operationTableHead.map((col) => {
      if (col.dataIndex === 'addAndDelete') {
        col.render = (text, record) => {
            return (
              <div>
                <span className="cursorPointer" onClick={() => this.deleteLineData(record)}><Icon type="minus" /></span>
              </div>
            );
          }
      }
      if (col.dataIndex === 'operation') {
        col.render = (text, record) => {
          const editable = this.isEditing(record);
          return (
            <div>
                {editable ? (
                  <span>
                    <EditableContext.Consumer>
                      {form => (
                        <span
                          className="cursorPointer"
                          onClick={() => this.save(form, record.key)}
                          style={{fontSize:10}}
                        >
                          保存
                        </span>
                      )}
                    </EditableContext.Consumer>
                    <Divider type="vertical" />
                    <Popconfirm
                      title="是否取消操作?"
                      onConfirm={() => this.cancel(record.key)}
                    >
                      <span className="cursorPointer" style={{fontSize: 10}}>取消</span>
                    </Popconfirm>
                  </span>
                ) : (
                  <span className="cursorPointer" onClick={() => this.edit(record.key)}>编辑</span>
                )}
              </div>
  
          );
        }
      }
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.type,
          dataIndex: col.dataIndex,
          title: col.title,
          required: col.required,
          canChange: col.canChange,
          disabled: col.disabled,
          editing: this.isEditing(record)
        }),
      };
    });
    return (
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={breadCrumbList} history={this.props.history} routerList={['GoodsOrderList']} />
          <Button type="primary" onClick={() => this.handleSubmit()} loading={submitLoading} className="fr">提交</Button>
        </div>
        <div className="page-wrapper-search">
          <SearchForm 
            formList={searchData}
            ref={el => this.searchForm = el}
            showSearch={setAction(PATH, 'search')}
            >
          </SearchForm>
        </div>
        <div className="addPage-return">
          <Table
            components={Components}
            bordered
            dataSource={this.state.data}
            columns={newColumns}
            rowClassName="editable-row"
            pagination={false}
          />
          <div className="mt15">
            <span>退款金额：<span className="dangerColor">{returnMoney}</span></span>
            <span className="ml_8">扣减积分：<span className="dangerColor">{total}</span></span>
            <span className="ml_8">抹零金额: <span className="dangerColor">{countPrice}</span></span>
          </div>
          <ReturnInputForm wrappedComponentRef={el => this.formDom = el} />
        </div>
        
        <div className="mt15">
          <CommonCollapse  defaultActiveKey='3' ref={el => this.collDom = el} onSelect={(item, val) => this.selectReturnWay(item, val)} optionList={optionList} />
				</div>
      </div>
    )
  }

  componentDidMount() {
    const state = this.props.location.state;
    if (!state) {
      this.props.history.push(`/GoodsOrderList`);
      return;
    }
    if(this.props.location.state.showLog) {
      this.setState({
        optionList: [
          // {key: 1, title: '促销信息', sign: 'font', fontList},
          // {key: 4, title: '赠品信息', sign: 'table', tableHead: Columns.disCountTableHead, dataSource: []},
          {key: 2, title: '订单会员信息', sign: 'table', tableHead: Columns.memberTableHead, dataSource: []},
          {key: 5, title: '操作日志', sign: 'doubleFont'},
          {key: 3, title: '退货信息', sign: 'search', searchData: returnSearchData}
        ],
      })
    }
    this.getReturnGoodsList();
    this.getNextApprovaler();
  }

  async getNextApprovaler() {
    const { code, data } = await GoodsCenterService.OrderManagement.getNextApprovalMan({
      flowId: 0
    });
    if (code !== SUCCESS_CODE) return;
    if (this.collDom.wrappedInstance.searchForm){
      const returnSearchData = this.collDom.wrappedInstance.searchForm;
      returnSearchData.initFormData({
        SingalNum: data.name,
        returnCompany: getLoginInfo().companyInfo.name,
        result: 2
      })
    }
    this.setState({
      nextDept: data
    })
  }

  async getReturnGoodsList() {
    const { orderNo } = this.props.location.state;
    const { code, data } = await GoodsCenterService.OrderManagement.getReturnGoodsByOrderNum({
      orderNo: orderNo
    });
    if (code !== SUCCESS_CODE) return;
    const list = [];
    data.orderDetailList.forEach((item, index) => {
        list.push({
          key: index,
          orderNo: item.orderNo,
          goodsHrNo: item.goodsHrNo,
          goodsName: item.goodsName,
          goodsNum: item.goodsNum,
          priceUnitName: item.priceUnitName,
          returnMoney: item.goodsNum,
          unitIntegral: item.returnIntegral,
          unitPrice: (item.unitPrice / 100).toFixed(2),
          subtotal: ((item.goodsNum * item.unitPrice) / 100).toFixed(2),
          returnIntegral: item.returnIntegral * item.goodsNum,
          goodsGenre: item.goodsGenre // 商品还是套餐
        });
    });
    this.searchForm.initFormData({
      relvantionSaleOrder: data.leaveWarehouseNo,
      storeName: data.storeName,
      createMan: data.createEmployeeName,
      relvantionOrder: data.orderNo
    });
   
   
    this.state.optionList.forEach((item) => {
      if (item.key === 2) {
        if(data.userVo) {
          data.userVo.key = 1;
          item.dataSource.push(data.userVo)
        }
        
      }
    })
    
    this.setState({
      data: list,
      totalMessage: data,
      total: data.totalReturnIntegral,
      countPrice: (data.wipePrice/ 100).toFixed(2) ,
      returnMoney: (data.totalAmount / 100).toFixed(2),
      userMessage: data.userVo
    }, () => {
      this.formDom.props.form.setFieldsValue({
        resultMoney: this.state.returnMoney
      })
    })
  }

  selectReturnWay(item, val) {
    if (val === 2) {
      returnSearchData = [
        {title: '退货结果', dataIndex: 'result', formType: 'select', required: true, options: returnResult, bindChange: true},
        {title: '下一审批步骤', dataIndex: 'SingalNum', formType: 'input', disabled: true},
        {title: '退回公司', dataIndex: 'returnCompany', formType: 'input', disabled: true,},
        {title: '备注', dataIndex: 'remark', formType: 'input'},
      ];
      const returnFormData = this.collDom.wrappedInstance.searchForm;
      const { nextDept } = this.state;
      setTimeout(() => {
        returnFormData.initFormData({
          SingalNum: nextDept.name,
          returnCompany: getLoginInfo().companyInfo.name,
          result: 2
        })
      }, 0)
      
    } else if (val === 1) {
      returnSearchData = [
        {title: '退货结果', dataIndex: 'result', formType: 'select', required: true, options: returnResult, bindChange: true},
        {title: '退款方式', dataIndex: 'returnWay', formType: 'select', required: true, options: returnMethod},
        {title: '退款时间', dataIndex: 'createTime', formType: 'date', notSelectBeforeDate: true},
        {title: '备注', dataIndex: 'remark', formType: 'input'},
      ];
    }
    this.state.optionList.forEach((item) => {
      if (item.key === 3) {
        item.searchData = returnSearchData;
      }
    })
    this.setState({})
  }

  handleSubmit() {
    const { data, totalMessage, total, nextDept } = this.state;
    const formData = this.formDom.props.form.getFieldsValue();
    const { employee } = getLoginInfo();
    const { storeId, storeName, companyId, customerId, customerName, leaveWarehouseNo, orderNo, areaId } = totalMessage;
    
    if (this.collDom.wrappedInstance.searchForm){
      const returnSearchData = this.collDom.wrappedInstance.searchForm;
      const returnFormData = returnSearchData.getFormData(); // 退货信息表单数据
      const bool = returnSearchData.validateFormValues();
      const headSearchValidateBool = this.searchForm.validateFormValues();
      const formDom = this.formDom.props.form.getFieldsValue();
      if (!bool && !headSearchValidateBool && formDom.resultMoney ) { // true为验证不通过
        const orderReturnsInfoList = [];
        data.forEach((item) => {
          orderReturnsInfoList.push({
            returnNum: item.returnMoney,
            orderNo: item.orderNo,
            goodsHrNo: item.goodsHrNo,
            countPrice: item.subtotal * 100,
            countIntegral: item.returnIntegral,
            mountPrice: item.subtotal * 100,
            unitPrice: item.unitPrice * 100,
            remark: item.remark,
            priceUnitName: item.priceUnitName,
            priceUnitId: item.priceUnitId,
            goodsName: item.goodsName,
            goodsNum: item.goodsNum,
            goodsGenre: item.goodsGenre
          })
        })
        const params = {
            typeId: returnFormData.result,
            storeId:storeId,
            storeName:storeName,
            companyId:companyId,
            orderBaseNo:orderNo,
            createEId: employee.id,
            createEName: employee.name,
            customerId: customerId,
            customerName:customerName,
            leaveWarehouseNo:leaveWarehouseNo,
            returnTotalPrice: formData.resultMoney * 100,
            returnTotalIntegral: total,
            nextDepartmentId: nextDept.flowId,
            nextDepartmentName: nextDept.name,
            returnMoneyDate: returnFormData.createTime? moment(returnFormData.createTime).format('YYYY-MM-DD 00:00:00'): null,
            returnMoneyWay: returnFormData.returnWay? returnFormData.returnWay : '',
            orderTypeId: returnFormData.result,
            remark:returnFormData.remark,
            areaId,
            orderReturnsInfoList
        }
        this.submitMessageReturnGoods(params);
      }
    }
  }

  async submitMessageReturnGoods(params) {
    this.setState({
      submitLoading: true
    })
    const { code, msg } = await GoodsCenterService.OrderManagement.submitReturnMessage(params);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      this.setState({
        submitLoading: false
      })
      return;
    }
    this.setState({
      submitLoading: false
    })
    this.props.history.push('ReturnOrderList');
  }

}

export default AddNewReturnOrder;