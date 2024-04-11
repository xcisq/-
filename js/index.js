// 地图对象
var map;
// 缩略地图
var miniMapLeft = null;
var miniMapRight = null;

var groupLayer;
var leftLayers, rightLayers;

// 大小、方向、动画 (历史数据)
var magnitude, direction, animation;
// 预报的大小、方向、动画
var magForecast, dirForecast, aniForecast;
// 订正后的大小、动画
var magCorrect, aniCorrect;

// 订正前的大小、动画
var magOrigin, aniOrigin;
// ERA5数据的大小、动画
var magERA5, aniERA5;


// 虚线框
var dashBox;
// 数据文件地址
var uUrl, vUrl;


// 弹框、缩放等级
var popup, zoom;
// 渲染缓冲，避免闪屏（历史数据）
var pre, cur, preDirection, curDirection;
// 渲染缓冲，避免闪屏（预报结果）
var preForecast, curForecast, preDirForecast, curDirForecast;
var preDashBox;

// 首次加载
var isFirst = true;
// 当前区域
var selectedRegion = 'r1';
// 数据文件类型
var selectedType = 'Uc';

var timePlay;
// 时间轴的当前时间
var curTime;
// 时间轴的起始时间，结束时间，历史数据和预报结果的分界时间
var startTime, endTime, boundaryTime;
// 待订正的数据的时间
var correctTime;
// 时间轴播放速度，1s
var speed = 1000;


/**元素对象 开始 */
var wave = {
    name:'swh',
    colorArray: ['rgb(135,206,235)', 'rgb(127, 255, 212)', 'rgb(0, 191, 255)', 'rgb(0, 127, 255)', 'rgb(0, 0, 255)'],
    numberArray:[0, 0.5, 1.0, 1.5, 2.0],
    colorStops: [{ position: 0.00, color: '#0000ff' },
                { position: 0.25, color: '#007fff' },
                { position: 0.50, color: '#00bfff' },
                { position: 0.75, color: '#7fffd4' },
                { position: 1.00, color: '#87ceeb' }],
    opacity: 1,
    width: 5,
    range: [0, 15],
    velocityScale: 0.005,
    magnitude: true, // 是否显示预报结果
    direction: false,
    animation: true,
    controlBar: true,
    colorBar: false,
    arrowDirection: "from",
    arrowType: "directionFrom",
    html: function(lngString,latString, v) {
        return (
            "<span>坐标：" +
            lngString +
            "," +
            latString +
            "<hr class='lineStyle'>" +
            "浪高：" +
            v +
            "m</span>"
        );
    }
};

var sst = {
    name:'sst',
    colorArray: ['rgb(255,255,0)', 'rgb(255,192,0)', 'rgb(255,129,0)', 'rgb(255,66,0)', 'rgb(255,0,0)'],
    numberArray:[28.0, 29.0, 30.0, 31.0, 32.0],
    colorStops: [{ position: 0.00, color: '#ff0000' },
                { position: 1.00, color: '#ffff00' } ],
    opacity: 1, // origin: 0.75
    controlBar: false,
    colorBar: false,
    magnitude: true, // 是否显示预报结果
    direction: false,
    animation: true,
    controlBar: false,
    colorBar: false,
    html: function(lngString,latString, v) {
        return (
            "<span>坐标：" +
            lngString +
            "," +
            latString +
            "<hr class='lineStyle'>" +
            "海表温度：" +
            v +
            "℃</span>"
        );
    }
};

var sss = {
    name:'sss',
    colorArray: ['rgb(102,224,255)', 'rgb(128,255,94)', 'rgb(255,255,51)', 'rgb(255,50,0)'],
    numberArray:[28.0, 30.0, 32.0, 34.0],
    colorStops: [{ position: 0.00, color: '#ff3200' },
                { position: 1.00, color: '#66e0ff' },
                { position: 0.33, color: '#ffff33' },
                { position: 0.66, color: '#80ff5e' }],
    opacity: 1,
    controlBar: false,
    colorBar: false,
    magnitude: true,
    direction: false,
    animation: true,
    controlBar: false,
    colorBar: false,
    html: function(lngString,latString, v) {
        return (
            "<span>坐标：" +
            lngString +
            "," +
            latString +
            "<hr class='lineStyle'>" +
            "海表盐度：" +
            v +
            "psu</span>"
        );
    }
};

var wind = {
    name:'win',
    colorArray:[
        'rgb(176,225,249)','rgb(120,199,200)','rgb(125,208,142)',
        'rgb(131,217,35)', 'rgb(185,228,63)','rgb(226,218,60)',
        'rgb(213,174,51)','rgb(212,131,42)','rgb(212,66,58)','rgb(202,29,128)'],
    numberArray:[1.5, 4.0, 6.5, 8.0, 9.5, 12.5, 15.5, 19.0, 22.6, 26.5, 26.51],
    colorStops: [{ position: 0.00, color: '#ca1d7f' },
                { position: 1.00, color: '#b0e1f9' },
                { position: 0.33, color: '#ffff00' },
                { position: 0.66, color: '#89db26' }],
    opacity: 1,
    width: 1.6, // origin: 1.2
    velocityScale: 0.001,
    magnitude: true, // 是否显示预报结果
    direction: false,
    animation: true,
    controlBar: false,
    colorBar: false,
    arrowDirection: "from",
    arrowType: "directionFrom",
    html: function(lngString, latString, v, d) {
        return (
            "<span>坐标：" +
            lngString +
            "," +
            latString +
            "<hr class='lineStyle'>" +
            "风速：" +
            v +
            "m/s</br>风向：" +
            windSwitch(d) +
            "</span>"
        );
    }
};

var correct = {
    name:'biasCorrect',
    colorArray:[
        'rgb(176,225,249)','rgb(120,199,200)','rgb(125,208,142)',
        'rgb(131,217,35)', 'rgb(185,228,63)','rgb(226,218,60)',
        'rgb(213,174,51)','rgb(212,131,42)','rgb(212,66,58)','rgb(202,29,128)'],
    numberArray:[1.5, 4.0, 6.5, 8.0, 9.5, 12.5, 15.5, 19.0, 22.6, 26.5,26.51],
    colorStops: [{ position: 0.00, color: '#ca1d7f' },
                { position: 1.00, color: '#b0e1f9' },
                { position: 0.33, color: '#ffff00' },
                { position: 0.66, color: '#89db26' }],
    opacity: 1,
    width: 1.6, // origin: 1.2
    velocityScale: 0.001,
    controlBar: false,
    colorBar: false,
    arrowDirection: "from",
    arrowType: "directionFrom",
    html: function(lngString, latString, v, d) {
        return (
            "<span>坐标：" +
            lngString +
            "," +
            latString +
            "<hr class='lineStyle'>" +
            "风速：" +
            v +
            "m/s</br>风向：" +
            windSwitch(d) +
            "</span>"
        );
    }
};

var nodata = {
    html: function (lngString, latString) {
        return (
            "<span>坐标：" +
            latString +
            "," +
            lngString +
            "<hr class='lineStyle'>" +
            "时间：" +
            formatDate("yyyy-MM-dd hh:00", curTime) +
            "</span>"
        );
      },
}
/**元素对象结束 */

// 初始化元素为海风
var curr = wind;

// 为按钮添加: 点击变暗操作、点击事件
var forecastButton = document.getElementById("forecastButton");
clickDark(forecastButton);
forecastButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        forecastButton.style.pointerEvents = 'none';
        forecastButton.classList.add("dark");
        document.getElementById("loading").style.display = "block";

        await forecast();

        document.getElementById("loading").style.display = "none";
        forecastButton.style.pointerEvents = 'auto';
        forecastButton.classList.remove("dark");
});

var correctButton = document.getElementById("correctButton");
clickDark(correctButton);
correctButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        correctButton.style.pointerEvents = 'none';
        correctButton.classList.add("dark");
        document.getElementById("loading").style.display = "block";

        await biasCorrect();

        document.getElementById("loading").style.display = "none";
        correctButton.style.pointerEvents = 'auto';
        correctButton.classList.remove("dark");
});

var switchButton = document.getElementById("switchButton");
clickDark(switchButton);

// 初始化弹框控制插件
function initParams() {
    $("#waveMenu #magnitude1").prop("checked", wave.magnitude);
//    $("#waveMenu #direction1").prop("checked", wave.direction);
//    $("#waveMenu #animation1").prop("checked", wave.animation);

    $("#sstMenu #magnitudeSst").prop("checked", sst.magnitude);
//    $("#sstMenu #directionSst").prop("checked", sst.direction);
//    $("#sstMenu #animationSst").prop("checked", sst.animation);

    $("#sssMenu #magnitudeSss").prop("checked", sss.magnitude);
//    $("#sssMenu #directionSss").prop("checked", sss.direction);
//    $("#sssMenu #animationSss").prop("checked", sss.animation);

    $("#windMenu #magnitude2").prop("checked", wind.magnitude);
//    $("#windMenu #direction2").prop("checked", wind.direction);
    $("#windMenu #animation2").prop("checked", wind.animation);

    $("#timePlay").on("click", function(event) {
       event.stopPropagation();
    });
}

