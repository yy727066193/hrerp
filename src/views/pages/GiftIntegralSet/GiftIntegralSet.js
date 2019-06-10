import React from 'react'
import { Button, InputNumber } from 'antd'
import '../../../assets/style/common/pageItem.less'
import { Bread } from '../../../components'
import {getLoginInfo, searchList} from "../../../utils/public";
import { inject, observer } from 'mobx-react'

import helper from "../../../utils/helper";
import GoodsCenterService from "../../../service/GoodsCenterService";
import {SUCCESS_CODE} from "../../../conf";

const PATH = 'GiftIntegralSet';

@inject('store')
@observer
class GiveIntSet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      integral: null
    };
  };

  getData = async () => {
    const { code, data } = await GoodsCenterService.GiveIntSet.selectAll({ type: 2 });
    if (code !== SUCCESS_CODE) {
      return;
    }
    this.setState({integral: data.list[0].integral});
  }

  handleSubmit = async () => {
    const { setCommon } = this.props.store;
    const { integral } = this.state;

    setCommon('loading', true);
    const { code, msg } = await GoodsCenterService.GiveIntSet.addOne({ integral, type: 2 });
    setCommon('loading', false);
    if (code !== SUCCESS_CODE) {
      helper.W(msg);
      return;
    }
    helper.S()
  };

  handleChangeValue(e) {
    this.setState({
      integral: e
    })
  };

  componentDidMount() {
    this.getData()
  }

  render() {
    const { integral } = this.state;
    return(
      <div className="page-wrapper">
        <div className="page-wrapper-bread">
          <Bread breadList={[`${searchList(getLoginInfo().modules || [], 'path', PATH).name || ''}`]} />
          <div className="page-wrapper-bread-txt">
            {searchList(getLoginInfo().modules || [], 'path', PATH).subName || ''}
          </div>
        </div>
        <div style={{ marginLeft: '30px'}}>
          <span style={{ marginRight: '10px' }}>门市价格</span>
          <span style={{ marginRight: '10px' }}> / </span>
          <InputNumber min={0.01} max={999999}
                       value={integral}
                       precision={2}
                       onChange={this.handleChangeValue.bind(this)}
                       style={{ marginRight: '10px', width: '100px' }} />
          <span style={{ marginRight: '10px' }}>=</span>
          <span style={{ marginRight: '20px' }}>兑换积分（结果四舍五入）</span>
          <Button type="primary" onClick={() => this.handleSubmit()}>确定</Button>
        </div>
        <div style={{ margin: '10px 30px', fontSize: '13px', color: '#a5a594' }}>注意：这里商品的销售金额为商品的游客价格，商品的销售金额除以上面的参数为单个该商品购买获得的积分（四舍五入），订单的总积分为所有商品的积分之和。</div>
      </div>
    )
  }
}

export default GiveIntSet;
