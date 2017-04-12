var AV = require('leanengine');
var Joke = AV.Object.extend("Joke");
var fetchAllJokeWithParams = function(type,page,timestamp){
    AV.Cloud.httpRequest({
        url: 'http://joke.zaijiawan.com/Joke/joke2.jsp?appname=readingxiaonimei&version=3.10.0&os=ios&hardware=iphone&sort='+type+'&page='+page+'&timestamp='+timestamp,
        success: function(httpResponse) {
            console.log('type='+type+',page='+page+',timestamp='+timestamp);
            console.log(httpResponse.text);
            var xml = httpResponse.text;//'<?xml version="1.0" encoding="UTF-8" ?><business><company>Code Blog</company><owner>Nic Raboy</owner><employee><firstname>Nic</firstname><lastname>Raboy</lastname></employee><employee><firstname>Maria</firstname><lastname>Campos</lastname></employee></business>';
            var parseString = require('xml2js').parseString;
            //var xml = strXml;
            parseString(xml, function (err, result) {
                //console.log(JSON.stringify(result));
                console.log('------------------------.....');
                //var jsonObj = JSON.parse(result);
                //console.log(result.root.joke);
                result.root.joke.forEach(function(entry) {
                    console.log(entry);
                    var query = new AV.Query(Joke);
                    query.equalTo("jokeId", entry.id[0]);
                    query.find({
                        success: function(results) {
                            console.log("Successfully retrieved " + results.length + " posts.");
                            // 处理返回的结果数据
                            if(results.length <= 0){
                                saveJoke(entry,type);

                            }
                        },
                        error: function(error) {
                            console.log("Error: " + error.code + " " + error.message);
                        }
                    });

                });
                if(result.root.timestamp){
                    timestamp = escape(result.root.timestamp[0]);
                }
                console.log('timestamp=='+timestamp);
                page++;
                if(result.root.joke.length >= 20 && page<3600){//约等于3年的数据
                    fetchAllJokeWithParams(type,page,timestamp);
                }
            });
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
        }
    });
}
var saveJokeWithXml = function(strXml,type){//type 0:文本笑话,1:图片笑话
    var parseString = require('xml2js').parseString;
    var xml = strXml;
    parseString(xml, function (err, result) {
        //console.log(JSON.stringify(result));
        console.log('------------------------.....');
        //var jsonObj = JSON.parse(result);
        //console.log(result.root.joke);
        result.root.joke.forEach(function(entry) {
            console.log(entry);
            var query = new AV.Query(Joke);
            query.equalTo("jokeId", entry.id[0]);
            query.find({
                success: function(results) {
                    console.log("Successfully retrieved " + results.length + " posts.");
                    // 处理返回的结果数据
                    if(results.length <= 0){
                        saveJoke(entry,type);

                    }
                },
                error: function(error) {
                    console.log("Error: " + error.code + " " + error.message);
                }
            });

        });
    });
}

