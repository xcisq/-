// 根据风速生成风级图标
function speedSwitch(s) {
  s = Math.abs(s);
  var src = "";
  if (s <= 2) {
    src = "./imgs/level1.png";
  } else if (s > 2 && s <= 4) {
    src = "./imgs/level2.png";
  } else if (s > 4 && s <= 6) {
    src = "./imgs/level3.png";
  } else if (s > 6 && s <= 8) {
    src = "./imgs/level4.png";
  } else if (s > 8 && s <= 10) {
    src = "./imgs/level5.png";
  } else if (s > 10 && s <= 12) {
    src = "./imgs/level6.png";
  } else if (s > 12 && s <= 14) {
    src = "./imgs/level7.png";
  } else if (s > 14 && s <= 16) {
    src = "./imgs/level8.png";
  } else if (s > 16 && s <= 20) {
    src = "./imgs/level9.png";
  } else if (s > 20 && s <= 24) {
    src = "./imgs/level10.png";
  } else if (s > 24 && s <= 28) {
    src = "./imgs/level11.png";
  } else if (s > 28 && s <= 32) {
    src = "./imgs/level12.png";
  } else if (s > 32 && s <= 36) {
    src = "./imgs/level13.png";
  } else {
    src = "./imgs/level14.png";
  }
  return src;
}

// 将以度数表示的波浪方向转换为大致的方位
function waveSwitch(s) {
  s = Math.abs(s);
  var direction = "";
  if (s >= 0 && s < 11.25) {
    direction = "北";
  } else if (s >= 11.25 && s < 33.75) {
    direction = "北东北";
  } else if (s >= 33.75 && s < 56.25) {
    direction = "东北";
  } else if (s >= 56.25 && s < 78.75) {
    direction = "东东北";
  } else if (s >= 78.75 && s < 101.25) {
    direction = "东";
  } else if (s >= 101.25 && s < 123.75) {
    direction = "东东南";
  } else if (s > 123.75 && s < 146.25) {
    direction = "东南";
  } else if (s > 146.25 && s < 168.75) {
    direction = "南东南";
  } else if (s > 168.75 && s < 191.25) {
    direction = "南";
  } else if (s >= 191.25 && s < 213.75) {
    direction = "南西南";
  } else if (s >= 213.75 && s < 236.25) {
    direction = "西南";
  } else if (s >= 236.25 && s < 258.75) {
    direction = "西西南";
  } else if (s >= 258.75 && s < 281.25) {
    direction = "西";
  } else if (s >= 281.25 && s < 303.75) {
    direction = "西西北";
  } else if (s >= 303.75 && s < 326.25) {
    direction = "西北";
  } else if (s >= 326.25 && s < 348.75) {
    direction = "北西北";
  } else if (s >= 348.75 && s < 360) {
    direction = "北";
  }
  return direction;
}

// 将以度数表示的流场方向转换为大致的方位
function currentSwitch(s) {
  s = Math.abs(s);
  var direction = "";
  if (s >= 0 && s < 11.25) {
    direction = "北";
  } else if (s >= 11.25 && s < 33.75) {
    direction = "北东北";
  } else if (s >= 33.75 && s < 56.25) {
    direction = "东北";
  } else if (s >= 56.25 && s < 78.75) {
    direction = "东东北";
  } else if (s >= 78.75 && s < 101.25) {
    direction = "东";
  } else if (s >= 101.25 && s < 123.75) {
    direction = "东东南";
  } else if (s > 123.75 && s < 146.25) {
    direction = "东南";
  } else if (s > 146.25 && s < 168.75) {
    direction = "南东南";
  } else if (s > 168.75 && s < 191.25) {
    direction = "南";
  } else if (s >= 191.25 && s < 213.75) {
    direction = "南西南";
  } else if (s >= 213.75 && s < 236.25) {
    direction = "西南";
  } else if (s >= 236.25 && s < 258.75) {
    direction = "西西南";
  } else if (s >= 258.75 && s < 281.25) {
    direction = "西";
  } else if (s >= 281.25 && s < 303.75) {
    direction = "西西北";
  } else if (s >= 303.75 && s < 326.25) {
    direction = "西北";
  } else if (s >= 326.25 && s < 348.75) {
    direction = "北西北";
  } else if (s >= 348.75 && s <= 360) {
    direction = "北";
  }
  return direction;
}

// 将以度数表示的风场方向转换为大致的方位
function windSwitch(s) {
  s = Math.abs(s);
  var direction = "";
  if (s >= 0 && s < 11.25) {
    direction = "北";
  } else if (s >= 11.25 && s < 33.75) {
    direction = "北东北";
  } else if (s >= 33.75 && s < 56.25) {
    direction = "东北";
  } else if (s >= 56.25 && s < 78.75) {
    direction = "东东北";
  } else if (s >= 78.75 && s < 101.25) {
    direction = "东";
  } else if (s >= 101.25 && s < 123.75) {
    direction = "东东南";
  } else if (s > 123.75 && s < 146.25) {
    direction = "东南";
  } else if (s > 146.25 && s < 168.75) {
    direction = "南东南";
  } else if (s > 168.75 && s < 191.25) {
    direction = "南";
  } else if (s >= 191.25 && s < 213.75) {
    direction = "南西南";
  } else if (s >= 213.75 && s < 236.25) {
    direction = "西南";
  } else if (s >= 236.25 && s < 258.75) {
    direction = "西西南";
  } else if (s >= 258.75 && s < 281.25) {
    direction = "西";
  } else if (s >= 281.25 && s < 303.75) {
    direction = "西西北";
  } else if (s >= 303.75 && s < 326.25) {
    direction = "西北";
  } else if (s >= 326.25 && s < 348.75) {
    direction = "北西北";
  } else if (s >= 348.75 && s <= 360) {
    direction = "北";
  }
  return direction;
}
