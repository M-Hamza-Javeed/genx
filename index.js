const express = require("express");
var bodyParser = require('body-parser')
var cors = require('cors')
const sqlite3 = require('sqlite3');
const  { open } = require('sqlite');
var axios = require('axios');



const app = express();
app.use(bodyParser.json())
app.use(cors())
var conn=null;

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



process.on('unhandledRejection', error => {
    console.log("Error -> unhandledRejection : -> ",error)
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started on port ${PORT}`));
