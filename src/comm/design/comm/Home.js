import React from 'react'
import { Nav,Input,Icon,Alert,InputGroup,Button,Uploader  } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.min.css';
import '././css/Sidenav-Style.css'
import { Context } from '../../contexApi/Dataprovide';
import  UploadToDatabase  from './UploadToDatabase';
import Creatdb from './Createdb';
import { CKEditor } from '@ckeditor/ckeditor5-react'
import FullEditor from 'ckeditor5-build-full'
import './css/Design.css'
import './css/Main.css'


var header = new Headers();
header.append("Content-Type", "application/json");
var requestOptions = {method: 'GET',headers: Headers,};


const styles = {
    marginBottom:'5px'
};

const MenuStyle = {
    marginTop:'15px',
    marginLeft:'50px',
    width:'90%',
    backgroundColor:'#fdfdfdc7',
    boxShadow:'1px 1px 5px #e8e8e8',
    border: '1px solid #bdbdbd'
};

const MenuContainer={
    padding:10,
    height:450,
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
            <Nav.Item eventKey="Design">Design</Nav.Item>            
            <Nav.Item eventKey="Apps">Apps</Nav.Item>            
            <Nav.Item eventKey="Htmlfun">Htmlfun</Nav.Item>            
        </Nav>
        );
};

