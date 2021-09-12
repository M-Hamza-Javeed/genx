import React,{useContext,useState} from 'react'
import { Nav,Input,Icon,Alert,InputGroup, Button } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.min.css';
import '././css/Sidenav-Style.css'
import { Context } from '../../contexApi/Dataprovide';
import  UploadToDatabase  from './UploadToDatabase';
import Creatdb from './Createdb';
import { CKEditor } from '@ckeditor/ckeditor5-react'
import FullEditor from 'ckeditor5-build-full'


var header = new Headers();
header.append("Content-Type", "application/json");
var requestOptions = {method: 'GET',headers: Headers,};


const styles = {
    marginBottom:'5px'
};

const MenuStyle = {
    marginTop:'30px',
    marginLeft:'50px',
    width:'90%',
    backgroundColor:'#fdfdfdc7',
    boxShadow:'1px 1px 5px #e8e8e8',
    border: '1px solid #bdbdbd'
};

const MenuContainer={
    padding:10,
    height:500,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
}

const MenuComm = ({ active, onSelect, ...props }) => {
        return (
        <Nav {...props} activeKey={active} onSelect={onSelect} style={styles}>
            <Nav.Item eventKey="Home" icon={<Icon icon="database" style={{color:"#000"}} />}>Database</Nav.Item>
            <Nav.Item eventKey="Editor">Editor</Nav.Item>
            <Nav.Item eventKey="WebScraper">Web Scraper</Nav.Item>
        </Nav>
        );
};

const Dbinforeq=()=>{
    return new Promise((resolver,reject)=>{
        fetch("http://localhost:8080/dbinfo", requestOptions)
            .then((response)=>{
                resolver(response.text())
            })
            .catch(error => console.log('error', error));
    });
}


export default class Menu extends React.Component {
        static contextType=Context
        constructor(props) {
        super(props);
        this.state = {
        active: 'Home', 
        createdb:false,
        dbinfo:"",
        prevhoverel:{ isempty:true , el:{} },
        ActiveELHtml:"",
        uploadbtn:false,
        UploadintoDatabase:"No Data",
        WebscraperData:"",
        CKEditorData:"React has been designed from the start for gradual adoption,and you can use as little or as much React as you need. Whether you want to get a taste of React, add some interactivity to a simple HTML page, or start a complex React-powered app, the links in this section will help you get started.React has been designed from the start for gradual adoption, and you can use as little or as much React as you need. Perhaps you only want to add some “sprinkles of interactivity” to an existing page. React components are a great way to do that.The majority of websites aren’t, and don’t need to be, single-page apps. With a few lines of code and no build tooling, try React in a small part of your website. You can then either gradually expand its presence, or keep it contained to a few dynamic widgets."
        };

        this.handleCallback = this.handleCallback.bind(this);
        this.UploadtoDatabase = this.UploadtoDatabase.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.CreateDatabase = this.CreateDatabase.bind(this);
        this.onEditorChange = this.onEditorChange.bind(this);
        this.onWebScraperClick = this.onWebScraperClick.bind(this);
        this.oniframeloaded = this.oniframeloaded.bind(this);
        }

        handleSelect(activeKey) {
        if (activeKey == "WebScraper"){this.oniframeloaded()} 
        this.setState({ active: activeKey });
        }

        handleCallback(req){
            if(req.from=="CreateTable"){this.setState({createdb: req.show });}
            if(req.from=="UploadToDatabase"){this.setState( { uploadbtn: req.show });}
        }

        UploadtoDatabase() {
            this.setState({UploadintoDatabase:this.state.CKEditorData});
            this.setState({uploadbtn: true});
        }

        onEditorChange( evt,data ) {
            this.setState( {
                CKEditorData: data.getData()
            });
        }

        CreateDatabase(){
            this.setState( {
                createdb: true
            });
        }

        componentDidMount(){
            Dbinforeq().then((data)=>{ 
            this.setState({
                dbinfo:data
            });
            console.log(this.state.dbinfo)
            });
        }

        onWebScraperClick(){
            let link = document.querySelector('#WebScraperSearchbtn').value;
            if(link.search('https://')){
                {Alert.error('URL of website is not Valid!', 3000)}
            }
            else{
            this.setState({ WebscraperData:"" });
            new Promise((resolver,reject)=>{
                    var requestOptions = {method: 'GET',headers: Headers};            
                    fetch(("http://localhost:8080/scrape?link="+link), requestOptions)
                        .then((response)=>{
                            resolver(response.json())
                    })
                    .catch(error => console.log('error ->', error));
            }).then((data)=>{this.setState({WebscraperData: data.data});})
            .then(()=>{
                    this.oniframeloaded();
            });
        }
        }

