/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import OpenViduVideoComponent from './ov-video';
import './user-video.css'

export default class UserVideoComponent extends Component {

    // eslint-disable-next-line class-methods-use-this
    getNicknameTag() {
        // Gets the nickName of the user
        // return JSON.parse(this.props.streamManager.stream.connection.data).clientData;
        return "1"
    }

    render() {
        console.log('更新',this.props.streamManager)
        return (
            <div>
                {this.props.streamManager !== undefined ? (
                    <div className="streamcomponent">
                        <OpenViduVideoComponent streamManager={this.props.streamManager} />
                        <div><p>{this.getNicknameTag()}</p></div>
                    </div>
                ) : null}
            </div>
        );
    }
}
