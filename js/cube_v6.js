import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

THREE.ColorManagement.enabled = false;

// 检验当前浏览器是否满足webgl2.0标准
if (WebGL.isWebGL2Available() === false) {

    document.body.appendChild(WebGL.getWebGL2ErrorMessage());

}
0
let renderer, scene, camera, group;
let mesh, text;
let data, mode;
let initialCameraPosition;
let initialGroupPosition;
let initialGroupRotation;
// 经纬度深度范围
let latMax = 26;
let latMin = 2;
let lonMax = 123;
let lonMin = 99;
let depMax = 5678;
let depMin = 0;
// 要素参数
// let element = '3DT'
let element = '3DS'
let datetime = '20191016120000'
let dataProfile = [];
const xhr = new XMLHttpRequest();

// drawZhexian(dataProfile);

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


// 定义开始反演的动作函数
// function inversion(element, datetime) {
//     showPrompt("开始预报~");
//     fetch('/inversion', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ element: element, date: datetime })
//     }).then(response => {
//         showPrompt("反演完成！");
//     });
// }
// 异步操作版本
function inversion(element, datetime) {
    return new Promise((resolve, reject) => {
        showPrompt("开始预报");
        document.getElementById("loading").style.display = "block";
        fetch('/inversion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ element: element, date: datetime })
        }).then(response => {
            document.getElementById("loading").style.display = "none";
            showPrompt("预报完成，即将展示预报结果！");
            resolve(); // 异步操作成功时调用resolve
        }).catch(error => {
            reject(error); // 异步操作失败时调用reject
        });
    });
}

// 当用户点击“2D”按钮时，调用该方法，切换到二维平台
function switch2D(event) {
    //    showPrompt("切换到二维平台！");
    window.location.href = '/';

}

function repaint() {
    const a = 241;
    const b = 241;
    const c = 50;
    const shape = [c, b, a]; // 数组的形状
    xhr.open("GET", `./static_3D/data/Forcast${element}_0.json`);
    xhr.responseType = "json";
    xhr.onload = function () {
        const jsonArray = xhr.response;
        data = new Uint8Array(jsonArray);
        console.log(data);
        startDrawing(data, element);
        animate();
    };
    xhr.send();
}

init();

// 以下主要定义了三个函数 init、onWindowResize、animate

