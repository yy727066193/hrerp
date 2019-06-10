import React from 'react'
import { Form, Radio } from 'antd'

const formMap = {
  layout: 'horizontal',
  formItemLayout: {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  },
};

class BaseForm extends React.Component {
  static defaultProps = {
    formChangeKey: 'parentPutOn',
    trueText: '上架',
    falseText: '下架'
  };

  render() {
    const { companyList, formChangeKey, trueText, falseText } = this.props;
    return(
      <Form layout={formMap.layout}>
        {companyList.map((item, index) => {
          return(
            <Form.Item label={item.name} { ...formMap.formItemLayout } required>
              <Radio.Group buttonStyle="solid" value={item[formChangeKey]} onChange={(e) => this.props.onRadioChange(e.target.value, index)}>
                <Radio.Button value={0}>{falseText}</Radio.Button>
                <Radio.Button value={1}>{trueText}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          )
        })}
      </Form>
    )
  }
}

const SetStatusInfo = Form.create()(BaseForm);

export default SetStatusInfo
