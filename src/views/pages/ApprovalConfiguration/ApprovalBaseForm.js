import React from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input, Select, Row, Col, Tooltip} from 'antd'
// import ApprovalLevelForm from './approvalLevelForm'

@inject('store')
@observer
class ApprovalBaseForm extends React.Component {

  renderFormItem = (item) => {
    const { formType } = item;
    switch (formType) {
      case 'input':
        return <Input disabled={item.disabled} placeholder={item.placeholder ? item.placeholder : `请输入${item.label}`} />;
      case 'select':
        return (
          <Select style={{ width: '100%' }}
                  showSearch
                  mode={item.multiple ? 'multiple' : undefined}
                  disabled={item.disabled}
                  placeholder={item.placeholder ? item.placeholder : `请选择${item.label}`}
                  onSelect={(val, option) => this.change(item, val, option)}
                  optionFilterProp="children">
            {
              !item.options ? null :
                item.options.map((opt) => {
                  return(
                    <Select.Option key={opt['value']}
                                   value={opt['value']}>
                                   {opt['label']}
                    </Select.Option>
                  )
                })
            }
          </Select>
        );
      default:
        return null
    }
  };

  change(item, val, option) {
    this.props.changeSelectValue(item, val, option);
  }

  getChildFormVal() {
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const { formMap, renderList } = this.props;
    return(
      <Form layout={formMap.layout}>
        <Row gutter={24}>
          {
            formMap.list.map((item, i) => {
              return(
                <Col key={item.label}>
                  <Form.Item {...formMap.formItemLayout} label={<Tooltip placement="top" title={item.label}>{item.label}</Tooltip>} required={item.required}>
                    {getFieldDecorator(item.key, {
                      rules: [{
                        required: item.required,
                        message: item.formType === 'input' ? `请输入${item.label}` : `请选择${item.label}!`,
                      }],
                    })(this.renderFormItem(item))}
                  </Form.Item>
                </Col>
              )
            })
          }

      <div>
        {
          renderList.map((renderItem) => {
            return (
              <div className="borderStyle">
                <h3 style={{textAlign: 'center'}}>{renderItem.title}</h3>
                <Form layout={formMap.layout}>
                  <Row gutter={24}>
                    {
                      renderItem.list ? renderItem.list.map((item, i) => {
                        return(
                          <Col key={item.label}>
                            <Form.Item {...formMap.formItemLayout} label={<Tooltip placement="top" title={item.label}>{item.label}</Tooltip>} required={item.required}>
                              {getFieldDecorator(item.key,{
                                rules: [{
                                  required: true,
                                  message: `请选择${item.label}`
                                }]
                              })(this.renderFormItem(item))}
                            </Form.Item>
                          </Col>
                        )
                      }) : null
                    }
                  </Row>
                </Form>
              </div>
            )
          })
        }
      </div>
          
        </Row>
      </Form>
    )
  }
}

const approvalBaseForm = Form.create()(ApprovalBaseForm);
export default approvalBaseForm;