function init() {
    const SanWeiZhanShi = document.getElementById("SanWeiZhanShi");
    // 初始化控制器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(renderer.domElement);
    // 设置渲染器的纵横比
    renderer.setPixelRatio(window.devicePixelRatio);
    // 设置渲染器大小
    renderer.setSize(SanWeiZhanShi.clientWidth, SanWeiZhanShi.clientHeight);
    SanWeiZhanShi.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    group = new THREE.Object3D();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, -1.6, 0);

    // 鼠标可以拖动三维图形
    const controls = new OrbitControls(camera, renderer.domElement);

    // Sky
    // 创建一个球体天空盒，将其添加到场景中，并设置成背面渲染
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 32;

    const context = canvas.getContext('2d');
    // 设置背景的颜色梯度
    const gradient = context.createLinearGradient(0, 0, 0, 32);
    gradient.addColorStop(0.0, 'rgb(164, 205, 255)');
    // gradient.addColorStop(0.5, '#3581c0');
    gradient.addColorStop(1.0, 'rgb(164, 205, 255)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1, 32);

    const sky = new THREE.Mesh(
        new THREE.SphereGeometry(10),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), side: THREE.BackSide })
    );
    scene.add(sky);

    xhr.open("GET", `./static_3D/data/Forcast${element}_0.json`);
    xhr.responseType = "json";
    xhr.onload = function () {
        const jsonArray = xhr.response;
        data = new Uint8Array(jsonArray);
        console.log(data);
        startDrawing(data, element);
        animate();
    };
    xhr.send();




    // 切换为2D系统
    const to2D = document.getElementById("to2D");
    clickDark(to2D);

    to2D.addEventListener('click', function () {
        switch2D();
    })

    // 切换为2D系统
    const btn_inversion = document.getElementById("inversion");
    clickDark(btn_inversion);

    btn_inversion.addEventListener('click', async () => {
        // showPrompt(element + ' ' + datetime);
        btn_inversion.style.pointerEvents = 'none';
        btn_inversion.classList.add("dark");
        await inversion(element, datetime);
        repaint();
        btn_inversion.style.pointerEvents = 'auto';
        btn_inversion.classList.remove("dark");
    })




    // 设置方位盘的21个部件的函数（很长）
    // left1
    const canvas_left1 = document.getElementById("left1");
    clickDark(canvas_left1);
    canvas_left1.width = 30;
    canvas_left1.height = 60;
    const ctx_left1 = canvas_left1.getContext("2d");
    ctx_left1.canvas.willReadFrequently = true;
    const texture_left1 = new Image();
    texture_left1.src = "./static_3D/imgs/left1.png";
    texture_left1.onload = function () {
        ctx_left1.drawImage(texture_left1, 0, 0, 30, 60);
        canvas_left1.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_left1.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.z += -Math.PI / 180;
            }
        });
    };

    // left2
    const canvas_left2 = document.getElementById("left2");
    clickDark(canvas_left2);
    canvas_left2.width = 30;
    canvas_left2.height = 60;
    const ctx_left2 = canvas_left2.getContext("2d");
    ctx_left2.canvas.willReadFrequently = true;
    const texture_left2 = new Image();
    texture_left2.src = "./static_3D/imgs/left2.png";
    texture_left2.onload = function () {
        ctx_left2.drawImage(texture_left2, 0, 0, 30, 60);
        canvas_left2.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_left2.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.z += -Math.PI / 18;
            }
        });
    };

    // left3
    const canvas_left3 = document.getElementById("left3");
    clickDark(canvas_left3);
    canvas_left3.width = 30;
    canvas_left3.height = 60;
    const ctx_left3 = canvas_left3.getContext("2d");
    ctx_left3.canvas.willReadFrequently = true;
    const texture_left3 = new Image();
    texture_left3.src = "./static_3D/imgs/left3.png";
    texture_left3.onload = function () {
        ctx_left3.drawImage(texture_left3, 0, 0, 30, 60);
        canvas_left3.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_left3.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.z += -Math.PI / 2;
            }
        });
    };

    // right1
    const canvas_right1 = document.getElementById("right1");
    clickDark(canvas_right1);
    canvas_right1.width = 30;
    canvas_right1.height = 60;
    const ctx_right1 = canvas_right1.getContext("2d");
    ctx_right1.canvas.willReadFrequently = true;
    const texture_right1 = new Image();
    texture_right1.src = "./static_3D/imgs/right1.png";
    texture_right1.onload = function () {
        ctx_right1.drawImage(texture_right1, 0, 0, 30, 60);
        canvas_right1.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_right1.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.z += Math.PI / 180;
            }
        });
    };

    // right2
    const canvas_right2 = document.getElementById("right2");
    clickDark(canvas_right2);
    canvas_right2.width = 30;
    canvas_right2.height = 60;
    const ctx_right2 = canvas_right2.getContext("2d");
    ctx_right2.canvas.willReadFrequently = true;
    const texture_right2 = new Image();
    texture_right2.src = "./static_3D/imgs/right2.png";
    texture_right2.onload = function () {
        ctx_right2.drawImage(texture_right2, 0, 0, 30, 60);
        canvas_right2.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_right2.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.z += Math.PI / 18;
            }
        });
    };

    // right3
    const canvas_right3 = document.getElementById("right3");
    clickDark(canvas_right3);
    canvas_right3.width = 30;
    canvas_right3.height = 60;
    const ctx_right3 = canvas_right3.getContext("2d");
    ctx_right3.canvas.willReadFrequently = true;
    const texture_right3 = new Image();
    texture_right3.src = "./static_3D/imgs/right3.png";
    texture_right3.onload = function () {
        ctx_right3.drawImage(texture_right3, 0, 0, 30, 60);
        canvas_right3.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_right3.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.z += Math.PI / 2;
            }
        });
    };

    // up1
    const canvas_up1 = document.getElementById("up1");
    clickDark(canvas_up1);
    canvas_up1.width = 60;
    canvas_up1.height = 30;
    const ctx_up1 = canvas_up1.getContext("2d");
    ctx_up1.canvas.willReadFrequently = true;
    const texture_up1 = new Image();
    texture_up1.src = "./static_3D/imgs/up1.png";
    texture_up1.onload = function () {
        ctx_up1.drawImage(texture_up1, 0, 0, 60, 30);
        canvas_up1.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_up1.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.x += -Math.PI / 180;
            }
        });
    };

    // up2
    const canvas_up2 = document.getElementById("up2");
    clickDark(canvas_up2);
    canvas_up2.width = 60;
    canvas_up2.height = 30;
    const ctx_up2 = canvas_up2.getContext("2d");
    ctx_up2.canvas.willReadFrequently = true;
    const texture_up2 = new Image();
    texture_up2.src = "./static_3D/imgs/up2.png";
    texture_up2.onload = function () {
        ctx_up2.drawImage(texture_up2, 0, 0, 60, 30);
        canvas_up2.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_up2.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.x += -Math.PI / 18;
            }
        });
    };

    // up3
    const canvas_up3 = document.getElementById("up3");
    clickDark(canvas_up3);
    canvas_up3.width = 60;
    canvas_up3.height = 30;
    const ctx_up3 = canvas_up3.getContext("2d");
    ctx_up3.canvas.willReadFrequently = true;
    const texture_up3 = new Image();
    texture_up3.src = "./static_3D/imgs/up3.png";
    texture_up3.onload = function () {
        ctx_up3.drawImage(texture_up3, 0, 0, 60, 30);
        canvas_up3.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_up3.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.x += -Math.PI / 2;
            }
        });
    };

    // down1
    const canvas_down1 = document.getElementById("down1");
    clickDark(canvas_down1);
    canvas_down1.width = 60;
    canvas_down1.height = 30;
    const ctx_down1 = canvas_down1.getContext("2d");
    ctx_down1.canvas.willReadFrequently = true;
    const texture_down1 = new Image();
    texture_down1.src = "./static_3D/imgs/down1.png";
    texture_down1.onload = function () {
        ctx_down1.drawImage(texture_down1, 0, 0, 60, 30);
        canvas_down1.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_down1.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.x += Math.PI / 180;
            }
        });
    };

    // down2
    const canvas_down2 = document.getElementById("down2");
    clickDark(canvas_down2);
    canvas_down2.width = 60;
    canvas_down2.height = 30;
    const ctx_down2 = canvas_down2.getContext("2d");
    ctx_down2.canvas.willReadFrequently = true;
    const texture_down2 = new Image();
    texture_down2.src = "./static_3D/imgs/down2.png";
    texture_down2.onload = function () {
        ctx_down2.drawImage(texture_down2, 0, 0, 60, 30);
        canvas_down2.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_down2.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.x += Math.PI / 18;
            }
        });
    };

    // down3
    const canvas_down3 = document.getElementById("down3");
    clickDark(canvas_down3);
    canvas_down3.width = 60;
    canvas_down3.height = 30;
    const ctx_down3 = canvas_down3.getContext("2d");
    ctx_down3.canvas.willReadFrequently = true;
    const texture_down3 = new Image();
    texture_down3.src = "./static_3D/imgs/down3.png";
    texture_down3.onload = function () {
        ctx_down3.drawImage(texture_down3, 0, 0, 60, 30);
        canvas_down3.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_down3.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.x += Math.PI / 2;
            }
        });
    };

    // shun1
    const canvas_shun1 = document.getElementById("shun1");
    clickDark(canvas_shun1);
    canvas_shun1.width = 60;
    canvas_shun1.height = 20;
    const ctx_shun1 = canvas_shun1.getContext("2d");
    ctx_shun1.canvas.willReadFrequently = true;
    const texture_shun1 = new Image();
    texture_shun1.src = "./static_3D/imgs/shun1.png";
    texture_shun1.onload = function () {
        ctx_shun1.drawImage(texture_shun1, 0, 0, 60, 20);
        canvas_shun1.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_shun1.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.y += Math.PI / 180;
            }
        });
    };

    // shun2
    const canvas_shun2 = document.getElementById("shun2");
    clickDark(canvas_shun2);
    canvas_shun2.width = 40;
    canvas_shun2.height = 20;
    const ctx_shun2 = canvas_shun2.getContext("2d");
    ctx_shun2.canvas.willReadFrequently = true;
    const texture_shun2 = new Image();
    texture_shun2.src = "./static_3D/imgs/shun2.png";
    texture_shun2.onload = function () {
        ctx_shun2.drawImage(texture_shun2, 0, 0, 40, 20);
        canvas_shun2.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_shun2.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.y += Math.PI / 18;
            }
        });
    };

    // shun3
    const canvas_shun3 = document.getElementById("shun3");
    clickDark(canvas_shun3);
    canvas_shun3.width = 20;
    canvas_shun3.height = 20;
    const ctx_shun3 = canvas_shun3.getContext("2d");
    ctx_shun3.canvas.willReadFrequently = true;
    const texture_shun3 = new Image();
    texture_shun3.src = "./static_3D/imgs/shun3.png";
    texture_shun3.onload = function () {
        ctx_shun3.drawImage(texture_shun3, 0, 0, 20, 20);
        canvas_shun3.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_shun3.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.y += Math.PI / 2;
            }
        });
    };

    // ni1
    const canvas_ni1 = document.getElementById("ni1");
    clickDark(canvas_ni1);
    canvas_ni1.width = 60;
    canvas_ni1.height = 20;
    const ctx_ni1 = canvas_ni1.getContext("2d");
    ctx_ni1.canvas.willReadFrequently = true;
    const texture_ni1 = new Image();
    texture_ni1.src = "./static_3D/imgs/ni1.png";
    texture_ni1.onload = function () {
        ctx_ni1.drawImage(texture_ni1, 0, 0, 60, 20);
        canvas_ni1.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_ni1.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.y += -Math.PI / 180;
            }
        });
    };

    // ni2
    const canvas_ni2 = document.getElementById("ni2");
    clickDark(canvas_ni2);
    canvas_ni2.width = 40;
    canvas_ni2.height = 20;
    const ctx_ni2 = canvas_ni2.getContext("2d");
    ctx_ni2.canvas.willReadFrequently = true;
    const texture_ni2 = new Image();
    texture_ni2.src = "./static_3D/imgs/ni2.png";
    texture_ni2.onload = function () {
        ctx_ni2.drawImage(texture_ni2, 0, 0, 40, 20);
        canvas_ni2.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_ni2.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.y += -Math.PI / 18;
            }
        });
    };

    // ni3
    const canvas_ni3 = document.getElementById("ni3");
    clickDark(canvas_ni3);
    canvas_ni3.width = 20;
    canvas_ni3.height = 20;
    const ctx_ni3 = canvas_ni3.getContext("2d");
    ctx_ni3.canvas.willReadFrequently = true;
    const texture_ni3 = new Image();
    texture_ni3.src = "./static_3D/imgs/ni3.png";
    texture_ni3.onload = function () {
        ctx_ni3.drawImage(texture_ni3, 0, 0, 20, 20);
        canvas_ni3.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            const pixel = ctx_ni3.getImageData(x, y, 1, 1).data;
            if (pixel[3] !== 0) {
                group.rotation.y += -Math.PI / 2;
            }
        });
    };

    // zuo
    const canvas_zuo = document.getElementById("zuo");
    clickDark(canvas_zuo);
    canvas_zuo.width = 50;
    canvas_zuo.height = 50;
    const ctx_zuo = canvas_zuo.getContext("2d");
    ctx_zuo.canvas.willReadFrequently = true;
    const texture_zuo = new Image();
    texture_zuo.src = "./static_3D/imgs/zuo.png";
    texture_zuo.onload = function () {
        ctx_zuo.drawImage(texture_zuo, 0, 0, 50, 50);
        canvas_zuo.addEventListener("click", function (event) {
            camera.position.copy(initialCameraPosition);
            group.position.copy(initialGroupPosition);
            group.rotation.copy(initialGroupRotation);
            group.rotation.z = Math.PI / 2;
        });
    };

    // zheng
    const canvas_zheng = document.getElementById("zheng");
    clickDark(canvas_zheng);
    canvas_zheng.width = 50;
    canvas_zheng.height = 50;
    const ctx_zheng = canvas_zheng.getContext("2d");
    ctx_zheng.canvas.willReadFrequently = true;
    const texture_zheng = new Image();
    texture_zheng.src = "./static_3D/imgs/zheng.png";
    texture_zheng.onload = function () {
        ctx_zheng.drawImage(texture_zheng, 0, 0, 50, 50);
        canvas_zheng.addEventListener("click", function (event) {
            camera.position.copy(initialCameraPosition);
            group.position.copy(initialGroupPosition);
            group.rotation.copy(initialGroupRotation);
        });
    };

    // shang
    const canvas_shang = document.getElementById("shang");
    clickDark(canvas_shang);
    canvas_shang.width = 50;
    canvas_shang.height = 50;
    const ctx_shang = canvas_shang.getContext("2d");
    ctx_shang.canvas.willReadFrequently = true;
    const texture_shang = new Image();
    texture_shang.src = "./static_3D/imgs/shang.png";
    texture_shang.onload = function () {
        ctx_shang.drawImage(texture_shang, 0, 0, 50, 50);
        canvas_shang.addEventListener("click", function (event) {
            camera.position.copy(initialCameraPosition);
            group.position.copy(initialGroupPosition);
            group.rotation.copy(initialGroupRotation);
            group.rotation.x = Math.PI / 2;
        });
    };

}

