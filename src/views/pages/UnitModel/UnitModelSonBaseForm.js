import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input, Tag, Icon, Tooltip, message } from 'antd'
import {SUCCESS_CODE} from "../../../conf";
import GoodsCenterService from "../../../service/GoodsCenterService";
import { validChar } from '../../../utils/RegExps'
import helper from '../../../utils/helper';

@inject('store')
@observer
class BaseForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      inputVisible: false,
      inputValue: '',
      isUpdate: false,
    }
  };

  handleClose = async (id, index) => {   // 删除规格值
    const { tableRowList } = this.props;
    const { code, msg } = await GoodsCenterService.UnitModel.updateOneUnit({ parentId: tableRowList.id, id, hidden: 0});
    if (code !== SUCCESS_CODE) {
      tableRowList.goodsBaseSpuList.splice(index, 0, tableRowList.goodsBaseSpuList[index]);
      helper.W(msg);
      return;
    }
    tableRowList.goodsBaseSpuList.splice(index, 1);
    this.setState({isUpdate: false})
  };

  showInput = () => {   // 显示、隐藏输入框
    this.setState({ inputVisible: true }, () => this.input.focus());
  }

  handleInputChange = (e) => {   // 输入框值改变同步到inputValue中
    this.setState({ inputValue: e.target.value });
  }

  handleInputConfirm = async (id, index) => {   // 输入框数据提交
    const { inputValue, isUpdate } = this.state;
    const { tableRowList } = this.props;

    if(!validChar.test(inputValue)) {
      helper.W('请勿输入特殊字符');
      return;
    }

    tableRowList.goodsBaseSpuList[index] = inputValue
    
    const params = isUpdate ? {parentId: tableRowList.id, name: inputValue, id} : {parentId: tableRowList.id, name: inputValue};
    if(inputValue !== '') {
      const { code, msg, data } = await GoodsCenterService.UnitModel[isUpdate ? 'updateOneUnit' : 'addOneUnit'](params);

      if (code !== SUCCESS_CODE) {
        message.error(msg);
        return;
      }
      if(isUpdate) {
        tableRowList.goodsBaseSpuList.splice(index, 1, data)
      } else {
        tableRowList.goodsBaseSpuList = [...tableRowList.goodsBaseSpuList, data]
      }
    }
    this.setState({
      isUpdate: false,
      inputVisible: false,
      inputValue: '',
    });
  };

  saveInputRef = input => this.input = input

  render() {
    const { inputVisible, inputValue } = this.state;
    const { tableRowList } = this.props;

    return(
      <div>
        {tableRowList && tableRowList.goodsBaseSpuList ?
        tableRowList.goodsBaseSpuList.map((tag, index) => {
          const isLongTag = tag.length > 8;
          const tagElem = (
            // <Popover title="编辑子规格" content={<Input
            //                                       defaultValue={tag.name}
            //                                       placeholder='请输入子规格名'
            //                                       onChange={this.handleInputChange}
            //                                       onBlur={this.handleInputConfirm.bind(this, tag.id, index)}
            //                                       onPressEnter={this.handleInputConfirm.bind(this, tag.id, index)} />}
            //                                       trigger="click">
            //                                       </Popover>
              <Tag key={tag.id} closable={true} 
                  //  onClick={() => {this.setState({isUpdate: true})}} 
                  onClose={() => this.handleClose(tag.id, index)}>
                {isLongTag ? `${tag.name.slice(0, 8)}...` : tag.name}
              </Tag>
            
          );
          return isLongTag ? <Tooltip title={tag.name} key={tag.id}>{tagElem}</Tooltip> : tagElem;
        }) : undefined}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag
            onClick={this.showInput}
            style={{ background: '#fff', borderStyle: 'dashed' }}>
            <Icon type="plus" /> 新增规格值
          </Tag>
        )}
      </div>
    )
  }
}

const UnitModelSonBaseForm = Form.create()(BaseForm);

export default UnitModelSonBaseForm
