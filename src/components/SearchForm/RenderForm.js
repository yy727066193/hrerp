
import React, { Component } from 'react'
import { Button, Form, Row, Col, Input, Select, Cascader, DatePicker, Radio, Tooltip, Icon } from 'antd';
import './index.less'
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/lib/date-picker/locale/zh_CN';

moment.locale('zh-cn');

const DATE_FORMAT = "YYYY-MM-DD";
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

class BaseForm extends Component {
  onSubmit = (e) => {
    e.preventDefault();

    if (!this.props.showSearch) { // 关闭搜索权限关闭回车提交
      return;
    }

    this.props.form.validateFields((err, values) => {
      this.props.onSubmit(values)
    })
  };

  onReset = (e) => {
    e.preventDefault();

    this.props.form.resetFields();
    this.props.onReset();
  };

  renderFormItem = (item) => {
    const { formType } = item;

    switch (formType) {
      case 'input':
        return <Input disabled={item.disabled} placeholder={item.placeholder ? item.placeholder : `请输入${item.title}`} />;
      case 'number':
        return <Input placeholder={item.placeholder ? item.placeholder : `请输入${item.title}`} type="number" />;
      case 'select':
        return (
          <Select style={{ width: '100%' }}
                  showSearch
                  mode={item.multiple ? 'multiple' : undefined}
                  disabled={item.disabled}
                  onSelect={(value) => item.bindChange? this.props.onSelect(item, value): null}
                  placeholder={item.placeholder ? item.placeholder : `请选择${item.title}`}
                  optionFilterProp="children">
            {
              !item.options ? null :
                item.options.map((opt) => {
                  return(
                    <Select.Option key={opt[item.defaultProps && item.defaultProps.value ? item.defaultProps.value : 'value']}
                                   value={opt[item.defaultProps && item.defaultProps.value ? item.defaultProps.value : 'value']}>
                      {opt[item.defaultProps && item.defaultProps.label ? item.defaultProps.label : 'label']}
                    </Select.Option>
                  )
                })

            }
          </Select>
        );
      case 'cascader':
        return(
          <Cascader options={item.options ? item.options : []}
                    placeholder={`请选择${item.title}`}
                    style={{ width: '100%' }}
                    onChange={ (value) => item.bindChange? this.props.onChange(item, value): null }
                    changeOnSelect={item.changeOnSelect ? item.changeOnSelect : false}
                    fieldNames={{ label: item.defaultProps&& item.defaultProps.label ? item.defaultProps.label : 'label',
                      value: item.defaultProps && item.defaultProps.value ? item.defaultProps.value : 'value',
                      children: item.defaultProps && item.defaultProps.children ? item.defaultProps.children : 'children' }}
                    showSearch={true} placholder="请选择" />
        );
      case 'radio':
        return(
          <Radio.Group buttonStyle="solid">
            {
              !item.options ? null :
                item.options.map((opt) => {
                  return(
                    <Radio.Button key={opt[item.defaultProps && item.defaultProps.value ? item.defaultProps.value : 'value']}
                                  value={opt[item.defaultProps && item.defaultProps.value ? item.defaultProps.value : 'value']}>
                      {opt[item.defaultProps && item.defaultProps.label ? item.defaultProps.label : 'label']}
                    </Radio.Button>
                  )
                })
            }
          </Radio.Group>
        );
      case 'date':
        return(
          <DatePicker disabledDate={(currentDate) => item.notSelectBeforeDate? moment(currentDate).endOf('day') < moment().endOf('day'): null} locale={locale} format={DATE_FORMAT} style={{ width: '100%' }} placeholder={`请选择${item.title}`} />
        );
      case 'dateScope':
        return(
          <DatePicker.RangePicker locale={locale} format={DATE_FORMAT} style={{ width: '100%' }} />
        );
      case 'dateTime':
        return(
          <DatePicker disabledDate={(currentDate) => item.notSelectBeforeDate? moment(currentDate).endOf('day') < moment().endOf('day'): null} locale={locale} showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} placeholder={`请选择${item.title}`} />
        );
      case 'dateTimeScope':
        return(
          <DatePicker.RangePicker locale={locale} showTime format={DATE_TIME_FORMAT} style={{ width: '100%' }} />
        );
      default:
        return null
    }
  };

  setFormData = (formData, isClear = true) => { // 表单写入默认值
    if (isClear) {
      this.props.form.resetFields();
    }

    Object.keys(formData).forEach(key => {
      const obj = {};
      obj[key] = formData[key];

      this.props.form.setFieldsValue(obj)
    });
  };

  getFormData() {
    return this.props.form.getFieldsValue();
  }

  validateValues() { // 校验表单方法 true为验证不通过
    let bool = false;
    this.props.form.validateFields((err, values) => {
      if (err)  {
        bool = true;
        return;
      }
    });
    return bool;
  }

  render() {
    const arr = [];
    const { getFieldDecorator } = this.props.form;
    const { formList, formItemSpan, showSearch, visible, showSearchCount, footer, notShowBorder, btnType } = this.props;
    formList.forEach(item => {
      if (item.formType)
        arr.push(item)
    });
    const count = visible ? arr.length : showSearchCount;
    return(
      <Form onSubmit={this.onSubmit} style={notShowBorder? {border: 'none'}: {}} className="z-search-form">
        <Row gutter={24}>
          {
            arr.map((item, i) => {
              if (!item.formType) {
                return null
              } else {
                return(
                  <Col span={formItemSpan} key={item.name} style={{ display: i < count ? 'block' : 'none' }}>
                    <Form.Item label={<Tooltip placement="top" required={item.required} title={item.title}>{item.title}</Tooltip>}>
                    {getFieldDecorator(item.dataIndex, item.config? item.config: {
                      rules: [{
                        required: item.required,
                        message: item.formType === 'input' ? `请输入${item.title}` : `请选择${item.title}!`
                      }],
                    })(this.renderFormItem(item))}
                    </Form.Item>
                  </Col>
                )
              }
            })
          }
        </Row>
        <div style={{ paddingTop: '10px' }} className="z-search-btn-wrapper clearfix">
          <div className="fl">
            {!btnType ? (footer) : null}
            {showSearch ? <Button htmlType="submit" type="primary" icon="search" ghost>查询</Button> : null}
            {showSearch ? <Button type="danger" icon="delete" ghost onClick={this.onReset}>清空</Button> : null}
            {btnType ? (footer) : null}
          </div>
          {
            arr.length <= showSearchCount ? null :
              <div className="z-search-btn-wrapper-right fr" style={{ height: '42px', lineHeight: '42px' }} onClick={this.props.handleToggle}>
                <span>高级搜索</span>
                <Icon type={visible ? 'up' : 'down'} />
              </div>
          }
        </div>
      </Form>
    )
  }
}

const RenderForm = Form.create()(BaseForm);

export default RenderForm;
