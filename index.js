const express = require("express");
var bodyParser = require('body-parser')
var cors = require('cors')
const sqlite3 = require('sqlite3');
const  { open } = require('sqlite');
var axios = require('axios');
const fileUpload = require('express-fileupload');
const fs = require('fs')
var AdmZip = require("adm-zip");
var HTMLParser = require('node-html-parser');
const { exec } = require('child_process');
const { spawn } = require("child_process");
var path = require('path');
const fsextra = require('fs-extra')


const app = express();
app.use(fileUpload());
app.use(bodyParser.json());
app.use(cors());

var conn=null;
let globalstate={"activeDir":"","projectName":""}


var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 
}


open({
    filename: './database/AppDatabase.db',
    driver: sqlite3.Database
}).then((db)=>{
    conn=db;
}).catch((err)=>{
    console.log("Database open error :",err)
});



var moveFile = (file, dir2)=>{
    var f = path.basename(file);
    var source = fs.createReadStream(file);
    var dest = fs.createWriteStream(path.resolve(dir2, f));
    source.pipe(dest);
    source.on('end', function() { console.log('Succesfully copied'); });
    source.on('error', function(err) { console.log(err); });
};





const pygenhtml=(filename)=>{
    return new Promise((resolver,reject)=>{
        var spawn = require('child_process').spawn,
            py    = spawn('python', ['./pdfreader.py']),
            data = {"file":filename.toString(),"path":"./html/"},
            dataString = '';
        py.stdout.on('data', function(data){ dataString += data.toString(); });
        py.stdout.on('end',async ()=>{
            let indexfiles=[];let imagefiles=[]

            await fs.readdir('./html', function (err, files) {
                if (err) { console.log('Unable to scan directory: ' + err);} 
                files.forEach(function (file) { indexfiles.push(file) });
            });

            await fs.readdir('./html/assets/img', function (err, files) {
                if (err) { console.log('Unable to scan directory: ' + err);} 
                files.forEach(function (file) { imagefiles.push(file) });
            });

            await fs.readFile('./html/index.html', 'utf8' , (err, indexpage) => {
                if (!err) { resolver({"indexpage":indexpage,"indexfiles":indexfiles,"imagefiles":imagefiles}) }
            });

        });
        py.stdin.write(JSON.stringify(data));
        py.stdin.end();
    });
}


app.get('/',cors(corsOptions), (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "Host":"localhost",
        "EndPoints":[{
        "EndPoint":{
            "path":"/data",
            "reqtype":"Get"
        }},
        {"EndPoint":{
            "path":"/Insert",
            "reqtype":"POST"
        }}
    ]
    })
});

const getdata=(title)=>{
    if(title){
    return new Promise((resolver,reject)=>{
        conn.all('select * from ReactData where title=$title',{"$title":title}).then((data)=>{
            resolver(data)
        }).catch((err)=>{
            reject(err);
        });
    });
    }
    else{
        return new Promise((resolver,reject)=>{
            conn.all('select * from ReactData').then((data)=>{
                resolver(data)
            }).catch((err)=>{
                reject(err);
            });
        });
    }
}


app.get('/data/:title', cors(corsOptions) ,(req, res) => {
    res.setHeader('Content-Type', 'application/json');
    getdata(req.params.title).then((data)=>{
        res.send(data)
    });
});

app.get('/data', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    getdata(req.params.title).then((data)=>{
        res.send(data)
    });
});

const ReadFile=(folder,name)=>{
    return new Promise((resolver,reject)=>{
            fs.readFile(("./designs/"+folder+("/index."+name)),'utf8',(err,file)=>{
                resolver({"filename":"index.html","path":"./designs/"+name+"/index.html",
                "data":file,"img":("./designs/"+folder+("/"+folder+"."+name))})
            })
    })
}

function capitalizeWords(str) {
    const arr = str.split(" ");
    for (var i = 0; i < arr.length; i++) { arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1); }
    const str2 = arr.join(" ");
    return str2
};

const htmlregularexpression=(regex,str,sub)=>{
    return((str.replace(regex,sub)));
}

const blockSplit_regex=(str)=>{
    const regex = /(?<=<!--Block Start-->).*(?=<!--Block End-->)/migs;
    let genstr = (regex.exec(str));
    if(genstr){ return (genstr[0]);}
    else{ return ""; }
}




