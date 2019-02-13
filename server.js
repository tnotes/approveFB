const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
let approve = require('./approve');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
let group = [];
let waitTime = time=>{
    return new Promise(resolve=>{
        setTimeout(function () {
            resolve(true)
        },time)
    })
};
let action = async function(){
    let groupActive = group.filter(e=>{
        if(e.error === 'Đang hoạt động'){
            return e
        }
    });
    if(groupActive.length > 0){
        let groupMap = groupActive.map(e=>approve({groupID:e.groupID,cookie:e.cookie}));
        let groupMapAction = await Promise.all(groupMap);
        group = groupMapAction;
    }
    if(groupActive.length === 0){
        await waitTime(1000);
    }

    return await action()

};
action();
app.post('/',async (req,res)=>{
    res.send(group)
});
app.post('/add',async function(req,res){
    if(!req.body.cookie){
        return res.send('Cookie không được bỏ trống !')
    }
    if(!req.body.groupID){
        return res.send('ID của group không được bỏ trống !')
    }
    group.push({cookie:req.body.cookie,groupID:req.body.groupID,error:'Đang hoạt động'});
    return res.send({cookie:req.body.cookie,groupID:req.body.groupID,error:'Đang hoạt động'});
});
app.post('/remove',async function(req,res){
   if(!req.body.groupID){
       return res.send('ID group muốn xóa chưa được xác định');
   }
   group = group.filter(e=>{
       if(e.groupID !== req.body.groupID){
           return e
       }
   });
    return res.send('Đã xóa thành công '+req.body.groupID)
});
app.listen(process.env.PORT || 80);