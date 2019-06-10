import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Form, Row, Col, Input } from 'antd';

class NextStep extends React.Component {

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form style={{border:'none',paddingTop:0}} className="z-search-form">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item required={true} title='下一审批步骤' label='下一审批步骤'>
              {getFieldDecorator('nextStep', {
                rules: [{
                  required: true,
                }],
              })(
                <Input disabled={true} style={{width: '100%'}} />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item required={true}  title='审批人' label='审批人'>
              {getFieldDecorator('approvalMan', {
                rules: [{
                  required: true,
                }],
              })(
                <Input disabled={true} style={{width: '100%'}} />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    )
  }
}

const RenderForm = Form.create()(NextStep);

export default RenderForm;