// 读取shader代码
function loadShader(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    if (xhr.status === 200) {
        return xhr.responseText;
    } else {
        throw new Error('Failed to load shader: ' + url);
    }
}

// 按钮点击变暗操作
function clickDark(widget) {
    widget.addEventListener("mousedown", function () {
        widget.classList.add("dark"); // 当鼠标按下时，为图片添加.dark类名
    });

    widget.addEventListener("mouseup", function () {
        widget.classList.remove("dark"); // 当鼠标松开时，移除.dark类名
    });
}

// 定义要素切换时更改反演参数
const wendu_radio = document.getElementById("wendu-radio");
wendu_radio.addEventListener("change", () => {
    if (wendu_radio.checked) {
        element = '3DT';
        repaint();
    }
})

const yandu_radio = document.getElementById("yandu-radio");
yandu_radio.addEventListener("change", () => {
    if (yandu_radio.checked) {
        element = '3DS';
        repaint();
    }
})

// 设置时间选择相关功能
$(function () {
    // 将日历绑定到文本框
    $("#day-choose #day-date").datepicker({
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
        onSelect: function (dateText) {
            // 将选择的日期文本转换为 Date 对象
            var selectedDate = new Date(dateText);
            datetime = formatDate("yyyyMMdd120000", selectedDate);
            // // 获取年、月、日信息
            // var year = selectedDate.getFullYear();
            // var month = selectedDate.getMonth() + 1; // 注意要加 1，因为 getMonth 返回的是 0 到 11
            // var day = selectedDate.getDate();
            // console.log(`用户选择的日期：${year}/${month}/${day} 00:00`);
            // selectedDate = new Date(`${year}/${month}/${day} 00:00`);
        }
    });

    // 显示日历对话框
    $("#day-choose #day-calendar").click(function () {
        $("#day-choose #day-date").datepicker("show");
    });
});

