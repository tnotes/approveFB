const request = require('request');

let FINDid = (text,startS,lastS)=>{
    let start = text.indexOf(startS) + startS.length;
    let last = text.indexOf(lastS,start);
    let sub = text.substring(
        start,last
    );
    return sub;
};

let fb_dtsg_ACTION = ({url,cookie,agent})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'get',
            url: url,
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,
            },

        };
        request(option, function (err, res, body) {
            if(body.includes('Tạo tài khoản')){
                resolve(false)
            }else {
                resolve(FINDid(body, 'name="fb_dtsg" value="', '"'))
            }
        });
    });
};

let approveGroup = ({groupID,cookie,agent,fb_dtsg})=>{
    return new Promise(resolve=> {
        let option = {
            method: 'post',
            url: 'https://www.facebook.com/api/graphql/',
            headers: {
                "User-Agent": agent,
                "Cookie":cookie,

            },
            form:{

                "__user": FINDid(cookie, "c_user=", ";"),
                av: FINDid(cookie, "c_user=", ";"),
                "fb_dtsg":fb_dtsg,
                variables: '{"input":{"client_mutation_id":"1","actor_id":"'+FINDid(cookie, "c_user=", ";")+'","group_id":"'+groupID+'","source":"requests_queue","name_search_string":null,"pending_member_filters":{"filters":[]}}}',
                doc_id: '1511272355657946'

            }
        };
        request(option, function (err, res, body) {
            if(body.includes('html>')){
                return resolve({error:'Cookie hết hạn',groupID:groupID,cookie})
            }
            if(JSON.parse(body)['errors'] === undefined){
                return resolve({error:'Đang hoạt động',groupID:groupID,cookie})
            }else{
                return resolve({error:'ID group không tồn tại',groupID:groupID,cookie})
            }
        });
    });
};



module.exports = async ({groupID,cookie})=>{
    if(groupID === null || cookie === null){
        return {error:'ID hoặc Cookie đang bị bỏ trống',groupID:groupID,cookie}
    }else {
        let url = 'https://m.facebook.com/';
        let agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36';
        let fb_dtsg = await fb_dtsg_ACTION({url, cookie, agent});
        if (fb_dtsg === false) {
            return {error: 'Cookie hết hạn', groupID:groupID,cookie}
        } else {
            let approve = await approveGroup({groupID, cookie, agent, fb_dtsg})
            return approve;
        }
    }

};