// 页面渲染完成加载
$(document).ready(function() {
    if (!map) {
        initMap();
    }
    initParams();

    groupLayer = L.layerGroup();
    groupLayer.addTo(map);
    leftLayers = L.layerGroup();
    rightLayers = L.layerGroup();

    zoom = map.getZoom();
    initCalendar();
    var currentDate = getCurrentDate(9);
    $("#showDate").datepicker("setDate", currentDate);
    initTimePlay(currentDate, 2*24, 5*24);

    addEvent();
    popup = L.popup({ className: "popupText" });

    var leftMiniMap = document.getElementById("leftMiniMap");
    var rightMiniMap = document.getElementById("rightMiniMap");
    leftMiniMap.style.display = "none";
    rightMiniMap.style.display = "none";

});

// 按钮点击变暗操作
function clickDark(widget) {
    widget.addEventListener("mousedown", function () {
        widget.classList.add("dark"); // 当鼠标按下时，为图片添加.dark类名
    });

    widget.addEventListener("mouseup", function () {
        widget.classList.remove("dark"); // 当鼠标松开时，移除.dark类名
    });
}

// 初始化地图
function initMap() {
    var withoutSeaUrl = './static_3D/map/map_tiles/map_tiles/{z}/{x}/{y}.png'; //高德地图瓦片

    // 矢量标记
    var tdtbz = './static_3D/map/mapLabel/{z}/{x}/{y}.png';

    map = L.map("map", {
        center: [35, 140],
        zoomControl: false,
        zoom: 6,
        // layers: [normalMap, satelliteMap],
        maxZoom: 7, // origin: 8
        minZoom: 6 // origin: 5
    });

    // 不带海洋的高德地图瓦片图层
    var withoutsea=L.tileLayer(withoutSeaUrl, {
        maxZoom: 7, // origin: 8
        minZoom: 6, // origin: 5
        unloadInvisibleTiles:true,
        updateWhenIdle:true,
        reuseTiles:true,
        zIndex:500
    }).addTo(map);
    map.getPanes().overlayPane.appendChild(withoutsea.getContainer());

    // 天地图标记服务的图层
    var bz=L.tileLayer(tdtbz, {
        // attribution: "地图数据&copy;天地图,高德地图",
        subdomains: ["1", "2", "3", "4"],
        maxZoom: 7, // origin: 8
        minZoom: 6, // origin: 5
        unloadInvisibleTiles:true,
        updateWhenIdle:true,
        reuseTiles:true,
        zIndex:550
    }).addTo(map);
    map.getPanes().overlayPane.appendChild(bz.getContainer());

    map.setView([35, 140]);
}


// 加载订正前的海军数据 （correct）
function loadOrigin(uOrigin, vOrigin) {
    d3.text(uOrigin, function(u) {
        d3.text(vOrigin, function(v) {
            if (u != null && v != null) {
//                console.log("loadOrigin被执行！");
                var color = chroma.scale(curr.colorArray).domain(curr.numberArray);
                var vf = L.VectorField.fromASCIIGrids(u, v);

                // 动画图层
                aniOrigin = L.canvasLayer.vectorFieldAnim(vf, {
                    width: curr.width,
                    velocityScale: curr.velocityScale,
                    density: 5,
                    contrast: 1.5,
                    length: 20,
                    inFilter: function(v) {
                        return v !== -32767;
                    }
                });

                // 要素值的图层（与热力图有关）
                magOrigin = L.canvasLayer.scalarField(vf.getScalarField("magnitude"), {
                    color: color,
                    opacity: curr.opacity,
                    interpolate: true,
                    inFilter: function(v) {
                        return v !== -32767;
                    }
                });

                magOrigin.addTo(leftLayers);

                aniOrigin.setOpacity(1);
                aniOrigin.addTo(leftLayers);
            }
        });
    });
}


// 加载ERA5数据 （correct）
function loadERA5(uERA5, vERA5) {
    d3.text(uERA5, function(u) {
        d3.text(vERA5, function(v) {
            if (u != null && v != null) {
                var color = chroma.scale(curr.colorArray).domain(curr.numberArray);
                var vf = L.VectorField.fromASCIIGrids(u, v);

                // 动画图层
                aniERA5 = L.canvasLayer.vectorFieldAnim(vf, {
                    width: curr.width,
                    velocityScale: curr.velocityScale,
                    // test
                    density: 5,
                    contrast: 1.5,
                    length: 20,
                    inFilter: function(v) {
                        return v !== -32767;
                    }
                });

                // 要素值的图层（与热力图有关）
                magERA5 = L.canvasLayer.scalarField(vf.getScalarField("magnitude"), {
                    color: color,
                    opacity: curr.opacity,
                    interpolate: true,
                    inFilter: function(v) {
                        return v !== -32767;
                    }
                });

                magERA5.addTo(rightLayers);

                aniERA5.setOpacity(1);
                aniERA5.addTo(rightLayers);
            }
        });
    });
}

// 构建两侧的缩略地图
function createMiniMap(uOrigin, vOrigin, uERA5, vERA5) {
    leftLayers = L.layerGroup();
    rightLayers = L.layerGroup();

    loadOrigin(uOrigin, vOrigin);
    loadERA5(uERA5, vERA5);

    // 左侧缩略地图：展示海军数据
    miniMapLeft = new L.Control.MiniMap(leftLayers, {
        toggleDisplay: true, // 最小化按钮
        // zoomAnimation: true,
        zoomLevelOffset: 0, // 缩放偏移。最小-5
        minimized: false,
        width: 400,
        height: 400,
    }).addTo(map);

    var leftMiniMap = document.getElementById("leftMiniMap");
    leftMiniMap.appendChild(miniMapLeft._container);
    // 删除阴影矩阵
    var gNode = leftMiniMap.getElementsByTagName("g")[0];
    gNode.parentElement.removeChild(gNode);


     // 右侧缩略地图：展示ERA5数据
     miniMapRight = new L.Control.MiniMap(rightLayers, {
         toggleDisplay: true, // 最小化按钮
         // zoomAnimation: true,
         zoomLevelOffset: 0,
         minimized: false,
         width: 400,
         height: 400,
     }).addTo(map);

     var rightMiniMap = document.getElementById("rightMiniMap");
     rightMiniMap.appendChild(miniMapRight._container);
     // 删除阴影矩阵
     gNode = rightMiniMap.getElementsByTagName("g")[0];
     gNode.parentElement.removeChild(gNode);

     // 显示提示文字
    var leftText = document.getElementById("leftText");
    var rightText = document.getElementById("rightText");
    leftText.style.display = "block";
    rightText.style.display = "block";

}

// 加载asc uv向量
function loadASC(uUrl, vUrl) {
    if (curr.name === 'sst' || curr.name === 'sss' || curr.name === 'swh') {
        loadScalar(uUrl, vUrl);
    } else {
        loadUV(uUrl, vUrl);
    }
}

// 加载uv文件（wind）
function loadUV(uUrl, vUrl) {
    d3.text(uUrl, function(u) {
        d3.text(vUrl, function(v) {
            if (u != null && v != null) {
                var color = chroma.scale(curr.colorArray).domain(curr.numberArray);
                var vf = L.VectorField.fromASCIIGrids(u, v);

                // 动画图层
                animation = L.canvasLayer.vectorFieldAnim(vf, {
                    width: curr.width,
                    velocityScale: curr.velocityScale,
                    // test
                    density: 5,
                    contrast: 1.5,
                    length: 20,
                    inFilter: function(v) {
                        return v !== -32767
                    }
                });
                //动画点击事件
                animation.on("click", function(e) {

                      layerPopup(e,'click');

                }).on("drag", function(e) {
                    layerPopup(e,'drag');
                });

                // 要素值的图层（与热力图有关）
                magnitude = L.canvasLayer.scalarField(vf.getScalarField("magnitude"), {
                    color: color,
                    opacity: curr.opacity,
                    interpolate: true,
                    inFilter: function(v) {
                        return v !== -32767
                    }
                });

                 magnitude.addTo(groupLayer);
                 if (map.hasLayer(pre)) {
                     map.removeLayer(pre);
                 }

                animation.setOpacity(0);
                animation.addTo(groupLayer);
                if (curr.animation) {
                    setTimeout(function() {
                        animation.setOpacity(1);
                    }, 250);
                }
            }
        });
    });
}

