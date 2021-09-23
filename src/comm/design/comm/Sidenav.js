import React from 'react'
import { Nav,Row,Col,Icon,Avatar } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.min.css';
import '././css/Sidenav-Style.css'
import {Context} from '../../contexApi/Dataprovide'

const styles = {boxShadow:'#ececec5e 1px 1px 3px',borderRight:'1px solid #e6e6e6'};


const CustomNav = ({ active, onSelect, ...props }) => {
  return (
    <Nav {...props} vertical activeKey={active} onSelect={onSelect} style={styles}>
      <Avatar  size="sm" style={{backgroundColor:'#000',color:'red',margin:'10px'}} ><Icon icon="leaf" /></Avatar>
      <Nav.Item eventKey="home"><Icon icon="home" /></Nav.Item>
      <Nav.Item eventKey="Apps" ><Icon icon="android" /> </Nav.Item>
      <Nav.Item eventKey="database" ><Icon icon="upload2" /> </Nav.Item>
    </Nav>
  );
};

export default class Sidenav extends React.Component {
  static contextType= Context
  constructor(props) {
    super(props);
    this.state = {
      active: 'home'
    };
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount(){
    console.log("Context :",this.context[1])
    
  }

  handleSelect(activeKey) {
    this.setState({ active: activeKey });
    this.context[1]({SideNavBtn:activeKey})

  }
  render() {
    const { active } = this.state;

    return (
      <Row>
        <Col md={2} className={"sidenav"} >
          <CustomNav appearance="tabs" reversed active={active} onSelect={this.handleSelect} />
        </Col>
      </Row>
    );
  }
}



