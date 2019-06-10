import React from 'react';
import {inject, observer} from 'mobx-react'
import { Form, Select, Icon, Button, Popconfirm } from 'antd';
import formConfig from './SpecInfoFormConfig'
import {getPermutationCombination} from "../../../../utils/public";
import ProductSpecTable from './ProductSpecTable'
import './index.less'
import helper from '../../../../utils/helper';

let productSpecId = 0;   // 货品规格批量添加起始值
let productSpecIds = [];   // 货品规格选中项数组
let productSpecSonData = [];   // 货品规格子级下拉选择项
const formItemLayoutWithOutLabel = { wrapperCol: { span: 20, offset: 4 }};

@inject('store')
@observer
class BaseForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      productSpecParentList: [],   // 货品规格表格表头(父级)动态部分数据
      productSpecSonList: [],   // 货品规格表格表头(父级)动态部分数据
      isProductSpecTable: false,   // 货品规格表格是否渲染
      isProductSpecTableTow: false,   // 货品规格表格是否渲染
      ProductSpecTableList: [],   // 表格数据
    }
  };

  setFormData = () => {
    const { form } = this.props;
    const { tableRowData, setProductSpecTableData } = this.props.store;
    this.setState({
      isProductSpecTableTow: true,
      ProductSpecTableList: tableRowData.goodsSkuList,
    })

    setProductSpecTableData(tableRowData.goodsSkuList);

    Object.keys(tableRowData).forEach(key => {
      if (formConfig.hasOwnProperty(key)) {
        const field = {};
        if (tableRowData[key] || tableRowData[key] === 0) {
          field[key] = tableRowData[key]
        }
        form.setFieldsValue(field)
      }
    });
  };

  addProductSpec = () => {   // 添加更多货品规格
    const { form } = this.props;
    const productSpecKeys = form.getFieldValue('productSpecKeys');
    const nextKeys = productSpecKeys.concat(++productSpecId);

    form.setFieldsValue({
      productSpecKeys: nextKeys,
    });
  };

  removeProductSpec = (k) => {   // 删除更多货品规格
    const { form } = this.props;
    const productSpecKeys = form.getFieldValue('productSpecKeys');

    if (productSpecKeys.length === 1) {
      return;
    }
    form.setFieldsValue({
      productSpecKeys: productSpecKeys.filter(key => key !== k),
    });
    productSpecIds.splice(k, 1)
    productSpecSonData.splice(k, 1)
  };

  productSpecParentChange = (value, option, index) => {   // 货品规格父级改变获取子级数据
    const { productSpecData } = this.props;

    if(productSpecIds.length-1 >= index) {
      productSpecIds.splice(index, 1, value);
      productSpecData.forEach((item) => {
        if(item.id === value) {
          productSpecSonData.splice(index, 1, item.goodsBaseSpuList)
        }
      })
    } else {
      productSpecIds.push(value);
      productSpecData.forEach((item) => {
        if(item.id === value) {
          productSpecSonData.push(item.goodsBaseSpuList)
        }
      })
    }
  };

  setProductSpecData = () => {   // 获取货品规格，方便生成表格
    const { productSpecData } = this.props;
    const { productSpecParentList, productSpecSonList } = this.state;
    const outputField = ['productSpecKeys', 'productSpecParent', 'productSpecSon'];
    const productSpecForm = this.props.form.getFieldsValue(outputField);

    const productSpecParentArr = [];
    const productSpecSonArr = [];
    productSpecForm.productSpecParent.forEach((item, index) => {
      if(item[0] === undefined) {
        productSpecParentArr.push(index)
      }
    });
    productSpecForm.productSpecSon.forEach((item, index) => {
      if(item[1] === undefined) {
        productSpecSonArr.push(index)
      }
    });

    if(productSpecParentArr.length || productSpecSonArr.length) {
      helper.W('货品规格不能为空');
      return;
    };

    productSpecForm.productSpecKeys.forEach(itemOne => {
      productSpecData.forEach(itemTow => {
        if(itemTow.id === productSpecForm.productSpecParent[itemOne][0]) {
          productSpecParentList.push(itemTow)
        }
        const sonArr = [];
        itemTow.goodsBaseSpuList.forEach(itemThree => {
          if(!productSpecForm.productSpecSon[itemOne][1]) {
            return;
          }
          productSpecForm.productSpecSon[itemOne][1].forEach(itemFive => {
            if(itemThree.id === itemFive) {
              sonArr.push(itemThree)
            }
          });
        })
        if(sonArr.length !== 0) {
          productSpecSonList.push(sonArr)
        }
      })
    });

    this.setState({
      isProductSpecTable: true,
      ProductSpecTableList: getPermutationCombination(productSpecSonList, 0),
    })
  };

  componentDidMount() {
    this.setFormData();
  };

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { productSpecData, 
            goodsPackingUnitData, 
            goodsLabelData } = this.props;
    const { productSpecParentList,
            isProductSpecTable,
            ProductSpecTableList,
            isProductSpecTableTow } = this.state;

    const { tableRowData } = this.props.store;
    getFieldDecorator('productSpecKeys', { initialValue: [productSpecId] });
    const productSpecKeys = getFieldValue('productSpecKeys');

    return(
      <div>
        <Form layout={formConfig.layout}>
          <div>
            <div>
              {[
                productSpecKeys.map((k, index) => {
                  return(
                    <Form.Item
                      label={index === 0 ? formConfig.productSpec.label : ''}
                      key={k} {...(index === 0 ? formConfig.formItemLayout : formItemLayoutWithOutLabel)} required>
                      <Form.Item style={{display: 'inline-block', width: productSpecKeys.length > 1 ? '45%' : '50%', marginBottom: 0}}>
                        {getFieldDecorator(`productSpecParent[${k}][0]`)(
                          <Select
                            onChange={(value, option) => this.productSpecParentChange(value, option, index)}
                            placeholder={formConfig.productSpec.ruleConfig.rules[0].message}
                            disabled={isProductSpecTable || tableRowData.isUpdate}
                            showSearch
                            allowClear
                            optionFilterProp="children">
                            {productSpecData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                          </Select>
                        )}
                      </Form.Item>
                      {productSpecIds.length > index && productSpecSonData[index] ? <Form.Item style={{'display': 'inline-block', width: productSpecKeys.length > 1 ? '45%' : '50%', marginBottom: 0}}>
                        {getFieldDecorator(`productSpecSon[${k}][1]`)(
                          <Select
                            placeholder={formConfig.productSpec.ruleConfig.rules[0].message}
                            disabled={isProductSpecTable || tableRowData.isUpdate}
                            mode="multiple"
                            showSearch
                            allowClear
                            optionFilterProp="children">
                            {productSpecSonData[index].map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
                          </Select>
                        )}
                      </Form.Item> : null}
                      {(productSpecKeys.length > 1 && !isProductSpecTable) ? (
                        <Icon style={{ marginLeft: '10px' }}
                          className="dynamic-delete-button"
                          type="minus-circle-o" disabled={productSpecKeys.length === 1}
                          onClick={() => this.removeProductSpec(k)} />
                      ) : null}
                    </Form.Item>
                  )}),
                  <Button type="dashed" onClick={this.addProductSpec} disabled={isProductSpecTable || tableRowData.isUpdate} style={{ marginLeft: '16.7%' }}>
                    <Icon type="plus" /> 增加货品规格
                  </Button>
              ]}
              <Popconfirm title="确认执行吗" placement="top" onConfirm={this.setProductSpecData}>
                {
                  isProductSpecTable || tableRowData.isUpdate 
                    ? null
                    : <Button type="primary" style={{ marginLeft: '20px' }} disabled={isProductSpecTable || tableRowData.isUpdate}>生成表格</Button>
                }
              </Popconfirm>
            </div>
            <div style={{ marginTop: '20px' }}>
              {isProductSpecTable || isProductSpecTableTow ?
                <ProductSpecTable
                  productSpecData={productSpecData}
                  isProductSpecTable={isProductSpecTable}
                  goodsLabelData={goodsLabelData}
                  productSpecParentList={productSpecParentList}
                  tableDataList={ProductSpecTableList}
                  goodsPackingUnitData={goodsPackingUnitData}/> : null}
            </div>
          </div>
        </Form>
      </div>
    )
  }
}

const ProductCategoriesForm = Form.create()(BaseForm);

export default ProductCategoriesForm;