// 加载asc文件（sst, sss, wave）
function loadScalar(uUrl, vUrl) {
    d3.text(uUrl, function(asc) {
        if (asc === null) {
            return;
        }
        var vf = L.ScalarField.fromASCIIGrid(asc); // 标量场
        var color = chroma.scale(curr.colorArray).domain(curr.numberArray);
        magnitude = L.canvasLayer.scalarField(vf, {
            color: color,
            opacity: curr.opacity,
            interpolate: true,
            inFilter: function(v) {
                return v !== -32767;
            }
        });

        // 要素大小图层点击事件
        magnitude.on("click", function(e) {
                    layerPopup(e,'click');
                }).on("drag", function(e) {
                    layerPopup(e,'drag');
                });

        magnitude.addTo(groupLayer);
        if (map.hasLayer(pre)) {
            map.removeLayer(pre);
        }
//        loadWind();
    });
}


// 加载偏差订正结果 (correct)
function loadCorrect(uCorrect, vCorrect) {
    d3.text(uCorrect, function(u) {
        d3.text(vCorrect, function(v) {
            if (u != null && v != null) {
                var color = chroma.scale(curr.colorArray).domain(curr.numberArray);
                var vf = L.VectorField.fromASCIIGrids(u, v);

                // 动画图层
                aniCorrect = L.canvasLayer.vectorFieldAnim(vf, {
                    width: curr.width,
                    velocityScale: curr.velocityScale,
                    // test
                    density: 5,
                    contrast: 1.5,
                    length: 20,
                    inFilter: function(v) {
                        return v !== -32767
                    }
                });
                //动画点击事件
                aniCorrect.on("click", function(e) {
                      layerPopup(e,'click');
                }).on("drag", function(e) {
                    layerPopup(e,'drag');
                });

                // 要素值的图层（与热力图有关）
                magCorrect = L.canvasLayer.scalarField(vf.getScalarField("magnitude"), {
                    color: color,
                    opacity: curr.opacity,
                    interpolate: true,
                    inFilter: function(v) {
                        return v !== -32767
                    }
                });

                magCorrect.addTo(groupLayer);

                aniCorrect.setOpacity(1);
                aniCorrect.addTo(groupLayer);
            }
        });
    });
}


// 在指定位置以指定样式加载虚线框
function loadDashBox(southWest, northEast, dashStyle) {
    var bounds = L.latLngBounds(southWest, northEast); // A_southWest和A_northEast为区域A的南西角和北东角坐标
    dashBox = L.rectangle(bounds, dashStyle);
    dashBox.addTo(groupLayer);
    // dashBox.addTo(map);

    if (map.hasLayer(preDashBox)) {
            map.removeLayer(preDashBox);
    }
}


// 加载预报结果
function loadForecastASC(uUrl, vUrl) {
     if (curr.name === 'sst' || curr.name === 'sss' || curr.name === 'swh') {
        loadForecastScalar(uUrl, vUrl);
    } else {
        // 移除历史风场的粒子动画
        if (map.hasLayer(animation)) {
            map.removeLayer(animation);
        }
        // 移除已有的预报结果的粒子动画
        if (map.hasLayer(aniForecast)) {
            map.removeLayer(aniForecast);
        }
        // 移除弹框
        if (map.hasLayer(popup)) {
            map.removeLayer(popup);
        }
        loadForecastUV(uUrl, vUrl);
    }
}


// 加载预报结果（wave, sst, sss）
function loadForecastScalar(uUrl, vUrl) {
    d3.text(uUrl, function(asc){
        if (asc === null) {
            return;
        }
        var vf = L.ScalarField.fromASCIIGrid(asc); // 标量场
        var color = chroma.scale(curr.colorArray).domain(curr.numberArray);
        magForecast = L.canvasLayer.scalarField(vf, {
            color: color,
            opacity: curr.opacity,
            interpolate: true,
            inFilter: function(v) {
                return v !== -32767;
            }
        });
        // 预报结果的点击事件
        magForecast.on("click", function(e) {
                    layerPopup(e,'click');
                }).on("drag", function(e) {
                    layerPopup(e,'drag');
                });
        // 需要显示预报结果
        if(curr.magnitude) {
             magForecast.addTo(groupLayer);
            // magForecast.addTo(map);

            if (map.hasLayer(preForecast)) {
                map.removeLayer(preForecast);
            }

            // 虚线框样式
            var dashStyle =  {
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0,
                dashArray: '5, 5'
            };
            // 虚线框的西南角坐标和东北角坐标
            var southWest = L.latLng(2, 99);
            var northEast = L.latLng(26.25, 123.25);
            loadDashBox(southWest, northEast, dashStyle);
        }

    });
}


// 加载预报结果（wind）
// todo: 将方向删除
function loadForecastUV(uUrl, vUrl) {
    d3.text(uUrl, function(u) {
        d3.text(vUrl, function(v) {
            if (u != null && v != null) {
                var color = chroma.scale(curr.colorArray).domain(curr.numberArray);
                var vf = L.VectorField.fromASCIIGrids(u, v);

                // 动画图层
                aniForecast = L.canvasLayer.vectorFieldAnim(vf, {
                    width: curr.width,
                    velocityScale: curr.velocityScale,
                    // test
                    density: 5,
                    contrast: 1.5,
                    length: 20,
                    inFilter: function(v) {
                        return v !== -32767
                    }
                });
                //动画点击事件
                aniForecast.on("click", function(e) {
                      layerPopup(e,'click');
                }).on("drag", function(e) {
                    layerPopup(e,'drag');
                });

                // 要素值的图层（与热力图有关）
                magForecast = L.canvasLayer.scalarField(vf.getScalarField("magnitude"), {
                    color: color,
                    opacity: curr.opacity,
                    interpolate: true,
                    inFilter: function(v) {
                        return v !== -32767
                    }
                });

                if (curr.magnitude) { // 显示预报结果
                    magForecast.addTo(groupLayer);
                    if (map.hasLayer(preForecast)) {
                        map.removeLayer(preForecast);
                    }

                    aniForecast.setOpacity(1);
                    aniForecast.addTo(groupLayer);

                    // 虚线框样式
                    var dashStyle =  {
                        color: '#000',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0,
                        dashArray: '5, 5'
                    };
                    // 虚线框的西南角坐标和东北角坐标
                    var southWest = L.latLng(2, 99);
                    var northEast = L.latLng(26.25, 123.25);
                    // 添加虚线框
                    loadDashBox(southWest, northEast, dashStyle);
                }
                else{
                    animation.addTo(map);
                }
            }
        });
    });
}


//加载风场动画
function loadWind(){
    uUrl =  "./static_3D/data/u10/uBackground.asc";
    vUrl =  "./static_3D/data/v10/vBackground.asc";
    d3.text(uUrl, function (u) {
        d3.text(vUrl, function (v) {
            if (u === null || v === null) {
                return;
              }
            var vf = L.VectorField.fromASCIIGrids(u, v);
            animation = L.canvasLayer.vectorFieldAnim(vf, {
                width: wind.width,
                velocityScale: wind.velocityScale,
                inFilter: function(v) {
                    return v !== -32767
                }
            });

            animation.setOpacity(1);
            animation.addTo(groupLayer);
            if (!curr.animation) {
                    animation.setOpacity(0);
            }
    })
  })
}


// 实现多要素菜单的逻辑
/**wave 监听事件开始 */
$("#wave").on("click", function(event) {
    event.stopPropagation();
    if (curr.name === 'swh') {
        return;
    }
    removeAll();
    map.flyTo([14, 111], 6);
    groupLayer.addTo(map);
    curr = wave;
    $("#wave").addClass("icon-active");
    $("#sst").removeClass("icon-active");
    $("#sss").removeClass("icon-active");
    $("#wind").removeClass("icon-active");
    $("#biasCorrect").removeClass("icon-active");

    $("#wave > img").prop("src", "./static_3D/imgs/wave1.png");
    $("#sst > img").prop("src", "./static_3D/imgs/sst.png");
    $("#sss > img").prop("src", "./static_3D/imgs/sss.png");
    $("#wind > img").prop("src", "./static_3D/imgs/wind.png");
    $("#biasCorrect > img").prop("src", "./static_3D/imgs/biasCorrect.png");

    colorTitle.innerHTML = '海浪：m';
    initDraw(['0', '0.5', '1.0', '1.5', '2.0']);

    var currentDate = getCurrentDate(9);
    $("#showDate").datepicker("setDate", currentDate);
    initTimePlay(currentDate, 2*24, 5*24);

    forecastButton.style.display = "block";

    correctButton.style.display = "none";

    removeMiniMap();
    var leftMiniMap = document.getElementById("leftMiniMap");
    var rightMiniMap = document.getElementById("rightMiniMap");
    leftMiniMap.style.display = "none";
    rightMiniMap.style.display = "none";

    // var typeDiv = document.getElementById('typeDiv');
    // typeDiv.style.display = 'none';
    var typeList = document.getElementById('type');
    typeList.options[0].selected = true; // 切换要素时，默认选择Uc类型
    selectedType = 'Uc';

    var regionList = document.getElementById('region');
    regionList.options[0].text = '116.5°E_120°E_18.5°N_22°N';
    regionList.options[1].text = '121.5°E_125°E_19.5°N_23°N';
    regionList.options[0].selected = true; // 切换要素时，默认选择区域1
    selectedRegion = 'r1';
});

