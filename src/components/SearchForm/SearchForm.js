import React, { Component } from 'react'
import RenderForm from './RenderForm'
import './index.less'

export default class SearchForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: true
    };
  }

  static defaultProps = {
    formList: [],
    formItemSpan: 8,
    showSearch: false,
    showSearchCount: 6,
    btnType: true // false 搜索左侧 true搜索右侧
  };

  onChange = () => {
    this.setState({ visible: !this.state.visible })
  };

  onSubmit = (data) => { // 搜索
    if (this.props.onSubmit)
      this.props.onSubmit(data);
  };

  getFormData() {
    return this.renderForm.getFormData();
  }

  onReset() { // 清空
    if (this.props.onReset)
      this.props.onReset();
    }

  initFormData = (formData) => { // 表单里写数据
    this.renderForm.setFormData(formData)
  };

  validateFormValues() {
    return this.renderForm.validateValues();
  }



  render() {
    const { visible } = this.state;
    const { formList, formItemSpan, showSearch, showSearchCount, notShowBorder, btnType } = this.props;
    return(
      <RenderForm onSubmit={(data) => this.onSubmit(data)}
                  visible={visible}
                  btnType={btnType}
                  footer={this.props.children}
                  showSearch={showSearch}
                  handleToggle={() => this.onChange()}
                  showSearchCount={showSearchCount}
                  formList={formList}
                  onSelect={(item, value) => this.props.onSelect(item, value)}
                  onChange={(item, value) => this.props.onChange(item, value)}
                  wrappedComponentRef={el => this.renderForm = el}
                  formItemSpan={formItemSpan}
                  notShowBorder={notShowBorder}
                  onReset={() => this.onReset()} />
    )
  }
}
