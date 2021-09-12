import React from 'react'
import { FormGroup,FormControl,ControlLabel,Alert,Form, Modal, Button } from 'rsuite';
import {createtable} from './request'


export default class Creatdb extends React.Component {
    constructor(props) {
        super(props);
        this.state = { Sql: "" , show: this.props.show };
        this.close = this.close.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.ok = this.ok.bind(this);
    }

    close(){         
        this.props.parentCallback({"from":"CreateTable",show:false});
        this.setState({ show: false });
    }

    ok(){ 
        if(this.state.Sql == "" || this.state.Sql == " "){{Alert.error('Empty Enter Sql Query !', 3000)}}
        else{
        createtable(this.state.Sql).then(()=>{
        {Alert.success('Sucessfuly Created', 3000)}
        }).catch(error=>{Alert.error('ERROR !', 3000)})
    }
    this.props.parentCallback({"from":"CreateTable",show:false});
    this.setState({ show: false });
    }

    handleChange(value) {this.setState({Sql: value.sql});}
    
    // componentWillReceiveProps(props){this.setState({ show: props.show });}


    render() {
    return (
        <div>
        <Modal show={this.props.show} onHide={this.close} size="sm">
            <Modal.Header> <Modal.Title>Create Database Tables</Modal.Title> </Modal.Header>
            <Modal.Body>
            <Form fluid onChange={this.handleChange} formValue={this.state.formValue} >
                <FormGroup> <ControlLabel>SQL</ControlLabel> 
                <FormControl rows={5} name="sql" componentClass="textarea" /> </FormGroup>
            </Form>
            </Modal.Body>
            <Modal.Footer>
            <Button onClick={this.ok} appearance="primary">
                Confirm
            </Button>
            <Button onClick={this.close} appearance="subtle">
                Cancel
            </Button>
            </Modal.Footer>
        </Modal>
        </div>
    );
    }
}