$("#wave").hover(
    function() {
        if ($(this).hasClass("icon-active")) {
            $("#waveMenu").show(100);
        }
    },
    function() {
        $("#waveMenu").hide(100);
    }
);

$("#magnitude1").change(function() {
    wave.magnitude = $(this).is(":checked");
    // 需要显示海浪预报结果，同时地图上没有
    if (wave.magnitude && !map.hasLayer(magForecast)) {
        magForecast.addTo(map);
        dashBox.addTo(map);
    }
    // 不显示海浪预报结果
    else if (!wave.magnitude) {
        map.removeLayer(magForecast);
        map.removeLayer(dashBox);
    }
});

/**wave 监听事件结束 */

/**sst 监听事件开始 */
$("#sst").on("click", function(event) {
    event.stopPropagation();
    if (curr.name === 'sst') {
        return;
    }
    removeAll();
    map.flyTo([14, 111], 6);
    curr = sst;
    groupLayer.addTo(map);

    $("#wave").removeClass("icon-active");
    $("#sst").addClass("icon-active");
    $("#sss").removeClass("icon-active");
    $("#wind").removeClass("icon-active");
    $("#biasCorrect").removeClass("icon-active");

    $("#wave > img").prop("src", "./static_3D/imgs/wave.png");
    $("#sst > img").prop("src", "./static_3D/imgs/sst1.png");
    $("#sss > img").prop("src", "./static_3D/imgs/sss.png");
    $("#wind > img").prop("src", "./static_3D/imgs/wind.png");
    $("#biasCorrect > img").prop("src", "./static_3D/imgs/biasCorrect.png");

    colorTitle.innerHTML = '海温：℃';
    initDraw(['28.00', '29.00', '30.00', '31.00', '32.00']);

    var currentDate = getCurrentDate(9);
    $("#showDate").datepicker("setDate", currentDate);
    initTimePlay(currentDate, 2*24, 5*24);

    forecastButton.style.display = "block";

    correctButton.style.display = "none";

    removeMiniMap();
    var leftMiniMap = document.getElementById("leftMiniMap");
    var rightMiniMap = document.getElementById("rightMiniMap");
    leftMiniMap.style.display = "none";
    rightMiniMap.style.display = "none";

    // var typeDiv = document.getElementById('typeDiv');
    // typeDiv.style.display = 'none';
    var typeList = document.getElementById('type');
    typeList.options[0].selected = true; // 切换要素时，默认选择Uc类型
    selectedType = 'Uc';

    var regionList = document.getElementById('region');
    regionList.options[0].text = '110.5°E_114°E_15°N_18.5°N';
    regionList.options[1].text = '111.5°E_115°E_18°N_21.5°N';
    regionList.options[0].selected = true; // 切换要素时，默认选择区域1
    selectedRegion = 'r1';
});
$("#sst").hover(
    function() {
        if ($(this).hasClass("icon-active")) {
            $("#sstMenu").show(100);
        }
    },
    function() {
        $("#sstMenu").hide(100);
    }
);

$("#magnitudeSst").change(function() {
    sst.magnitude = $(this).is(":checked");
    // 需要显示海温预报结果，同时地图上没有
    if (sst.magnitude && !map.hasLayer(magForecast)) {
        magForecast.addTo(map);
        dashBox.addTo(map);
    }
    // 不显示海温预报结果
    else if (!sst.magnitude) {
        map.removeLayer(magForecast);
        map.removeLayer(dashBox);
    }
});

/**sst 监听事件结束 */

/**sss 监听事件开始 */
// sss 预报间隔：1 day
$("#sss").on("click", function(event) {
    event.stopPropagation();
    if (curr.name === 'sss') {
        return;
    }
    removeAll();
    map.flyTo([14, 111], 6);
    curr = sss;
    groupLayer.addTo(map);
    $("#wave").removeClass("icon-active");
    $("#sst").removeClass("icon-active");
    $("#sss").addClass("icon-active");
    $("#wind").removeClass("icon-active");
    $("#biasCorrect").removeClass("icon-active");

    $("#wave > img").prop("src", "./static_3D/imgs/wave.png");
    $("#sst > img").prop("src", "./static_3D/imgs/sst.png");
    $("#sss > img").prop("src", "./static_3D/imgs/sss1.png");
    $("#wind > img").prop("src", "./static_3D/imgs/wind.png");
    $("#biasCorrect > img").prop("src", "./static_3D/imgs/biasCorrect.png");

    colorTitle.innerHTML = '海盐：psu';
    initDraw(['28.0', '30.0', '32.0', '34.0']);

    var currentDate = getCurrentDate(9);
    $("#showDate").datepicker("setDate", currentDate);
    initTimePlay(currentDate, 2*24, 5*24);

    forecastButton.style.display = "block";

    correctButton.style.display = "none";

    removeMiniMap();
    var leftMiniMap = document.getElementById("leftMiniMap");
    var rightMiniMap = document.getElementById("rightMiniMap");
    leftMiniMap.style.display = "none";
    rightMiniMap.style.display = "none";

    // var typeDiv = document.getElementById('typeDiv');
    // typeDiv.style.display = 'none';
    var typeList = document.getElementById('type');
    typeList.options[0].selected = true; // 切换要素时，默认选择Uc类型
    selectedType = 'Uc';

    var regionList = document.getElementById('region');
    regionList.options[0].text = '110.5°E_114°E_15°N_18.5°N';
    regionList.options[1].text = '111.5°E_115°E_18°N_21.5°N';
    regionList.options[0].selected = true; // 切换要素时，默认选择区域1
    selectedRegion = 'r1';
});
$("#sss").hover(
    function() {
        if ($(this).hasClass("icon-active")) {
            $("#sssMenu").show(100);
        }
    },
    function() {
        $("#sssMenu").hide(100);
    }
);

$("#magnitudeSss").change(function() {
    sss.magnitude = $(this).is(":checked");
    // 需要显示海盐预报结果，同时地图上没有
    if (sss.magnitude && !map.hasLayer(magForecast)) {
        magForecast.addTo(map);
        dashBox.addTo(map);
    }
    // 不显示海盐预报结果
    else if (!sss.magnitude) {
        map.removeLayer(magForecast);
        map.removeLayer(dashBox);
    }
});

/**sss 监听事件结束 */

/**wind 监听事件开始 */
$("#wind").on("click", function(event) {
    event.stopPropagation();
    if (curr.name === 'win') {
        return;
    }
    removeAll();
    map.flyTo([14, 111], 6);
    curr = wind;
    groupLayer.addTo(map);

    $("#wave").removeClass("icon-active");
    $("#sst").removeClass("icon-active");
    $("#sss").removeClass("icon-active");
    $("#wind").addClass("icon-active");
    $("#biasCorrect").removeClass("icon-active");

    $("#wave > img").prop("src", "./static_3D/imgs/wave.png");
    $("#sst > img").prop("src", "./static_3D/imgs/sst.png");
    $("#sss > img").prop("src", "./static_3D/imgs/sss.png");
    $("#wind > img").prop("src", "./static_3D/imgs/wind1.png");
    $("#biasCorrect > img").prop("src", "./static_3D/imgs/biasCorrect.png");

    colorTitle.innerHTML = '海风：m/s';
    initDraw(['1.5', '6.5', '11.5', '16.5', '21.5', '26.5']);

    var currentDate = getCurrentDate(9);
    $("#showDate").datepicker("setDate", currentDate);
    initTimePlay(currentDate, 2*24, 5*24);

    forecastButton.style.display = "block";

    correctButton.style.display = "none";

    removeMiniMap();
    var leftMiniMap = document.getElementById("leftMiniMap");
    var rightMiniMap = document.getElementById("rightMiniMap");
    leftMiniMap.style.display = "none";
    rightMiniMap.style.display = "none";

    // var typeDiv = document.getElementById('typeDiv');
    // typeDiv.style.display = 'block';
    var typeList = document.getElementById('type');
    typeList.options[0].selected = true; // 切换要素时，默认选择Uc类型
    selectedType = 'Uc';

    var regionList = document.getElementById('region');
    regionList.options[0].text = '116.5°E_120°E_18.5°N_22°N';
    regionList.options[1].text = '121.5°E_125°E_19.5°N_23°N';
    regionList.options[0].selected = true; // 切换要素时，默认选择区域1
    selectedRegion = 'r1';
});

