import React from 'react'
import {inject, observer} from 'mobx-react'
import { Table, Input, Button, Divider, Popconfirm, Select, Modal, InputNumber, Form } from 'antd'
import './index.less'
import ExtendExhibitionForm from './extendExhibitionForm'
import helper from '../../../utils/helper';

const { Column } = Table;
const formConfigSpec = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  },
  packingSpecNum: {
    key: 'packingSpecNum',
    label: '包装规格数量',
    ruleConfig: {
      initialValue: 1,
      rules: [{ required: true, message: '请输入包装规格数量' }]
    }
  },
  packingSpec: {
    key: 'packingSpec',
    label: '包装规格',
    ruleConfig: {
      rules: [{ required: true, message: '请选择包装规格' }]
    }
  },
}

let heavyUnit = 'kg/件';   // 体重单位
let volumeUnit = 'm³/件';   // 体积单位

@inject('store')
@observer
class ProductSpecTable extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      cargoNoList: [],   // 货品编码
      barCodeList: [],   // 条形码
      tableData: this.props.tableDataList,   // 表格数据
      rowIndex: null,   // 增加规格点击行
      setMarketRowData: {},   // 销售设置点击行内容
      setMarketIndex: null,   // 销售设置点击行
      attrModalVisible: false,   // 设置扩展属性弹框显示、隐藏
      isDelete: false,   // 表格数据是否可以删除

      mainImgsFileList: [],
      mainImgsFileType: '.jpg, .gif, .png',

      videosFileList: [],
      videosFileType: '.mp4, .avi, .mkv',

      detailImgsPreviewVisible: false,
      detailImgsPreviewImage: '',
      detailImgsFileList: [],
    };
  };

  renderTypeName = (text, record, index, i) => {
    return(
      <span>{text[i] ? text[i].name : ''}</span>
    )
  };

  handleCargoNoChange(text, record, index, e) {   // 货品编号改变
    const { tableData } = this.state;
    
    tableData[index]['k3No'] = e.target.value;

    const { setProductSpecTableData } = this.props.store;
    setProductSpecTableData(this.state.tableData)
  };

  handleBarCodeChange(text, record, index, e) {   // 条形码改变
    const { tableData } = this.state;
    
    tableData[index]['barcode'] = e.target.value;

    const { setProductSpecTableData } = this.props.store;
    setProductSpecTableData(this.state.tableData)
  };

  addPackingSpec = (text, record, index) => {   // 添加包装规格
    const { tableData } = this.state;
    return(
      <span>
        {
          tableData[index]['goodsPackingUnitList'] ? 
          tableData[index]['goodsPackingUnitList'].map(item => {
            return(
              <div>
                { item.packingSpecNum || item.packingSpecNum === 0 ? item.packingSpecNum : 0 } 
                { item.packingSpecUnit.name } 
              </div>
            )
          }) : null
        }
        <Button size="small" onClick={this.showModal.bind(this, text, record, index)}>增加规格</Button>
      </span>
    )
  };

  showModal(text, record, index, e) {   // 添加规格弹框显示
    const { setCommon } = this.props.store;
    setCommon('modalVisible', true);
    this.setState({
      rowIndex: index
    })
  };

  handleSubmitAdd = (e) => {
    const { tableData, rowIndex } = this.state;
    const { setCommon, setProductSpecTableData } = this.props.store;
    const { goodsPackingUnitData } = this.props;
    e.preventDefault();
    this.props.form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      goodsPackingUnitData.forEach(item => {
        if(formData.packingSpec === item.id) {
          formData.packingSpecUnit = JSON.parse(JSON.stringify(item));
          formData.packingSpecUnit.num = formData.packingSpecNum;
        }
      })
      if(tableData[rowIndex]['goodsPackingUnitList']) {
        tableData[rowIndex]['goodsPackingUnitList'].push(formData)
      } else {
        tableData[rowIndex]['goodsPackingUnitList'] = [{...formData}]
      }
      setCommon('modalVisible', false);

      setProductSpecTableData(this.state.tableData);
    })
  };

  setMarket = (text, record, index) => {
    this.setState({
      setMarketRowData: record,
      setMarketIndex: index,
      attrModalVisible: true,
    }, () => {
      const { isProductSpecTable } = this.state;
      if(isProductSpecTable) {
        this.setFormData(index);
      }
    })
  };

  setFormData = (index) => {
    const { mainImgsFileList, videosFileList, detailImgsFileList, tableData } = this.state;
    const tableRowData = tableData[index];
    const goodsKeywordsData = this.props.store.tableRowData.goodsKeywordsList;

    const goodsKeywordsDataArr = [];
    if(goodsKeywordsData.length) {
      goodsKeywordsData.forEach(item => {
        goodsKeywordsDataArr.push(item.id)
      })
    }
    tableRowData['shortName'] = tableRowData.goodsExtendedAttribute.shortName;
    tableRowData['helpCode'] = tableRowData.goodsExtendedAttribute.helpCode;
    tableRowData['marketPrice'] = tableRowData.goodsExtendedAttribute.marketPrice / 100;
    tableRowData['costPrice'] = tableRowData.goodsExtendedAttribute.costPrice / 100;
    tableRowData['heavy'] = tableRowData.goodsExtendedAttribute.heavy;
    tableRowData['volume'] = tableRowData.goodsExtendedAttribute.volume;
    tableRowData['expirationDateUnit'] = 3;   // 编辑保质期默认为天
    tableRowData['goodsKeywordsList'] = goodsKeywordsDataArr;
    tableRowData['createArea'] = tableRowData.goodsExtendedAttribute.createArea;
    tableRowData['sortId'] = tableRowData.goodsPresentation.sortId;
    tableRowData['description'] = tableRowData.goodsPresentation.description;
    
    if(tableRowData.goodsPresentation.mainImgs) {
      tableRowData.goodsPresentation.mainImgs.split(',').forEach((item, index) => {
        mainImgsFileList.push({
          uid: 'mainImgsFileList' + index,
          name: 'mainImgsFileList' + index,
          status: 'done',
          url: item
        })
      })
    };

    if(tableRowData.goodsPresentation.detailImgs) {
      tableRowData.goodsPresentation.detailImgs.split(',').forEach((item, index) => {
        detailImgsFileList.push({
          uid: 'detailImgsFileList' + index,
          name: 'detailImgsFileList' + index,
          status: 'done',
          url: item
        })
      })
    };

    if(tableRowData.goodsPresentation.videos) {
      tableRowData.goodsPresentation.videos.split(',').forEach((item, index) => {
        videosFileList.push({
          uid: 'videosFileList' + index,
          name: 'videosFileList' + index,
          status: 'done',
          url: item
        })
      })
    };
  };

  handleSubmitAddAttr = (e) => {
    const { goodsLabelData } = this.props;
    const { setProductSpecTableData } = this.props.store;
    const { tableData, setMarketIndex } = this.state;
    const { mainImgsFileList, videosFileList, detailImgsFileList } = this.extendExhibitionFormUrl.wrappedInstance.state;
    
    e.preventDefault();
    this.extendExhibitionForm.validateFields((err, formData) => {
      if (err) {
        return;
      }
      
      if(formData.expirationDate && formData.expirationDateUnit) {
        if(formData.expirationDateUnit === 1) {
          formData.expirationDate = formData.expirationDate * 365
        } else if (formData.expirationDateUnit === 2) {
          formData.expirationDate = formData.expirationDate * 30
        }
      }
      const goodsKeywordsListData = [];
      if(formData.goodsKeywordsList) {
        goodsLabelData.forEach(itemOne => {
          formData.goodsKeywordsList.forEach(itemTow => {
            if(itemOne.id === itemTow) {
              goodsKeywordsListData.push(itemOne)
            }
          })
        })
      }
      const goodsExtendedAttribute = {
        shortName: formData.shortName ? formData.shortName : null,
        helpCode: formData.helpCode ? formData.helpCode : null,
        marketPrice: formData.marketPrice ? formData.marketPrice * 100 : null,
        costPrice: formData.costPrice ? formData.costPrice * 100 : null,
        heavy: formData.heavy ? formData.heavy : null,
        longth: formData.longth ? formData.longth : null,
        width: formData.width ? formData.width : null,
        height: formData.height ? formData.height : null,
        volume: formData.volume ? formData.volume.toFixed(2) : null,
        heavyUnit,
        volumeUnit,
        expirationDate: formData.expirationDate,
        createArea: formData.createArea ? formData.createArea : null,
        goodsKeywordsListData       
      }

      const mainImgsFileListArr = [];
      if(mainImgsFileList) {
        mainImgsFileList.forEach(item => {
          if(item.response) {
            mainImgsFileListArr.push(item.response.data)
          } else {
            mainImgsFileListArr.push(item.url)
          }
        })
      }
      const videosFileListArr = [];
      if(videosFileList) {
        videosFileList.forEach(item => {
          if(item.response) {
            videosFileListArr.push(item.response.data)
          } else {
            videosFileListArr.push(item.url)
          }
        })
      }
      const detailImgsFileListArr = [];
      if(detailImgsFileList) {
        detailImgsFileList.forEach(item => {
          if(item.response) {
            detailImgsFileListArr.push(item.response.data)
          } else {
            detailImgsFileListArr.push(item.url)
          }
        })
      }
      
      const goodsPresentation = {
        sortId: formData.sortId ? formData.sortId : null,
        mainImgs: mainImgsFileListArr.join(','),
        videos: videosFileListArr.join(','),
        detailImgs: detailImgsFileListArr.join(','),
        description: formData.description ? formData.description : null
      }

      tableData[setMarketIndex]['goodsExtendedAttribute'] = goodsExtendedAttribute;
      tableData[setMarketIndex]['goodsPresentation'] = goodsPresentation;
      tableData[setMarketIndex]['goodsKeywordsList'] = goodsKeywordsListData;

      setProductSpecTableData(this.state.tableData)
    })

    this.setState({
      attrModalVisible: false,
    })
  };

  hlandDeleteSpec = (text, record, index) => {   // 删除
    const { tableData } = this.state;
    const { setProductSpecTableData } = this.props.store;
    
    if(tableData.length < 2) {
      helper.W('无法全部删除！')
      return;
    }

    tableData.splice(index, 1);

    console.log(index, tableData)
    
    this.setState({
      tableData
    }, () => { setProductSpecTableData(this.state.tableData) })
  };

  render() {
    const { tableData, attrModalVisible, setMarketRowData} = this.state;
    const { productSpecParentList, goodsPackingUnitData, goodsLabelData } = this.props;
    const { loading, modalVisible, setCommon } = this.props.store;
    const { getFieldDecorator } = this.props.form;

    return(
      <div className="page-wrapper-content">
        <Table 
          dataSource={tableData}
          rowKey={record => JSON.parse(JSON.stringify(record))}
          bordered
          pagination={false} >
          {productSpecParentList.map((item, i) => {
            return(
              <Column title={item.name} render={(text, record, index) => this.renderTypeName(text, record, index, i)}/>
            )
          })}
          <Column
            title="货品编码"
            dataIndex="k3No"
            key="k3No"
            render = {(text, record, index) =>  <span><Input 
                                                        size="small" 
                                                        onPressEnter={this.handleCargoNoChange.bind(this, text, record, index)}
                                                        onBlur={this.handleCargoNoChange.bind(this, text, record, index)}/></span>}
          />
          <Column
            title="条形码"
            dataIndex="barcode"
            key="barcode"
            render = {(text, record, index) =>  <span><Input 
                                                        size="small"
                                                        onPressEnter={this.handleBarCodeChange.bind(this, text, record, index)}
                                                        onBlur={this.handleBarCodeChange.bind(this, text, record, index)}/></span>}
          />
          <Column
            title="包装规格"
            dataIndex="packingSpec"
            key="packingSpec"
            render = {(text, record, index) => this.addPackingSpec(text, record, index)}
          />
          <Column
            title="操作"
            dataIndex="action"
            render={(text, record, index) => (
              <span className="root-item-table-action-wrapper">
                <Button size="small" type="primary" onClick={() => {this.setMarket(text, record, index)}}>销售设置</Button>
                <Divider type="vertical" />
                <Popconfirm title="确认执行吗" placement="top" onConfirm={() => this.hlandDeleteSpec(text, record, index)}>
                  <Button size="small">删除</Button>
                </Popconfirm>
              </span>
            )}
          />
        </Table>

        <Modal title="新增包装规格"
               confirmLoading={loading}
               onCancel={() => {setCommon('modalVisible', false)}}
               onOk={this.handleSubmitAdd}
               destroyOnClose
               visible={modalVisible}>
          <Form layout={formConfigSpec.layout}>
            <Form.Item label={formConfigSpec.packingSpec.label} {...formConfigSpec.formItemLayout}>
              <Form.Item style={{ width: '50%', 'display': 'inline-block', marginBottom: 0 }}>   
                {getFieldDecorator(formConfigSpec.packingSpecNum.key, formConfigSpec.packingSpecNum.ruleConfig)(
                  <InputNumber min={1} style={{ width: '100%' }}/>
                )}
              </Form.Item>
              <Form.Item style={{ width: '50%', 'display': 'inline-block', marginBottom: 0 }}>
                {getFieldDecorator(formConfigSpec.packingSpec.key, formConfigSpec.packingSpec.ruleConfig)(
                  <Select
                    showSearch
                    allowClear
                    optionFilterProp="children">
                    {goodsPackingUnitData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                  </Select>
                )}
              </Form.Item>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="销售设置"
          width='1000px'
          confirmLoading={loading}
          onCancel={() => {this.setState({setMarketRowData: {}, attrModalVisible: false })}}
          onOk={this.handleSubmitAddAttr}
          destroyOnClose
          visible={attrModalVisible}>
            <ExtendExhibitionForm ref={el => this.extendExhibitionForm = el} 
                                  setMarketRowData={setMarketRowData}
                                  goodsLabelData={goodsLabelData}
                                  wrappedComponentRef={el => this.extendExhibitionFormUrl = el} />
        </Modal>
      </div>
    )
  }
};

const ProductSpecTableForm = Form.create()(ProductSpecTable);

export default ProductSpecTableForm;