/* eslint-disable react/no-unused-class-component-methods */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import './chat-swipeable-nav-item.css';
import React from 'react';

class ChatSwipeableNavItem extends React.Component {
  // DOM Refs
  listElement;

  wrapper;

  background;

  // Drag & Drop
  dragStartX = 0;

  hasSwipe = true;

  left = 0;

  hasLeft = false;

  dragged = false;

  // FPS Limit
  startTime;

  fpsInterval = 1000 / 60;

  constructor(props) {
    super(props);

    this.listElement = null;
    this.wrapper = null;
    this.background = null;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onDragStartMouse = this.onDragStartMouse.bind(this);
    this.onDragStartTouch = this.onDragStartTouch.bind(this);
    this.onDragEndMouse = this.onDragEndMouse.bind(this);
    this.onDragEndTouch = this.onDragEndTouch.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
    this.onClicked = this.onClicked.bind(this);

    this.onSwiped = this.onSwiped.bind(this);

    this.onClickOutsize = this.onClickOutsize.bind(this);
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.onDragEndMouse);
    window.addEventListener('touchend', this.onDragEndTouch);
    window.addEventListener('click', this.onClickOutsize);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onDragEndMouse);
    window.removeEventListener('touchend', this.onDragEndTouch);
    window.removeEventListener('click', this.onClickOutsize);
  }

  onClickOutsize(event) {
    if (this.wrapper && !this.wrapper.contains(event.target)) {
      this.onDragEnd(true);
    }
    // if(this.listElement && this.listElement.contains(event.target) && !this.dragged){
    //     console.log('点击')
    //     // this.onSwiped()
    // }
  }

  onDragStartMouse(evt) {
    if (this.hasSwipe) {
      this.onDragStart(evt.clientX);
      window.addEventListener('mousemove', this.onMouseMove);
    }
  }

  onDragStartTouch(evt) {
    if (this.hasSwipe) {
      const touch = evt.targetTouches[0];
      this.onDragStart(touch.clientX);
      window.addEventListener('touchmove', this.onTouchMove);
    }
  }

  onDragStart(clientX) {
    this.dragged = true;
    this.dragStartX = clientX;
    this.listElement.className = 'ListItem';
    this.startTime = Date.now();
    requestAnimationFrame(this.updatePosition);
  }

  onDragEndMouse(evt) {
    window.removeEventListener('mousemove', this.onMouseMove);
    this.onDragEnd();
  }

  onDragEndTouch(evt) {
    window.removeEventListener('touchmove', this.onTouchMove);
    this.onDragEnd();
  }

  onDragEnd(close) {
    if (this.dragged || close) {
      this.dragged = false;

      // const threshold = this.props.threshold || 0.3;

      // if (this.left < this.listElement.offsetWidth * threshold * -1) {
      //     this.left = -this.listElement.offsetWidth * 2;
      //     this.wrapper.style.maxHeight = 0;
      //     this.onSwiped();
      // } else
      if (this.left < -70) {
        this.hasLeft = true;
        this.left = -70;
      } else {
        this.left = 0;
        this.hasLeft = false;
        // if (!close) {
        //     this.onSwiped();
        // }
      }

      this.listElement.className = 'BouncingListItem';
      this.listElement.style.transform = `translateX(${this.left}px)`;
    }
  }

  onMouseMove(evt) {
    if (!this.hasLeft) {
      const left = evt.clientX - this.dragStartX;
      if (left < 0 && left > -100) {
        this.left = left;
      }
    } else {
      this.onDragEnd(true);
    }
  }

  onTouchMove(evt) {
    if (!this.hasLeft) {
      const touch = evt.targetTouches[0];
      const left = touch.clientX - this.dragStartX;
      if (left < 0 && left > -100) {
        this.left = left;
      }
    } else {
      this.onDragEnd(true);
    }
  }

  onClicked() {
    if (this.props.onSwipe && !this.hasLeft && !this.dragged) {
      this.props.handleClickConversation();
    }
  }

  onSwiped() {
    if (this.props.onSwipe) {
      this.props.onSwipe();
    }
  }

  updatePosition() {
    if (this.dragged) requestAnimationFrame(this.updatePosition);

    const now = Date.now();
    const elapsed = now - this.startTime;

    if (this.dragged && elapsed > this.fpsInterval) {
      this.listElement.style.transform = `translateX(${this.left}px)`;

      // const opacity = (Math.abs(this.left) / 100).toFixed(2);
      // if (opacity < 1 && opacity.toString() !== this.background.style.opacity) {
      //     this.background.style.opacity = opacity.toString();
      // }
      // if (opacity >= 1) {
      //     this.background.style.opacity = "1";
      // }

      this.startTime = Date.now();
    }
  }

  render() {
    return (
      <div
        className="Wrapper"
        ref={(div) => {
          this.wrapper = div;
        }}
      >
        <div
          ref={(div) => {
            this.background = div;
          }}
          onClick={this.onSwiped}
          className="Background"
        >
          {this.props.background ? this.props.background : <span>删除</span>}
        </div>
        <div
          ref={(div) => {
            this.listElement = div;
          }}
          onClick={this.onClicked}
          onMouseDown={this.onDragStartMouse}
          onTouchStart={this.onDragStartTouch}
          className="ListItem"
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default ChatSwipeableNavItem;