function formatDate(fmt, date) {
    var currentDate = date != null ? date : new Date();
    var o = {
        "M+": currentDate.getMonth() + 1, //月份
        "d+": currentDate.getDate(), //日
        "h+": currentDate.getHours(), //小时
        "m+": currentDate.getMinutes(), //分
        "s+": currentDate.getSeconds(), //秒
        "q+": Math.floor((currentDate.getMonth() + 3) / 3), //季度
        "S+": currentDate.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(
            RegExp.$1,
            (currentDate.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
            );
    return fmt;
}


// 绘制中央立方体图形
function startDrawing(data, mode) {
    let a, b, c;
    a = 241;
    b = 241;
    c = 50;

    const shape = [c, b, a]; // 数组的形状
    // 尝试绘制字体**********************************************************************************
    const loader = new FontLoader();
    function makeText(mytext, x, y, z) {
        loader.load('static_3D/font/helvetiker_regular.typeface.json', function (font) {
            const color = 0x006699;

            const matLite = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });

            const message = mytext;

            const shapes = font.generateShapes(message, 0.05);

            const geometry = new THREE.ShapeGeometry(shapes);

            geometry.computeBoundingBox();

            const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

            geometry.translate(xMid, 0, 0);

            const text = new THREE.Mesh(geometry, matLite);

            text.position.x = x;
            text.position.y = y;
            text.position.z = z;
            group.add(text);
        });
    }
    makeText('Lat', -0.7, -0.0, 0.5);
    makeText('Lon', -0.0, -0.7, 0.5);
    makeText('Dep', -0.7, -0.7, 0);
    for (let index = 0; index <= 5; index++) {
        makeText(`${latMin + index * (latMax - latMin) / 5}`, -0.6, -0.5 + index * 0.2, 0.5);
        makeText(`${lonMin + index * (lonMax - lonMin) / 5}`, -0.5 + index * 0.2, -0.6, 0.5);
        makeText(`${depMin + index * (depMax - depMin) / 5}`, -0.6, -0.6, 0.5 - index * 0.2);
    }
    // *********************************************************************************************

    var winWidth = window.innerWidth;
    var winHeight = window.innerHeight;
    //求取数据的最大值和最小值
    let data_maxValue = -Infinity;
    let data_minValue = Infinity;
    // 创建一个切片专用的颜色映射列表[(值, rgb值)]
    const colorArray_Slice = [];

    for (let i = 1; i < data.length; i++) {
        if (data[i] > data_maxValue) {
            data_maxValue = data[i];
        }

        if (data[i] < data_minValue && data[i] != 0) {
            data_minValue = data[i];
        }
    }

    console.log('最大值:', data_maxValue);
    console.log('最小值:', data_minValue);
    const reloadCurve = document.getElementById('reloadCurve');
    clickDark(reloadCurve);
    reloadCurve.addEventListener('click', () => {
        const newOnes = Array.from({ length: 256 }, (_, i) => 1.0);
        getOpacityTexture(newOnes);
        opacity_texture.needsUpdate = true;

        d3.select("#chart")
            .selectAll(".line")
            .remove();

        drawHistogram();

    });


    // 使用对象数组存储浮点数和颜色信息
    const stops_3DT = [
        { position: 0.00, color: '#0000FF' },
        { position: 0.89, color: '#FFFF00' },
        { position: 0.92, color: '#FFC000' },
        { position: 0.95, color: '#FF8100' },
        { position: 0.98, color: '#FF4200' },
        { position: 1.00, color: '#FF0000' }
    ];
    // 三维盐度初始colorbar
    const stops_3DS = [
        { position: 0.00, color: '#0000FF' },
        { position: 0.28, color: '#66E0FF' },
        { position: 0.50, color: '#80FF5E' },
        { position: 0.73, color: '#FFFF33' },
        { position: 0.93, color: '#FF3200' },
        { position: 1.00, color: '#FF0000' }
    ];
    let stops = mode == '3DS' ? stops_3DS : stops_3DT;

    // 声明选中的颜色及其位置
    let selected_color_3D;
    let selected_X;
    let newcolor;
    let newstop;
    // Texture
    const texture = new THREE.Data3DTexture(data, a, b, c);
    texture.format = THREE.RedFormat;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.unpackAlignment = 1;
    texture.needsUpdate = true;

    // 创建颜色映射表
    const YanSeKongZhi = document.getElementById("YanSeKongZhi")
    const mycanvas = document.createElement('canvas');
    const mycontext = mycanvas.getContext('2d');
    mycanvas.id = "myCanvas";
    document.body.appendChild(mycanvas);

    // 设置画布大小
    mycanvas.width = winWidth * 0.32;
    mycanvas.height = 20;
    // 创建渐变对象并填充矩形
    const mygradient = mycontext.createLinearGradient(0, 0, mycanvas.width, mycanvas.height);
    for (let stop of stops) {
        mygradient.addColorStop(stop.position, stop.color);
    }

    mycontext.fillStyle = mygradient;
    mycontext.fillRect(0, 0, mycanvas.width, mycanvas.height);
    // 将原颜色条缩放到长为255的canvas
    const destinationCanvas = document.createElement('canvas');
    const destinationCtx = destinationCanvas.getContext('2d');
    destinationCanvas.width = 256;
    destinationCanvas.height = 10;
    destinationCtx.drawImage(mycanvas, 0, 0, destinationCanvas.width, destinationCanvas.height);
    for (let index = 0; index < 256; index++) {
        const dataValue = index * (data_maxValue - data_minValue) / 255 + data_minValue;
        const colorValue = destinationCtx.getImageData(index, 0, 1, 1).data;
        colorArray_Slice.push([dataValue, colorValue]);
    }

    const colorPicker = document.createElement('input'); // 创建<input>元素
    colorPicker.type = 'color'; // 设置type属性为"color"

    colorPicker.addEventListener('change', function (event) {
        const hexColor = event.target.value; // 获取所选颜色的值（十六进制格式）
        selected_color_3D = hexColor;

        // 创建一个新的CanvasGradient对象，添加三个colorstop，并替换画布中的渐变色
        const mygradient = mycontext.createLinearGradient(0, 0, mycanvas.width, mycanvas.height);

        newstop = { position: selected_X / (mycanvas.width), color: selected_color_3D };
        stops.push(newstop);
        for (let stop of stops) {
            mygradient.addColorStop(stop.position, stop.color);
        }
        mycontext.fillStyle = mygradient;
        mycontext.fillRect(0, 0, mycanvas.width, mycanvas.height);
        // 将原颜色条缩放到长为255的canvas
        const destinationCanvas = document.createElement('canvas');
        const destinationCtx = destinationCanvas.getContext('2d');
        destinationCanvas.width = 256;
        destinationCanvas.height = 10;
        colorArray_Slice.length = 0;
        destinationCtx.drawImage(mycanvas, 0, 0, destinationCanvas.width, destinationCanvas.height);
        for (let index = 0; index < 256; index++) {
            const dataValue = index * (data_maxValue - data_minValue) / 255 + data_minValue;
            const colorValue = destinationCtx.getImageData(index, 0, 1, 1).data;
            colorArray_Slice.push([dataValue, colorValue]);
        }

        console.log(colorArray_Slice);
        texture_canvas.needsUpdate = true;
        sliceByDep(shape[0]);
    });

    mycanvas.addEventListener('click', function (event) {
        selected_X = event.clientX - mycanvas.offsetLeft; // 计算X坐标
        newcolor = colorPicker.click(); // 触发颜色选择器的点击事件
    });

    // 将 Canvas 转换为纹理
    const texture_canvas = new THREE.CanvasTexture(mycanvas);

    // Material
    const vertexShader = loadShader('./static_3D/glsl/vertexShader.glsl');
    let fragmentShader;
    if (mode == '3DS') {
        fragmentShader = loadShader('./static_3D/glsl/fragmentShader_3DS.glsl');
    } else {
        fragmentShader = loadShader('./static_3D/glsl/fragmentShader_3DT.glsl');
    }

    // 创建不透明度调节控件
    drawHistogram();
    // drawZhexian(dataProfile);
    // 将opacity_map的不透明度256长度数组转换为opacity_texture
    const opacity_canvas = document.getElementById("OpacityCanvas");
    const ctx = opacity_canvas.getContext('2d');
    const width_Opa = 256;
    const height_Opa = 1;

    opacity_canvas.width = width_Opa;
    opacity_canvas.height = height_Opa;

    const opacity_texture = new THREE.CanvasTexture(opacity_canvas);

    let opacity_map = Array.from({ length: 256 }, (_, i) => 1.0);
    getOpacityTexture(opacity_map);

    function getOpacityTexture(opacity_map) {
        const imageData = ctx.createImageData(width_Opa, height_Opa);
        const buffer = imageData.data.buffer;
        const pixels = new Uint8ClampedArray(buffer);
        for (let i = 0; i < opacity_map.length; i++) {
            pixels[i * 4] = opacity_map[i] * 255;     // red channel
            pixels[i * 4 + 1] = opacity_map[i]; // green channel
            pixels[i * 4 + 2] = opacity_map[i]; // blue channel
            pixels[i * 4 + 3] = 255;     // alpha channel
        }
        ctx.putImageData(imageData, 0, 0);
    }

    //设置保存配色方案
    const btn_savePlan = document.getElementById("savePlan");
    btn_savePlan.addEventListener('click', async function () {
        event.preventDefault(); // 阻止默认的表单提交行为
        // 将原颜色条缩放到长为255的canvas
        // const destinationCanvas = document.createElement('canvas');
        // const destinationCtx = destinationCanvas.getContext('2d');
        // destinationCanvas.width = 256;
        // destinationCanvas.height = 10;
        // destinationCtx.drawImage(mycanvas, 0, 0, destinationCanvas.width, destinationCanvas.height);

        // const colorLists = [];
        // for (let x = 0; x < destinationCanvas.width; x++) {

        //     const pixelData = destinationCtx.getImageData(x, 0, 1, 1).data;

        //     const singleColor = [x, pixelData];
        //     colorLists.push(singleColor);
        // }
        const jsonData = { "opacity": opacity_map, "stops": stops, "colorList": colorArray_Slice };
        try {
            const options = {
                suggestedName: 'plan.json',
                types: [
                    {
                        description: 'JSON Files',
                        accept: {
                            'application/json': ['.json'],
                        },
                    },
                ],
            };
            const handle = await window.showSaveFilePicker(options);
            const writableStream = await handle.createWritable();
            const json = JSON.stringify(jsonData);
            await writableStream.write(json);
            await writableStream.close();
        } catch { showPrompt('保存文件时出错' ); }
    })
    //设置加载配色方案
    const btn_loadPlan = document.getElementById("loadPlan");
    btn_loadPlan.addEventListener('click', async function () {
        // 创建一个隐藏的文件输入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        // 当文件选择完成时触发事件
        fileInput.addEventListener('change', function (event) {
            const selectedFile = event.target.files[0];
            const reader = new FileReader();
            // 当文件读取完成时触发事件
            reader.onload = function (fileEvent) {
                const content = fileEvent.target.result;
                // try {
                const jsonData = JSON.parse(content);
                // 加载颜色信息
                const mygradient = mycontext.createLinearGradient(0, 0, mycanvas.width, mycanvas.height);
                for (let stop of jsonData.stops) { mygradient.addColorStop(stop.position, stop.color); }
                mycontext.fillStyle = mygradient;
                mycontext.fillRect(0, 0, mycanvas.width, mycanvas.height);
                // 重新创建切片配色方案
                // 将原颜色条缩放到长为255的canvas
                const destinationCanvas = document.createElement('canvas');
                const destinationCtx = destinationCanvas.getContext('2d');
                destinationCanvas.width = 256;
                destinationCanvas.height = 10;
                colorArray_Slice.length = 0;
                destinationCtx.drawImage(mycanvas, 0, 0, destinationCanvas.width, destinationCanvas.height);
                for (let index = 0; index < 256; index++) {
                    const dataValue = index * (data_maxValue - data_minValue) / 255 + data_minValue;
                    const colorValue = destinationCtx.getImageData(index, 0, 1, 1).data;
                    colorArray_Slice.push([dataValue, colorValue]);
                }
                texture_canvas.needsUpdate = true;

                // 加载不透明度信息
                getOpacityTexture(jsonData.opacity);
                opacity_texture.needsUpdate = true;
                // 重新绘制切片
                sliceByDep(shape[0]);
            };
            // 开始读取文件
            reader.readAsText(selectedFile);
        });

        // 模拟点击打开文件对话框
        fileInput.click();
    })

    group.clear();

    // 创建了一个立方体几何体（BoxGeometry）和一个原始着色器材质（RawShaderMaterial）
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
            base: { value: new THREE.Color(0x00ff00) },
            map: { value: texture },
            lutMap: { value: texture_canvas }, // 将颜色映射表作为uniform传递到着色器程序
            opacityMap: { value: opacity_texture }, // 不透明度控件的结果
            cameraPos: { value: new THREE.Vector3() },
            threshold: { value: mode == '3DS' ? 0.10 : 0.20 },
            opacity: { value: 1.00 },
            range: { value: 0.0 },
            steps: { value: 100 },
            frame: { value: 0 }
        },
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        transparent: true
    });

    mesh = new THREE.Mesh(geometry, material);
    // mesh.scale.set(1.4,1,1);
    group.add(mesh);

    // 记录camera和mesh的初始状态
    initialCameraPosition = camera.position.clone();
    initialGroupPosition = group.position.clone();
    initialGroupRotation = group.rotation.clone();

    const parameters = {
        threshold: mode == '3DS' ? 0.10 : 0.20,
        opacity: 1.00,
        range: 0.0,
        steps: 100
    };

    function update() {

        material.uniforms.threshold.value = parameters.threshold;
        material.uniforms.opacity.value = parameters.opacity;
        material.uniforms.range.value = parameters.range;
        material.uniforms.steps.value = parameters.steps;

    }
    const thresholdSlider = document.getElementById("threshold-Slider");
    const thresholdInput = thresholdSlider.querySelector('input');
    const thresholdBar = thresholdSlider.querySelector('.bar');
    const thresholdText = document.getElementById("threshold-Text");
    const thresholdPlus = document.getElementById("threshold-plus");
    const thresholdSub = document.getElementById("threshold-sub");
    clickDark(thresholdPlus);
    clickDark(thresholdSub);
    var thresholdValue = parameters.threshold;
    thresholdBar.style.width = thresholdValue * 100 + '%';
    thresholdText.textContent = parseFloat(thresholdValue).toFixed(2);

    thresholdPlus.addEventListener('click', function () {
        if (thresholdValue < 1) {
            thresholdValue += 0.01;
            thresholdBar.style.width = thresholdValue * 100 + '%';
            thresholdText.textContent = parseFloat(thresholdValue).toFixed(2);
            parameters.threshold = thresholdValue;
            update();
        }
    })

    thresholdSub.addEventListener('click', function () {
        if (thresholdValue > 0) {
            thresholdValue -= 0.01;
            if (thresholdValue < 0) {
                thresholdValue = 0;
            }
            thresholdBar.style.width = thresholdValue * 100 + '%';
            thresholdText.textContent = parseFloat(thresholdValue).toFixed(2);
            parameters.threshold = thresholdValue;
            update();
        }
    })

    thresholdInput.addEventListener('input', function () {
        thresholdValue = (this.value - this.min) / (this.max - this.min);
        thresholdBar.style.width = thresholdValue * 100 + '%';
    });

    thresholdInput.addEventListener('mouseup', function () {
        if (this.value === undefined) {
            return;
        }
        thresholdValue = (this.value - this.min) / (this.max - this.min);
        thresholdText.textContent = parseFloat(thresholdValue).toFixed(2);
        parameters.threshold = thresholdValue;
        update();
    });

    thresholdText.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            thresholdValue = thresholdText.textContent;
            event.target.blur(); // 调用文本编辑框的blur()方法使其失去焦点
            event.preventDefault();
            thresholdBar.style.width = thresholdValue * 100 + '%';
            thresholdText.textContent = thresholdValue;
            parameters.threshold = thresholdValue;
            update();
        }
    });

    const opacitySlider = document.getElementById("opacity-Slider");
    const opacityInput = opacitySlider.querySelector('input');
    const opacityBar = opacitySlider.querySelector('.bar');
    const opacityText = document.getElementById("opacity-Text");
    const opacityPlus = document.getElementById("opacity-plus");
    const opacitySub = document.getElementById("opacity-sub");
    clickDark(opacityPlus);
    clickDark(opacitySub);
    var opacityValue = parameters.opacity;
    opacityBar.style.width = opacityValue * 100 + '%';
    opacityText.textContent = parseFloat(opacityValue).toFixed(2);

    opacityPlus.addEventListener('click', function () {
        if (opacityValue < 1) {
            opacityValue += 0.01;
            opacityBar.style.width = opacityValue * 100 + '%';
            opacityText.textContent = parseFloat(opacityValue).toFixed(2);
            parameters.opacity = opacityValue;
            update();
        }
    })

    opacitySub.addEventListener('click', function () {
        if (opacityValue > 0) {
            opacityValue -= 0.01;
            if (opacityValue < 0) {
                opacityValue = 0;
            }
            opacityBar.style.width = opacityValue * 100 + '%';
            opacityText.textContent = parseFloat(opacityValue).toFixed(2);
            parameters.opacity = opacityValue;
            update();
        }
    })

    opacityInput.addEventListener('input', function () {
        opacityValue = (this.value - this.min) / (this.max - this.min);
        opacityBar.style.width = opacityValue * 100 + '%';
    });

    opacityInput.addEventListener('mouseup', function () {
        if (this.value === undefined) {
            return;
        }
        opacityValue = (this.value - this.min) / (this.max - this.min);
        opacityText.textContent = parseFloat(opacityValue).toFixed(2);
        parameters.opacity = opacityValue;
        update();
    });

    opacityText.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            opacityValue = opacityText.textContent;
            event.target.blur(); // 调用文本编辑框的blur()方法使其失去焦点
            event.preventDefault();
            opacityBar.style.width = opacityValue * 100 + '%';
            opacityText.textContent = parseFloat(opacityValue).toFixed(2);
            parameters.opacity = opacityValue;
            update();
        }
    });

    const resolutionSlider = document.getElementById("resolution-Slider");
    const resolutionInput = resolutionSlider.querySelector('input');
    const resolutionBar = resolutionSlider.querySelector('.bar');
    const resolutionText = document.getElementById("resolution-Text");
    const resolutionPlus = document.getElementById("resolution-plus");
    const resolutionSub = document.getElementById("resolution-sub");
    clickDark(resolutionPlus);
    clickDark(resolutionSub);
    var resolutionValue = parameters.steps;
    resolutionBar.style.width = resolutionValue * 0.5 + '%';
    resolutionText.textContent = Math.round(resolutionValue);

    resolutionPlus.addEventListener('click', function () {
        if (resolutionValue < 200) {
            resolutionValue = parseInt(resolutionValue);
            resolutionValue += 1;
            resolutionBar.style.width = resolutionValue * 0.5 + '%';
            resolutionText.textContent = Math.round(resolutionValue);
            parameters.steps = resolutionValue;
            update();
        }
    })

    resolutionSub.addEventListener('click', function () {
        if (resolutionValue > 0) {
            resolutionValue = parseInt(resolutionValue);
            resolutionValue -= 1;
            if (resolutionValue < 0) {
                resolutionValue = 0;
            }
            resolutionBar.style.width = resolutionValue * 0.5 + '%';
            resolutionText.textContent = Math.round(resolutionValue);
            parameters.steps = resolutionValue;
            update();
        }
    })

    resolutionInput.addEventListener('input', function () {
        resolutionValue = (this.value - this.min) / (this.max - this.min) * 200;
        resolutionBar.style.width = resolutionValue * 0.5 + '%';
    });

    resolutionInput.addEventListener('mouseup', function () {
        if (this.value === undefined) {
            return;
        }
        resolutionValue = (this.value - this.min) / (this.max - this.min) * 200;
        resolutionText.textContent = Math.round(resolutionValue);
        parameters.steps = resolutionValue;
        update();
    });

    resolutionText.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            resolutionValue = resolutionText.textContent;
            event.target.blur(); // 调用文本编辑框的blur()方法使其失去焦点
            event.preventDefault();
            resolutionBar.style.width = resolutionValue * 0.5 + '%';
            resolutionText.textContent = Math.round(resolutionValue);
            parameters.steps = resolutionValue;
            update();
        }
    });

    window.addEventListener('resize', onWindowResize);

    var axis = createAxisWithMarkers(10, 1);
    group.add(axis);
    scene.add(group);

    function drawHistogram() {
        // 获取id为"chart"的SVG元素
        var svgChart = document.getElementById("chart");

        // 选择id为"chart"的SVG元素下的所有具有"class"为"line"的子元素
        var lines = svgChart.getElementsByClassName("line");

        // 逐个删除子元素
        while (lines.length > 0) {
            lines[0].parentNode.removeChild(lines[0]);
        }

        var bars = svgChart.getElementsByClassName("bar");

        // 逐个删除子元素
        while (bars.length > 0) {
            bars[0].parentNode.removeChild(bars[0]);
        }

        var axisXs = svgChart.getElementsByClassName("axis-x");

        // 逐个删除子元素
        while (axisXs.length > 0) {
            axisXs[0].parentNode.removeChild(axisXs[0]);
        }

        var axisYs = svgChart.getElementsByClassName("axis-y");

        // 逐个删除子元素
        while (axisYs.length > 0) {
            axisYs[0].parentNode.removeChild(axisYs[0]);
        }
        // 去除data中的null值l
        let true_data = data.filter((value) => value !== 0);
        // 设定直方图参数
        const histogram = d3.histogram()
            .domain(d3.extent(true_data))
            .thresholds(20);

        // 进行分组（binning）操作
        const bins = histogram(true_data);

        // 设定 x 和 y 比例尺
        const xScale = d3.scaleLinear()
            .range([winWidth * 0.005, winWidth * 0.325])
            // .domain([Math.floor(d3.min(true_data) / 5) * 5, Math.floor(d3.max(true_data) / 5) * 5 + 5]);
            .domain(d3.extent(true_data));

        const yScale = d3.scaleLinear()
            .range([winHeight * 0.15, winHeight * 0.01])
            .domain([0, d3.max(bins, d => d.length)]);

        // 创建 SVG 容器并添加直方图柱状图
        const svg = d3.select("#chart")
            .attr("width", "100%")
            .attr("height", "100%");

        svg.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.x0) + 1)
            .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
            .attr("y", d => yScale(d.length))
            .attr("height", d => yScale(0) - yScale(d.length));

        // 添加 x 轴和 y 轴，并设定刻度、标签等属性
        let xAxis = d3.axisBottom(xScale).ticks(10);
        if (mode == '3DT') {
            xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d => d - 100);
        }
        const yAxis = d3.axisLeft(yScale).ticks(5);

        svg.append("g")
            .attr("class", "axis-x")
            .attr("transform", `translate(0, ${150})`)
            .style("font-size", "18px")  // 设置字体大小为12像素
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis-y")
            .attr("transform", `translate(${0}, 0)`)
            .call(yAxis);

        // 设置绘制图线
        let isDrawing = false;
        let lineData = [];
        let standArr;
        let line = null;

        svg.on("mousedown", function () {
            // 开始绘制曲线
            isDrawing = true;
            lineData.push(d3.pointer(event, this));
            line = svg.append("path")
                .datum(lineData)
                .attr("class", "line")
                .attr("d", d => d3.line()(d));
        });

        svg.on("mousemove", function () {
            if (isDrawing) {
                // 更新曲线路径
                lineData.push(d3.pointer(event, this));
                line.attr("d", d => d3.line()(d));
            }
        });

        svg.on("mouseup", function () {
            if (isDrawing) {
                // 完成曲线绘制，输出坐标值
                isDrawing = false;
                let standArr = standardizeArr(lineData);
                opacity_map = standArr;
                getOpacityTexture(standArr);
                opacity_texture.needsUpdate = true;
                return standArr;
            }

        });
    }
    // const depList = [0, 10, 20, 30, 50, 70, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 925, 950, 975, 1000];
    const depList = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 121, 133, 146, 162, 182, 207, 238, 276, 323, 378, 441, 513, 592, 677, 767, 861, 958, 1056, 1155, 1255, 1356, 1461, 1572, 1695, 1834, 1993, 2174, 2378, 2604, 2854, 3126, 3422, 3740, 4082, 4446, 4834, 5244, 5678];



    // 切片功能相关代码
    const slice = [];  // 切片数组
    // 顺便声明一下剖面数组
    const slice_profile = [];
    console.log(colorArray_Slice);
    sliceByDep(shape[0]);

    // 实现切片选择器功能
    const latSlider = document.getElementById("latSlider");
    const latInput = latSlider.querySelector('input');
    const latBar = latSlider.querySelector('.bar');
    const latText = document.getElementById("latText");
    const latOption = document.getElementById("latRadio");
    const latPlus = document.getElementById("lat-plus");
    const latSub = document.getElementById("lat-sub");
    clickDark(latPlus);
    clickDark(latSub);
    latPlus.classList.add("dark");
    latSub.classList.add("dark");
    var latValue = (latMax + latMin) / 2;  // 纬度切片对应的实际值
    var latSlice = 0;  // 纬度切片对应的数据序号(后续初始化将其设置为中间值)
    var latIndex = latMax - latMin;
    var latAbled = false;
    latSlider.classList.add("dark");
    latText.classList.add("dark");
    $("#latMax").text(latMax + '°N');
    $("#latMin").text(latMin + '°N');

    const lonSlider = document.getElementById("lonSlider");
    const lonInput = lonSlider.querySelector('input');
    const lonBar = lonSlider.querySelector('.bar');
    const lonText = document.getElementById("lonText");
    const lonOption = document.getElementById("lonRadio");
    const lonPlus = document.getElementById("lon-plus");
    const lonSub = document.getElementById("lon-sub");
    clickDark(lonPlus);
    clickDark(lonSub);
    lonPlus.classList.add("dark");
    lonSub.classList.add("dark");
    var lonValue = (lonMax + lonMin) / 2;
    var lonSlice = 0;
    var lonIndex = lonMax - lonMin;
    var lonAbled = false;
    lonSlider.classList.add("dark");
    lonText.classList.add("dark");
    $("#lonMax").text(lonMax + '°E');
    $("#lonMin").text(lonMin + '°E');

    const depSlider = document.getElementById("depSlider");
    const depInput = depSlider.querySelector('input');
    const depBar = depSlider.querySelector('.bar');
    const depText = document.getElementById("depText");
    const depOption = document.getElementById("depRadio");
    const depPlus = document.getElementById("dep-plus");
    const depSub = document.getElementById("dep-sub");
    clickDark(depPlus);
    clickDark(depSub);
    var depValue = 0;
    var depSlice = 0;
    var depIndex = depMax - depMin;
    var depAbled = true;
    $("#depMax").text(depMax + 'm');
    $("#depMin").text(depMin + 'm');

    depBar.style.width = '0%';

    // 初始化各个维度对应的实际值
    const latList = [];
    const lonList = [];
    for (let index = 0; index < shape[1] - 1; index++) {
        latList.push((index / shape[1] * latIndex + latMin).toFixed(2));
    }
    latList.push(latMax.toFixed(2));
    for (let index = 0; index < shape[2] - 1; index++) {
        lonList.push((index / shape[2] * lonIndex + lonMin).toFixed(2));
    }
    lonList.push(lonMax.toFixed(2));

    for (let index = 0; index < latList.length; index++) {
        if (latList[index] >= latValue) { latValue = latList[index]; latSlice = index; break; }
    }
    for (let index = 0; index < lonList.length; index++) {
        if (lonList[index] >= lonValue) { lonValue = lonList[index]; lonSlice = index; break; }
    }

    latText.textContent = parseFloat(latValue).toFixed(1);
    lonText.textContent = parseFloat(lonValue).toFixed(1);
    depText.textContent = parseFloat(depValue).toFixed(0);

    // 增加微调按钮功能
    latPlus.addEventListener('click', function () {
        if (latSlice < shape[1] - 1 && latAbled) {
            latSlice += 1;
            latValue = latList[latSlice];
            latBar.style.width = (latValue - latMin) / latIndex * 100 + '%';
            latText.textContent = parseFloat(latValue).toFixed(1);
            sliceByLat(latSlice);
        }
    })
    latSub.addEventListener('click', function () {
        if (latSlice > 0 && latAbled) {
            latSlice -= 1;
            latValue = latList[latSlice];
            latBar.style.width = (latValue - latMin) / latIndex * 100 + '%';
            latText.textContent = parseFloat(latValue).toFixed(1);
            sliceByLat(latSlice);
        }
    })

    lonPlus.addEventListener('click', function () {
        if (lonSlice < shape[2] - 1 && lonAbled) {
            lonSlice += 1;
            lonValue = lonList[lonSlice];
            lonBar.style.width = (lonValue - lonMin) / lonIndex * 100 + '%';
            lonText.textContent = parseFloat(lonValue).toFixed(1);
            sliceByLon(lonSlice);
        }
    })
    lonSub.addEventListener('click', function () {
        if (lonSlice > 0 && lonAbled) {
            lonSlice -= 1;
            lonValue = lonList[lonSlice];
            lonBar.style.width = (lonValue - lonMin) / lonIndex * 100 + '%';
            lonText.textContent = parseFloat(lonValue).toFixed(1);
            sliceByLon(lonSlice);
        }
    })

    depPlus.addEventListener('click', function () {
        if (depSlice < shape[0] - 1 && depAbled) {
            depSlice += 1;
            depValue = depList[depSlice];
            depBar.style.width = (depValue - depMin) / depIndex * 100 + '%';
            depText.textContent = parseFloat(depValue).toFixed(0);
            sliceByDep(shape[0] - depSlice);
        }
    })
    depSub.addEventListener('click', function () {
        if (depSlice > 0 && depAbled) {
            depSlice -= 1;
            depValue = depList[depSlice];
            depBar.style.width = (depValue - depMin) / depIndex * 100 + '%';
            depText.textContent = parseFloat(depValue).toFixed(0);
            sliceByDep(shape[0] - depSlice);
        }
    })


    // 绑定单选框
    latOption.addEventListener('change', () => {
        if (latOption.checked) {
            latPlus.style.pointerEvents = "auto";
            latPlus.classList.remove("dark");
            lonPlus.style.pointerEvents = "none";
            lonPlus.classList.add("dark");
            depPlus.style.pointerEvents = "none";
            depPlus.classList.add("dark");
            latSub.style.pointerEvents = "auto";
            latSub.classList.remove("dark");
            lonSub.style.pointerEvents = "none";
            lonSub.classList.add("dark");
            depSub.style.pointerEvents = "none";
            depSub.classList.add("dark");
            latText.contentEditable = true;
            latAbled = true;
            lonText.contentEditable = false;
            lonAbled = false;
            depText.contentEditable = false;
            depAbled = false;
            latSlider.classList.remove("dark");
            latText.classList.remove("dark");
            lonSlider.classList.add("dark");
            lonText.classList.add("dark");
            depSlider.classList.add("dark");
            depText.classList.add("dark");
            sliceByLat(latSlice);
        }
    });

    lonOption.addEventListener('change', () => {
        if (lonOption.checked) {
            latPlus.style.pointerEvents = "none";
            latPlus.classList.add("dark");
            lonPlus.style.pointerEvents = "auto";
            lonPlus.classList.remove("dark");
            depPlus.style.pointerEvents = "none";
            depPlus.classList.add("dark");
            latSub.style.pointerEvents = "none";
            latSub.classList.add("dark");
            lonSub.style.pointerEvents = "auto";
            lonSub.classList.remove("dark");
            depSub.style.pointerEvents = "none";
            depSub.classList.add("dark");
            latText.contentEditable = false;
            latAbled = false;
            lonText.contentEditable = true;
            lonAbled = true;
            depText.contentEditable = false;
            depAbled = false;
            latSlider.classList.add("dark");
            latText.classList.add("dark");
            lonSlider.classList.remove("dark");
            lonText.classList.remove("dark");
            depSlider.classList.add("dark");
            depText.classList.add("dark");
            sliceByLon(lonSlice);
        }
    });

    depOption.addEventListener('change', () => {
        if (depOption.checked) {
            latPlus.style.pointerEvents = "none";
            latPlus.classList.add("dark");
            lonPlus.style.pointerEvents = "none";
            lonPlus.classList.add("dark");
            depPlus.style.pointerEvents = "auto";
            depPlus.classList.remove("dark");
            latSub.style.pointerEvents = "none";
            latSub.classList.add("dark");
            lonSub.style.pointerEvents = "none";
            lonSub.classList.add("dark");
            depSub.style.pointerEvents = "auto";
            depSub.classList.remove("dark");
            latText.contentEditable = false;
            latAbled = false;
            lonText.contentEditable = false;
            lonAbled = false;
            depText.contentEditable = true;
            depAbled = true;
            latSlider.classList.add("dark");
            latText.classList.add("dark");
            lonSlider.classList.add("dark");
            lonText.classList.add("dark");
            depSlider.classList.remove("dark");
            depText.classList.remove("dark");
            sliceByDep(shape[0] - depSlice);
        }
    });

    // 更新滑块位置和数值
    latInput.addEventListener('input', function () {
        if (latAbled) {
            const latValue_tmp = (this.value - this.min) / (this.max - this.min) * latIndex + latMin;
            for (let index = 0; index < latList.length; index++) {
                if (latList[index] >= latValue_tmp) { latValue = latList[index]; latSlice = index; break; }
            }
            console.log('latValue ' + latValue);
            latBar.style.width = (latValue - latMin) / latIndex * 100 + '%';
        }
    });

    latInput.addEventListener('mouseup', function () {
        if (this.value === undefined) { return; }
        if (latAbled) {
            latText.textContent = parseFloat(latValue).toFixed(1);
            sliceByLat(latSlice);
        }
    });

    lonInput.addEventListener('input', function () {
        if (lonAbled) {
            const lonValue_tmp = (this.value - this.min) / (this.max - this.min) * lonIndex + lonMin;
            for (let index = 0; index < lonList.length; index++) {
                if (lonList[index] >= lonValue_tmp) { lonValue = lonList[index]; lonSlice = index; break; }
            }
            lonBar.style.width = (lonValue - lonMin) / lonIndex * 100 + '%';
        }
    });

    lonInput.addEventListener('mouseup', function () {
        if (this.value === undefined) { return; }
        if (lonAbled) {
            lonText.textContent = parseFloat(lonValue).toFixed(1);
            sliceByLon(lonSlice);
        }
    });

    depInput.addEventListener('input', function () {
        if (depAbled) {
            const depValue_tmp = (this.value - this.min) / (this.max - this.min) * depIndex + depMin;
            for (let index = 0; index < depList.length; index++) {
                if (depList[index] >= depValue_tmp) { depValue = depList[index]; depSlice = index; break; }
            }
            console.log('depValue_tmp: ' + depValue_tmp + ', depValue: ' + depValue + ', depSlice: ' + depSlice);
            depBar.style.width = (depValue - depMin) / depIndex * 100 + '%';
        }
    });

    depInput.addEventListener('mouseup', function () {
        if (this.value === undefined) { return; }
        if (depAbled) {
            depText.textContent = parseFloat(depValue).toFixed(0);
            sliceByDep(shape[0] - depSlice);
        }
    });


    // 设置文本显示框动作
    latText.addEventListener('keydown', function (event) {
        if (event.keyCode === 13 && latAbled && latText.textContent >= latMin && latText.textContent <= latMax) {
            const latValue_tmp = parseFloat(latText.textContent);
            for (let index = 0; index < latList.length; index++) {
                if (latList[index] >= latValue_tmp) { latValue = latList[index]; latSlice = index; break; }
            }
            event.target.blur(); // 调用文本编辑框的blur()方法使其失去焦点
            event.preventDefault();
            latBar.style.width = (latValue - latMin) / latIndex * 100 + '%';
            latText.textContent = parseFloat(latValue).toFixed(1);
            sliceByLat(latSlice);
        }
    });

    lonText.addEventListener('keydown', function (event) {
        if (event.keyCode === 13 && lonAbled && lonText.textContent >= lonMin && lonText.textContent <= lonMax) {
            const lonValue_tmp = parseFloat(lonText.textContent);
            for (let index = 0; index < lonList.length; index++) {
                if (lonList[index] >= lonValue_tmp) { lonValue = lonList[index]; lonSlice = index; break; }
            }
            event.target.blur(); // 调用文本编辑框的blur()方法使其失去焦点
            event.preventDefault();
            lonBar.style.width = (lonValue - lonMin) / lonIndex * 100 + '%';
            lonText.textContent = parseFloat(lonValue).toFixed(1);
            sliceByLon(lonSlice);
        }
    });

    depText.addEventListener('keydown', function (event) {
        if (event.keyCode === 13 && depAbled && depText.textContent >= depMin && depText.textContent <= depMax) {
            const depValue_tmp = parseFloat(depText.textContent);
            for (let index = 0; index < depList.length; index++) {
                if (depList[index] >= depValue_tmp) { depValue = depList[index]; depSlice = index; break; }
            }
            event.target.blur(); // 调用文本编辑框的blur()方法使其失去焦点
            event.preventDefault();
            depBar.style.width = (depValue - depMin) / depIndex * 100 + '%';
            depText.textContent = parseFloat(depValue).toFixed(0);
            sliceByDep(shape[0] - depSlice);
        }
    });


    // 切片函数
    function sliceByLat(lat) {
        if (lat > shape[1] - 1) { lat = shape[1] - 1; }
        if (lat < 0) { lat = 0; }
        for (let j = 0; j < shape[0]; j++) {
            const start = (lat * shape[2]) + j * shape[1] * shape[2];
            const end = start + shape[2];
            const subArray = data.slice(start, end);
            slice.push(subArray);
        }
        drawSlice();
    }

    function sliceByLon(lon) {
        if (lon > shape[2] - 1) { lon = shape[2] - 1; }
        if (lon < 0) { lon = 0; }
        for (let j = 0; j < shape[0]; j++) {
            const subArray = [];
            for (let k = 0; k < shape[1]; k++) {
                const index = shape[1] * shape[2] * j + shape[2] * k + lon;
                subArray.push(data[index]);
            }
            slice.push(subArray);
        }
        drawSlice();
    }

    function sliceByDep(dep) {
        if (dep > shape[0] - 1) { dep = shape[0] - 1; }
        if (dep < 0) { dep = 0; }
        for (let j = 0; j < shape[1]; j++) {
            const start = (dep * shape[1] * shape[2]) + (j * shape[2]);
            const end = start + shape[2];
            const subArray = data.slice(start, end);
            slice.push(subArray);
        }
        drawSlice();
    }

    function drawSlice() {
        drawProfile(latSlice, lonSlice);
        // 创建Canvas元素
        var qiepian_canvas = document.getElementById('heatmap');
        var qiepian_context = qiepian_canvas.getContext('2d');
        var qiepian_width = slice.length;
        var qiepian_height = slice[0].length;
        qiepian_canvas.width = qiepian_width;
        qiepian_canvas.height = qiepian_height;

        qiepian_canvas.style.transform = 'rotate(-90deg)';

        var data_plot = [];
        for (var i = 0; i < slice.length; i++) {
            for (var j = 0; j < slice[0].length; j++) {
                data_plot.push([i, j, slice[i][j]]);
            }
        }

        qiepian_context.clearRect(0, 0, 200, 200);
        // 绘制热力图
        data_plot.forEach(function (d) {
            var x = d[0];
            var y = d[1];
            var value = d[2];

            var color = getSliceColor(value);
            qiepian_context.fillStyle = color;
            qiepian_context.fillRect(x, y, 1, 1);
        });

        // 清空数组(第一次不清空)
        // if (InitClear == true) { slice.length = 0; } else { InitClear = true; }
        slice.length = 0;

        // 插值颜色
        function getSliceColor(value) {
            if (value == 0) { return 'rgba(0,0,0,0)'; }
            for (let index = 0; index < colorArray_Slice.length; index++) {
                if (Math.round(value) == parseInt(colorArray_Slice[index][0])) { return `rgb(${colorArray_Slice[index][1]["0"]},${colorArray_Slice[index][1]["1"]},${colorArray_Slice[index][1]["2"]})`; }
            }
        }
    }

    function drawZhexian(dataProfile) {
        // 获取id为"chart"的SVG元素
        var svgZhexian = document.getElementById("zhexian");

        // 选择id为"chart"的SVG元素下的所有具有"class"为"line"的子元素
        var lines = svgZhexian.getElementsByClassName("myline");

        // 逐个删除子元素
        while (lines.length > 0) {
            lines[0].parentNode.removeChild(lines[0]);
        }

        var bars = svgZhexian.getElementsByClassName("bar");

        // 逐个删除子元素
        while (bars.length > 0) {
            bars[0].parentNode.removeChild(bars[0]);
        }

        var axises = svgZhexian.getElementsByClassName("axis");

        // 逐个删除子元素
        while (axises.length > 0) {
            axises[0].parentNode.removeChild(axises[0]);
        }

        // // 去除data中的null值l
        // let true_data = data.filter((value) => value !== 0);

        // *************************************************************

        var svg_zhexian = d3.select("#zhexian"),
            margin = { top: 50, right: 20, bottom: 30, left: 50 },
            width = +svg_zhexian.attr("width") - margin.left - margin.right,
            height = +svg_zhexian.attr("height") - margin.top - margin.bottom,
            g_zhexian = svg_zhexian.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            
        // X轴比例尺
        var x_zhexian = d3.scaleLinear()
            .rangeRound([0, width])
            .domain([d3.min(dataProfile, function (d) { return d.value; }), d3.max(dataProfile, function (d) { return d.value; })]);

        // Y轴比例尺
        var y_zhexian = d3.scaleLinear()
            .rangeRound([height, 0])
            .domain([5678, 0]);

        if (mode == '3DS') {
            // X轴
            g_zhexian.append("g")
                .attr("class", "axis")
                .call(d3.axisTop(x_zhexian).ticks(2))
                .append("text")
                .attr("fill", "#000")
                .attr("x", width)
                .attr("y", -30)
                .attr("dx", "0.71em")
                .attr("text-anchor", "end")
                .text("psu");
        } else {
            // X轴
            g_zhexian.append("g")
                .attr("class", "axis")
                .call(d3.axisTop(x_zhexian).ticks(2).tickFormat(d => d - 100))
                .append("text")
                .attr("fill", "#000")
                .attr("x", width)
                .attr("y", -30)
                .attr("dx", "0.71em")
                .attr("text-anchor", "end")
                .text("℃");
        }


        // Y轴
        g_zhexian.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y_zhexian))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end");

        // 折线路径
        var line_zhexian = d3.line()
            .x(function (d) { return x_zhexian(d.value); })
            .y(function (d) { return y_zhexian(d.depth); });

        // 绘制折线
        g_zhexian.append("path")
            .datum(dataProfile)
            .attr("class", "myline")
            .attr("d", line_zhexian);
        slice_profile.length = 0;
        dataProfile.length = 0;
    }


    // 温度/盐度随深度变化剖面数据的获取
    function drawProfile() {
        let data_f;
        xhr.open("GET", `./static_3D/data/Forcast${element}_0.json`);
        xhr.responseType = "json";
        xhr.onload = function () {
            const jsonArray = xhr.response;
            data_f = new Float32Array(jsonArray);
            for (let j = 0; j < shape[0]; j++) {
                const selectedValue = data_f[lonSlice + (latSlice * shape[2]) + j * shape[1] * shape[2]];
                slice_profile.push(selectedValue);
            }
            for (let index = 0; index < depList.length; index++) {
                dataProfile.push({depth: depList[index], value: slice_profile[shape[0] - index - 1]})
                
            }
            console.log(dataProfile);
            drawZhexian(dataProfile);
        };
        xhr.send();



    }
}


