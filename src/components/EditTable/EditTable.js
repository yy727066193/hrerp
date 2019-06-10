import {
  Input, InputNumber, Form, Select
} from 'antd';
import React from 'react';
import { searchList } from '../../utils/public';
import { inject, observer } from 'mobx-react';
const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

// const eventBus = new EventBus();

const EditableFormRow = Form.create()(EditableRow);
class EditableCell extends React.Component {
  getInput = () => {
    const { inputType, goodsOptions, options, dataIndex, goodsCodeOptions, canChange, disabled } = this.props;
    if (inputType === 'select') {
      if (dataIndex === 'goodsName') {
        return this.renderSelect(goodsOptions);
      } else if (dataIndex === 'shelfNum') {
        return this.renderSelect(options);
      } else if (dataIndex === 'goodsCode') {
        return this.renderSelect(goodsCodeOptions);
      }
    } else if (inputType === 'number') {
      return  <InputNumber disabled={disabled} onChange={(val) => canChange? this.onChange(val): null}  min={1} max={99999999} />;
    } else if (inputType === 'input') {
      return <Input disabled={disabled} />
    }
      
  };

  renderSelect(options) {
    
    const { multiple, dataIndex } = this.props;
    return (
        <Select style={{ width: '100%' }}
                showSearch
                mode={multiple ? 'multiple' : undefined}
                onSelect={(item, val) => this.onSelect(item, val, dataIndex)}
                optionFilterProp="children">
            {
              !options ? null :
              options.map((opt) => {
                  return(
                    <Select.Option key={opt['value']}
                                   value={opt['value']}>
                      {opt['label']}
                    </Select.Option>
                  )
                })

            }
        </Select>
    )
  }

  onSelect(item, val, dataIndex) { // 可编辑表格下拉
    const { record, goodsOptions, goodsCodeOptions } = this.props;
    if (dataIndex === 'goodsName') { // 货品名称下拉
      record.goodsCode = searchList(goodsCodeOptions, 'hrNo', item).label;
      record.goodsName = searchList(goodsOptions, 'value', item).label;
      record.unit = searchList(goodsCodeOptions, 'hrNo', item).priceUnitName;
    } else if (dataIndex === 'goodsCode') { // 货品编码下拉
      record.goodsName = searchList(goodsOptions, 'value', item).label;
      // record.goodsCode = searchList(goodsCodeOptions, 'hrNo', item).label;
      record.unit =  searchList(goodsOptions, 'value', item).priceUnitName;
    }
  }

  onChange(val) {
    const { record } = this.props;
    
      if (val >= 0 && val) {
        record['subtotal'] = (parseInt(val) * record.unitPrice).toFixed(2);
        record['returnIntegral'] = (parseInt(val) * record.unitIntegral).toFixed(0);
      } else {
        record['subtotal'] = 0;
        record['returnIntegral'] = 0;
      }
    
    
  }

  render() {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      required,
      placeholder,
      ...restProps
    } = this.props;
    return (
      <EditableContext.Consumer>
        {(form) => {
          const { getFieldDecorator } = form;
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{ margin: 0 }}>
                  {getFieldDecorator(dataIndex, {
                    rules: [{
                      required: required,
                      message: `请选择 ${title}!`,
                    }],
                    initialValue: record[dataIndex],
                  })(this.getInput())}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}
@inject('store')
@observer
class SignalEditCell extends React.Component{
  state = {
    editing: false,
  }

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        // this.input.focus();
      }
    });
  }

  save = (e) => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  }

  changeSelect(val, key) {
    window.eventBus.emit('selectEditTable', window, [val, key, 'select']);
  }

  changeInputNumber(val, key) {
    const { setCommon, editDataSource } = this.props.store;
    editDataSource[key].saveGoodsNum = val;
    setCommon('editDataSource', editDataSource);
    // window.eventBus.emit('selectEditTable', window, [val, key, 'input']);
  }

  eventBusChange(val, key) {
     window.eventBus.emit('selectEditTable', window, [val, key, 'input']);
  }

  inputOrSelectForm(type, options) {
    const { title, record } = this.props;
    if (type) {
      if (type === 'select') {
        return (
          <Select style={{ width: '100%' }}
            showSearch
            placeholder={`请选择${title}`}
            onSelect={(val) => this.changeSelect(val, record.key)}
            optionFilterProp="children">
            {
              options ?
                options.map((opt) => {
                  return(
                    <Select.Option key={opt['value']}
                                  value={opt['value']}>
                      {opt['label']}
                    </Select.Option>
                  )
              }): null
            }
          </Select>
        )
      } else if (type === 'input') {
        return (
          <InputNumber
            ref={node => (this.input = node)}
            onPressEnter={this.save}
            onChange={(val) => this.eventBusChange(val, record.key)}
            min={0}
            max={9999999}
            onBlur={this.save}
            />
        )
      }
    } else {
      return (
        <InputNumber
          min={0}
          max={9999999}
          onChange={(val) => this.changeInputNumber(val, record.key)}
          onPressEnter={this.save}
          onBlur={this.save}
          />
      )
    }
  }

 
  render() {
    const { editing } = this.state;
    const {
      editable,
      dataIndex,
      title,
      record,
      type,
      index,
      options,
      handleSave,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {(form) => {
              this.form = form;
              return (
                !editing ? (
                  <FormItem style={{ margin: 0 }}>
                    {form.getFieldDecorator(dataIndex, {
                      rules: [{
                        required: true,
                        message: `${title}不能为空`,
                      }],
                      initialValue: record[dataIndex],
                    })(this.inputOrSelectForm(type, options))}
                  </FormItem>
                ) : (
                  <div
                    className="editable-cell-value-wrap"
                    style={{ paddingRight: 24 }}
                    onClick={this.toggleEdit}
                  >
                    {restProps.children}
                  </div>
                )
              );
            }}
          </EditableContext.Consumer>
        ) : restProps.children}
      </td>
    );
  }
}

export {EditableFormRow, EditableCell, EditableContext, SignalEditCell};