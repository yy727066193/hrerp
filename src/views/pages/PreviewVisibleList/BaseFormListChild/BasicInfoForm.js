import React from 'react';
import {inject, observer} from 'mobx-react'
import { Form, Input, Cascader, Select, Upload, Modal, Icon } from 'antd';
import { searchList } from '../../../../utils/public'
import formConfig from './BasicInfoFormConfig'
import api from '../../../../service/api'
import helper from '../../../../utils/helper';
import { IMG_SIZE } from '../../../../conf/index';
import './index.less'

const generateData = (list) => { // 套餐分类数据扁平化
  let data = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    data.push(item);
    if (item.children && Array.isArray(item.children)) {
      data = [...data, ...generateData(item.children)];
    }
  }
  return data;
};

const searchTypeIdArr = (id, list) => {
  let data = [];
  if (!id) {
    return data;
  }
  if (data.indexOf(id) === -1) {
    data.unshift(id)
  }
  const findId = searchList(list, 'id', id).parentId;
  if (findId) {
    data = [...searchTypeIdArr(findId, list), ...data]
  }
  return data;
};

@inject('store')
@observer
class BaseForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      qualificationUrlPreviewVisible: false,
      qualificationUrlPreviewImage: '',
      qualificationUrlFileList: [],
      qualificationFileType: '.jpg, .gif, .png',
    }
  };

  setFormData = () => {
    const { form } = this.props;
    const { tableRowData } = this.props.store;
    const { qualificationUrlFileList } = this.state;
    const { goodsCategoriesData } = this.props;
    const rowData = {};

    rowData['name'] = tableRowData.name;
    rowData['k3No'] = tableRowData.k3No;
    rowData['categoriesId'] = searchTypeIdArr(tableRowData.categoriesId, generateData(goodsCategoriesData));
    rowData['goodsBrand'] = tableRowData.brandId;
    rowData['goodsProvider'] = tableRowData.goodsProvider.id;
    rowData['priceUnit'] = tableRowData.priceUnitId;
    rowData['stockUnit'] = tableRowData.stockUnitId;

    if(tableRowData.qualificationUrl) {
      tableRowData.qualificationUrl.split(',').forEach((item, index) => {
        qualificationUrlFileList.push({
          uid: 'qualificationUrl' + index,
          name: 'qualificationUrl' + index,
          status: 'done',
          url: item
        })
      })
    };

    Object.keys(rowData).forEach(key => {
      if (formConfig.hasOwnProperty(key)) {
        const field = {};
        if (rowData[key] || rowData[key] === 0) {
          field[key] = rowData[key]
        }
        form.setFieldsValue(field)
      }
    });
  };

  priceUnitChange = (value) => {   // 计价单位变化
    this.props.form.setFieldsValue({stockUnit: value});
  };

  getFormUrl = () => {
    const { qualificationUrlFileList } = this.state;
    this.props.form.setFieldsValue({
      qualificationUrl: qualificationUrlFileList
    })
  };

  handleCancelQualificationUrl = () => { 
    this.setState({ 
      qualificationUrlPreviewVisible: false 
    }, () => {this.getFormUrl()})
  };

  handlePreviewQualificationUrl = (file) => {
    this.setState({
      qualificationUrlPreviewImage: file.url || file.thumbUrl,
      qualificationUrlPreviewVisible: true,
    });
  };

  handleChangeQualificationUrl = (e) => {
    if(e.file.status) {
      this.setState({ 
        qualificationUrlFileList: e.fileList 
      }, () => {this.getFormUrl()});
    }
  };

  beforeUpload = (maxSize, file) => {
    if (file.size/1024 <= maxSize) {
      return true;
    } else {
      helper.W('上传文件过大');
      return false;
    }
  };

  componentDidMount() {
    this.setFormData();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {qualificationUrlPreviewVisible, 
           qualificationUrlPreviewImage, 
           qualificationUrlFileList, 
           qualificationFileType, } = this.state;
    const {goodsCategoriesData, 
           goodsBrandData,
           goodsProviderData, 
           goodsBaseUnitData,} =this.props;
    const { tableRowData } = this.props.store;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    return(
      <div>
        <Form layout={formConfig.layout}>
          <Form.Item label={formConfig.name.label} { ...formConfig.formItemLayout }>
            {getFieldDecorator(formConfig.name.key, formConfig.name.ruleConfig)(
              <Input
                allowClear={!tableRowData.isUpdate}
                disabled={tableRowData.isUpdate}
                placeholder={formConfig.name.ruleConfig.rules[0].message}/>
            )}
          </Form.Item>
          <Form.Item label={formConfig.categoriesId.label} { ...formConfig.formItemLayout }>
            {getFieldDecorator(formConfig.categoriesId.key, formConfig.categoriesId.ruleConfig)(
              <Cascader
                showSearch
                allowClear
                disabled={tableRowData.isUpdate}
                options={goodsCategoriesData}
                fieldNames={formConfig.categoriesId.fieldNames}
                placeholder={formConfig.categoriesId.ruleConfig.rules[0].message}/>
            )}
          </Form.Item>
          <Form.Item label={formConfig.k3No.label} { ...formConfig.formItemLayout }>
            {getFieldDecorator(formConfig.k3No.key, formConfig.k3No.ruleConfig)(
              <Input
                allowClear={false}
                disabled
                placeholder={formConfig.k3No.ruleConfig.rules[0].message}/>
            )}
          </Form.Item>
          <Form.Item label={formConfig.goodsBrand.label} { ...formConfig.formItemLayout }>
            {getFieldDecorator(formConfig.goodsBrand.key, formConfig.goodsBrand.ruleConfig)(
              <Select style={{ width: '100%' }}
                placeholder={formConfig.goodsBrand.ruleConfig.rules[0].message}
                showSearch
                allowClear
                disabled={tableRowData.isUpdate}
                optionFilterProp="children">
                {goodsBrandData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
              </Select>
            )}
          </Form.Item>
          <Form.Item label={formConfig.goodsProvider.label} { ...formConfig.formItemLayout }>
            {getFieldDecorator(formConfig.goodsProvider.key, formConfig.goodsProvider.ruleConfig)(
              <Select style={{ width: '100%' }}
                placeholder={formConfig.goodsProvider.ruleConfig.rules[0].message}
                showSearch
                allowClear
                disabled={tableRowData.isUpdate}
                optionFilterProp="children">
                {goodsProviderData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
              </Select>
            )}
          </Form.Item>
          <Form.Item label={formConfig.priceUnit.label} { ...formConfig.formItemLayout }>
            {getFieldDecorator(formConfig.priceUnit.key, formConfig.priceUnit.ruleConfig)(
              <Select style={{ width: '100%' }}
                placeholder={formConfig.priceUnit.ruleConfig.rules[0].message}
                showSearch
                allowClear
                disabled={tableRowData.isUpdate}
                onSelect={(value) => this.priceUnitChange(value)}
                optionFilterProp="children">
                {goodsBaseUnitData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
              </Select>
            )}
          </Form.Item>
          <Form.Item label={formConfig.stockUnit.label} { ...formConfig.formItemLayout }>
            {getFieldDecorator(formConfig.stockUnit.key, formConfig.stockUnit.ruleConfig)(
              <Select style={{ width: '100%' }}
                placeholder={formConfig.stockUnit.ruleConfig.rules[0].message}
                showSearch
                allowClear
                disabled
                optionFilterProp="children">
                {goodsBaseUnitData.map(item => <Select.Option value={item.id} key={item.id}>{item.name}</Select.Option>)}
              </Select>
            )}
          </Form.Item>
          <Form.Item label={formConfig.qualificationUrl.label} { ...formConfig.formItemLayout }>
            {getFieldDecorator(formConfig.qualificationUrl.key)(
              <div>
                <Upload
                  accept={qualificationFileType}
                  action={api.Upload}
                  listType="picture-card"
                  fileList={qualificationUrlFileList}
                  beforeUpload={this.beforeUpload.bind(this, IMG_SIZE)}
                  onPreview={this.handlePreviewQualificationUrl}
                  onRemove={() => { return tableRowData.isUpdate ? false : true}}
                  onChange={this.handleChangeQualificationUrl}>
                  {qualificationUrlFileList.length >= 5 || tableRowData.isUpdate ? null : uploadButton}
                </Upload>
                <Modal visible={qualificationUrlPreviewVisible} footer={null} onCancel={this.handleCancelQualificationUrl}>
                  <img alt="example" style={{ width: '100%' }} src={qualificationUrlPreviewImage} />
                </Modal>
              </div>
            )}
            <div>支持多图上传,最多5个,每个图应小于1M,jpg,gif,png格式。</div>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

const BasicInfoForm = Form.create()(BaseForm);

export default BasicInfoForm;