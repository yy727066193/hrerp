import React from 'react'
import GoodsType from '../GoodsType/GoodsType'

class MealType extends React.Component {

  render() {
    return(
      <GoodsType goodsTypeId={2} path="mealType" title="套餐分类" />
    )
  }
}

export default MealType;

