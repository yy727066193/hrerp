import React, { Component } from 'react'
import { Breadcrumb } from 'antd'

export default class Bread extends Component{
  static defaultProps = {
    breadList: []
  };

  componentDidMount() {
    const { breadList } = this.props;
    if (breadList.length === 0) {
      return;
    }

    document.title = breadList.join('/')
  }

  render() {
    const { breadList } = this.props;

    return(
      <Breadcrumb>
        {breadList.map((item, index) => <Breadcrumb.Item style={{ cursor: this.props.history ? 'pointer' : undefined }} key={item}  onClick={() => this.linkTo(item, index)}>{item}</Breadcrumb.Item>)}
      </Breadcrumb>
    )
  }

  linkTo = (item, index) => {
    if (!this.props.history) {
      return;
    }
    if (!this.props.routerList[index]) {
      return;
    }
    this.props.history.replace(`${this.props.routerList[index]}`)
  };
}
