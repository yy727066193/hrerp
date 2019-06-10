import React from 'react';
import { Col, Button } from 'antd';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';

export default class CommonHead extends React.Component {
  
  render() {
    const { optionList } = this.props;
    return (
      <div style={{marginBottom: '15px'}}>
        {
          optionList.map((item) => {
            if (item.type === 'Button') {
              return (
                <Col className="gutter-row" span={item.itemSpan}>
                  <div className='pr20'>
                    <Button onClick={() => this.operateButton()} type="primary">{item.title}</Button>
                  </div>
                </Col>
              )
            }
            return (
              <Col className="gutter-row" span={item.itemSpan}>
                <div className='pr20'>
                  <span className="pr8 lh32">{item.title}:</span>
                  <span className="fb lh32">{item.value}</span>
                </div>
              </Col>
            )
          })
        }
      </div>
    )
  }

  operateButton() {
    this.props.operateButton();
  }
}