const generatedesignHtml=(folder,path,projectname,projectfiles)=>{

    let _projectfiles = projectfiles.map((e)=>{
        let filename = (e.split("/").splice(-1,1).join(".").split(".")[0]).replaceAll("-"," ")
        if(e.split(".").splice(-1,1)=="html"){return ({"path":e.replace(path+"/","").replace(projectname+"/",""),"name":capitalizeWords(filename)}) }
        else{return false}
    })

    fs.readFile(("./designs/"+folder+"/index.html"),"utf-8",async(err,file)=>{

        let CodeBlock = blockSplit_regex(file);let topiccounter=0;
        let GeneratedCodeBlock=_projectfiles.map((projectfile,key)=>{
            if(projectfile){
                if(projectfile.name.match("404")){
                    console.log("404 File Existed")
                }
                else{
                    topiccounter++;
                    return (CodeBlock.replace("{{{SubHeading}}}",projectfile.name).replace("{{{Index}}}",topiccounter).replace("{{{Topic}}}",projectfile.name).replace("{{{TopicLink}}}",projectfile.path))
                }
            }
        });

        let fileStarting = file.split("<!--Block Start-->")
        let fileEnding = file.split("<!--Block End-->")
        let IndexFile_Html=(fileStarting[0]+GeneratedCodeBlock.join("")+fileEnding[1])



        await fs.readdir((path+"/"+projectname),async(err,folders)=>{            
            await fsextra.copy(("./designs/"+folder), (path+"/"+projectname), function (err) {
                if (err) return console.error(err)
                console.log("File Move ",("./designs/"+folder)," -->-> ",(path+"/"+projectname))
                fs.writeFile((path+"/"+projectname+"/index.html"),IndexFile_Html,function(err, data) {
                    console.log("Index File Generated !")
                });
            });
        });

    });
}


app.post('/designs/:action',cors(corsOptions),async(req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(req.params.action=="getdesigns"){
        let designsHtml=[]
        fs.readdir("./designs",async(err,folder)=>{
            for(var i=0;i<folder.length;i++){
                let _e=null
                await ReadFile(folder[i],"html").then((e)=>{_e=e;})
                await fsextra.copy(("./designs/"+folder[i]+("/"+folder[i]+"."+"png")), ('./public/Designs/'+folder[i]+"."+"png"))
                .then(() => {designsHtml.push({"Design":_e,"Image":('/Designs/'+folder[i]+"."+"png")})})
                .catch(err => console.error(err))
            }
            res.json(JSON.stringify({"error":"Action Existed !","designs":designsHtml}))
        });
    }
    else if(req.params.action.match("generate-")){
        let design=req.params.action.split("-")[1]
        generatedesignHtml(design,req.body.file,req.body.projectname.split(".").slice(0,-1).join("."),req.body.projectfiles)
        res.send({"Design":design})
    }
    else{
        res.send({"error":"Action Not Existed !"})
    }
});








app.post('/scrape/page', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let pagename = req.body.pagename;
    fs.readFile("./html/"+pagename, 'utf8' , (err, indexpage) => {
        if (!err) { res.send({"indexpage":indexpage}) }
    });
});



app.get('/scrape',cors(corsOptions),(req, res) => {
    var config = { method: 'get',url:(req.query.link), headers: { }};
    axios(config)
        .then(function (response) {
            res.json({"data":response.data,"error":'no'});
        })
        .catch(function (error) {
            res.json({"error":error});
    });
});

// this endpoint give information about database path , all tables colume data types and primery key information
app.get('/dbinfo', cors(corsOptions) ,(req, res) => {
    let db={};col=[]
    res.setHeader('Content-Type', 'application/json');
    new Promise(async(resolver,reject)=>{
        await conn.all('PRAGMA database_list').then((data)=>{db=data;}).catch(async(err)=>{await reject(err);});
        await conn.all("SELECT tbl_name FROM sqlite_master where name != 'sqlite_sequence' and  type='table'").then(async(data)=>{
        await data.forEach(async(el)=>{
            await conn.all("SELECT name FROM PRAGMA_TABLE_INFO('"+el.tbl_name+"')").then(async(cols)=>{
            await col.push([cols,{"tablename":el.tbl_name}])}).catch(async(err)=>{await reject(err);});
        });
        await setTimeout(async()=>{
            await resolver([db,col])            
        },1000)
        }).catch(
        (err)=>{reject(err);
        });
    }).then((data)=>{
        let path=data[0][0].file.split('\\');
        res.json({
            "col":data[1],
            "path":path.splice(0,path.length-1).join('\\'),
            "filename":path
        })
    });
});


/*sql: {
form: { ids: 'sad', vad: 'asd' },
htmlcontent: '<b>React</b>',
tablinfo: '[[{"name":"ids"},{"name":"vad"}],{"tablename":"lpo"}]'
}*/


// THIS request insert data into database selected by user 
// IF key/Columm not exist in user POST request then it will consider it Autoincrement and that columm will be removed from sql query
// Validation is not writen yet for error you use develper tools and nodejs logs