const Dbinforeq=()=>{
    return new Promise((resolver,reject)=>{
        fetch("http://localhost:8080/dbinfo", requestOptions)
            .then((response)=>{resolver(response.text())}).catch(error => console.log('error', error));
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
        Htmlimages:[],
        dbinfo:"",
        Activeprojectname:"Project Name",
        Activedir:"dir path ...",
        prevhoverel:{ isempty:true , el:{} },
        ActiveELHtml:"",
        zipfiles:[],
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
        this.OpenWebPage = this.OpenWebPage.bind(this);
        this.OpenGrapesjsEditor = this.OpenGrapesjsEditor.bind(this);
        this.OpenGrapesjsEditorSave = this.OpenGrapesjsEditorSave.bind(this);
        this.Htmlfun = this.Htmlfun.bind(this);
        this.HtmlfunSucc = this.HtmlfunSucc.bind(this);
        this.IconsGeneratorfunsuccess = this.IconsGeneratorfunsuccess.bind(this);
        this.IconsGeneratorfunerror = this.IconsGeneratorfunerror.bind(this);
        this.IconsGeneratorfunupload = this.IconsGeneratorfunupload.bind(this);
        this.GetDesigns = this.GetDesigns.bind(this);        
        this.GetDesignsiframe = this.GetDesignsiframe.bind(this);        
        }
        

        IconsGeneratorfunsuccess(req){
            Alert.success("Icons Generated!")
        }

        IconsGeneratorfunupload(e){
            let _projectname= this.state.Activeprojectname;
            let _dirname= this.state.Activedir;
            fetch("http://localhost:8080/project/infoupdate",
                    {method:'POST',headers:header,body:JSON.stringify({"projectname":_projectname,"dirname":_dirname})}).then((response)=>{
                        console.log(response)
                    }).catch((e)=>{ console.log(e) })
        }

        IconsGeneratorfunerror(error){
            Alert.error(error.response)
        }

        HtmlfunSucc(e){
        localStorage.setItem("zipfiles",JSON.stringify(e));
        this.setState({zipfiles:e},()=>{Alert.success('Files Downloaded !', 3000)});
        this.setState({Activeprojectname:e.projectname});
        this.setState({Activedir:e.dirname});
        }

        Htmlfun(e){
            let _zipfiles=JSON.parse(localStorage.getItem('zipfiles'))

            if(e.target.name=="remove_footer_header"){
                    var raw = JSON.stringify({"files":_zipfiles});
                    fetch("http://localhost:8080/projects/project/html/remove_footer_header",
                    {method:'POST',headers:header,body:raw}).then((response)=>{
                        Alert.success('footer/header were removed !', 3000)
                    }).catch((e)=>{
                        Alert.error('Error Remove footer/header from page !', 3000)})
            }
            if(e.target.name=="removeclass"){
                let removenode = document.querySelector('#removeclasshtml').value
                var raw = JSON.stringify({"files":_zipfiles,"removeclass":removenode});
                if(removenode!=""){
                    fetch("http://localhost:8080/projects/project/html/removeclass",
                    {method:'POST',headers:header,body:raw}).then((response)=>{
                        Alert.success('el were removed !', 3000)
                    }).catch((e)=>{
                        Alert.error('Error Remove removeclass from page !', 3000)})
                }
            }
            if(e.target.name=="calcpages"){
                if(_zipfiles){
                    let htmlfiles=[]
                    _zipfiles.file.forEach((file)=>{
                        let filepath = file.split("/");
                        let filename = filepath[filepath.length-1];
                        let fileexte = filename.split(".")
                        let projectpath = file.split("genx/projects/")
                        if(fileexte[fileexte.length-1]=="html"){
                            htmlfiles.push({"path":file,
                            "projectpath":projectpath[projectpath.length-1],
                            "name":fileexte.slice([0,fileexte.length-1])})
                        }
                    })
                    console.log(htmlfiles[0])
                    Alert.success('Html pages', 3000)
                    localStorage.setItem("htmlfiles",JSON.stringify(htmlfiles))
                }
                // fetch("http://localhost:8080/projects/project/html/calcpages",
                //     {method:'POST',headers:header,body:raw}).then((response)=>{
                //         Alert.success('el were removed !', 3000)
                //     }).catch((e)=>{
                //         Alert.error('Error Remove removeclass from page !', 3000)})
            }
        }


        handleSelect(activeKey) {
        if (activeKey == "WebScraper"){this.oniframeloaded()}
        if (activeKey == "Design"){this.GetDesignsiframe();}
        this.setState({ active: activeKey });
        
        // if(this.context[0].SideNavBtn=="Home" && activeKey != "Apps" && activeKey != "Design" ){
        //     this.setState({ active: activeKey });
        // }
        // if(this.context[0].SideNavBtn=="Apps"){
        //     this.setState({ active: activeKey });
        // }
        }

        componentWillReceiveProps(){
            // if (this.context[0].SideNavBtn=="Apps") { 
            //     // this.setState({ active: this.context[0].SideNavBtn}); 
            // }
            
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
            Dbinforeq().then((data)=>{ this.setState({dbinfo:data}); });
            this.GetDesigns("getdesigns")
        }

        GetDesigns(action){
            fetch((("http://localhost:8080/designs/"+action)), {method: 'POST'})
                .then((response)=>response.json()).then((result)=>{localStorage.setItem("DesignTemplatesHTML",result)})
            fetch((("http://localhost:8080/app/data/get")), {method: 'GET'})
                .then((response)=>response.json()).then((result)=>{
                    localStorage.setItem("projectname",result.projectname)
                    localStorage.setItem("dirpath",result.dirpath)
                    this.setState({Activeprojectname:result.projectname});
                    this.setState({Activedir:result.dirpath});
                })
        }


        GetDesignsiframe(){
            setTimeout((e)=>{
                let  DesignCardContainer = document.getElementsByClassName("Design-Card-Container")[0]
                JSON.parse(localStorage.getItem("DesignTemplatesHTML")).designs.forEach((files)=>{
                    let img = document.createElement("img")
                    let conn = document.createElement("div")
                    let btn = document.createElement("button")
                    img.setAttribute("src",files.Image)
                    conn.setAttribute("style","display:flex;flex-direction:column;")
                    img.setAttribute("style","height:350px;width:290px;margin:20px;border:1px solid")
                    btn.setAttribute("style","height:40px;width:290px;margin:0px 20px")
                    btn.setAttribute("id",files.Design.img.split("/")[2])
                    btn.addEventListener("click", (e)=>{
                    let projectfilesobj = JSON.parse(localStorage.getItem("zipfiles"))
                    fetch((("http://localhost:8080/designs/"+("generate-"+e.target.id))), {method: 'POST',headers:header,
                    body:JSON.stringify({"file":localStorage.getItem("dirpath"),"projectname":localStorage.getItem("projectname"),"projectfiles":projectfilesobj.file})}).then((response)=>response.json()).then((result)=>{
                        Alert.success("Design Generated :- "+e.target.id)
                        console.log(result)})
                    }); 
                    btn.textContent="Design";conn.append(img);conn.append(btn);DesignCardContainer.append(conn)
                });
            },100)
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
                    .catch(error => {console.log('error ->', error);reject(error)});
            }).then((data)=>{this.setState({WebscraperData: data.data});})
            .then(()=>{
                    this.oniframeloaded();
            });
        }
        }

        oniframeloaded(){
        setTimeout(()=>{
            let iframe = document.querySelector('iframe');
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
        }

        OpenWebPage(pagename){
            var formdata = new FormData();
            formdata.append("pagename",pagename);
            var requestOptions = { method: 'POST', body: formdata };
            fetch("http://localhost:8080/scrape/page", requestOptions).then(response => response.json())
            .then((result)=>{
                this.context[1]({SideNavBtn:this.context[0].SideNavBtn,Htmlpage:result.indexpage})
                localStorage.setItem("Htmlpage",result.indexpage)
                localStorage.setItem("Pagename",pagename)
            })
            .catch(error => console.log('error', error));
        }

        OpenGrapesjsEditor(){
            let grapesjseditor = window.open("http://localhost:3000/HTMLEditor")
        }

        OpenGrapesjsEditorSave(){
            console.log("let save the state of grapesjseditor")
            console.log(localStorage)
            
        }



        render() {
        const { active } = this.state;
        const html = '<p>Hey this <strong>editor</strong> rocks 😀</p>';
        return (
            <div style={{display:'flex',flexDirection:'row',justifyContent:'center'}}>
            <div style={MenuStyle}>
                <div style={{padding:"5px 11px",display:"flex",justifyContent:"space-between","backgroundColor":"#000",color:"#fff",fontWeight:"bold"}}>
                    <span style={{width:"25%"}}>{this.state.Activeprojectname}</span>
                    <span style={{fontWeight:"lighter",width:"75%",textAlign:"end"}}>{this.state.Activedir}</span>
                </div>
            
            <MenuComm appearance="subtle" active={active} onSelect={this.handleSelect} />            
            <div className={"Menu"}>
            <div style={{width:'100%',overflow:'auto',display:'flex'}}>


            { active == "Home" && 
                <div className={"Menu-Home"}>
                <div className={"MenuContainer"} style={{width:'65%'}} >

                    <div className={"Home-btn-outer-div"}>
                        <Button className={"Home-btn"} onClick={this.CreateDatabase}  >
                        <Icon className={"Home-btn-icon"} icon="database" />Create Tables</Button> 
                        <Button className={"Home-btn"}>
                        <Icon  className={"Home-btn-icon"} icon="file-text" />Generate Files</Button> 
                    </div>

                </div>
                <div className={"Home-db-info"}>
                <p style={{lineBreak:'anywhere',fontSize:"18px"}}>{this.state.dbinfo}</p>
                </div>
                <Creatdb parentCallback = {this.handleCallback} show={this.state.createdb}></Creatdb>
                </div>
            }



            
            { active == "Editor" && 
            <div className={"Editor-Menu"} style={{height:"490px"}} >
            
            <div>
                <CKEditor data = {this.state.CKEditorData} editor={FullEditor} onChange={this.onEditorChange} />
                <div style={{width:'100',marginTop:'10px',display:'flex',justifyContent:'end'}}>
                    <Button className={"Home-btn"}  onClick={this.UploadtoDatabase} >Upload to Database</Button>
                </div>
                <UploadToDatabase data={this.state.CKEditorData} dbinfo={this.state.dbinfo} 
                parentCallback = {this.handleCallback} show={this.state.uploadbtn} />
            </div>
            
            <div className={"Editor-viewer"}><div dangerouslySetInnerHTML={{ __html: this.state.CKEditorData }} ></div></div>
            </div>
            }


            { active == "WebScraper" && 
            <div className={"MenuContainer","Menu-inner-con"}>
            <InputGroup style={styles}>
                <Input id={"WebScraperSearchbtn"} placeholder={"Link"} />
                <InputGroup.Button onClick={this.onWebScraperClick}><Icon icon="search" /></InputGroup.Button>
            </InputGroup>
            <iframe className={"WebScraper-iframe"} srcDoc={this.state.WebscraperData} >
            </iframe>
            </div>
            }

            { active == "PDFReader" && 
            <div  className={"MenuContainer","Menu-inner-con"} >
            <button style={{padding:'10px',margin:'10px 0px'}} >ClearAllFiles</button>
            <Uploader onSuccess={this.isfileuploaded} style={{boxShadow:"1px 1px 3px #e6e4e4"}} autoUpload={true} accept={".pdf"} 
            action="http://localhost:8080/upload" draggable>
            <div style={{lineHeight: '200px'}}>Click or Drag files to this area to upload</div>
            </Uploader>
            </div>
            }

            { active == "Pages"  && 
            <div className={"MenuContainer","Menu-inner-con"} style={{display:'flex'}}>
            <div style={{width:"20%",height:"100%",overflowY:'auto',scrollbarWidth:'thin'}}>
                <div style={{border:'1px solid #ccc',height:'100%'}}>
                    {this.state.Htmlpages.map((e)=>{
                        if(e!=="assets"){
                                return <div className={"Page-btn"} onClick={(e)=>{this.OpenWebPage(e.target.textContent)}}>{e}</div>
                        }
                    })}
                </div>
            </div>
            <div style={{width: '100%',padding:'10px',height: '92%'}}>

            <div style={{display:'flex',justifyContent:'end',marginRight:'-10px'}}>
                <Button color="green" appearance="primary" onClick={this.OpenGrapesjsEditor} 
                style={{margin:'5px',padding:'5px 20px'}} >
                Open Editor</Button>
                <Button color="green" appearance="primary" onClick={this.OpenGrapesjsEditorSave} 
                style={{margin:'5px',padding:'5px 20px'}} >
                Save</Button>
            </div>

            <iframe className={"WebScraper-iframe"} style={{margin:"0px 5px"}} srcDoc={this.context[0].Htmlpage} width={'100%'} height={"100%"} ></iframe>
            </div>
            </div>
            }


            { active == "Apps" &&
            <div style={MenuContainer,{width:'100%',padding:'10px',height:"500px",display:"flex",scrollbarWidth:'thin'}}>
                <div><h3>Apps</h3></div>
            </div>
            }

            { active == "Design" &&
            <div className={"Design-outer-Container"}>
                <div><h3>Design</h3></div>
                <div className={"Design-Card-Container"} >
                </div>
            </div>
            }


            { active == "Htmlfun" &&
            <div className={"Design-outer-Container"}>
            
            <Uploader  onSuccess={this.HtmlfunSucc} style={{boxShadow:"1px 1px 3px #e6e4e4"}} autoUpload={true} accept={".zip"} multiple={true}
            action="http://localhost:8080/projects/upload" draggable>
            <div style={{lineHeight: '200px'}}>Click or Drag files to this area to upload</div>
            </Uploader>

            <div style={{display:"flex",marginTop:"20px"}}>
            <Button name={"remove_footer_header"} style={{width:"240px"}} className={"Home-btn"}  onClick={this.Htmlfun}>
            <Icon className={"Home-btn-icon"} icon="database" />Remove Header / Footer</Button>
            
            <InputGroup style={{width:"400px"}}>
                <Input id={"removeclasshtml"} placeholder={"Enter classname to remove el"} />
                <InputGroup.Button name="removeclass" onClick={this.Htmlfun}>Remove Class</InputGroup.Button>
            </InputGroup>
            <Button style={{width:"240px"}} name={"calcpages"} className={"Home-btn"} onClick={this.Htmlfun} >Html Pages</Button>
            </div>

            <div style={{display:"flex",alignItems: "center"}}>
            <Uploader listType="picture" onError={this.IconsGeneratorfunerror} shouldUpload={this.IconsGeneratorfunupload} onSuccess={this.IconsGeneratorfunsuccess} multiple autoUpload={true} action="http://localhost:8080/app/icons/generater">
                <button style={{border:"1px solid #000"}}>
                <svg width="1.5em" height="1.5em" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false" className="rs-icon" aria-label="camera retro" data-category="legacy"><path d="M16.571 14.857a.564.564 0 00-.571-.571 2.866 2.866 0 00-2.857 2.857c0 .321.25.571.571.571s.571-.25.571-.571c0-.946.768-1.714 1.714-1.714.321 0 .571-.25.571-.571zm4 2.322c0 2.518-2.054 4.571-4.571 4.571s-4.571-2.054-4.571-4.571 2.054-4.571 4.571-4.571 4.571 2.054 4.571 4.571zM2.286 27.429h27.429v-2.286H2.286v2.286zm20.571-10.25c0-3.786-3.071-6.857-6.857-6.857s-6.857 3.071-6.857 6.857 3.071 6.857 6.857 6.857 6.857-3.071 6.857-6.857zM4.571 5.714h6.857V3.428H4.571v2.286zM2.286 9.143h27.429V4.572H14.929l-1.143 2.286h-11.5v2.286zM32 4.571v22.857a2.279 2.279 0 01-2.286 2.286H2.285a2.279 2.279 0 01-2.286-2.286V4.571a2.279 2.279 0 012.286-2.286h27.429A2.279 2.279 0 0132 4.571z"></path></svg></button>
            </Uploader>
            </div>
            </div>
            }



            </div>
            </div>            
            </div>
            
            </div>
        );
        }
}


