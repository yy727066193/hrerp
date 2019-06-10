import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { inject, observer } from 'mobx-react';
import { Input, Form, Select, Row, Col, } from 'antd';


const formConfig = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  name: {
    key: 'name',
    label: '审批人',
    ruleConfig: {
      rules: [{ required: false, message: '请输入审批人' }]
    }
  },
  pointOfContact: {
    key: 'pointOfContact',
    label: '',
    ruleConfig: {
      rules: [{ required: true, message: '请选择审批结果' }]
    }
  },
  remark: {
    key: 'remark',
    label: '',
    ruleConfig: {
      rules: [{ required: false, message: '请输入备注' }]
    }
  },
};

@inject('store')
@observer
class RenderFormList extends React.Component {
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form>
        <Row gutter={16}>
          <Col className="gutter-row" span={8}>
          <Form.Item label="审批人"  labelCol= { {span: 6}}  wrapperCol= { {span: 18 } }>
            {getFieldDecorator(formConfig.name.key, formConfig.name.ruleConfig)(
              <Input disabled />
            )}
            
          </Form.Item>
          </Col>
          <Col className="gutter-row" span={8}>
          <Form.Item label="审批结果" required  labelCol= { {span: 6}}  wrapperCol= { {span: 18 } }>

            {getFieldDecorator(formConfig.pointOfContact.key, formConfig.pointOfContact.ruleConfig
                    )(
                      <Select showSearch optionFilterProp="children">
                        {window.globalConfig.approvalStatusSmall.map(item => <Select.Option value={item.value} key={item.value}>{item.label}</Select.Option>)}
                      </Select>
                    )}
          </Form.Item>
          </Col>
          <Col className="gutter-row" span={8}>
          <Form.Item label="备注"  labelCol= { {span: 6}}  wrapperCol= { {span: 18 } }>
            {getFieldDecorator(formConfig.remark.key, formConfig.remark.ruleConfig)(
              <Input />
            )}
          </Form.Item>
          </Col>
        </Row>
      </Form>
    )
  }

  getInputValue() {
    console.log(this.props.form.getFieldsValue());
  }

}

const FormRenderList = Form.create()(RenderFormList);
export default FormRenderList;