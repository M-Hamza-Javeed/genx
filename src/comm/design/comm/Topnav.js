import React from 'react'
import { Nav,Row,Col,Icon,Divider } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.min.css';
import '././css/Sidenav-Style.css'

const _topnav = ({ active, onSelect, ...props })=>{
    return(
        <Nav {...props} activeKey={active} onSelect={onSelect} 
        style={{marginLeft:'50px',padding:'5px',marginRight:'6px',boxShadow:'50px 1px 5px #ececec52'}}>
        <Nav.Item eventKey="home" >Home</Nav.Item>
        <Nav.Item eventKey="about">About</Nav.Item>
        </Nav>
    );
}



export class Topnav extends React.Component {
    constructor() {
        super();
        this.state = {
            active: 'home'
        };
        this.handleSelect = this.handleSelect.bind(this);
        }
        handleSelect(activeKey) {
        this.setState({ active: activeKey });
        }
        render() {
        const { active } = this.state;
        return (
            <div>
            <_topnav appearance="subtle" active={active} onSelect={this.handleSelect} />
            </div>
        );
        }
}