function createAxisWithMarkers(axisLength, markerFrequency) {
    var axis = new THREE.Object3D();
    var lineMaterial = new THREE.LineBasicMaterial({
        color: 0xfff,
        linewidth: 2, // 线宽度为2个单位
        linecap: "round" // 圆形线端点
    });

    // 创建坐标轴线
    var lineGeometry_x = new THREE.BufferGeometry();
    // 经度x轴线			
    lineGeometry_x.setAttribute('position', new THREE.Float32BufferAttribute([
        -0.5, -0.5, 0.5,
        axisLength / 10 - 0.5, -0.5, 0.5
    ], 3));
    var line_x = new THREE.Line(lineGeometry_x, lineMaterial);
    axis.add(line_x);

    // var canvas_x = document.createElement('canvas');
    // var context_x = canvas_x.getContext('2d');
    // context_x.font = '12px Microsoft YaHei';
    // context_x.fillStyle = '#00f';
    // context_x.fillText('经度', 0, 10);
    // var texture_x = new THREE.Texture(canvas_x);
    // texture_x.needsUpdate = true;

    // var spriteMaterial_x = new THREE.SpriteMaterial({ map: texture_x, color: 0xffffff });
    // var sprite_x = new THREE.Sprite(spriteMaterial_x);
    // sprite_x.width = 50;
    // sprite_x.height = 50;
    // sprite_x.scale.set(1.0, 0.5, 1.0);
    // sprite_x.position.set(0.5, -0.8, 0.5);
    // axis.add(sprite_x);

    // 纬度y轴线			
    var lineGeometry_y = new THREE.BufferGeometry();
    lineGeometry_y.setAttribute('position', new THREE.Float32BufferAttribute([
        -0.5, -0.5, 0.5,
        -0.5, axisLength / 10 - 0.5, 0.5
    ], 3));
    var line_y = new THREE.Line(lineGeometry_y, lineMaterial);
    axis.add(line_y);

    // var canvas_y = document.createElement('canvas');
    // var context_y = canvas_y.getContext('2d');
    // canvas_y.width = 200;
    // canvas_y.height = 200;
    // context_y.font = '12px Microsoft YaHei';
    // context_y.fillStyle = '#00f';
    // context_y.fillText('纬度', 30, 100);
    // var texture_y = new THREE.Texture(canvas_y);
    // texture_y.needsUpdate = true;

    // var spriteMaterial_y = new THREE.SpriteMaterial({ map: texture_y, color: 0xffffff });
    // var sprite_y = new THREE.Sprite(spriteMaterial_y);
    // sprite_y.width = 50;
    // sprite_y.height = 50;
    // sprite_y.scale.set(1.0, 1.0, 1.0);
    // sprite_y.position.set(-0.3, -0.2, 0.5);
    // axis.add(sprite_y);

    // 深度z轴线	
    var lineGeometry_z = new THREE.BufferGeometry();
    lineGeometry_z.setAttribute('position', new THREE.Float32BufferAttribute([
        -0.5, -0.5, -0.5,
        -0.5, -0.5, axisLength / 10 - 0.5
    ], 3));
    var line_z = new THREE.Line(lineGeometry_z, lineMaterial);
    axis.add(line_z);

    // var canvas_z = document.createElement('canvas');
    // var context_z = canvas_z.getContext('2d');
    // context_z.font = '12px Microsoft YaHei';
    // context_z.fillStyle = '#00f';
    // context_z.fillText('深度', 0, 10);
    // var texture_z = new THREE.Texture(canvas_z);
    // texture_z.needsUpdate = true;

    // var spriteMaterial_z = new THREE.SpriteMaterial({ map: texture_z, color: 0xffffff });
    // var sprite_z = new THREE.Sprite(spriteMaterial_z);
    // sprite_z.width = 50;
    // sprite_z.height = 50;
    // sprite_z.scale.set(1.0, 0.5, 1.0);
    // sprite_z.position.set(-0.3, -0.8, 0.2);
    // axis.add(sprite_z);


    // 创建刻度线和数值
    for (var i = 0; i <= axisLength; i += markerFrequency) {
        // 创建经度坐标轴x
        var markerGeometry_x = new THREE.BufferGeometry();
        markerGeometry_x.setAttribute('position', new THREE.Float32BufferAttribute([
            i / 10 - 0.5, -0.5, 0.5,
            i / 10 - 0.5, -0.53, 0.5
        ], 3));
        var markerLine_x = new THREE.Line(markerGeometry_x, lineMaterial);
        axis.add(markerLine_x);

        // 创建纬度坐标轴y
        var markerGeometry_y = new THREE.BufferGeometry();
        markerGeometry_y.setAttribute('position', new THREE.Float32BufferAttribute([
            -0.5, i / 10 - 0.5, 0.5,
            -0.53, i / 10 - 0.5, 0.5
        ], 3));
        var markerLine_y = new THREE.Line(markerGeometry_y, lineMaterial);
        axis.add(markerLine_y);

        // 创建深度坐标轴z
        var markerGeometry_z = new THREE.BufferGeometry();
        markerGeometry_z.setAttribute('position', new THREE.Float32BufferAttribute([
            -0.5, - 0.5, i / 10 - 0.5,
            -0.53, - 0.5, i / 10 - 0.5
        ], 3));
        var markerLine_z = new THREE.Line(markerGeometry_z, lineMaterial);
        axis.add(markerLine_z);
    }
    return axis;
}