$("#wind").hover(
    function() {
        if ($(this).hasClass("icon-active")) {
            $("#windMenu").show(100);
        }
    },
    function() {
        $("#windMenu").hide(100);
    }
);

//$("#magnitude2").change(function() {
//    wind.magnitude = $(this).is(":checked");
//    if (wind.magnitude && !map.hasLayer(magnitude)) {
//        magnitude.addTo(map);
//        if (wind.animation) {
//            map.removeLayer(animation);
//            animation.addTo(map);
//        }
//
//        if (wind.direction) {
//            map.removeLayer(direction);
//            direction.addTo(map);
//        }
//    } else if (!wind.magnitude) {
//        map.removeLayer(magnitude);
//    }
//});

$("#magnitude2").change(function() {
    wind.magnitude = $(this).is(":checked");
    // 需要显示海风预报结果，同时地图上没有
    if (wind.magnitude && !map.hasLayer(magForecast)) {
        magForecast.addTo(map);
        dashBox.addTo(map);
        if (wind.animation) {
            map.removeLayer(animation);
            aniForecast.addTo(map);
        }
    }
    // 不显示海风预报结果
    else if (!wind.magnitude) {
        map.removeLayer(magForecast);
        map.removeLayer(aniForecast);
        map.removeLayer(dashBox);
        animation.addTo(map);
    }
});

//$("#animation2").change(function() {
//    wind.animation = $(this).is(":checked");
//    if (wind.animation) {
//        if (wind.magnitude) {
//            groupLayer.removeLayer(animation);
//            animation.addTo(groupLayer);
//        }
//        animation.setOpacity(1);
//    } else {
//        animation.setOpacity(0);
//    }
//});

$("#animation2").change(function() {
    wind.animation = $(this).is(":checked");
    if(wind.magnitude){ // 显示海风预报结果
        if (wind.animation){
            groupLayer.removeLayer(aniForecast);
            aniForecast.addTo(groupLayer);
            aniForecast.setOpacity(1);
        }
        else{
            aniForecast.setOpacity(0);
        }
    }
    else{
        if (wind.animation){
            groupLayer.removeLayer(animation);
            animation.addTo(groupLayer);
            animation.setOpacity(1);
        }
        else{
            animation.setOpacity(0);
        }
    }
});

/**wind 监听事件结束 */

/**偏差订正 监听事件开始 */
$("#biasCorrect").on("click", function(event) {
    event.stopPropagation();

    removeAll();
    map.flyTo([14, 111], 6);
    curr = correct;
    groupLayer.addTo(map);

    $("#wave").removeClass("icon-active");
    $("#sst").removeClass("icon-active");
    $("#sss").removeClass("icon-active");
    $("#wind").removeClass("icon-active");
    $("#biasCorrect").addClass("icon-active");

    $("#wave > img").prop("src", "./static_3D/imgs/wave.png");
    $("#sst > img").prop("src", "./static_3D/imgs/sst.png");
    $("#sss > img").prop("src", "./static_3D/imgs/sss.png");
    $("#wind > img").prop("src", "./static_3D/imgs/wind.png");
    $("#biasCorrect > img").prop("src", "./static_3D/imgs/biasCorrect1.png");

    colorTitle.innerHTML = '海风：m/s';
    initDraw(['1.5', '6.5', '11.5', '16.5', '21.5', '26.5']);

    var currentDate = getCurrentDate(12);
    $("#showDate").datepicker("setDate", currentDate);
    initTimePlay(currentDate, 12, 11);

    forecastButton.style.display = "none";

    correctButton.style.display = "block";

    var leftMiniMap = document.getElementById("leftMiniMap");
    var rightMiniMap = document.getElementById("rightMiniMap");
    leftMiniMap.style.display = "block";
    rightMiniMap.style.display = "block";

    // alert("这是偏差订正模块！");
});

/**偏差订正 监听事件结束 */

/**区域选择 监听事件开始 */
$("#region").change(function(){
    if(this.value === 'r2'){
        selectedRegion = 'r2';
    }
    else {
        selectedRegion = 'r1';
    }
});
/**区域选择 监听事件结束 */

/**数据文件类型选择 监听事件开始 */
$("#type").change(function(){
    if(this.value === 'Grb'){
        selectedType = 'Grb';
    }
    else {
        selectedType = 'Uc';
    }
});
/**数据文件类型选择 监听事件结束 */


// 移除渲染的图层
function removeAll() {
    map.removeLayer(groupLayer);
    groupLayer = L.layerGroup();
}


// 时间轴切换时调用的移除方法
function removeSimple() {
    if (map.hasLayer(animation)) {
        map.removeLayer(animation);
    }
    if (map.hasLayer(popup)) {
        map.removeLayer(popup);
    }
}

// 移除缩略地图
function removeMiniMap(){
    if (miniMapLeft != null){
            map.removeControl(miniMapLeft);
    }
    if (miniMapRight != null){
            map.removeControl(miniMapRight);
    }
    // 隐藏提示文字
    var leftText = document.getElementById("leftText");
    var rightText = document.getElementById("rightText");
    leftText.style.display = "none";
    rightText.style.display = "none";
}

// 在时间轴上由预报结果切换到历史数据时，调用该移除方法
function removeForecast() {
    if (map.hasLayer(magForecast)) {
        map.removeLayer(magForecast); // 移除预报的数值图层
    }
    if (curr.name === 'win'){
        if (map.hasLayer(aniForecast)) {
            map.removeLayer(aniForecast); // 移除预报的动画图层
        }
//        if (map.hasLayer(dirForecast)) {
//            map.removeLayer(dirForecast); // 移除预报的方向图层
//        }
    }
    if (map.hasLayer(dashBox)) {
        map.removeLayer(dashBox); // 移除虚线框
    }
    if (map.hasLayer(popup)) {
        map.removeLayer(popup);
    }
}

// 添加地图缩放监听事件
function addEvent() {
    map.on("zoomend", function() {
        zoom = map.getZoom();
        if (zoom != 4) {
            isFirst = false;
        }
    });
}


// 初始化日历
function initCalendar() {
		$("#showDate").datepicker({
			dateFormat: "yy-mm-dd",
			changeMonth: true,
			changeYear: true,
		    yearRange: "1900:2099",
			monthNames: [
					"一月", "二月", "三月", "四月", "五月", "六月",
					"七月", "八月", "九月", "十月", "十一月", "十二月"
			],
			monthNamesShort: [
					"一月", "二月", "三月", "四月", "五月", "六月",
					"七月", "八月", "九月", "十月", "十一月", "十二月"
			],
			dayNames: [
					"星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"
			],
			dayNamesMin: [
					"日", "一", "二", "三", "四", "五", "六"
			],
			onSelect: function(dateText, inst) {
			    // 将选择的日期文本转换为 Date 对象
                var selectedDate = new Date(dateText);
                // 获取年、月、日信息
                var year = selectedDate.getFullYear();
                var month = selectedDate.getMonth() + 1; // 注意要加 1，因为 getMonth 返回的是 0 到 11
                var day = selectedDate.getDate();
                // console.log(`用户选择的日期：${year}/${month}/${day} 00:00`);
                // selectedDate = new Date(`${year}/${month}/${day} 00:00`);
                if (curr.name === 'biasCorrect') {
                    selectedDate = new Date(`${year}/${month}/${day} 12:00`);
                    // 更新时间轴
                    initTimePlay(selectedDate, 12, 11);
                }
                else {
                    selectedDate = new Date(`${year}/${month}/${day} 9:00`);
                    // 更新时间轴
                    initTimePlay(selectedDate, 2*24, 5*24);
                }
            }
		});

		$("#chooseDate").click(function (event) {
		    event.stopPropagation();
			$("#showDate").datepicker("show"); // 显示日期选择器
		});
}


// 获取当前日期，用于初始化时间轴
// hour: 当前日期下具体的时间（整数, 17代表17时）
function getCurrentDate(hour){
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1; // 注意要加 1，因为 getMonth 返回的是 0 到 11
    var day = currentDate.getDate();
    // currentDate = new Date(`${year}/${month}/${day} 00:00`);
    currentDate = new Date(`${year}/${month}/${day} ${hour}:00`);
    return currentDate;
}


