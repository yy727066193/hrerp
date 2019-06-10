import React from 'react'
import {inject, observer} from 'mobx-react'
import { Table, Input, Button, Divider, Popconfirm, Select, Modal, InputNumber, Form, message } from 'antd'
import './index.less'
import ExtendExhibitionForm from './extendExhibitionForm'

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
      tableData: [],   // 表格数据
      newTableData: [],   // 再次生成的表格数据
      isProductSpecTable: this.props.isProductSpecTable,   // 是否重新编辑
      rowIndex: null,   // 增加规格点击行
      setMarketRowData: {},   // 销售设置点击行内容
      setMarketIndex: null,   // 销售设置点击行
      attrModalVisible: false,   // 设置扩展属性弹框显示、隐藏
      addPackingSpecShow: false,   // 添加包装规格弹框显示隐藏

      mainImgsFileList: [],
      mainImgsFileType: '.jpg, .gif, .png',

      videosFileList: [],
      videosFileType: '.mp4, .avi, .mkv',

      detailImgsPreviewVisible: false,
      detailImgsPreviewImage: '',
      detailImgsFileList: [],
    };
  };

  renderTypeName = (text, record, index, i, bol) => {
    if(!bol) {
      return(
        <span>{text[i].name}</span>
      )
    } else {
      return(
        <span>{text.goodsBaseSpuList[i].name}</span>
      )
    }
  };

  handleCargoNoChange(text, record, index, e) {   // 货品编号改变
    const { tableData, newTableData } = this.state;
    const { setProductSpecTableData } = this.props.store;
    const tableDataArr = newTableData.length ? newTableData : tableData;
    
    tableDataArr[index]['k3No'] = e.target.value;

    if(newTableData.length) {
      this.setState({newTableData: tableDataArr}, () => {
        setProductSpecTableData(tableDataArr)
      });
    } else {
      this.setState({tableData: tableDataArr}, () => {
        setProductSpecTableData(tableDataArr)
      });
    }
  };

  handleBarCodeChange(text, record, index, e) {   // 条形码改变
    const { tableData, newTableData } = this.state;
    const { setProductSpecTableData } = this.props.store;
    const tableDataArr = newTableData.length ? newTableData : tableData;
    
    tableDataArr[index]['barcode'] = e.target.value;

    if(newTableData.length) {
      this.setState({newTableData: tableDataArr}, () => {
        setProductSpecTableData(tableDataArr)
      });
    } else {
      this.setState({tableData: tableDataArr}, () => {
        setProductSpecTableData(tableDataArr)
      });
    }
  };

  addPackingSpec = (text, record, index) => {   // 添加包装规格
    const { tableData, newTableData } = this.state;
    const { tableRowData } = this.props.store;
    const tableDataArr = newTableData.length ? newTableData : tableData;

    return(
      <span>
        {
          <span>
            {
              tableDataArr[index]['goodsPackingUnitList'] ? 
              tableDataArr[index]['goodsPackingUnitList'].map(item => {
                return(
                  <div>
                    { item.num ? item.num : item.packingSpecNum } 
                    { item.name ? item.name : item.packingSpecUnit ? item.packingSpecUnit.name : '' } 
                  </div>
                )
              }) : null
            }
            <Button size="small" disabled={tableRowData.isUpdate} onClick={this.showModal.bind(this, text, record, index)}>增加规格</Button>
          </span>
        }
      </span>
    )
  };

  showModal(text, record, index, e) {   // 添加规格弹框显示
    this.setState({addPackingSpecShow: true, rowIndex: index})
  };

  handleSubmitAdd = (e) => {
    e.preventDefault();
    
    this.props.form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const { tableData, newTableData, rowIndex } = this.state;
      const { setProductSpecTableData } = this.props.store;
      const { goodsPackingUnitData } = this.props;
      const tableDataArr = newTableData.length ? newTableData : tableData;

      goodsPackingUnitData.forEach(item => {
        if(formData.packingSpec === item.id) {
          if(tableDataArr[rowIndex]['goodsPackingUnitList']) {
            item.num = formData.packingSpecNum;
            tableDataArr[rowIndex]['goodsPackingUnitList'].push(item)
          } else {
            item.num = formData.packingSpecNum;
            tableDataArr[rowIndex]['goodsPackingUnitList'] = [{...item}]
          }
        }
      })

      this.setState({rowIndex: null, addPackingSpecShow: false});
      if(newTableData.length) {
        this.setState({newTableData: tableDataArr}, () => {
          setProductSpecTableData(tableDataArr)
        });
      } else {
        this.setState({tableData: tableDataArr}, () => {
          setProductSpecTableData(tableDataArr)
        });
      }
    })
  };

  setMarket = (text, record, index) => {
    this.setState({
      setMarketRowData: record,
      setMarketIndex: index,
      attrModalVisible: true,
    })
  };

  handleSubmitAddAttr = (e) => {
    const { goodsLabelData } = this.props;
    const { setProductSpecTableData } = this.props.store;
    const { tableData, newTableData, setMarketIndex } = this.state;
    const { mainImgsFileList, videosFileList, detailImgsFileList } = this.extendExhibitionFormUrl.wrappedInstance.state;
    const tableDataArr = newTableData.length ? newTableData : tableData;
    
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
        volume : formData.volume ? formData.volume : null,
        heavyUnit,
        volumeUnit,
        expirationDate: formData.expirationDate,
        createArea: formData.createArea ? formData.createArea : null      
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

      tableDataArr[setMarketIndex]['goodsExtendedAttribute'] = goodsExtendedAttribute;
      tableDataArr[setMarketIndex]['goodsPresentation'] = goodsPresentation;
      tableDataArr[setMarketIndex]['goodsKeywordsList'] = goodsKeywordsListData;

      setProductSpecTableData(tableDataArr)
    })

    this.setState({ attrModalVisible: false })
  };

  hlandDeleteSpec = (text, record, index) => {   // 删除
    const { tableData, newTableData } = this.state;
    const { setProductSpecTableData } = this.props.store;
    if(newTableData.length) {
      if(newTableData.length < 2) {
        message.warning('无法全部删除！')
        return;
      }
      newTableData.splice(index, 1);
      this.setState({
        newTableData
      }, () => {setProductSpecTableData(this.state.newTableData)})
    } else {
      if(tableData.length < 2) {
        message.warning('无法全部删除！')
        return;
      }
      tableData.splice(index, 1);
      this.setState({
        tableData
      }, () => {setProductSpecTableData(this.state.tableData)})
    }
  };

  getParentName = (val, bol) => {
    const { productSpecData } = this.props;
    let objName;
    if(bol) {
      productSpecData.forEach(item => {
        if(item.id === val.parentId) {
          objName = item.name;
        }
      })
    } else {
      objName = val.name
    }
    return objName;
  };

  componentDidMount() {
    const { tableDataList } = this.props;
    this.setState({
      tableData: JSON.parse(JSON.stringify(tableDataList))
    })
  };

  componentWillReceiveProps(nextProps) {
    const { tableDataList, isProductSpecTable } = nextProps;
    const { newTableData } = this.state;

    if(isProductSpecTable && !newTableData.length) {
      this.setState({
        newTableData: JSON.parse(JSON.stringify(tableDataList))
      })
    }
  };

  render() {
    const { tableData, newTableData, attrModalVisible, addPackingSpecShow, setMarketRowData} = this.state;
    const { productSpecParentList, goodsPackingUnitData, goodsLabelData } = this.props;
    const { loading, tableRowData } = this.props.store;
    const { getFieldDecorator } = this.props.form;
    const tableDataArr = newTableData.length ? newTableData : tableData;
    
    return(
      <div className="page-wrapper-content">
        <Table 
          dataSource={tableDataArr}
          rowKey={record => JSON.parse(JSON.stringify(record))}
          bordered
          pagination={false} >
          {
            productSpecParentList.length ? productSpecParentList.map((item, i) => {
              return(<Column title={this.getParentName(item, false)} render={(text, record, index) => this.renderTypeName(text, record, index, i, false)}/>)
            }) : tableDataArr.length ? tableDataArr[0].goodsBaseSpuList.map((item, i) => {
              return(<Column title={this.getParentName(item, true)} render={(text, record, index) => this.renderTypeName(text, record, index, i, true)}/>)
            }) : ''
          }
          <Column
            title="货品编码"
            dataIndex="k3No"
            key="k3No"
            render = {(text, record, index) =>  <span><Input 
                                                        disabled={tableRowData.isUpdate}
                                                        size="small" 
                                                        defaultValue={record.k3No ? record.k3No : ''}
                                                        onPressEnter={this.handleCargoNoChange.bind(this, text, record, index)}
                                                        onBlur={this.handleCargoNoChange.bind(this, text, record, index)}/></span>}
          />
          <Column
            title="条形码"
            dataIndex="barcode"
            key="barcode"
            render = {(text, record, index) =>  <span><Input 
                                                        disabled={tableRowData.isUpdate}
                                                        size="small"
                                                        defaultValue={record.barcode ? record.barcode : ''}
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
            key="action"
            render={(text, record, index) => (
              <span className="root-item-table-action-wrapper">
                <Button size="small" type="primary" onClick={() => {this.setMarket(text, record, index)}}>销售设置</Button>
                {
                  tableRowData.isUpdate 
                    ? null
                    : [ <Divider type="vertical" />,
                        <Popconfirm title="确认执行吗" placement="top" onConfirm={() => this.hlandDeleteSpec(text, record, index)}>
                          <Button size="small">删除</Button>
                        </Popconfirm> ]
                }
              </span>
            )}
          />
        </Table>

        <Modal title="新增包装规格"
               confirmLoading={loading}
               onCancel={() => {this.setState({addPackingSpecShow: false})}}
               onOk={this.handleSubmitAdd}
               destroyOnClose
               visible={addPackingSpecShow}>
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