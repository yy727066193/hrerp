import React from 'react'
import { Button } from 'antd'
import '../../../assets/style/common/pageItem.less'
import { Bread } from '../../../components'
import {getLoginInfo, searchList} from "../../../utils/public";
import { inject, observer } from 'mobx-react'
import GiveIntSetBaseForm from './GiveIntSetBaseForm'

import helper from "../../../utils/helper";
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";

const PATH = 'giveIntSet';
const integral = 1;

@inject('store')
@observer
class GiveIntSet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      integralData: []
    };
  };

  getData = async () => {
    const { code, data } = await GoodsCenterService.GiveIntSet.selectAll({ type: 1 });
    if (code !== SUCCESS_CODE) {
      return;
    }
    this.setState({integralData: data.list});
  };

  handleSubmit = (e) => {
    const { integralData } = this.state;
    e.preventDefault();

    this.formEl.validateFields((err, formData) => {
      const money = Number(formData.money);
      if (err) {
        return;
      } else if (money < 0 || money > 999999) {
        helper.W('金额不能小于零且不大于999999！');
        return;
      } else if (money === integralData[0].money) {
        helper.W('当前输入金额不能等于上次设置金额数！');
        return;
      }

      this.updateOne(formData)
    })
  };

  updateOne = async (formData) => {
    const { setCommon } = this.props.store;

    formData.money = formData.money * 100;

    setCommon('loading', true);
    const { code, msg } = await GoodsCenterService.GiveIntSet.addOne({ ...formData, integral, type: 1 });
    setCommon('loading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S();
  };

  componentDidMount() {
    this.getData()
  }

  render() {
    const { integralData } = this.state;
    return(
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={[`${searchList(getLoginInfo().modules || [], 'path', PATH).name || ''}`]} />
          <div className="page-wrapper-bread-txt">
            {searchList(getLoginInfo().modules || [], 'path', PATH).subName || ''}
          </div>
        </div>
        {
          integralData.length ?
          <div className="integral-set-top">
            <GiveIntSetBaseForm  ref={el => this.formEl = el} integralData={integralData} />
            <Button type="primary" htmlType="submit" onClick={this.handleSubmit}>确定</Button>
          </div> : undefined
        }
        <div style={{ margin: '0 30px', fontSize: '13px', color: '#a5a594' }}>注意：这里商品的销售金额为商品的游客价格，商品的销售金额除以上面的参数为单个该商品购买获得的积分（四舍五入），订单的总积分为所有商品的积分之和。</div>
      </div>
    )
  }
}

export default GiveIntSet;