var saveJoke = function(entry,type){//type 0:文本笑话,1:图片笑话
    var joke = new Joke();
    joke.set("jokeId", entry.id[0]);
    joke.set("name", entry.name[0]);
    joke.set("time", parseDateFromString(entry.time[0]));
    joke.set("content", entry.text[0]);
    if(entry.imgurl)
        joke.set("imgurl", entry.imgurl[0]);
    if(entry.thmurl)
        joke.set("thmurl", entry.thmurl[0]);
    if(entry.videourl)
        joke.set("videourl", entry.videourl[0]);
    joke.set("type",type);
    joke.save(null, {
        success: function(joke) {
            // 成功保存之后，执行其他逻辑.
            console.log('New object created with objectId: ' + joke.id);
        },
        error: function(joke, error) {
            // 失败之后执行其他逻辑
            // error 是 AV.Error 的实例，包含有错误码和描述信息.
            console.log('Failed to create new object, with error message: ' + error.message);
        }
    });
    //parseDateFromString(entry.time[0]);
}
var parseDateFromString = function(strDate){
    var date = new Date();
    if(strDate.indexOf("年") > -1){//14年06月02日
        var year = "20"+strDate.substring(0,2);
        var month = Number(strDate.substring(3,5))-1;
        var day = strDate.substring(6,8);
        date.setFullYear(year);
        date.setMonth(month);
        date.setDate(day);
    }else if(strDate.indexOf("月") > -1){//03月22日
        var month = Number(strDate.substring(0,2))-1;
        var day = strDate.substring(3,5);
        date.setMonth(month);
        date.setDate(day);
    }else if(strDate.indexOf("日") > -1){//25日 09:24
        var day = strDate.substring(0,2);
        var hour = strDate.substring(4,6);
        var minute = strDate.substring(7,9);
        date.setDate(day);
        date.setHours(hour);
        date.setMinutes(minute);
    }else if(strDate.indexOf("今天") > -1){//今天 11:08
        var hour = strDate.substring(3,5);
        var minute = strDate.substring(6,8);
        date.setHours(hour);
        date.setMinutes(minute);
    }else if(strDate.indexOf("昨天") > -1){//昨天 02:54
        var hour = strDate.substring(3,5);
        var minute = strDate.substring(6,8);
        date.setDate(date.getDate()-1);
        date.setHours(hour);
        date.setMinutes(minute);
    }
    console.log('parseDateFromString result:'+date);
    // offset =-8; //北京时间-8
    // var bj = date.getTime() + (3600000*offset);
    date = new Date(bj);
    return date;
}

AV.Cloud.define('learnTest', function(request, response) {
// AV.Object 的稍复杂一点的子类
    var Post = AV.Object.extend("Post", {
        //实例方法
        pubUser: function() {
            return this.get("pubUser");
        },
        content: function(){
            return this.get('content');
        }
    }, {
        //类方法
        spawn: function(username) {
            var post = new Post();
            post.set("pubUser", username);
            return post;
        }
    });
    var post = new Post();
    post.set("content", "每个 JavaScript 程序员必备的8个开发工具");
    post.set("pubUser", "LeanCloud官方客服");
    post.set("pubTimestamp", 1435541999);
    post.save(null, {
        success: function(post) {
            // 成功保存之后，执行其他逻辑.
            alert('New object created with objectId: ' + post.id);
        },
        error: function(post, error) {
            // 失败之后执行其他逻辑
            // error 是 AV.Error 的实例，包含有错误码和描述信息.
            alert('Failed to create new object, with error message: ' + error.message);
        }
    });
})

AV.Cloud.define('fetchJoke', function(request, response) {
    console.log('ttttttttttttt.....');
    AV.Cloud.httpRequest({
        url: 'http://joke.zaijiawan.com/Joke/joke2.jsp?appname=readingxiaonimei&version=3.10.0&os=ios&hardware=iphone&sort=0&page=0&timestamp=(null)',
        success: function(httpResponse) {
            console.log(httpResponse.text);
            var xml = httpResponse.text;//'<?xml version="1.0" encoding="UTF-8" ?><business><company>Code Blog</company><owner>Nic Raboy</owner><employee><firstname>Nic</firstname><lastname>Raboy</lastname></employee><employee><firstname>Maria</firstname><lastname>Campos</lastname></employee></business>';
            saveJokeWithXml(xml,0);
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
        }
    });
    AV.Cloud.httpRequest({
        url: 'http://joke.zaijiawan.com/Joke/joke2.jsp?appname=readingxiaonimei&version=3.10.0&os=ios&hardware=iphone&sort=1&page=0&timestamp=(null)',
        success: function(httpResponse) {
            console.log(httpResponse.text);
            var xml = httpResponse.text;//'<?xml version="1.0" encoding="UTF-8" ?><business><company>Code Blog</company><owner>Nic Raboy</owner><employee><firstname>Nic</firstname><lastname>Raboy</lastname></employee><employee><firstname>Maria</firstname><lastname>Campos</lastname></employee></business>';
            saveJokeWithXml(xml,1);
        },
        error: function(httpResponse) {
            console.error('Request failed with response code ' + httpResponse.status);
        }
    });
    return response.success();
})