// 初始化/更新时间轴
// initDate: 时间轴的初始日期
// pastLen: 展示的历史数据时长 （单位：小时）
// forecastLen: 展示的预报结果时长 （单位：小时）
function initTimePlay(initDate, pastLen, forecastLen) {
    // 时间轴开始日期
    startTime = new Date(initDate.getTime() - pastLen * 1000 * 60 * 60);
    // 结束日期
    endTime = new Date(initDate.getTime() + forecastLen * 1000 * 60 * 60);
    // 区分历史数据和预报结果的分界日期
    if (curr.name === 'sss') {
        boundaryTime = new Date(initDate.getTime() + 24 * 1000 * 60 * 60);
    }
    else {
        boundaryTime = new Date(initDate.getTime() + 3 * 1000 * 60 * 60);
    }

    // 判断时间轴是否需要显示游标
    var showCursor = curr.name != 'biasCorrect';

    if (timePlay) {
        timePlay.empty();
    }
    timePlay = new TimePlay({
        speed: speed, //播放速度
        startDate: startTime, //开始日期
        endDate: endTime, //结束日期
        selectedDate: initDate, //初始日期
        showCursor: showCursor, //是否显示游标
        backToday: false, //是否显示返回今天按钮
        timeUnitControl: false, //是否显示时/天切换控件
        onClickChangeEnd: function(time) {
            setTimeout(function() {
                renderByTime(time);
            }, 200);
        },
        onAnimateEnd: function(time) {
            setTimeout(function() {
                renderByTime(time);
            }, 200);
        }
    });
}


// 当展示历史数据时，根据当前要素，设置数据文件的路径
// time: 格林尼治时间
// 海盐：格林尼治时间
// 海温：格林尼治时间
// 其它要素：需要换算成模式时间
function joinPath(time) {
    if (curr.name === 'sss' || curr.name === 'sst') {
        var modelTime = time;
    }
    else {
        // 由格林尼治时间换算到模式时间
        var modelTime = new Date(time.getTime() - 12 * 1000 * 60 * 60);
    }

    var date = formatDate("yyyyMMdd", modelTime);
    var hour = modelTime.getHours();
    // 将时间的小时数填充成三位数，左侧补零
    var paddedHour3 = hour.toString().padStart(3, '0');
    // 将时间的小时数填充成两位数，左侧补零
    var paddedHour2 = hour.toString().padStart(2, '0');

    if (curr.name === 'swh') {
        uUrl =
            "./static_3D/data/display/" + date
            + "/H03/orderH03_" + paddedHour3 + ".asc";
    }
    else if (curr.name === 'sst') {
        uUrl =
            "./static_3D/data/display/" + date
            + "/SST/" + paddedHour2 + "h.asc";
    }
    else if (curr.name === 'sss') {
        uUrl =
           "./static_3D/data/display/" + date
            + "/SAL/daily.asc";
    }
    else if (curr.name === 'win') {
        uUrl =
            "./static_3D/data/display/" + date
            + "/UT/orderUT_" + paddedHour3 + ".asc";

        vUrl =
            "./static_3D/data/display/" + date
            + "/VT/orderVT_" + paddedHour3 + ".asc";
    }
}


// 当展示预报结果时，根据当前要素，设置数据文件的路径
// time: 格林尼治时间
// 海盐：格林尼治时间
// 其它要素：模式时间
function joinForecastPath(time) {
    if (curr.name === 'sss') {
        // 获取时间轴的初始时间(格林尼治时间)
        var initDate = new Date(boundaryTime.getTime() - 24 * 1000 * 60 * 60);
        // 获取保存预报结果的日期(格林尼治时间)
        var date = formatDate("yyyyMMdd", boundaryTime);

        var hours = parseInt((time - initDate) / 1000 / 60 / 60);
    }
    else {
        // 获取时间轴的初始时间(格林尼治时间)
        var initDate = new Date(boundaryTime.getTime() - 3 * 1000 * 60 * 60);
        // 获取保存预报结果的日期(格林尼治时间)
        var date = formatDate("yyyyMMdd", boundaryTime);
        // 获取向后预报的小时数
        var hours = parseInt((time - initDate) / 1000 / 60 / 60);
    }

    if (curr.name === 'swh') {
        uUrl =
            "./static_3D/data/forcast/" + date
            + `/swh/Forcastswh_${hours}.asc`;
    }
    else if (curr.name === 'sst') {
        uUrl =
            "./static_3D/data/forcast/" + date
            + `/sst/Forcastsst_${hours}.asc`;
    }
    else if (curr.name === 'sss') {
        uUrl =
            "./static_3D/data/forcast/" + date
            + `/sss/Forcastsss_${hours}.asc`;
    }
    else if (curr.name === 'win') {
        uUrl =
             "./static_3D/data/forcast/" + date
            + `/u10/Forcastu10_${hours}.asc`;

        vUrl =
            "./static_3D/data/forcast/" + date
            + `/v10/Forcastv10_${hours}.asc`;
    }
}

// 根据时间轴的当前时间进行渲染 (渲染某时刻的热力图、动画图层和方向图层)
// time: 格林尼治时间
function renderByTime(time) {
    curTime = time;
    if (curr.name === 'biasCorrect'){
        correctTime = time;
        removeAll();
        removeMiniMap();
        groupLayer.addTo(map);
    }

    else if (curr.name === 'sss'){
        // 对于sss(预报间隔1天), 时间轴的当前时间与起始时间相差是24小时的倍数时，渲染数据
        if (parseInt((time - startTime) / 1000 / 60 / 60) % 24 === 0) {

            // 当前时间在分界时间之前，展示历史数据
            if (time < boundaryTime) {
                pre = magnitude;

                joinPath(time);
                removeForecast();
                removeSimple();
                loadASC(uUrl, vUrl);
            }
            // 以历史数据作为背景，添加预报结果
            else {
                preForecast = magForecast;
                // preDirForecast = dirForecast;
                preDashBox = dashBox;

                // joinPath(time);
                joinForecastPath(time);
                loadForecastASC(uUrl, vUrl);
            }
        }
    }
    else {
        // 对于其它要素(预报间隔3小时), 时间轴的当前时间与起始时间相差是3小时的倍数时，渲染数据
        if (parseInt((time - startTime) / 1000 / 60 / 60) % 3 === 0) {

            // 当前时间在分界时间之前，展示历史数据
            if (time < boundaryTime) {
                pre = magnitude;

                joinPath(time);
                removeForecast();
                removeSimple();
                loadASC(uUrl, vUrl);
            }
            // 以历史数据作为背景，添加预报结果
            else {
                preForecast = magForecast;
                // preDirForecast = dirForecast;
                preDashBox = dashBox;

                // joinPath(time);
                joinForecastPath(time);
                loadForecastASC(uUrl, vUrl);
            }
        }
    }
}

//经纬度保留小数位数方法
function mathfloat(num, n) {
    n = n ? parseInt(n) : 0;
    if (n <= 0) {
        return Math.round(num);
    }
    num = Math.round(num * Math.pow(10, n)) / Math.pow(10, n); //四舍五入
    num = Number(num).toFixed(n);
    return num;
}

//经纬度单位
function latlngUnit(value,type){
    var valstring;
    if(type=='lat'){
      if (value > 0) {
        valstring = value + "°N";
      } else {
        valstring = value + "°S";
      }
    }else{
      if (value > 0) {
        valstring = value + "°E";
      } else {
        valstring = value + "°W";
      }
    }
    return valstring;
}

//弹框点击事件
function layerPopup(e, type){
    if (curr.name !== 'biasCorrect'){
        if (!curr.animation && !curr.magnitude && !curr.direction) {
            return;
        }
    }
    if(type=='drag'&&!popup.isOpen()){//当弹框没有打开时
       return;
    }
    var lat = e.latlng.lat; // 纬度
    var lng = e.latlng.lng; // 经度
    lat = mathfloat(lat, 3);
    lng = mathfloat(lng, 3);
    var latString = latlngUnit(lat,"lat");
    var lngString = latlngUnit(lng,"lng");
    if (e.value !== null) {//在可视化范围内 //
        if(curr.name === 'sst' || curr.name === 'sss' || curr.name === 'swh'){ // 标量要素
            var v = e.value.toFixed(2);
            var html = curr.html(lngString, latString, v);
        }else{ // 矢量要素
            var v = e.value.magnitude().toFixed(2);
            var d = e.value.directionFrom().toFixed(2);
            var html = curr.html(lngString, latString, v, d);
        }
        popup.setLatLng(e.latlng)
            .setContent(html)
            .openOn(map);
    }
//    else{//不在可视化范围内
//        popup.setContent(nodata.html(lngString, latString))
//        .setLatLng(e.latlng)
//        .openOn(map);
//    }
}

// prompt info
function showPrompt(info) {
    new NoticeJs({
        text: info,
        position: 'topCenter',
        type: 'info',
        animation: {
            open: 'animated bounceInDown',
            close: 'animated bounceOutUp'
        },
        timeout: false,
    }).show();
}


// 当用户点击“开始预报”按钮时，调用该方法
function forecast(){
     return new Promise((resolve, reject) => {
        var selectedElement = curr.name;

        fetch('/forecast', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({element: selectedElement, date: formatDate("yyyyMMddhh0000", boundaryTime)})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 请求成功的逻辑
                // alert("预报完成！");
                showPrompt("预报完成！");
            } else {
                // 请求失败的逻辑，显示错误消息
                // alert('请求失败：' + data.error);
                showPrompt("预报失败");
            }

            // 异步操作成功时调用resolve
            resolve();
        })
        .catch(error => {
            // alert('请求失败：' + error.message);
            showPrompt("预报失败");
            reject(error); // 异步操作失败时调用reject
        });

    });
}


