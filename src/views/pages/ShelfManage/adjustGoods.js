import React from 'react';
import './../../../assets/style/common/index.less';
import '../../../assets/style/common/pageItem.less';
import { Modal, Transfer  } from 'antd';
import { inject, observer } from 'mobx-react';

@inject('store')
@observer
class AdjustGoods extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      targetKeys: [],
    }
  }
  
  render() {
    const { visible, leftContentList, targetKeys } = this.props;
   
    return (
      <Modal title='调整货品'
             visible={visible}
             onOk={this.handleOk.bind(this)}
             onCancel={this.handleCancel.bind(this)}>
        {/* <Form.Item label="分类"  labelCol= { {span: 2}}  wrapperCol= { {span: 20 }}>
          <Select placeholder="请选择分类" optionFilterProp="children" style={{ width: '100%' }}>
            {
                !options ? null :
                  options.map((opt) => {
                    return(
                      <Select.Option key={opt.value}
                                    value={opt.value}>
                        {opt.label}
                      </Select.Option>
                    )
                  })

            }
                    
          </Select>
        </Form.Item> */}
        <Transfer
          dataSource={leftContentList}
          listStyle={{
            width: 210,
            height: 250,
          }}
          titles={['待添加货品', '已添加货品']}
          targetKeys={targetKeys}
          showSearch
          onChange={this.handleChange.bind(this)}
          render={this.renderItem}
        />
      </Modal>
    )
  }

  handleOk() {
    this.props.clickOk(this.state.targetKeys);
  }

  handleCancel() {
    this.props.clickCancel();
  }

  handleChange(targetKeys, direction, moveKeys) {
    // const { targetKeys } = this.state;
    // console.log(newTarget, direction, moveKeys);
    // if (direction === 'left') {
    //   moveKeys.forEach((item) => {
    //     targetKeys.push(item);
    //   })
    // }
    // console.log(targetKeys);
    this.props.handleChange(targetKeys);
    this.setState({ targetKeys });
  }

  renderItem = (item) => {
    const customLabel = (
      <span className="custom-item">
        <span>
          {item.title}
        </span>
        <span style={{marginLeft:'24px',height: '20px'}}>
          <span> 编码:{item.code}</span>
          <span>{item.batchCode}</span>
        </span>
        
      </span>
    );

    return {
      label: customLabel, 
      value: item.title, 
    };
  }

}

export default AdjustGoods;