AV.Cloud.define('xmlTest', function(request, response) {
    var parseString = require('xml2js').parseString;
    var xml = '<?xml version="1.0" encoding="UTF-8" ?><business><company>Code Blog</company><owner>Nic Raboy</owner><employee><firstname>Nic</firstname><lastname>Raboy</lastname></employee><employee><firstname>Maria</firstname><lastname>Campos</lastname></employee></business>';
    parseString(xml, function (err, result) {
        console.log(JSON.stringify(result));
        response.success();
    });
})

AV.Cloud.define('parseJson', function(request, response) {
    var jsonString = '{"root":{"AdConfig":[{"PlacementAdNetwork":[{"NoAd":["100"]}],"WallAdNetwork":[{"NoAd":["100"]}],"PlacementAdShowTimes":["200"],"PlacementAllowNoFillLT":["6"],"PlacementAd_enable":["0"],"BannerAd_enable":["1"],"AppWallAd_enable":["0"],"WallAd_enable":["0"],"AdList":[{"Ad":[{"name":["妹子推荐"],"time":["8月27日"],"text":["妹子给您的私密推荐"],"index":["6"]},{"name":["妹子推荐"],"time":["8月27日"],"text":["妹子给您的私密推荐"],"index":["-2"]},{"name":["妹子推荐"],"time":["8月27日"],"text":["妹子给您的私密推荐"],"index":["15"]},{"name":["妹子推荐"],"time":["8月27日"],"text":["妹子给您的私密推荐"],"index":["-2"]},{"name":["妹子推荐"],"time":["8月27日"],"text":["妹子给您的私密推荐"],"index":["29"]},{"name":["妹子推荐"],"time":["8月27日"],"text":["妹子给您的私密推荐"],"index":["-2"]},{"name":["妹子推荐"],"time":["8月27日"],"text":["妹子给您的私密推荐"],"index":["44"]},{"name":["妹子推荐"],"time":["8月27日"],"text":["妹子给您的私密推荐"],"index":["-2"]},{"name":["妹子推荐"],"time":["8月27日"],"text":["妹子给您的私密推荐"],"index":["61"]}]}]}],"dataend":["0"],"timestamp":["2015-08-26 23:36:00"],"joke":[{"id":["2312844"],"name":["爆笑段子精选A"],"time":["昨天 23:36"],"text":["逛街时偶遇多年不见的前女友，互相凝视了许久，我率先打破了沉默，“你的脸，好似夜空中的繁星……”见她有些羞涩，我又补充了一句：“老多了。”"],"forward":["2"],"commend":["16"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2349897"],"name":["Hei"],"time":["昨天 23:12"],"text":["和QQ上的一女网友聊得非常好，不过从来没视频聊天过，只是互相发短信，终于有一天，她主动约我了。\r\n刚见面我都震惊了，她：“怎么是你？你对得起你老婆吗？”\r\n我：“我错了，丈母娘！！！”"],"forward":["12"],"commend":["298"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2516930"],"name":["学生来吐槽"],"time":["昨天 22:48"],"text":["最无助的时刻：起床后发现外卖都休息了...空虚寂寞冷...."],"forward":["3"],"commend":["277"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2346712"],"name":["肉便器_"],"time":["昨天 22:24"],"text":["有个妹子姓鲁，出生那天，是个大雪纷飞的日子，正值那年的第一场雪，长辈给她起了个好听的名字：鲁初雪...."],"forward":["13"],"commend":["277"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2369168"],"name":["爆笑屌丝港"],"time":["昨天 22:00"],"text":["前几天聚餐和朋友一起吃饭，坐在我旁边的一对像是闹了别扭的师弟师妹在默默地吃饭，女生低着头情绪很差的样子，我估计是男生惹到她了，然后男生木讷了半天终于开口…我以为是道歉…结果他说：可是那个式子的积分肯定没法消掉那个三角函数的因子啊……"],"forward":["1"],"commend":["301"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2044713"],"name":["我们爱讲冷笑话_"],"time":["昨天 21:36"],"text":["A：“听说你昨天相亲对象长得不错，家庭也不错，人品也不错，那你昨天约会还成功吗？”B：“还行，我挺喜欢她吞吞吐吐的样子。”A：“哦，她很紧张吗？”B：“不是。"],"forward":["12"],"commend":["280"],"comment":["1"],"ishot":["0"],"mark":["0"]},{"id":["2371173"],"name":["BROKEN  OPEN"],"time":["昨天 21:12"],"text":["君问归期未有期，红烧茄子油焖鸡。 秋高东篱采桑菊，犹记那盆水煮鱼。 一树梨花压海棠，青椒干煸溜肥肠。 曾经沧海难为水，鱼香肉丝配鸡腿。 相见时难别亦难，清蒸螃蟹别放盐。 在天愿作比翼鸟，今天就要吃虾饺。 问君能有几多愁，孜然铁板烧肥牛。 天若有情天亦老，俩大腰子用火烤！ （吃货的诗情你永远不懂~）"],"forward":["125"],"commend":["360"],"comment":["0"],"ishot":["1"],"mark":["1"]},{"id":["2351500"],"name":["桃小夭"],"time":["昨天 20:48"],"text":["还有几天就是我和媳妇的结婚纪念日了，媳妇说想去没去过的地方瞅瞅，我想了想，觉得是厨房。"],"forward":["9"],"commend":["309"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2367558"],"name":["拉面杀手"],"time":["昨天 20:25"],"text":["我一哥们跟我在同一公司，特喜欢吃热山芋，\r\n他旁边坐着我们测试经理。\r\n中午吃饭的时候吃了一大个，然后下午经理说：哎？\r\n这今天这空气质量太差了吧，怎么一阵阵的什么味啊！\r\n然后就关上了窗户，结果味道更浓。\r\n我抬头看看那二货就说了句：XX你放的屁吧”。\r\n二货很淡定的说：没有啊！\r\n我那是菊花在打嗝...\r\n打你妹的嗝，最后被我们经理一顿胖揍！"],"forward":["5"],"commend":["322"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2358304"],"name":["再给我两分钟"],"time":["昨天 20:01"],"text":["呵，说我追不到女孩子？我是不想追好吗？我要是追了，好像她能跑过我似得。"],"forward":["9"],"commend":["289"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2689522"],"name":["搞笑妹子"],"time":["昨天 20:00"],"text":["晚上A和X在客厅看电视，五岁的侄子在地上玩具，突然拉着自己鸡鸡问：“姑姑，小鸡鸡有什么用？” “尿尿。” “还有什么用？” X朝A这边斜了一眼“没了！” 于是A默默的站起来刷碗去了……"],"forward":["186"],"commend":["482"],"comment":["3"],"rm1":["A"],"rf1":["X"],"ishot":["0"],"mark":["0"]},{"id":["2325076"],"name":["时尚趣味空间_"],"time":["昨天 19:37"],"text":["下身穿着小内内，上身围着毛巾，对着镜子妩媚的说你这个狐狸精怎么可以这么美...然后我爸进来了..."],"forward":["8"],"commend":["517"],"comment":["0"],"ishot":["1"],"mark":["1"]},{"id":["2367187"],"name":["纯情小萌鹿"],"time":["昨天 19:13"],"text":["夏天和同学郊游，去了趟洗手间后同学们和男神就很欢乐友好的对我笑，\r\n然后裙子塞在红内裤里登了一天的山还没有人告诉我。"],"forward":["2"],"commend":["429"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2373138"],"name":["MoonQDK"],"time":["昨天 18:49"],"text":["昨天交辞工书了，刚刚老板找我，一堆的港式普通话听得我云里雾里，迷糊中好像听到说给我加一百块工资，我精神一震，带着疑惑问道:加多少？100？ 因为车间有点吵，我怕他没听清，同时伸出一根手指，辅以肢体语言。老板没说话，看着我的手势，黑着脸走了......默默收回我举得高高的中指，:老板，刚才我一时激动，伸错了手指，你能听我解释嘛"],"forward":["1"],"commend":["350"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2361941"],"name":["纯情小萌鹿"],"time":["昨天 18:25"],"text":["有次深夜来姨妈把秋裤弄脏了，因为第二天要穿，所以打了盆水在厕所洗裤子，\r\n结果弟弟推门而入，看到眼前的景象愣了，半天憋出一句话：“姐，你是不是杀人了！”"],"forward":["9"],"commend":["400"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2465217"],"name":["这个青年有点二_"],"time":["昨天 18:01"],"text":["大家都说：三短一长，选最长；三长一短，选最短。前几天，有一个同学。在做英语的选择题。只见他拿着一把尺子，说：“1.02，1.03，1.02。好，就选B啦。”"],"forward":["1"],"commend":["303"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2371809"],"name":["__喝咖啡就大蒜"],"time":["昨天 17:38"],"text":["叛军被击溃，向北方逃窜，大将军骑着战马走出城门，神色暗淡。副将走上前来，单膝跪下:“将军我们要追吗？”将军捋了一下胡子说“追击吧！”副将没有动，大军没有动。将军一愣。又说了一次“追击吧”副将未动，大军仍未动......"],"forward":["11"],"commend":["387"],"comment":["3"],"ishot":["0"],"mark":["0"]},{"id":["2325069"],"name":["给力笑话排行榜_"],"time":["昨天 17:14"],"text":["如果你的男朋友是理工大学的，那你更应该好好珍惜。因为他在那么多优秀的男生面前，竟然还是喜欢女生。"],"forward":["14"],"commend":["457"],"comment":["0"],"ishot":["0"],"mark":["0"]},{"id":["2424437"],"name":["有内涵哦_"],"time":["昨天 16:50"],"text":["刚购置了新车不久，便买了两个包着竹碳的玩具狗，放在车子后座吸收车里的甲醛气味。这天老公叫我去火车站接公公和婆婆，两人上车坐后座里便开车上路，路上婆婆问我，这新车有甲醛味，有没有放什么东西吸收一下？我说，有啊，后面有两只狗在帮忙吸掉毒气。嗯....妈，你们听我解释一下！！"],"forward":["25"],"commend":["502"],"comment":["0"],"ishot":["1"],"mark":["1"]},{"id":["2493002"],"name":["爆笑段子精选A"],"time":["昨天 16:26"],"text":["女朋友有洁癖，什么东西只要掉在马路上就嫌脏不要了。 今天和她在一起逛街的时候，我绊倒了……"],"forward":["22"],"commend":["476"],"comment":["1"],"ishot":["1"],"mark":["1"]}],"info":[""],"rectAD":["0"]}}';
    var jsonObj = JSON.parse(jsonString);
    console.log(jsonObj.root.joke);
})