app.post("/Insert",cors(corsOptions) ,(req, res) => {
    let _tableinfo=JSON.parse(req.body.sql.tablinfo);let form=req.body.sql.form;
    let tablename=_tableinfo[1].tablename;let tablecols=_tableinfo[0];
    let sql_tablename="INSERT INTO "+tablename+"(";
    let sql_colums="";let sql_colums_val="";let sql="";

    tablecols.forEach((item)=>{ 
        for(let key in form){
            if(item.name==key){
                sql_colums_val=sql_colums_val+","+"'"+form[key]+"'";
                sql_colums=sql_colums+","+item.name;
            }
        }
    });

    sql=sql_tablename+sql_colums.replace(',',"")+")"+"VALUES("+sql_colums_val.replace(',','')+")";
    console.log(sql)

    res.setHeader('Content-Type', 'application/json');
    conn.run(sql).then((data)=>{
        res.send(data)
    }).catch((err)=>{
        res.send(err);
    });

});


const Creatdb=()=>{
    return new Promise((resolver,reject)=>{
        resolver(new sqlite3.Database('./database/AppDatabase.db'));
    });
}

app.post("/CreateDB",cors(corsOptions) ,(req, res) => {
    Creatdb().then(()=>{
    res.setHeader('Content-Type', 'application/json');
    res.json({"error":false,
    "Message":"Database -> AppDatabase is create in ./database/AppDatabase"})
    });
});


app.post("/CreateTable",cors(corsOptions) ,(req, res) => {
    console.log(req.body.sql);
    res.setHeader('Content-Type', 'application/json');
    conn.run(req.body.sql).then((data)=>{
        res.send(data)
    }).catch((err)=>{
        res.send(err);
    });
});


app.post("/upload",cors(corsOptions),(req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    file = req.files.file;
    if(file.name.split('.')[1]=="pdf"){
    uploadPath = __dirname + '/media/pdf/' + file.name;
    file.mv(uploadPath, function(err) {
        pygenhtml(file.name).then((data)=>{
            console.log(data)
            res.send(JSON.stringify(data));
        })
    });
    }
    else{
        res.status(400).send()
    }
});


app.post("/CreateTable",cors(corsOptions) ,(req, res) => {
    console.log(req.body.sql);
    res.setHeader('Content-Type', 'application/json');
    conn.run(req.body.sql).then((data)=>{
        res.send(data)
    }).catch((err)=>{
        res.send(err);
    });
});


app.post("/",cors(corsOptions),(req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    file = req.files.file;
    if(file.name.split('.')[1]=="pdf"){
    uploadPath = __dirname + '/media/pdf/' + file.name;
    file.mv(uploadPath, function(err) {
        pygenhtml(file.name).then((data)=>{
            console.log(data)
            res.send(JSON.stringify(data));
        })
    });
    }
    else{
        res.status(400).send()
    }
});

app.post("/CreateTable",cors(corsOptions) ,(req, res) => {
    console.log(req.body.sql);
    res.setHeader('Content-Type', 'application/json');
    conn.run(req.body.sql).then((data)=>{
        res.send(data)
    }).catch((err)=>{
        res.send(err);
    });
});


app.post("/app/icons/generater",cors(corsOptions) ,(req, res) => {

    if(globalstate.projectName == "" || globalstate.activeDir == "" ){
        console.log("Project Name / ActivDir is not set!")
            return res.status(400).send("Project Name / ActivDir is not set!")
    }else{
        if (!req.files || Object.keys(req.files).length === 0) {
            console.log("No files were uploaded.")
            return res.status(400).send('No files were uploaded.');
        }
    
        file = req.files.file;
        _filename=file.name.split('.')[1]
        if(_filename.toLowerCase()=="png" || _filename.toLowerCase()=="jpg" || _filename.toLowerCase()=="webp" || _filename.toLowerCase()=="jpeg"){
            uploadPath = globalstate.activeDir+"/uploaded";

            if (fs.existsSync(uploadPath)) {
                console.log('Directory exists!');
                file.mv(uploadPath+"/"+file.name, function(err) {
                    exec("cd "+uploadPath+" && icon "+(uploadPath+"/"+file.name), (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return res.sendStatus(500)
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return res.status(200).send("Icon generated !")
                        }
                        console.log(`stdout: ${stdout}`);
                        return res.sendStatus(400)
                    });

                });
            } else {


            fs.mkdir(uploadPath,(e)=>{
                if(e){
                    console.log(e)
                    return res.send("error during creating project !")
                }
                else{
                    file.mv(uploadPath+"/"+file.name, function(err) {
                        exec("cd "+uploadPath+" && icon "+(uploadPath+"/"+file.name), (error, stdout, stderr) => {
                            if (error) {
                                console.log(`error: ${error.message}`);
                                return res.sendStatus(500)
                            }
                            if (stderr) {
                                console.log(`stderr: ${stderr}`);
                                return res.sendStatus(200)
                            }
                            console.log(`stdout: ${stdout}`);
                            return res.sendStatus(400)
                        });

                    });

                }
            });

        }

        }
        else{
            return res.status(400).send("upload png file!")
        }
    }

});


