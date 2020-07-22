var num_line=0;
var num_rec=0;
var num_cir=0;
var num_tri=0;
var num_arc=0;
var canvaswidth=1148;
var canvasheight=654;
var url_choose="sound/vis.mp3";
var url_done="sound\\done.wav";
function load_sound(url_data) {
    var con=new AudioContext();
    var req = new XMLHttpRequest();
    req.open('GET', url_data, true);
    req.responseType = 'arraybuffer';

    req.onload = function() {
        con.decodeAudioData(req.response, function(buffer){
            var source = con.createBufferSource();
            source.buffer = buffer;
            source.connect(con.destination);
            source.start(0);
        },function (e) {
            console.info('错误');
        });
    }
    req.send();
}
window.onload=function(){
        var  box = init();
    let btn=document.getElementById('dis')
    if(num_arc==0&&num_tri==0&&num_rec==0&&num_cir==0&&num_line==0){
        btn.disabled=true

    }


        var  colorBox = initcolor();
        colorBox.onmousedown  = function(e){
            let x = e.offsetX;
            let y = e.offsetY;
            let imgData=colorBox.getContext("2d").getImageData(x,0,x+1,1);
            box.getContext("2d").strokeStyle ='rgb('+imgData['data'][0]+','+imgData['data'][1]+','+imgData['data'][2]+')'
            box.getContext("2d").fillStyle ='rgb('+imgData['data'][0]+','+imgData['data'][1]+','+imgData['data'][2]+')'

        }
        $("input[name='options']").off().change((e)=>{
            load_sound(url_choose);
            let mode =$(e.target).attr('value');
            function startmode(box,f){//模式选择
                box.onmousedown=null;
                box.onmousemove=null;
                box.onmouseup=null;
                f(box);
            }
            let a =context.getMode(mode);
            startmode(box,context.getMode(mode));
        });
        $("#reset").click(()=>{

            context.go_back(box);
        });
        $("#advance").click(()=>{
            context.go_forward(box);
        });
        $("#save").click(()=>{
            var a = document.createElement('a');
            a.href = box.toDataURL('image/png'); //下载图片
            a.download = 'CurrentPic.png';
            a.click();//保存至图片。创建一个本地URL超链接
            var data=a.href;
            //如data=JSON.stringify(data);

            var storage=window.localStorage;
            storage.setItem("draw",JSON.stringify(data));
            console.log("转换成png格式的图片存储信息如下");
            console.log(storage)
        });
        $('#linewidth').change(function(){
            let lw=$(this).val();

            box.getContext("2d").lineWidth=lw;
        })
        $('#dis').click(()=>{
                load_sound(url_done);
                var dom = document.getElementById("display");
                var myChart = echarts.init(dom);
                option = {
                    title:{
                        text: '来看看你的绘图构成:',
                        subtext: '（暂未添加普通画笔线段）'

                    },
                    xAxis: {
                        type: 'category',
                        data: ['线段', '矩形', '圆', '三角形', '圆弧']
                    },
                    yAxis: {
                        type: 'value',
                        minInterval: 1,
                        boundaryGap:[0,0.1],
                    },
                    series: [{
                        data: [num_line, num_rec, num_cir, num_tri, num_arc],
                        type: 'bar',
                        label: {
                            show: true,
                            position: 'inside'
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                magicType: {show: true, type: ['line', 'bar']},
                            }
                        },
                    }]
                };
             myChart.setOption(option);
        })
        function init(){
            var  box = document.getElementById("myCanvas");
            // box.width = $(".text-center.header-body").width();
            // box.height = $(".text-center.header-body").height();
            box.width=canvaswidth;
            box.height=canvasheight;
            return box;
        }
        function initcolor(){
            let can = document.getElementById("colorPicker");
            let ctx=can.getContext("2d");
            let colors=[
                '#ff0000',
                '#ff9900',
                '#fffb00',
                '#37ff00',
                '#0099ff',
                '#0048ff',
                '#FF00FF',
                '#170101',
                '#FFFFFF'
            ];
            var gradientBar = ctx.createLinearGradient(0, 0, can.width, 0);
            for(let i=0;i<colors.length;i++){
                gradientBar.addColorStop(i/(colors.length-1), colors[i]);
            }
            ctx.fillStyle = gradientBar;
            ctx.beginPath();
            ctx.rect(0, 0,  can.width, can.height);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
            return can;
        }

        var context={
            rollbackSize:100,
            backStores:function(){
                let backCanvas = document.createElement('canvas');
                let backCtx = backCanvas.getContext('2d');
                backCanvas.width = box.width;
                backCanvas.height = box.height;
                backCtx.drawImage(box, 0, 0, box.width, box.height);
                let stores = [];
                stores.push(backCanvas);
                return stores;
            }(),//提供回滚,撤销操作

            backflag:1,//回滚标记

            map:function(){
                let map= new Map();
                map.set('0',pencil);
                map.set('1',drawcCircle);
                map.set('2',drawRectangle);
                map.set('3',drawcLine);
                map.set('4',drawTriangle);
                map.set('5',drawArc);
                return map;
            }(),
            getMode:function(mode){
                return this.map.get(mode);
            },
            backStore:function(box){//存储
                let backCanvas = document.createElement('canvas');
                let backCtx = backCanvas.getContext('2d');
                backCanvas.width = box.width;
                backCanvas.height = box.height;
                backCtx.drawImage(box, 0, 0, box.width, box.height);
                this.backStores.push(backCanvas);
                this.backflag=1;

            },

            go_back:function(box){//后退

                    if (this.backflag ==  1) {
                        let ctx = box.getContext("2d");
                        ctx.clearRect(0, 0, box.width, box.height);
                        ctx.drawImage(this.backStores[this.backStores.length - this.backflag - 1], 0, 0, box.width, box.height);
                        this.backflag=500;

                    }

                     else if(this.backStores.length-this.backflag>1||this.backflag==500) {
                        if(this.backflag==500) {
                            this.backflag=1;
                            let ctx = box.getContext("2d");
                            ctx.clearRect(0, 0, box.width, box.height);
                            ctx.drawImage(this.backStores[this.backStores.length - this.backflag - 1], 0, 0, box.width, box.height);

                        }
                            let ctx = box.getContext("2d");this.backflag++;
                            ctx.clearRect(0, 0, box.width, box.height);
                            ctx.drawImage(this.backStores[this.backStores.length-this.backflag-1], 0, 0, box.width, box.height);


                    }

                },


            go_forward:function(box){//前进

                if(this.backflag==500)  this.backflag=1
                if(this.backStores.length-this.backflag>=0&&this.backflag>0){
                    this.backflag --;
                    let ctx = box.getContext("2d");
                    ctx.clearRect(0, 0, box.width, box.height);
                    ctx.drawImage(this.backStores[this.backStores.length-this.backflag-1], 0, 0, box.width, box.height);
                }

            }
        }

        function pencil(box){//铅笔
            let ctx = box.getContext("2d");
            box.onmousedown = function(e){
                let x = e.offsetX;
                let y = e.offsetY;
                box.onmousemove = function(e1){
                    ctx.beginPath();
                    ctx.moveTo(x,y);
                    x = e1.offsetX;
                    y = e1.offsetY;
                    ctx.lineTo(x,y);
                    ctx.closePath();
                    ctx.stroke();

                }
            }
            box.onmouseup  = function(e){
                $("#fill").one("click",function(){
                    console.log('抱歉，线框暂不支持填充（非闭合路径）')
                    return
                })
                box.onmousemove = null;
                context.backStore(box);
                btn.disabled=false
            }
        }
        function drawcLine(box){//线段
            let ctx = box.getContext("2d");
            box.onmousedown = function(e){
                //缓存起始点图像,移动时不断加载刷新
                let backCanvas = document.createElement('canvas');
                let backCtx = backCanvas.getContext('2d');
                backCanvas.width = box.width;
                backCanvas.height = box.height;
                backCtx.drawImage(box, 0, 0, box.width, box.height);
                let x = e.offsetX;
                let y = e.offsetY;
                box.onmousemove = function(e1){
                    let x1 = e1.offsetX;
                    let y1 = e1.offsetY;
                    ctx.clearRect(0, 0, box.width, box.height);
                    ctx.drawImage(backCanvas, 0, 0, box.width, box.height);
                    ctx.beginPath();
                    ctx.moveTo(x,y);
                    ctx.lineTo(x1,y1);
                    ctx.closePath();
                    ctx.stroke();

                }

            }
            box.onmouseup = function(e){
                $("#fill").one("click",function(){
                    console.log('抱歉，线框暂不支持填充（非闭合路径）')
                    return;
                })
                box.onmousemove = null;
                context.backStore(box);
                num_line++;
                btn.disabled=false
            }
        }
        function drawcCircle(box){//画圆
            let ctx = box.getContext("2d");
            box.onmousedown = function(e){
                //缓存起始点图像,移动时不断加载刷新
                let backCanvas = document.createElement('canvas');
                let backCtx = backCanvas.getContext('2d');
                backCanvas.width = box.width;
                backCanvas.height = box.height;
                backCtx.drawImage(box, 0, 0, box.width, box.height);
                let x = e.offsetX;
                let y = e.offsetY;
                box.onmousemove = function(e1){
                    let x1 = e1.offsetX;
                    let y1 = e1.offsetY;
                    let distance=Math.sqrt(Math.pow(Math.abs(x - x1),2)+Math.pow(Math.abs(y - y1),2));
                    ctx.clearRect(0, 0, box.width, box.height);
                    ctx.drawImage(backCanvas, 0, 0, box.width, box.height);
                    ctx.beginPath();
                    ctx.arc(x+(x1-x)/2,y+(y1-y)/2,distance/2,0,2*Math.PI);
                    ctx.stroke();
                }

            }
            box.onmouseup = function(e){
                $("#fill").click(()=>{
                    ctx.fill();
                    // console.log('填色后已存储');
                    context.backStore(box);return;
                })
                box.onmousemove = null;
                // console.log('普通存储');
                context.backStore(box);
                num_cir++;btn.disabled=false
            }
        }
        function drawTriangle(box){//画三角形
            let ctx=box.getContext("2d");
            box.onmousedown = function(e){
                let backCanvas = document.createElement('canvas');
                let backCtx = backCanvas.getContext('2d');
                backCanvas.width = box.width;
                backCanvas.height = box.height;
                backCtx.drawImage(box, 0, 0, box.width, box.height);
                let x = e.offsetX;
                let y = e.offsetY;
                box.onmousemove = function(e1){
                    let x1 = e1.offsetX;
                    let y1 = e1.offsetY;
                    ctx.clearRect(0, 0, box.width, box.height);
                    ctx.drawImage(backCanvas, 0, 0, box.width, box.height);
                    ctx.beginPath();
                    ctx.moveTo(x,y);
                    ctx.lineTo(x1,y1);
                    ctx.lineTo(x1+100,y1);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
            box.onmouseup  = function(e){
                $("#fill").click(()=>{
                    ctx.fill(); context.backStore(box);return
                })
                box.onmousemove = null;
                context.backStore(box);
                num_tri++;btn.disabled=false
            }
        }

        function drawRectangle(box){//画矩形
            let ctx = box.getContext("2d");
            //与画圆原理相同,同上
            box.onmousedown = function(e){
                let backCanvas = document.createElement('canvas');
                let backCtx = backCanvas.getContext('2d');
                backCanvas.width = box.width;
                backCanvas.height = box.height;
                backCtx.drawImage(box, 0, 0, box.width, box.height);
                let x = e.offsetX;
                let y = e.offsetY;
                box.onmousemove = function(e1){
                    ctx.clearRect(0, 0, box.width, box.height);
                    ctx.drawImage(backCanvas, 0, 0, box.width, box.height);
                    ctx.beginPath();
                    ctx.rect(x,y,e1.offsetX - x,e1.offsetY - y);
                    ctx.stroke();
                }
            }
            box.onmouseup  = function(e){
                $("#fill").click(()=>{
                    ctx.fill(); context.backStore(box);return
                })
                box.onmousemove = null;
                context.backStore(box);
                    num_rec++;btn.disabled=false
            }
        }
        function  drawArc(box) {//画圆弧
            let ctx = box.getContext("2d");
            //与画圆原理相同,同上
            box.onmousedown = function(e){
                let backCanvas = document.createElement('canvas');
                let backCtx = backCanvas.getContext('2d');
                backCanvas.width = box.width;
                backCanvas.height = box.height;
                backCtx.drawImage(box, 0, 0, box.width, box.height);
                let x = e.offsetX;
                let y = e.offsetY;
                box.onmousemove = function(e1){
                    let x1 = e1.offsetX;
                    let y1 = e1.offsetY;
                    let distance=Math.sqrt(Math.pow(Math.abs(x - x1),2)+Math.pow(Math.abs(y - y1),2));
                     ctx.clearRect(0, 0, box.width, box.height);
                    ctx.drawImage(backCanvas, 0, 0, box.width, box.height);
                    ctx.beginPath();
                    ctx.arc(x1,y1,distance/2,0,Math.PI/2);
                    ctx.stroke();

                    //ctx.moveTo(x,y);
                    //arc(x, y, r, startAngle, endAngle, anticlockwise): 以(x, y) 为圆心，以r 为半径，从 startAngle 弧度开始到endAngle弧度结束。anticlosewise 是布尔值，true 表示逆时针，false 表示顺时针(默认是顺时针)。
                    // arcTo(x1, y1, x2, y2, radius): 根据给定的控制点和半径画一段圆弧，最后再以直线连接两个控制点。


                }
            }
            box.onmouseup  = function(){
                $("#fill").click(()=>{
                ctx.fill(); context.backStore(box);return
            })
                box.onmousemove = null;
                context.backStore(box);
                num_arc++;btn.disabled=false

            }
        }
    function vis() {
        var dom = document.getElementById("display");
        var myChart = echarts.init(dom);
        option = {
            xAxis: {
                type: 'category',
                data: ['线段', '矩形', '圆', '三角形', '圆弧']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [num_line, num_rec, num_cir, num_tri, num_arc],
                type: 'bar'
            }]
        };
        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        }

    }


}
