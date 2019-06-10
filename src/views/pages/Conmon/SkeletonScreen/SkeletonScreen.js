import React, {Component} from 'react'
import './index.less'

class SkeletonScreen extends Component {
  render() {
    return(
      <div className="root-skeleton">
        <div className="root-skeleton-header" />
        <div className="root-skeleton-body">
          <div className="root-skeleton-body-slide" />
          <div className="root-skeleton-body-content">
            <div className="root-skeleton-body-content-info" />
          </div>
        </div>
      </div>
    )
  }
}

export default SkeletonScreen;
