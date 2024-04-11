function TimePlay(options) {
  var timePlay = this;
  timePlay.default_option = {
    //speed: 5000, // 每200ms循环一次
    speed: 1000,
    //steep: 1 * 1000 * 60 * 5, // *origin*
    steep: 1000 * 60 * 60, // 以1小时为播放步进长度
    startDate: new Date(),
    endDate: new Date(),
    showMenu: false,
    showMulSpeed: false,
    container: "#timePlay",
    onClickChangeEnd: null,
    onAnimateEnd: null
  };
  timePlay.options = $.extend(true, timePlay.default_option, options);

  timePlay.msWidth = 0;
  timePlay.timer = null;
  timePlay.translate = 0;
  timePlay.width = 0;
  timePlay.unitWidth = 0;
  timePlay.temp_x = 0;
  timePlay.temp_date = {};
  timePlay.curr_date = {};
  timePlay.index_hover = 0;
  timePlay.hover = 0;
  timePlay.delay = false;
  timePlay.initDoms();
  timePlay.init();
}

TimePlay.prototype.init = function() {
  var timePlay = this;
  timePlay.initDate();

  $(".timeControl").on("click", function() {
    timePlay.play();
  });
  $(".time-speed-btn").on("click", function() {
    $(this).toggleClass("time-speed-active");
    $("#time-speed").toggle();
    $("#time-menu").hide();
  });
  $("#time-speed ul li").on("click", function() {
    $(this)
      .addClass("active")
      .siblings()
      .removeClass("active");
    timePlay.options.speed = $(this).data("val");
    //	 console.log("speed=%s", timePlay.options.speed);
    if (timePlay.timer != null) {
      clearInterval(timePlay.timer);
    }
    timePlay.startPlay();
  });

  $(".timeProgress").on("mouseover", function() {
    timePlay.hoverPopup();
  });
  $(".timeProgress").on("click", function() {
    timePlay.clickPopup();
  });

  $(".time-menu-btn").on("click", function() {
    $("#time-menu").toggle();
    $("#time-speed").hide();
  });

//  //当前时间的下一个预报时间节点 *origin*
//  var next = new Date(Date.now() + 60 * 60 * 1000);
//  timePlay.location(new Date(formatDate("yyyy/MM/dd hh:00:00", next)));
    timePlay.location(timePlay.options.selectedDate);
};

TimePlay.prototype.hoverPopup = function() {
  // 进度条悬浮方法
  var timePlay = this;
  var startDate = new Date(timePlay.options.startDate);
  $(window).on("mousemove", function(event) {
    var e = event || window.event;
    var x = e.offsetX;
    var t = (x * timePlay.countTime) / $(".timeProgress-inner").width();
    //	console.log("x=%s, timePlay.countTime=%s, timePlay.width=%s, t=%s", x, timePlay.countTime, $(".timeProgress-inner").width(), t);
    t = Math.floor(t / 100) * 100;
    var realDate = new Date(startDate.getTime() + Math.floor(t));
    if (realDate.getMinutes() < 30) {
      realDate.setMinutes(0);
      realDate.setSeconds(0);
    } else {
      realDate.setHours(realDate.getHours() + 1);
      realDate.setMinutes(0);
      realDate.setSeconds(0);
    }
    timePlay.temp_date = realDate;
    timePlay.temp_x = x;
    $(".hover-popup")
      .show()
      .css("left", x)
      .text(timePlay.getPopupStr(realDate));
  });
  $(".timeProgress").one("mouseleave", function() {
    $(window).off("mousemove");
    $(".hover-popup").hide();
  });
};
TimePlay.prototype.clickPopup = function() {
  // 进度条点击方法
  var timePlay = this;
  timePlay.stopPlay();

  timePlay.curr_date = timePlay.temp_date;
  $(".curr-popup")
    .hide()
    .text(timePlay.getPopupStr());
  $(".curr-popup.for-click")
    .show()
    .css("left", timePlay.temp_x);
  $(".for-animate").css({ left: timePlay.temp_x });
  $(".timeProgress-bar")
    .stop()
    .css("width", timePlay.temp_x);
  //	timePlay.index = timePlay.index_hover;
  var func = new Function("return " + timePlay.options.onClickChangeEnd)();
  func(timePlay.curr_date);
};

