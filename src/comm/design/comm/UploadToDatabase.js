import React from 'react'
import { SelectPicker,Modal,Alert,Button,FormGroup,FormControl,ControlLabel,Form } from 'rsuite';
import {UploadContent} from './request'


export default class UploadtoDatabase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {formValue:{},data:"",Tableindex:0}
        this.close = this.close.bind(this);
        this.ok = this.ok.bind(this);
        this.HandleSelectPicker = this.HandleSelectPicker.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    close() {this.props.parentCallback({"from":"UploadToDatabase",show:false});}

    ok() {
        let len=0
        for (var key in this.state.formValue){len=len+1;}
        if(len<1){{Alert.error('Input Fields Empty', 3000)}}
        else{
            UploadContent({"form":this.state.formValue,"htmlcontent":this.props.data,
            tablinfo:JSON.stringify(JSON.parse(this.props.dbinfo).col[this.state.Tableindex])})
            {Alert.success('Data Uploaded', 3000)}
        }
        this.props.parentCallback({"from":"UploadToDatabase",show:false});
    }

    HandleSelectPicker(item){
    this.setState({formValue:{}});
    if(item==null){this.setState({Tableindex:0});}else{this.setState({Tableindex:item})}}
    
    handleChange(item){this.setState({formValue:item})}


    render() {
        return (
            <Modal show={this.props.show} onHide={this.close} onExited={this.resetRows}>
                <Modal.Header><Modal.Title>Upload Content</Modal.Title></Modal.Header>

                <Modal.Body>
                <Form fluid onChange={this.handleChange} formValue={this.state.formValue} >

                <FormGroup> 
                <ControlLabel>Tables</ControlLabel> 
                <SelectPicker onChange={this.HandleSelectPicker} placeholder="Select Table Name" block data={JSON.parse(this.props.dbinfo).col.map(
                (item,index)=>({"label":item[1].tablename,"value":index,"role": "Master"})
                )}/>
                </FormGroup>

                
                {
                    JSON.parse(this.props.dbinfo).col[this.state.Tableindex][0].map(
                    (item,index)=>(<FormGroup><ControlLabel style={{fontVariantCaps:'petite-caps'}}>{item.name}</ControlLabel> 
                    <FormControl name={item.name} placeholder="#HTMLDATA to send HTML Content / Leave auto increment Feilds" /></FormGroup>)
                    )
                }


                </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button onClick={this.ok} appearance="primary">Ok</Button>
                <Button onClick={this.close} appearance="subtle">Cancel</Button>
                </Modal.Footer>
            </Modal>
        );
        }
}