app.post("/Htmlfun/:action",cors(corsOptions),(req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send()
});


app.post("/project/:action",cors(corsOptions),(req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(req.body.projectname && req.body.dirname){
        globalstate.activeDir = path.normalize(req.body.dirname);
        globalstate.projectName = req.body.projectname;
        res.send()
    }
    else{
        res.send("Project Name / Dir Name is empty !")
    }
});


app.post("/projects/upload",cors(corsOptions),async(req, res) => {
    let uploadPath="";let extractdir=""
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    file = req.files.file;
    let ext=file.name.split('.')


    if(ext[ext.length-1]=="zip"){
        await fs.readdir(__dirname + '/projects/', function (err, files) {
            if(files.includes(file.name)){uploadPath = (__dirname + '/projects/'+file.name+"_"+files.length)}
            else{uploadPath = (__dirname + '/projects/'+file.name)}

            fs.mkdir(uploadPath,(e)=>{
                if(e){
                    res.send("error during creating project !")
                }
                else{

                    if(files.includes(file.name)){uploadPath = (__dirname + '/projects/'+file.name+"_"+files.length+"/") + file.name;extractdir=(__dirname + '/projects/'+file.name+"_"+files.length)
                    }else{uploadPath = (__dirname + '/projects/'+file.name+"/") + file.name;
                    extractdir=(__dirname + '/projects/'+file.name)}



                    file.mv(uploadPath,async(err)=>{
                        try {
                            let files=[]
                            var zip = new AdmZip(uploadPath);
                            var zipEntries = zip.getEntries();
                            await zip.extractAllTo(extractdir,true)
                            await zipEntries.forEach((zipEntry)=>{
                            if(fs.lstatSync(extractdir+"/"+zipEntry.entryName).isFile()){
                                files.push(extractdir+"/"+zipEntry.entryName);
                            }                            
                            });
                            await res.send({"file":files,"dirname":extractdir,"projectname":file.name})
                            
                        } catch (err) {
                            res.send("error during extraction of zip file")
                            console.log(err)
                        }
                    });
                }
            })
        });
    }
    else{
        res.send("Upload zip file!")
    }
});

const saveHtmlfile=(files,c)=>{
    fs.readFile(files[c],'utf8' , (err, data) => {
        var root = HTMLParser.parse(data);
        let headernode = root.querySelector('header');
        let fotternode = root.querySelector('footer');

        if(headernode){headernode.remove();}
        if(fotternode){fotternode.remove();}
        
        fs.writeFile(files[c],root.innerHTML,(e)=>{
            if(e){console.log("error during saving file!")}
        });

    });
}





app.post("/projects/project/html/:action",cors(corsOptions),async(req, res) => {
    if(req.params.action=="removefooter"){
        res.send({"message":"completed!"})
    }
    else if(req.params.action=="remove_footer_header"){
        let files= req.body.files.file;

        for(let c=0;c<files.length;c++){
            let name = files[c].split('.')
            if(name[name.length-1]=="html"){ saveHtmlfile(files,c) }
        }

        res.send({"message":"completed!"})
    }
    else if(req.params.action=="removeclass"){

        if(req.body.files.file){
        let files= req.body.files.file;
        
        for(let c=0;c<files.length;c++){
            let name = files[c].split('.')
            if(name[name.length-1]=="html"){
                fs.readFile(files[c],'utf8' , (err, data) => {
                    var root = HTMLParser.parse(data);
                    console.log(req.body.removeclass)
                    let classnode = root.querySelector(req.body.removeclass.toString().trim());
                    console.log(classnode)
                    if(classnode){
                        classnode.remove();
                        fs.writeFile(files[c],root.innerHTML,(e)=>{if(e){console.log("error during saving file!")}});
                    }
                });
            }
        }
                res.send({"message":"completed!"})
        }    
        else{
                res.send({"message":"Files were not loaded yet!"})
        }
    }
    else if(req.params.action=="calcpages"){
        fs.readdir('./html', function (err, files) {
            console.log(files)
        });
        console.log("pages )|(")
    }
    else{ res.send("Files were not loaded yet") }
});


process.on('unhandledRejection', error => {
    console.log("Error -> unhandledRejection : -> ",error)
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