        oniframeloaded(){
        setTimeout(()=>{
            let iframe = document.querySelector('iframe');
            console.log(iframe)
            if (iframe){
                iframe=iframe.contentWindow;
                iframe.document.body.addEventListener('mouseover',(e)=>{
                    if(!(e.target.classList.contains("genx-containner-4234od3d") || e.target.id == "genx-containner-4234od3d")){
                        if(this.state.prevhoverel.isempty){
                            e.target.style.border="1px solid red";
                            this.setState({prevhoverel:{el:e.target,isempty:false}});
                        }
                        else{
                            this.state.prevhoverel.el.style.border="";
                            e.target.style.border="1px solid red";
                            this.setState({prevhoverel:{el:e.target,isempty:false}});
                        }
                    }
                });

                iframe.document.body.addEventListener('click',(e)=>{
                    if(e.target.name !== "add"){
                        iframe.document.querySelectorAll('.genx-containner-4234od3d').forEach((e)=>{e.remove();});
                        if(e.target.id != "genx-containner-4234od3d"){
                            if(!this.state.prevhoverel.isempty){this.state.prevhoverel.el.style.border="";}
                            this.setState({ActiveELHtml:this.state.prevhoverel.el.outerHTML});
                            e.target.innerHTML+='<div class="genx-containner-4234od3d"\
                            style="font-size:13px;margin:10px 0px;">\
                            <button name="add" id="genx-containner-4234od3d"\
                            style="background-color:black;padding: 3px 30px;color: #fff;">Add</button>'}
                    }
                    if(e.target.name=="add"){
                        this.setState({CKEditorData:this.state.CKEditorData+this.state.ActiveELHtml});
                    }
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        },1500);
        }
        




        render() {
        const { active } = this.state;
        return (
            <div style={{display:'flex',flexDirection:'row',justifyContent:'center'}}>
            <div style={MenuStyle}>

            
            <MenuComm appearance="subtle" active={active} onSelect={this.handleSelect} />            
            <div style={{display:'flex',flexDirection:'row',justifyContent:'space-between'}}>
            <div style={{width:'100%',overflow:'auto',display:'flex'}}>


            { active == "Home" && 
            <div style={{width:"100%",display:'flex',height:'500px'}} >

            <div style={MenuContainer,{width:'65%'}} >
                <div style={{display:'flex',justifyContent:'space-around',padding:'20px'}}>
                
                <Button onClick={this.CreateDatabase} 
                style={{margin:'2px 5px',width:'170px',backgroundColor:'#000',color:'#fff'}}>
                <Icon   icon="database" style={{padding:'0px 10px',color:'#fff'}} />Create Tables</Button> 
                
                <Button style={{width:'170px',margin:'2px 5px',backgroundColor:'#000',color:'#fff'}}>
                <Icon   icon="file-text" style={{padding:'0px 10px',color:'#fff'}} />Generate Files</Button> 
                
                </div>
            </div>
            <div style={{"width":"35%",padding:"5px 10px",border:"1px solid rgb(189, 189, 189)",borderRight:"0px",borderBottom:"0px"}}>
            <p style={{lineBreak:'anywhere',fontSize:"18px"}}>{this.state.dbinfo}</p>
            </div>
            <Creatdb parentCallback = {this.handleCallback} show={this.state.createdb}></Creatdb>
            </div>
            }



            
            { active == "Editor" && 
            <div style={{display:"flex",flexDirection:'row !important',width:"100%",height:'500px',marginTop:'10px'}} >
            
            <div style={{width:'65%',padding:'10px',overflowY:'auto',overflowX:'hidden',margin:"0px 10px"}}>
                <CKEditor 
                data = {this.state.CKEditorData}
                editor={FullEditor}
                onChange={this.onEditorChange} />
                <div style={{width:'100',marginTop:'10px',display:'flex',justifyContent:'end'}}>
                    <Button  onClick={this.UploadtoDatabase} style={{width:'200px',backgroundColor:'#424242',color:'#fff'}}>Upload to Database</Button>
                </div>
                <UploadToDatabase
                data={this.state.CKEditorData}
                dbinfo={this.state.dbinfo}
                parentCallback = {this.handleCallback} show={this.state.uploadbtn} />
            </div>
            
            <div style={{"width":"35%",overflow:"auto",padding:"5px 10px",border:"1px solid rgb(189, 189, 189)",borderRight:"0px",borderBottom:"0px"}}>
            <div dangerouslySetInnerHTML={{ __html: this.state.CKEditorData }} ></div>
            </div>
            </div>
            }


            { active == "WebScraper" && 
            <div style={MenuContainer,{width:'100%',padding:'10px',height:"500px"}} >
            <InputGroup style={styles}>
                <Input id={"WebScraperSearchbtn"} placeholder={"Link"} />
                <InputGroup.Button onClick={this.onWebScraperClick}>
                    <Icon icon="search" />
                </InputGroup.Button>
            </InputGroup>
            <iframe srcDoc={this.state.WebscraperData}
            style={{border:"1px solid #ccc",width:'100%',height:'calc( 100% - 40px)'}}>
            </iframe>
            </div>
            }


            </div>
            </div>            
            </div>
            </div>
        );
        }
}