// 当用户点击“开始订正”按钮时，调用该方法
function biasCorrect() {
    return new Promise((resolve, reject) => {
        var hour = correctTime.getHours();
        if ((hour % 3) == 0){
            var selectedElement = "win";

            fetch('/biasCorrect', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({element: selectedElement, date: formatDate("yyyyMMddhh0000", correctTime)})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 请求成功的逻辑
                    // alert("订正完成！");
                    showPrompt("订正完成！");

                    // 获取订正结果的路径
                    var date = formatDate("yyyyMMdd", correctTime);
                    var hour = correctTime.getHours();
                    // 将小时数填充成两位数，左侧补零
                    var paddedHour = hour.toString().padStart(2, '0');
                    uUrl =
                         "./static_3D/data/forcast/" + date
                        + "/bc_u10/bc_u10_" + paddedHour + "h.asc";

                    vUrl =
                        "./static_3D/data/forcast/" + date
                        + "/bc_v10/bc_v10_" + paddedHour + "h.asc";
                    // 将订正结果渲染到地图上
                    loadCorrect(uUrl, vUrl);

                    // 获取ERA5数据的路径
                    var uERA5 =
                        "./static_3D/data/display/" + date
                        + "/ERA5U/" + paddedHour + "h.asc";
                    var vERA5 =
                        "./static_3D/data/display/" + date
                        + "/ERA5V/" + paddedHour + "h.asc";

                    // 获取海军数据的路径
                    var modelTime = new Date(correctTime.getTime() - 12 * 1000 * 60 * 60);
                    date = formatDate("yyyyMMdd", modelTime);
                    hour = modelTime.getHours();
                    // 将模式时间的小时数填充成三位数，左侧补零
                    paddedHour = hour.toString().padStart(3, '0');
                    var uOrigin =
                        "./static_3D/data/display/" + date
                        + "/UT/orderUT_" + paddedHour + ".asc";

                    var vOrigin =
                        "./static_3D/data/display/" + date
                        + "/VT/orderVT_" + paddedHour + ".asc";
                    // 添加缩略地图，显示订正前和ERA5
                    createMiniMap(uOrigin, vOrigin, uERA5, vERA5);

                } else {
                    // 请求失败的逻辑，显示错误消息
                    // alert('请求失败：' + data.error);
                    showPrompt("订正失败");
                }

                // 异步操作成功时调用resolve
                resolve();
            })
            .catch(error => {
                // alert('请求失败：' + error.message);
                showPrompt("订正失败");
                reject(error); // 异步操作失败时调用reject
            });

        }
        else {
            // alert("请选择能够被3小时整除的时刻！");
            showPrompt("请选择能够被3小时整除的时刻！");
            // 异步操作成功时调用resolve
            resolve();
        }
    });
}


// 当用户点击“3D”按钮时，调用该方法，切换到三维温盐平台
function switch3D(event){
    event.stopPropagation();
    window.location.href = '/to3D';
}


// 使用对象数组存储浮点数和颜色信息
let selected_color;
let selected_Y = 200;
const cvsWidth = 10;
const cvsHeight = 200;

// 元素
const cursorArea = document.getElementById('cursorArea');
const topArrow = document.getElementById("topArrow");
const bottomArrow = document.getElementById("bottomArrow");
const fixBar = document.getElementById("fixBar");
const colorTitle = document.getElementsByClassName('colorTitle')[0];

bottomArrow.onclick = function () {
    oBox.style.top = colorBar.offsetTop - oBox.offsetHeight / 2 + 'px';
    selected_Y = 0;
}
topArrow.onclick = function () {
    oBox.style.top = topArrow.offsetTop + topArrow.offsetHeight / 2 - oBox.offsetHeight / 2 + 'px';
    selected_Y = 200;
}

//
// 1.获取元素
const oBox = document.getElementById("box");
const selfShadow = document.getElementById("selfShadow");

// 2.鼠标按下事件
// oBox.addEventListener("mousedown", function (ev) {
//
//     // ev = ev || window.event;
//     ev.stopPropagation();
//     ev.preventDefault();
//     // 获取鼠标相对于盒子的坐标
//     var y2 = ev.offsetY;
//     // 鼠标移动
//     document.addEventListener("mousemove", function (e) {
//         e.stopPropagation();
//         e.preventDefault();
//         // var e = e || window.event;
//
//         e.stopPropagation();
//         var y3 = e.pageY;
//         var y4 = selfShadow.offsetTop;
//         let location = y3 - y2 - y4 + 6;
//         selected_Y = location;
//         if (location <=200 && location >=0) {
//             oBox.style.top = y3 - y4 - y2+ "px";
//         }
//     })
// })
const colorBar = document.getElementById("colorBar");
oBox.onmousedown = function (ev) {
    var ev = ev || window.event;
    // 获取鼠标相对于盒子的坐标
    var y2 = ev.offsetY;
    // 鼠标移动
    document.onmousemove = function (ev) {
        ev = ev || window.event;
        const barTop = colorBar.offsetTop;
        const y3 = ev.pageY;
        const y4 = selfShadow.offsetTop;
        let location = y3 - y2 - y4 + 6 - barTop;

        if (location <= 200 && location >= 0) {
            oBox.style.top = y3 - y4 - y2 + "px";
            selected_Y = location;
        } else if (location < 0) {
            selected_Y = 0;
        } else {
            selected_Y = cvsHeight;
        }
    }
}
// 4.鼠标松开事件
// function upToPick() {
// 	colorPicker.click(); // 触发颜色选择器的点击事件
//     oBox.removeEventListener("mouseup", upToPick);
// }
document.addEventListener("mouseup", function (e) {
    document.addEventListener("mousemove", function () {

    })
})
document.onmouseup = function () {
    document.onmousemove = function () {
    }
}
oBox.addEventListener("click", function(e) {
    selected_Y = oBox.offsetTop - colorBar.offsetTop + 6;
})

function getColors(context) {
    // 获取整个颜色带的像素数据
    const imageData = context.getImageData(0, 0, 1, cvsHeight).data;
    const length = curr.numberArray.length; // 映射数量
    const delta = imageData.length / length
    // 提取颜色信息并存入数组
    const colors = [];
    for (let i = 0; i < imageData.length; i+=Math.floor(delta) + 4) {
        const red = imageData[i];
        const green = imageData[i + 1];
        const blue = imageData[i + 2];
        // const alpha = imageData[i + 3];
        colors.push(`rgb(${red}, ${green}, ${blue})`);
    }
    if (colors.length < length) {
        colors.push(`rgb(${imageData[796]}, ${imageData[797]}, ${imageData[798]})`);
    }
    return colors.reverse();
}


// 颜色条
// 共用一个画布
const cvsFix = document.createElement('canvas');
const ctxFix = cvsFix.getContext('2d');
cvsFix.width = cvsWidth;
cvsFix.height = cvsHeight;
function drawColorBar(colorStops) {
    ctxFix.clearRect(0, 0, cvsWidth, cvsHeight);
    let gradient = ctxFix.createLinearGradient(0, 0, cvsWidth, cvsHeight);
    for (let stop of colorStops) {
        gradient.addColorStop(stop.position, stop.color);
    }
    ctxFix.fillStyle = gradient;
    ctxFix.fillRect(0, 0, cvsWidth, cvsHeight);
    cvsFix.style.marginLeft = 10 + 'px';
    fixBar.appendChild(cvsFix);
}

// 颜色选择器
let colorPicker = null;
fixBar.addEventListener("click", function (e) {
    e.stopPropagation();
    myShadow.style.display = 'block';
    initMark();
    showMark();
    colorPicker = new Colorpicker({
        el: "box",
        color: "#000fff",
        change: function(elem, hex) {
            selected_color = hex; // 获取所选颜色的值（十六进制格式）
            changeHandler();
        }
    })
})

// 自定义colorbar后，重新渲染数据
function reRenderData() {
    if (curr.name === 'biasCorrect'){
        // 获取订正结果的路径
        var date = formatDate("yyyyMMdd", correctTime);
        var hour = correctTime.getHours();
        // 将小时数填充成两位数，左侧补零
        var paddedHour = hour.toString().padStart(2, '0');
        uUrl =
             "./static_3D/data/forcast/" + date
            + "/bc_u10/bc_u10_" + paddedHour + "h.asc";

        vUrl =
            "./static_3D/data/forcast/" + date
            + "/bc_v10/bc_v10_" + paddedHour + "h.asc";

        loadCorrect(uUrl, vUrl);
    }
    else{
        renderByTime(curTime);
    }
}


