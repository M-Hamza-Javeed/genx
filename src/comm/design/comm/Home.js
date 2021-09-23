import React from 'react'
import { Nav,Input,Icon,Alert,InputGroup,Button,Uploader  } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.min.css';
import '././css/Sidenav-Style.css'
import { Context } from '../../contexApi/Dataprovide';
import  UploadToDatabase  from './UploadToDatabase';
import Creatdb from './Createdb';
import { CKEditor } from '@ckeditor/ckeditor5-react'
import FullEditor from 'ckeditor5-build-full'
// import 'grapesjs-preset-webpage';
import { GrapesjsReact } from "grapesjs-react";
import "grapesjs/dist/css/grapes.min.css";


import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState , ContentState } from 'draft-js';

// import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';



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
            <Nav.Item eventKey="PDFReader">PDFReader</Nav.Item>
            <Nav.Item eventKey="Pages">Pages</Nav.Item>            
            <Nav.Item eventKey="Apps">Apps</Nav.Item>            
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
        Htmlpage:'',
        Htmlpages:[],
        editorState:EditorState.createEmpty(),
        Htmlimages:[],
        dbinfo:"",
        prevhoverel:{ isempty:true , el:{} },
        ActiveELHtml:"",
        grapejsref:{},
        uploadbtn:false,
        UploadintoDatabase:"No Data",
        WebscraperData:"",
        CKEditorData:"React"
        };

        this.handleCallback = this.handleCallback.bind(this);
        this.UploadtoDatabase = this.UploadtoDatabase.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.CreateDatabase = this.CreateDatabase.bind(this);
        this.onEditorChange = this.onEditorChange.bind(this);
        this.onWebScraperClick = this.onWebScraperClick.bind(this);
        this.oniframeloaded = this.oniframeloaded.bind(this);
        this.isfileuploaded = this.isfileuploaded.bind(this);
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
        this.makeEditorState = this.makeEditorState.bind(this);
        this.OpenWebPage = this.OpenWebPage.bind(this);

        }


        makeEditorState(_Html){
            const contentBlock = htmlToDraft(_Html);
            if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
            const _editorState = EditorState.createWithContent(contentState);
            this.setState({editorState:_editorState});
            }
        }


        handleSelect(activeKey) {
        if (activeKey == "WebScraper"){this.oniframeloaded()} 
        if(this.context[0].SideNavBtn=="home"){ this.setState({ active: activeKey }); }
        if (this.context[0].SideNavBtn=="Apps") { this.setState({ active: this.context[0].SideNavBtn}); }
        }

        componentWillReceiveProps(){
            if (this.context[0].SideNavBtn=="Apps") { this.setState({ active: this.context[0].SideNavBtn}); }
            if (this.context[0].SideNavBtn=="home") { this.setState({ active: "Home"}); }
        }

        
        onEditorStateChange(_editorState){
            this.setState({editorState:_editorState});
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


        isfileuploaded(indexPage){
            this.setState({
                Htmlpage:indexPage.indexpage
            })
            this.setState({
                Htmlpages:indexPage.indexfiles
            })
            this.setState({
                Htmlimages:indexPage.imagefiles
            })
            this.makeEditorState(indexPage.indexpage)
        }

        OpenWebPage(pagename){
            console.log(pagename)
            var formdata = new FormData();
            formdata.append("pagename",pagename);
            var requestOptions = { method: 'POST', body: formdata };
            fetch("http://localhost:8080/scrape/page", requestOptions).then(response => response.json())
            .then((result)=>{
                this.state.grapejsref.editor.setComponents(result.indexpage)
            })
            .catch(error => console.log('error', error));
        }



        render() {
        const { active } = this.state;
        const html = '<p>Hey this <strong>editor</strong> rocks 😀</p>';
        const contentBlock = htmlToDraft(html)
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

            { active == "PDFReader" && 
            <div style={MenuContainer,{width:'100%',padding:'10px',height:"500px"}} >
            <button style={{padding:'10px',margin:'10px 0px'}} >ClearAllFiles</button>
            <Uploader onSuccess={this.isfileuploaded} style={{boxShadow:"1px 1px 3px #e6e4e4"}} autoUpload={true} accept={".pdf"} action="http://localhost:8080/upload" draggable>
            <div style={{lineHeight: '200px'}}>Click or Drag files to this area to upload</div>
            </Uploader>
            </div>
            }

            { active == "Pages" && 
            <div style={MenuContainer,{width:'100%',padding:'10px',height:"500px",display:"flex"}}>
            <div style={{width:"20%",height:"100%",overflowY:'auto',scrollbarWidth:'thin'}}>
                {this.state.Htmlpages.map((e)=>{
                    if(e!=="assets"){
                            return <div onClick={(e)=>{this.OpenWebPage(e.target.textContent)}} style={{display:'flex',margin:'10px 0px',color:"#fff",padding:"5px",marginRight:'7px',justifyContent:'center','backgroundColor':'#000'}} ><p>{e}</p></div>
                    }
                })}
            </div>       
            <GrapesjsReact id='grapesjs-react' components={this.state.Htmlpage} onInit={(ref)=>{this.setState({grapejsref:ref})}} plugins={['gjs-preset-webpage','gjs-blocks-basic']} />;
            </div>
            }


            { active == "Apps" &&
            <div style={MenuContainer,{width:'100%',padding:'10px',height:"500px",display:"flex",scrollbarWidth:'thin'}}>

            </div>
            }




            </div>
            </div>            
            </div>
            
            </div>
        );
        }
}