// 在时间轴上定位当前时间
TimePlay.prototype.location = function(temp_date) {
  var timePlay = this;
  var realDate = temp_date;
  timePlay.curr_date = new Date(temp_date);
  if (temp_date >= timePlay.options.endDate.getTime()) {
    timePlay.curr_date = timePlay.options.endDate;
    realDate = timePlay.options.endDate;
    $(".timeProgress-bar").css({ width: "100%" });
    $(".timeControl")
      .removeClass("pause")
      .addClass("play");
    clearInterval(timePlay.timer);
    // return;
  }
  $(".curr-popup").text(timePlay.getPopupStr());
  var w = (realDate - timePlay.options.startDate.getTime()) * timePlay.msWidth;
  $(".for-animate").animate({ left: parseInt(w) }, 0);
  $(".timeProgress-bar").css({ width: parseInt(w) });

  var _func = new Function("return " + timePlay.options.onAnimateEnd)();
  _func(timePlay.curr_date);
};

TimePlay.prototype.initDate = function() {
  //
  var timePlay = this;
  var curr_date = timePlay.options.startDate;

  $(".curr-popup").hide();
  $(".for-animate").show();
  timePlay.curr_date = new Date(curr_date);
  var dateFmt = "MM-dd hh:00";
  $(".curr-popup").text(formatDate(dateFmt, timePlay.curr_date));
  timePlay.index = 0;
};

TimePlay.prototype.initDoms = function() {
  // 初始化播放器DOM
  var timePlay = this;
  $(timePlay.options.container).hide();
  var mainContainer = $('<div id="timeMain"></div>'),
    playControl =
      '<div class="timeControl-box"><div class="timeControl play"></div></div>',
    showMenu = '<div class="time-menu-btn"><span class="">菜单</span></div>',
    speedContainer =
      '<span class="time-speed-btn">倍速</span><div id="time-speed"><ul><li data-val="200">1.0x</li><li data-val="60">2.0x</li><li data-val="30">4.0x</li></ul></div>';
  if (timePlay.options.showCursor){
        var timeAxis =
      '<div class="timeProgress-box"><div class="color-arrow" id="boundaryArrow"></div><div class="curr-popup for-animate">17:00</div><div class="hover-popup"></div><div class="curr-popup for-click">17:00</div><div class="timeProgress-hide"><div class="timeProgress-inner"><div class="timeProgress"><div class="timeProgress-bar"></div></div><ul></ul></div></div></div>';
  }
  else {
        var timeAxis =
      '<div class="timeProgress-box"><div class="curr-popup for-animate">17:00</div><div class="hover-popup"></div><div class="curr-popup for-click">17:00</div><div class="timeProgress-hide"><div class="timeProgress-inner"><div class="timeProgress"><div class="timeProgress-bar"></div></div><ul></ul></div></div></div>';
  }
  $(timePlay.options.container).append(mainContainer);
  mainContainer.append(playControl).append(timeAxis);

  timePlay.fillDate(timePlay.options.startDate, timePlay.options.endDate);

  if (timePlay.options.showMulSpeed) {
    $(timePlay.options.container).append(speedContainer);
  }

  if (timePlay.options.showMenu) {
    $(timePlay.options.container).append(showMenu);
  }
};
TimePlay.prototype.fillDate = function(start, end) {
  var timePlay = this;
  var codeFmt = "yyyyMMddhh00";
  var showFmt = "MM-dd";
  var fullFmt = "MM-dd hh:00";
  var ul = $(timePlay.options.container)
    .show()
    .find("ul");
  timePlay.countTime = end.getTime() - start.getTime();
  var steep = timePlay.options.steep; // 时间步长为1小时
  // var steep = 1000 * 60 * 60; // 时间步长为1小时
    
  var size = Math.ceil(timePlay.countTime / steep);
  var index = 0;

  var date = start.getDate();
  for (var i = start.getTime(); i <= end.getTime(); i += steep) {
    var datelist = [];
    var currentDate = new Date(i);
    var cDate = currentDate.getDate();
    if (index == 0) {
      datelist.push('<li class="rod-item" data-time="');
      datelist.push(i);
      datelist.push('" id="t-');
      datelist.push(formatDate(codeFmt, currentDate));
      datelist.push('"><span class="minute">');
      datelist.push(formatDate(showFmt, currentDate));
      datelist.push("</span></li>");
    } else if (date != cDate) {
      date = cDate;
      datelist.push('<li class="rod-item" data-time="');
      datelist.push(i);
      datelist.push('" id="t-');
      datelist.push(formatDate(codeFmt, currentDate));
      datelist.push('"><span class="minute">');
      datelist.push(formatDate(showFmt, currentDate));
      datelist.push("</span></li>");
      // } else if (currentDate.getTime()==end.getTime()) {
      // 	datelist.push('<li class="rod-item" data-time="');datelist.push(i);datelist.push('" id="t-');datelist.push(formatDate(codeFmt, currentDate));datelist.push('"><span class="minute">&nbsp;</span></li>');
    }
    ul.append(datelist.join(""));
    index++;
  }
  var boxWidth = $("#timePlay").width() - 80;
  if (timePlay.options.showMulSpeed) {
    boxWidth -= 60;
  }
  if (timePlay.options.showMenu) {
    boxWidth -= 60;
  }
  $(".timeProgress-box").width(boxWidth);
  $(".timeProgress-inner").width(boxWidth);
  timePlay.msWidth = parseFloat(boxWidth) / timePlay.countTime; // 每毫秒的宽度

  timePlay.width = boxWidth; // 时间轴的宽度
  timePlay.unitWidth = parseInt(boxWidth / size); // 每个小时的宽度
  // timePlay.unitWidth = parseInt(boxWidth / size / 3); // 每个小时的宽度，当步长为3小时，需要除3
  // console.log("boxWidth=%s, msWidth=%s, size=%s, unitWidth=%s", boxWidth, timePlay.msWidth, size, timePlay.unitWidth);
//  $(".rod-item").width(timePlay.unitWidth * 24);
  $(".rod-item").width(101.4);
  var hours = 24 - start.getHours();
  if (hours < 24) {
//    $(".rod-item:first").width(timePlay.unitWidth * hours - 7);
    $(".rod-item:first").width(60.9);
  }

  hours = end.getHours();
  if (hours > 0) {
//    $(".rod-item:last").width(timePlay.unitWidth * hours - 7);
    $(".rod-item:last").width(34.4);
  }
};

