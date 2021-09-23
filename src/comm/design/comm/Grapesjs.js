import React from 'react'
import { Context } from '../../contexApi/Dataprovide';
import  UploadToDatabase  from './UploadToDatabase';
// import 'grapesjs-preset-webpage';
import { GrapesjsReact } from "grapesjs-react";
import "grapesjs/dist/css/grapes.min.css";
import 'grapesjs-preset-webpage';



export default class GrapejsEditor extends React.Component {
    static contextType=Context

    constructor(props) {
        super(props);
        this.state = { 
            Htmlpage:"",
            grapejsref:{}
        };
    }

    render(){
        return (<div>
            <GrapesjsReact id='grapesjs-react' components={this.context[0].Htmlpage} onInit={(ref)=>{this.setState({grapejsref:ref});console.log(this.context)}} plugins={['gjs-preset-webpage','gjs-blocks-basic']} />;
        </div>)
    }
}