AV.Cloud.define('dateTest', function(request, response) {
    var strDate = '今天 11:08';
    var date = new Date();
    console.log('The local time zone is: GMT'+date.getTimezoneOffset()/60);
    if(strDate.indexOf("年") > -1){//14年06月02日
        var year = "20"+strDate.substring(0,2);
        var month = Number(strDate.substring(3,5))-1;
        var day = strDate.substring(6,8);
        date.setFullYear(year);
        date.setMonth(month);
        date.setDate(day);
    }else if(strDate.indexOf("月") > -1){//03月22日
        var month = Number(strDate.substring(0,2))-1;
        var day = strDate.substring(3,5);
        date.setMonth(month);
        date.setDate(day);
    }else if(strDate.indexOf("日") > -1){//25日 09:24
        var day = strDate.substring(0,2);
        var hour = strDate.substring(4,6);
        var minute = strDate.substring(7,9);
        date.setDate(day);
        date.setHours(hour);
        date.setMinutes(minute);
    }else if(strDate.indexOf("今天") > -1){//今天 11:08
        var hour = strDate.substring(3,5);
        var minute = strDate.substring(6,8);
        date.setHours(hour);
        date.setMinutes(minute);
    }else if(strDate.indexOf("昨天") > -1){//昨天 02:54
        var hour = strDate.substring(3,5);
        var minute = strDate.substring(6,8);
        date.setDate(date.getDate()-1);
        date.setHours(hour);
        date.setMinutes(minute);
    }
    console.log('parseDateFromString result:'+date);
})

AV.Cloud.define('fetchAllJokes', function(request, response) {
    fetchAllJokeWithParams(0,0);
    fetchAllJokeWithParams(1,0);
})

module.exports = AV.Cloud;