function changeHandler() {
    let relPos = selected_Y / 200;
    if (relPos > 1) relPos = 1;
    if (relPos < 0) relPos = 0;
    // 替换画布中的渐变色
    const gradient = ctxEject.createLinearGradient(0, 0, cvsWidth, cvsHeight);

    if (relPos === 0 || relPos === 1) { // 顶端和底端
        curr.colorStops[relPos].color = selected_color;
        if (relPos) {
            topArrow.style = "border-left: 8px solid "+ selected_color;
        } else {
            bottomArrow.style = "border-left: 8px solid "+ selected_color;
        }
    } else {
        for (const item of curr.colorStops) { // 删除原来的点
            if (item.position === relPos) {
                document.getElementById("mark"+curr.name+relPos).ondblclick;
            }
        }

        let newStop = { position: relPos, color: selected_color };
        const mark = document.createElement("div");
        mark.id = "mark" + curr.name + newStop.position;
        mark.className = "color-arrow";
        mark.style = `border-left: 8px solid ${selected_color};top: ${selected_Y + colorBar.offsetTop - 8}px`;
        mark.ondblclick = function() {
            const local = (mark.offsetTop - colorBar.offsetTop + mark.offsetHeight / 2) / 200;
            const gradient_new = ctxEject.createLinearGradient(0, 0, cvsEject.width, cvsEject.height);
            oBox.style.top = mark.offsetTop + mark.offsetHeight/2 - oBox.offsetHeight/2 +  'px';

            selected_Y = mark.offsetTop - colorBar.offsetTop + 8;

            curr.colorStops = curr.colorStops.filter(function(item) {
                return item.position !== local;
            })
            for (let stop of curr.colorStops) {
                gradient_new.addColorStop(stop.position, stop.color);
            }
            ctxEject.fillStyle = gradient_new;
            ctxEject.fillRect(0, 0, cvsWidth, cvsHeight);

            ctxFix.fillStyle = gradient_new;
            ctxFix.fillRect(0, 0, cvsWidth, cvsHeight);


            // getColors(context);
            curr.colorArray = getColors(ctxEject);
            reRenderData();
            cursorArea.removeChild(mark);
        }
        cursorArea.appendChild(mark);
        curr.colorStops.push(newStop);
    }
    for (let stop of curr.colorStops) {
        gradient.addColorStop(stop.position, stop.color);
    }
    ctxEject.fillStyle = gradient;
    ctxEject.fillRect(0, 0, cvsWidth, cvsHeight);

    ctxFix.fillStyle = gradient;
    ctxFix.fillRect(0, 0, cvsWidth, cvsHeight);

    curr.colorArray = getColors(ctxEject);
    reRenderData();
}

// 弹出层
const myShadow = document.getElementById("myShadow");
myShadow.addEventListener("click", function (e) {
    e.stopPropagation();
})
function closeShadow() {
    hideMark();
    myShadow.style.display = 'none';
}

// 画刻度条
const cvsDeg = document.createElement('canvas');
cvsDeg.className = "myCanvas";
cvsDeg.width = 40;
cvsDeg.height = cvsHeight;
let ctxDeg = cvsDeg.getContext('2d');
function drawDegree(degrees) {
    ctxDeg.clearRect(0, 0, 40, cvsHeight);
    // 竖线
    ctxDeg.beginPath();
    ctxDeg.moveTo(5, 0);
    ctxDeg.lineTo(5, cvsHeight);

    // 刻度（从下至上）
    const delta = cvsHeight / (degrees.length - 1);
    for (let i = 0; i < degrees.length - 1; i++) {
        const tempY = cvsHeight - i * delta;
        ctxDeg.moveTo(5, tempY);
        ctxDeg.lineTo(10, tempY);
        ctxDeg.fillText(degrees[i], 12, tempY)
    }
    ctxDeg.moveTo(5, 0);
    ctxDeg.lineTo(10, 0);
    ctxDeg.fillText(degrees[degrees.length - 1], 12, 10);
    ctxDeg.stroke();
    fixBar.appendChild(cvsDeg);
}

// 弹出层颜色条
const cvsEject = document.createElement('canvas');
const ctxEject = cvsEject.getContext('2d');
cvsEject.width = cvsWidth;
cvsEject.height = cvsHeight;
function drawEjectColorBar(colorStops) {
    ctxEject.clearRect(0, 0, cvsWidth, cvsHeight);
    let gradient = ctxEject.createLinearGradient(0, 0, cvsWidth, cvsHeight);
    for (let stop of colorStops) {
        gradient.addColorStop(stop.position, stop.color);
    }
    ctxEject.fillStyle = gradient;
    ctxEject.fillRect(0, 0,  cvsWidth, cvsHeight);
    colorBar.appendChild(cvsEject);
}

// 弹出层刻度
const cvsEDeg = document.createElement('canvas');
cvsEDeg.width = 40;
cvsEDeg.height = cvsHeight;
let ctxEDeg = cvsEDeg.getContext('2d');
function drawEjectDegree(degrees) {
    ctxEDeg.clearRect(0, 0, 40, cvsHeight);
    // 竖线
    ctxEDeg.beginPath();
    ctxEDeg.moveTo(5, 0);
    ctxEDeg.lineTo(5, cvsHeight);

    // 刻度（从下至上）
    const delta = cvsHeight / (degrees.length - 1);
    for (let i = 0; i < degrees.length - 1; i++) {
        const tempY = cvsHeight - i * delta;
        ctxEDeg.moveTo(5, tempY);
        ctxEDeg.lineTo(10, tempY);
        ctxEDeg.fillText(degrees[i], 12, tempY)
    }
    ctxEDeg.moveTo(5, 0);
    ctxEDeg.lineTo(10, 0);
    ctxEDeg.fillText(degrees[degrees.length - 1], 12, 10);
    ctxEDeg.stroke();
    colorBar.appendChild(cvsEDeg);
}

initDraw(['1.5', '6.5', '11.5', '16.5', '21.5', '26.5']);

// 显示颜色标（切换元素）
function showMark() {
     for (let i = 2; i < curr.colorStops.length; i++) {
        let mark = document.getElementById("mark" + curr.name + curr.colorStops[i].position);
        if (mark) {
            mark.style.display = 'block'
        }
     }
}

// 隐藏颜色标（切换元素）
function hideMark() {
    for (let i = 2; i < curr.colorStops.length; i++) {
        let mark = document.getElementById("mark" + curr.name + curr.colorStops[i].position);
        if (mark) mark.style.display = 'none';
    }
}

// 初始化颜色标
function initMark() {
    bottomArrow.style = `border-left: 8px solid ${curr.colorStops[0].color}`;
    topArrow.style = `border-left: 8px solid ${curr.colorStops[1].color}`;
    for (let i = 2; i < curr.colorStops.length; i++) {
        let mark = document.getElementById("mark" + curr.name + curr.colorStops[i].position);
        if (!mark) {    // mark不存在
            const mark = document.createElement("div");
            mark.id = "mark" + curr.name + curr.colorStops[i].position;
            mark.className = "color-arrow";
            mark.style = `border-left: 8px solid ${curr.colorStops[i].color};top: ${curr.colorStops[i].position * 200 + colorBar.offsetTop - 8}px`;
            mark.ondblclick = function() {
                const local = (mark.offsetTop - colorBar.offsetTop + mark.offsetHeight / 2) / 200;
                const gradient_new = ctxEject.createLinearGradient(0, 0, cvsEject.width, cvsEject.height);
                oBox.style.top = mark.offsetTop + mark.offsetHeight/2 - oBox.offsetHeight/2 +  'px';

                selected_Y = mark.offsetTop - colorBar.offsetTop + 8;

                curr.colorStops = curr.colorStops.filter(function(item) {
                    return item.position !== local;
                })
                for (let stop of curr.colorStops) {
                    gradient_new.addColorStop(stop.position, stop.color);
                }
                ctxEject.fillStyle = gradient_new;
                ctxEject.fillRect(0, 0, cvsWidth, cvsHeight);

                ctxFix.fillStyle = gradient_new;
                ctxFix.fillRect(0, 0, cvsWidth, cvsHeight);


                // getColors(context);
                curr.colorArray = getColors(ctxEject);
                reRenderData();
                cursorArea.removeChild(mark);
            }
            cursorArea.appendChild(mark);
        }
     }
}

// 初始化total
function initDraw(degrees) {
    showMark();
    drawColorBar(curr.colorStops);
    drawDegree(degrees);
    drawEjectColorBar(curr.colorStops);
    drawEjectDegree(degrees);
}

// tips
$("#bottomArrow").hover(function() {
    showTip(this);
},function(){
    showTip();
});
function showTip(_this) {
    const tip=$("#tip");
    if (!_this) {
        tip.fadeOut()
    } else {
        tip.show();
    }
}