TimePlay.prototype.play = function() {
  var timePlay = this;
  if ($(".timeControl").hasClass("play")) {
    timePlay.startPlay();
    return true;
  } else {
    timePlay.stopPlay();
    return false;
  }
};
TimePlay.prototype.delayAnimation = function() {
  var timePlay = this;
  timePlay.delay = true;
};
TimePlay.prototype.continueAnimation = function() {
  var timePlay = this;
  timePlay.delay = false;
};
TimePlay.prototype.startPlay = function() {
  var timePlay = this;
  if ($(".timeControl").hasClass("play")) {
    $(".timeControl")
      .removeClass("play")
      .addClass("pause");
  }
  //	$('.timeControl').toggleClass('play').toggleClass('pause');
  $(".curr-popup").hide();
  $(".curr-popup.for-animate").show();
  timePlay.timer = setInterval(function() {
    if (timePlay.delay) {
      return false;
    }
    var temp_date = timePlay.curr_date.getTime() + timePlay.options.steep; // 播放时按照步长
    timePlay.location(temp_date);
  }, timePlay.options.speed);
};
TimePlay.prototype.stopPlay = function() {
  var timePlay = this;
  if ($(".timeControl").hasClass("pause")) {
    $(".timeControl")
      .removeClass("pause")
      .addClass("play");
  }
  clearInterval(timePlay.timer);
};
TimePlay.prototype.getPopupStr = function(d) {
  var timePlay = this;
  var r = formatDate("MM-dd hh:00", d ? d : timePlay.curr_date);
  return r;
};
TimePlay.prototype.getSteep = function() {
  var timePlay = this;
  return timePlay.options.steep;
};
TimePlay.prototype.getCurrentTime = function() {
  var timePlay = this;
  return timePlay.curr_date;
};
TimePlay.prototype.empty = function() {
  var timePlay = this;
  if (timePlay.timer != null) {
    clearInterval(timePlay.timer);
  }
  $("#timePlay").empty();
};

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