function standardizeArr(arr) { // 规范化坐标数据     150-30
    let standArr = [];
    let min_a = Infinity;
    let max_a = -Infinity;
    for (const [a, b] of arr) {
        if (a < min_a) {
            min_a = a;
        }
        if (a > max_a) {
            max_a = a;
        }
    }
    for (let index = 0; index < arr.length; index++) {
        const [a, b] = arr[index];
        const new_a = Math.round((a - min_a) * 255 / (max_a - min_a));
        const new_b = Math.min(255, 255 - (b - 30) * (255 / 120)) / 255;
        standArr.push([new_a, new_b]);
    }

    const res = new Array(256).fill(0);
    for (const [a, b] of standArr) {
        res[a] = b;
    }
    let i = 0;
    while (i < 256 && res[i] === 0) {
        i++;
    }
    let j = i + 1;
    while (j < 256) {
        if (res[j] !== 0) {
            const slope = (res[j] - res[i]) / (j - i);
            for (let k = i + 1; k < j; k++) {
                res[k] = res[i] + slope * (k - i);
            }
            i = j;
        }
        j++;
    }
    return res;
}



// 用于在窗口大小发生变化时调整相机和渲染器
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    mesh.material.uniforms.cameraPos.value.copy(camera.position);

    mesh.material.uniforms.frame.value++;

    renderer.render(scene, camera);

}
