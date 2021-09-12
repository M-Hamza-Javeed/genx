var header = new Headers();
header.append("Content-Type", "application/json");


export const createtable=(sql)=>{
    return new Promise((resolver,reject)=>{
        var requestOptions = {method:'POST',headers: header,body: JSON.stringify({"sql":sql})};
        fetch("http://localhost:8080/CreateTable", requestOptions).then((res)=>{resolver(res)})
        .catch(error => console.log('error', error));
    })
}


export const UploadContent=(sql)=>{
    return new Promise((resolver,reject)=>{
        var requestOptions = {method:'POST',headers: header,body: JSON.stringify({"sql":sql})};
        fetch("http://localhost:8080/Insert", requestOptions).then((res)=>{resolver(res)})
        .catch(error => console.log('error', error));
    })
}




