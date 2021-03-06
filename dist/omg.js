/*!
 * omg.js v3.0.0
 * Author: PengJiyuan
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.omg = factory());
}(this, (function () { 'use strict';

/* eslint-disable */

// requestAnimationFrame polyfill
(function () {
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  var lastTime = 0;
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame) { window.requestAnimationFrame = function (callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  }; }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }

  // Object.assign polyfill
  if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
      value: function assign(target, varArgs) { // .length of function is 2
        'use strict';
        var arguments$1 = arguments;

        if (target == null) { // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments$1[index];

          if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }
})();

var version = "3.0.0";

var utils = {

  getPos: function getPos(e) {
    var ev = e || event;
    var ref = [ ev.offsetX, ev.offsetY ];
    var x = ref[0];
    var y = ref[1];
    return {x: x, y: y};
  },

  bind: function bind(target, eventType, handler) {
    if (window.addEventListener) {
      target.addEventListener(eventType, handler, false);
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, handler);
    } else {
      target['on' + eventType] = handler;
    }
    return target;
  },

  unbind: function unbind(target, eventType, handler) {
    if (window.removeEventListener) {
      target.removeEventListener(eventType, handler, false);
    } else if (window.detachEvent) {
      target.detachEvent(eventType, handler);
    } else {
      target['on' + eventType] = '';
    }
  },

  // do not change the origin array
  reverse: function reverse(array) {
    var ref = [ array.length, [] ];
    var length = ref[0];
    var ret = ref[1];
    for(var i = 0; i < length; i++) {
      ret[i] = array[length - i -1];
    }
    return ret;
  },

  formatFloat: function formatFloat(f) {
    var m = Math.pow(10, 10);
    return parseInt(f * m, 10) / m;
  },

  /**
   * @param {Array} arr
   */
  getMax: function getMax(arr) {
    return Math.max.apply(null, arr);
  },
  /**
   * @param {Array} arr
   */
  getMin: function getMin(arr) {
    return Math.min.apply(null, arr);
  },

  insertArray: function insertArray(originArray, start, number, insertArray$1) {
    var args = [start, number].concat(insertArray$1);
    Array.prototype.splice.apply(originArray, args);
  },

  isArr: function isArr(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  },

  isObj: function isObj(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

};

var Event = function Event(_this) {
  // global this
  this._ = _this;
  this.triggeredMouseDown = false;
  this.triggeredMouseMove = false;
};

Event.prototype.getPos = function getPos (e) {
  var ev = e || event;
  var ref = [ ev.offsetX, ev.offsetY ];
    var x = ref[0];
    var y = ref[1];
  return { x: x, y: y };
};

Event.prototype.triggerEvents = function triggerEvents () {
  var hasEvents = this._.objects.some(function (item) {
    return item.events && utils.isArr(item.events) || item.enableDrag;
  });
  if(!hasEvents && !this._.enableGlobalTranslate && !this._.enableGlobalScale) {
    return;
  }

  var hasEnterOrMove = this._.objects.some(function (item) {
    return item.events && item.events.some(function (i) {
      return i.eventType === 'mouseenter'
        || i.eventType === 'mousemove'
        || i.eventType === 'drag'
        || i.eventType === 'dragin'
        || i.eventType === 'dragout'
        || i.eventType === 'drop';
    });
  }) || this._.globalMousemove;

  // mouseenter mousemove
  if(hasEnterOrMove && !this.triggeredMouseMove) {
    this.bindMouseMove();
    this.triggeredMouseMove = true;
  }

  if(!hasEnterOrMove && this.triggeredMouseMove) {
    this.unBindMouseMove();
    this.triggeredMouseMove = false;
  }

  if(!this.triggeredMouseDown) {
    utils.bind(this._.element, 'mousedown', this.mouseDown.bind(this));
    this.triggeredMouseDown = true;
  }

  if(this._.enableGlobalScale) {
    this.bindMouseWheel();
  } else {
    this.unBindMouseWheel();
  }

};

Event.prototype.bindMouseWheel = function bindMouseWheel () {
  utils.bind(this._.element, 'wheel', this.mouseWheel.bind(this));
};

Event.prototype.unBindMouseWheel = function unBindMouseWheel () {
  utils.unbind(this._.element, 'wheel', this.mouseWheel.bind(this));
};

Event.prototype.mouseWheel = function mouseWheel (e) {
  if(e.deltaY && e.deltaY > 0) {
    this._.scale = this._.scale - 0.01 >= this._.minDeviceScale ? this._.scale - 0.01 : this._.minDeviceScale;
  } else if(e.deltaY && e.deltaY < 0) {
    this._.scale = this._.scale + 0.01 <= this._.maxDeviceScale ? this._.scale + 0.01 : this._.maxDeviceScale;
  }
  this._.redraw();
};

Event.prototype.bindMouseMove = function bindMouseMove () {
  utils.bind(this._.element, 'mousemove', this.mouseEnterOrMove.bind(this));
};

Event.prototype.unBindMouseMove = function unBindMouseMove () {
  utils.unbind(this._.element, 'mousemove', this.mouseEnterOrMove.bind(this));
};

Event.prototype.mouseEnterOrMove = function mouseEnterOrMove (e_moveOrEnter) {
  var that = this;
  var isDragging;

  var mX = that.getPos(e_moveOrEnter).x;
  var mY = that.getPos(e_moveOrEnter).y;

  that._.globalMousemove && that._.globalMousemove(e_moveOrEnter);

  isDragging = that._.objects.some(function (item) {
    return item.isDragging;
  });

  // trigger mouseenter and mousemove
  var movedOn = that._._objects.filter(function (item) {
    return item.isPointInner(mX, mY);
  });

  if(isDragging) {
    // dragin
    if(movedOn && movedOn.length > 1) {
      movedOn[1].events && movedOn[1].events.forEach(function (i) {
        if(i.eventType === 'dragin' && !movedOn[1].hasDraggedIn) {
          movedOn[1].hasDraggedIn = true;
          i.callback && i.callback(movedOn[1]);
        }
      });
    }

    // dragout handler
    var handleDragOut = function (item) {
      item.hasDraggedIn && item.events.forEach(function (i) {
        if(i.eventType === 'dragout') {
          i.callback && i.callback(movedOn[1]);
        }
      });
      item.hasDraggedIn = false;
    };

    // Determine whether the mouse is dragged out from the shape and trigger dragout handler
    that._._objects.some(function (item) {
      return item.hasDraggedIn && (!item.isPointInner(mX, mY) || movedOn[1] !== item) && handleDragOut(item);
    });

  } else {
    // mouseleave handler
    var handleMoveOut = function (item) {
      item.hasEnter && item.events.forEach(function (i) {
        if(i.eventType === 'mouseleave') {
          i.callback && i.callback(item);
        }
      });
      item.hasEnter = false;
    };
    // normal mousemove
    // Determine whether the mouse is removed from the shape and trigger mouseleave handler
    that._._objects.some(function (item) {
      return item.hasEnter && (!item.isPointInner(mX, mY) || movedOn[0] !== item) && handleMoveOut(item);
    });
    if(movedOn && movedOn.length > 0) {
      movedOn[0].events && movedOn[0].events.forEach(function (i) {
        if(i.eventType === 'mouseenter' && !movedOn[0].hasEnter) {
          movedOn[0].hasEnter = true;
          i.callback && i.callback(movedOn[0]);
        } else if(i.eventType === 'mousemove') {
          i.callback && i.callback(movedOn[0]);
        }
      });
    }
  }

};

Event.prototype.mouseDown = function mouseDown (e_down) {
  var that = this, whichIn, hasEventDrag, hasEventDragEnd, dragCb, dragEndCb;

  // global setting event mousedown
  this._.globalMousedown && this._.globalMousedown(e_down);

  var hasDrags = this._.objects.some(function (item) {
    return item.enableDrag;
  });

  // drag shape
  var pX = this.getPos(e_down).x;
  var pY = this.getPos(e_down).y;
  that.cacheX = pX;
  that.cacheY = pY;

  // mousedown
  var whichDown = this._._objects.filter(function (item) {
    return item.isPointInner(pX, pY) && !item.isBg;
  });

  if(whichDown && whichDown.length > 0) {
    if(whichDown[0].enableChangeIndex) {
      that.changeOrder(whichDown[0]);
    }
    whichDown[0].events && whichDown[0].events.some(function (i) {
      return i.eventType === 'mousedown' && i.callback && i.callback(whichDown[0]);
    });
  }

  // mouseDrag
  if(hasDrags) {
    whichIn = that._._objects.filter(function (item) {
      return item.isPointInner(pX, pY) && !item.isBg;
    });

    hasEventDrag = whichIn.length > 0 && whichIn[0].events && whichIn[0].events.some(function (item) {
      if(item.eventType === 'drag') {
        dragCb = item.callback;
      }
      return item.eventType === 'drag';
    });

    hasEventDragEnd = whichIn.length > 0 && whichIn[0].events && whichIn[0].events.some(function (item) {
      if(item.eventType === 'dragend') {
        dragEndCb = item.callback;
      }
      return item.eventType === 'dragend';
    });

    var move_Event = function (e_move) {
      var mx = that.getPos(e_move).x;
      var my = that.getPos(e_move).y;

      whichIn[0].moveX = whichIn[0].moveX + mx - that.cacheX;
      whichIn[0].moveY = whichIn[0].moveY + my - that.cacheY;

      // event drag
      hasEventDrag && dragCb(whichDown[0]);

      that._.redraw();
      that.cacheX = mx;
      that.cacheY = my;
      whichIn[0].isDragging = true;
    };

    var up_Event = function (e_up) {
      var uX = that.getPos(e_up).x;
      var uY = that.getPos(e_up).y;

      var upOn = that._._objects.filter(function (item) {
        return item.isPointInner(uX, uY);
      });

      if(upOn && upOn.length > 1) {
        if(upOn[1].hasDraggedIn) {
          upOn[1].hasDraggedIn = false;
          var dp = upOn[1].events.some(function (i) {
            return i.eventType === 'drop' && i.callback && i.callback(upOn[1], upOn[0]);
          });
          // if not defined event drop, check if event dragout exist
          // if yes, trigger the callback dragout.
          !dp && upOn[1].events.some(function (i) {
            return i.eventType === 'dragout' && i.callback && i.callback(upOn[1]);
          });
        }
      }

      // event dragend
      hasEventDragEnd && dragEndCb(whichDown[0]);

      utils.unbind(document, 'mousemove', move_Event);
      utils.unbind(document, 'mouseup', up_Event);
      whichIn[0].isDragging = false;
    };
    if(whichIn && whichIn.length > 0 && whichIn[0].enableDrag) {
      utils.bind(document, 'mousemove', move_Event);
      utils.bind(document, 'mouseup', up_Event);
    }
  }

  // global translate
  if(this._.enableGlobalTranslate && !(whichIn && whichIn.length > 0)) {

    var move_dragCanvas = function (e_move) {
      var mx = that.getPos(e_move).x;
      var my = that.getPos(e_move).y;
      // that._.originTransX = that._.originTransX + mx - that.cacheX;
      // that._.originTransY = that._.originTransY+ my - that.cacheY;
      that._.transX = that._.transX + mx - that.cacheX;
      that._.transY = that._.transY + my - that.cacheY;
      that._.redraw();
      that.cacheX = mx;
      that.cacheY = my;
    };

    var up_dragCanvas = function () {
      utils.unbind(document, 'mousemove', move_dragCanvas);
      utils.unbind(document, 'mouseup', up_dragCanvas);
    };

    utils.bind(document, 'mousemove', move_dragCanvas);
    utils.bind(document, 'mouseup', up_dragCanvas);
  }
};

Event.prototype.changeOrder = function changeOrder (item) {
  var i = this._.objects.indexOf(item);
  var cacheData = this._.objects[i];
  this._.objects.splice(i, 1);
  this._.objects.push(cacheData);
  this._._objects = utils.reverse(this._.objects);
  this._.redraw();
};

var Color = function Color() {};

// converts hex to RGB
Color.prototype.hexToRGB = function hexToRGB (hex) {
  var rgb = [];

  hex = hex.substr(1);

  // converts #abc to #aabbcc
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, '$1$1');
  }

  hex.replace(/../g, function (color) {
    rgb.push(parseInt(color, 0x10));
  });

  return {
    r: rgb[0],
    g: rgb[1],
    b: rgb[2],
    rgb: ("rgb(" + (rgb.join(',')) + ")")
  };
};

// converts rgb to HSL
Color.prototype.rgbToHSL = function rgbToHSL (r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: h,
    s: s,
    l: l,
    hsl: ("hsl(" + (h * 360) + ", " + (s * 100) + "%, " + (l * 100) + "%)")
  };
};

// converts hsl to RGB
Color.prototype.hslToRGB = function hslToRGB () {
};

// color lighten
Color.prototype.lighten = function lighten (color, percent) {
  var hsl, h, s, l, rgba, a;
  if(!color || !percent || !/^[0-9]{1,2}%$/.test(percent)) {
    return;
  }
  if(this.isRgba(color)) {
    rgba = this.getRgba(color);
    a = +rgba.a - +( percent.slice(0, -1) / 100 );
    return ("rgba(" + (rgba.r) + ", " + (rgba.g) + ", " + (rgba.b) + ", " + a + ")");
  } else {
    hsl = this.getHsl(color);
    h = +hsl.h;
    s = +hsl.s;
    l = +hsl.l * 100 + +percent.slice(0, -1);

    return ("hsl(" + (h * 360) + ", " + (s * 100) + "%, " + l + "%)");
  }
};

// color darken
Color.prototype.darken = function darken (color, percent) {
  var hsl, h, s, l, rgba, a;
  if(!color || !percent || !/^[0-9]{1,2}%$/.test(percent)) {
    return;
  }
  if(this.isRgba(color)) {
    rgba = this.getRgba(color);
    a = +rgba.a + +( percent.slice(0, -1) / 100 );
    return ("rgba(" + (rgba.r) + ", " + (rgba.g) + ", " + (rgba.b) + ", " + a + ")");
  } else {
    hsl = this.getHsl(color);
    h = +hsl.h;
    s = +hsl.s;
    l = +hsl.l * 100 - +percent.slice(0, -1);

    return ("hsl(" + (h * 360) + ", " + (s * 100) + "%, " + l + "%)");
  }
};

Color.prototype.isHex = function isHex (color) {
  return /^#[a-fA-F0-9]{3}$|#[a-fA-F0-9]{6}$/.test(color);
};

Color.prototype.isRgb = function isRgb (color) {
  return /^rgb\((\s*[0-5]{0,3}\s*,?){3}\)$/.test(color);
};

Color.prototype.isRgba = function isRgba (color) {
  return /^rgba\((\s*[0-5]{0,3}\s*,?){3}[0-9.\s]*\)$/.test(color);
};

Color.prototype.getRgb = function getRgb (color) {
    var assign, assign$1;

  var rgb, r, g, b;
  if(this.isHex(color)) {
    rgb = this.hexToRGB(color);
    (assign = [ rgb.r, rgb.g, rgb.b ], r = assign[0], g = assign[1], b = assign[2]);
  } else if(this.isRgb(color)) {
    rgb = color.slice(4, -1).split(',');
    (assign$1 = [ rgb[0], rgb[1], rgb[2] ], r = assign$1[0], g = assign$1[1], b = assign$1[2]);
  }
  return { r: r, g: g, b: b };
};

Color.prototype.getRgba = function getRgba (color) {
    var assign;

  var rgba, r, g, b, a;
  rgba = color.slice(5, -1).split(',');
  (assign = [ rgba[0], rgba[1], rgba[2], rgba[3] ], r = assign[0], g = assign[1], b = assign[2], a = assign[3]);

  return { r: r, g: g, b: b, a: a };
};

Color.prototype.getHsl = function getHsl (color) {
    var assign, assign$1;

  var hsl, rgb, r, g, b, h, s, l;
  rgb = this.getRgb(color);
  (assign = [ rgb.r, rgb.g, rgb.b ], r = assign[0], g = assign[1], b = assign[2]);

  hsl = this.rgbToHSL(r, g, b);
  (assign$1 = [ hsl.h, hsl.s, hsl.l ], h = assign$1[0], s = assign$1[1], l = assign$1[2]);

  return { h: h, s: s, l: l };
};

var ImageLoader = function ImageLoader() {
  this.imageList = [];
  this.loadNum = 0;
};

ImageLoader.prototype.ready = function ready (callback) {
    var this$1 = this;

  this.imageList.forEach(function (img) {
    this$1.loadImg(img);
  });
  var timer = setInterval(function () {
    if(this$1.loadNum === this$1.imageList.length){
      clearInterval(timer);
      callback && callback();
    }
  }, 50);
};

ImageLoader.prototype.loadImg = function loadImg (img) {
    var this$1 = this;

  var timer = setInterval(function () {
    if(img.complete === true){
      this$1.loadNum++;
      clearInterval(timer);
    }
  }, 50);
};

ImageLoader.prototype.addImg = function addImg (imageArray) {
    var this$1 = this;

  imageArray.forEach(function (src) {
    var img = new Image();
    img.src = src;
    img.name = src;
    img.loaded = false;
    this$1.imageList.push(img);
  });
};

ImageLoader.prototype.getImg = function getImg (name) {
  var target;
  this.imageList.forEach(function (img) {
    if(img.name == name){
      target = img;
    }
  });
  return target;
};

// https://github.com/component/autoscale-canvas/blob/master/index.js

/**
 * Retina-enable the given `canvas`.
 *
 * @param {Canvas} canvas
 * @return {Canvas}
 * @api public
 */

var autoscale = function (canvasList, opt) {
  var ratio = window.devicePixelRatio || 1,
    ctx = null;

  canvasList.forEach(function (canvas) {
    ctx = canvas.getContext('2d');
    canvas.style.position = opt.position;
    canvas.style.width = opt.width + 'px';
    canvas.style.height = opt.height + 'px';
    canvas.width = opt.width * ratio;
    canvas.height = opt.height * ratio;
    ctx.scale(ratio, ratio);
  });

  return canvasList;
};

var insideRectangle = function (x, y, recX, recY, recW, recH) {
  var xRight = x > recX;
  var xLeft = x < recX + recW;
  var yTop = y > recY;
  var yBottom = y < recY + recH;

  return xRight && xLeft && yTop && yBottom;
};

// from https://github.com/ecomfe/zrender/blob/master/src/contain/line.js
var insideLine = function (x0, y0, x1, y1, lineWidth, x, y) {
  if (lineWidth === 0) {
    return false;
  }
  var _l = lineWidth;
  var _a = 0;
  var _b = x0;
  // Quick reject
  if (
    (y > y0 + _l && y > y1 + _l)
    || (y < y0 - _l && y < y1 - _l)
    || (x > x0 + _l && x > x1 + _l)
    || (x < x0 - _l && x < x1 - _l)
  ) {
    return false;
  }

  if (x0 !== x1) {
    _a = (y0 - y1) / (x0 - x1);
    _b = (x0 * y1 - x1 * y0) / (x0 - x1) ;
  }
  else {
    return Math.abs(x - x0) <= _l / 2;
  }
  var tmp = _a * x - y + _b;
  var _s = tmp * tmp / (_a * _a + 1);
  return _s <= _l / 2 * _l / 2;
};

var insideArc = function (x, y, r, sa, ea) {
  var pi = Math.PI;
  var dis, isIn;
  // Sector
  if(!isNaN(sa) && !isNaN(ea)) {
    var angle;
    // 4th quadrant
    if(x >= 0 && y >= 0) {
      if(x === 0) {
        angle = pi/2;
      } else {
        angle = Math.atan( (y / x) );
      }
    }
    // 3th quadrant
    else if(x <= 0 && y >= 0) {
      if(x === 0) {
        angle = pi;
      } else {
        angle = pi - Math.atan(y / Math.abs(x));
      }
    }
    // secend quadrant
    else if(x <= 0 && y <= 0) {
      if(x === 0) {
        angle = pi;
      } else {
        angle = Math.atan(Math.abs(y) / Math.abs(x)) + pi;
      }
    }
    // first quadrant
    else if(x >= 0 && y<= 0) {
      if(x === 0) {
        angle = pi*3/2;
      } else {
        angle = 2*pi - Math.atan(Math.abs(y) / x);
      }
    }
    dis = Math.sqrt( x * x + y * y );
    if(sa < ea) {
      isIn = !!(angle >= sa && angle <= ea && dis <= r);
    } else {
      isIn = !!( ( (angle >= 0 && angle <= ea) || (angle >= sa && angle <= 2*pi) ) && dis <= r);
    }
  }
  // normal arc
  else {
    isIn = !!( Math.sqrt( x * x + y * y ) <= r );
  }
  return isIn;
};

/**
 * @type: polygon
 *
 * Return true if the given point is contained inside the boundary.
 * See: http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 * @return true if the point is inside the boundary, false otherwise
 */
var insidePolygon = function (x, y, points) {
  var result = false;
  for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
    if ((points[i][1] > y) != (points[j][1] > y) &&
        (x < (points[j][0] - points[i][0]) * (y - points[i][1]) / (points[j][1] - points[i][1]) + points[i][0])) {
      result = !result;
    }
  }
  return result;
};

var isPointInner = function(x, y) {
  var this$1 = this;

  // 图形内部偏移的像素
  var mx = this.moveX * this._.scale;
  var my = this.moveY * this._.scale;
  // 全局偏移的像素
  var ltx = this.fixed ? 0 : this._.transX;
  var lty = this.fixed ? 0 : this._.transY;
  // 鼠标获取到的坐标减去全局偏移像素和图形内部偏移的像素
  var pgx = x - mx - ltx;
  var pgy = y - my - lty;

  switch(this.type) {
    /**
     * @type: image, text, coord
     */
    case 'rectangle':
    case 'group':
      return insideRectangle(pgx, pgy, this.scaled_x, this.scaled_y, this.scaled_width, this.scaled_height);
    /**
     * @type: Arc
     */
    case 'arc':
      var cx = this.scaled_x, // 圆心x
        cy = this.scaled_y, // 圆心y
        pi = Math.PI,
        // 将度数转化为PI角度
        sa = this.startAngle < 0 ? 2 * pi + pi / 180 * this.startAngle : pi / 180 * this.startAngle,
        ea = this.endAngle < 0 ? 2 * pi + pi / 180 * this.endAngle : pi / 180 * this.endAngle,
        r = this.scaled_radius,
        dx = pgx - cx,
        dy = pgy - cy;
      return insideArc(dx, dy, r, sa, ea);
    /**
     * @type: polygon
     */
    case 'polygon':
      return insidePolygon(pgx, pgy, this.scaled_matrix);
    /**
     * @type: line
     */
    case 'line':
      var linePoints = this.scaled_matrix;
      var length = linePoints.length;
      for (var i = 0;i < length; i ++) {
        if(i > 0) {
          if(insideLine(
            linePoints[i - 1][0],
            linePoints[i - 1][1],
            linePoints[i][0],
            linePoints[i][1],
            this$1.scaled_lineWidth,
            pgx,
            pgy
          )) {
            return true;
          }
        }
      }
      return false;
    default:
      break;
  }
};

/**
 * @param {Array}  points - point list
 * @return {Array} bounding points. left top, right top, right bottom, left bottom.
 */
function getBounding(points, lineWidth) {
  var lw = lineWidth ? lineWidth : 0;
  var xList = points.map(function (point) { return point[0]; });
  var yList = points.map(function (point) { return point[1]; });
  var minX = utils.getMin(xList) - lw;
  var maxX = utils.getMax(xList) + lw;
  var minY = utils.getMin(yList) - lw;
  var maxY = utils.getMax(yList) + lw;
  var lt = [minX, minY];
  var lb = [minX, maxY];
  var rt = [maxX, minY];
  var rb = [maxX, maxY];
  var w = maxX - minX;
  var h = maxY - minY;
  return {
    lt: lt,
    rt: rt,
    rb: rb,
    lb: lb,
    w: w,
    h: h
  };
}

/**!
 * code from https://github.com/LiikeJS/Liike/blob/master/src/ease.js
 */
var easeInBy = function (power) { return function (t) { return Math.pow(t, power); }; };
var easeOutBy = function (power) { return function (t) { return 1 - Math.abs(Math.pow(t - 1, power)); }; };
var easeInOutBy = function (power) { return function (t) { return t < 0.5 ? easeInBy(power)(t * 2) / 2 : easeOutBy(power)(t * 2 - 1) / 2 + 0.5; }; };

var linear = function (t) { return t; };
var quadIn = easeInBy(2);
var quadOut = easeOutBy(2);
var quadInOut = easeInOutBy(2);
var cubicIn = easeInBy(3);
var cubicOut = easeOutBy(3);
var cubicInOut = easeInOutBy(3);
var quartIn = easeInBy(4);
var quartOut = easeOutBy(4);
var quartInOut = easeInOutBy(4);
var quintIn = easeInBy(5);
var quintOut = easeOutBy(5);
var quintInOut = easeInOutBy(5);
var sineIn = function (t) { return 1 + Math.sin(Math.PI / 2 * t - Math.PI / 2); };
var sineOut = function (t) { return Math.sin(Math.PI / 2 * t); };
var sineInOut = function (t) { return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2; };
var bounceOut = function (t) {
  var s = 7.5625;
  var p = 2.75;

  if (t < 1 / p) {
    return s * t * t;
  }
  if (t < 2 / p) {
    t -= 1.5 / p;
    return s * t * t + 0.75;
  }
  if (t < 2.5 / p) {
    t -= 2.25 / p;
    return s * t * t + 0.9375;
  }
  t -= 2.625 / p;
  return s * t * t + 0.984375;
};
var bounceIn = function (t) { return 1 - bounceOut(1 - t); };
var bounceInOut = function (t) { return t < 0.5 ? bounceIn(t * 2) * 0.5 : bounceOut(t * 2 - 1) * 0.5 + 0.5; };


var easing = Object.freeze({
	linear: linear,
	quadIn: quadIn,
	quadOut: quadOut,
	quadInOut: quadInOut,
	cubicIn: cubicIn,
	cubicOut: cubicOut,
	cubicInOut: cubicInOut,
	quartIn: quartIn,
	quartOut: quartOut,
	quartInOut: quartInOut,
	quintIn: quintIn,
	quintOut: quintOut,
	quintInOut: quintInOut,
	sineIn: sineIn,
	sineOut: sineOut,
	sineInOut: sineInOut,
	bounceOut: bounceOut,
	bounceIn: bounceIn,
	bounceInOut: bounceInOut
});

var Tween = function Tween(settings) {
  var from = settings.from;
  var to = settings.to;
  var duration = settings.duration;
  var delay = settings.delay;
  var easing = settings.easing;
  var onStart = settings.onStart;
  var onUpdate = settings.onUpdate;
  var onFinish = settings.onFinish;

  for(var key in from) {
    if(to[key] === undefined) {
      to[key] = from[key];
    }
  }
  for(var key$1 in to) {
    if(from[key$1] === undefined) {
      from[key$1] = to[key$1];
    }
  }

  this.from = from;
  this.to = to;
  this.duration = duration || 500;
  this.delay = delay || 0;
  this.easing = easing || 'linear';
  this.onStart = onStart;
  this.onUpdate = onUpdate;
  this.onFinish = onFinish;
  this.startTime = Date.now() + this.delay;
  this.started = false;
  this.finished = false;
  this.keys = {};
};

Tween.prototype.update = function update () {
    var this$1 = this;

  this.time = Date.now();
  // delay some time
  if(this.time < this.startTime) {
    return;
  }
  // finish animation
  if(this.elapsed === this.duration) {
    if(!this.finished) {
      this.finished = true;
      this.onFinish && this.onFinish(this.keys);
    }
    return;
  }
  this.elapsed = this.time - this.startTime;
  this.elapsed = this.elapsed > this.duration ? this.duration : this.elapsed;
  for(var key in this$1.to) {
    this$1.keys[key] = this$1.from[key] + ( this$1.to[key] - this$1.from[key] ) * easing[this$1.easing](this$1.elapsed / this$1.duration);
  }
  if(!this.started) {
    this.onStart && this.onStart(this.keys);
    this.started = true;
  }
  this.onUpdate(this.keys);
};

var Display = function Display(settings, _this) {

  this._ = _this;

  // scaled_xxx, the value xxx after scaled, finally display value.
  this.commonData = {

    color: settings.color,

    x: settings.x,

    scaled_x: settings.x * _this.scale,

    y: settings.y,

    scaled_y: settings.y * _this.scale,

    width: settings.width,

    scaled_width: settings.width * _this.scale,

    height: settings.height,

    scaled_height: settings.height * _this.scale,

    moveX: 0,

    scaled_moveX: 0,

    moveY: 0,

    scaled_moveY: 0,

    boundingWidth: 0,

    boundingHeight: 0,

    zindex: 0

  };

};

Display.prototype.on = function on (eventTypes, callback) {
    var this$1 = this;

  if(this.isBg) {
    return;
  }

  if(!eventTypes) {
    throw 'no eventTypes defined!';
  }

  if(!callback || typeof callback !== 'function') {
    throw 'you need defined a callback!';
  }

  this.events = this.events || [];

  var eTypes = eventTypes.split(' '), that = this;

  eTypes.forEach(function (event) {
    if(~this$1._.eventTypes.indexOf(event)) {
      that.events.push({
        eventType: event,
        callback: callback
      });
    } else {
      throw (event + " is not in eventTypes!\n Please use event in " + (this$1._.eventTypes));
    }
  });

  return this;
};

// whether pointer is inner this shape
Display.prototype.isPointInner = function isPointInner$1 (x, y) {
  return isPointInner.bind(this)(x, y);
};

Display.prototype.config = function config (obj) {
  if(Object.prototype.toString.call(obj) !== '[object Object]') {
    return;
  }
  if(obj.drag) {
    this.enableDrag = obj.drag;
  }
  if(obj.changeIndex) {
    this.enableChangeIndex = obj.changeIndex;
  }
  if(obj.fixed) {
    this.fixed = obj.fixed;
  }
  if(obj.bg) {
    this.isBg = obj.bg;
  }
  // Whether the graphic is animating drawn
  if(obj.cliping) {
    this.cliping = obj.cliping;
  }
  this.zindex = obj.zindex || 0;

  return this;
};

Display.prototype.animateTo = function animateTo (keys, configs) {
    var this$1 = this;
    if ( configs === void 0 ) configs = {};

  var data = {};
  var to = keys;
  var from = {};
  for (var key in to) {
    from[key] = this$1[key];
  }
  data.from = from;
  data.to = to;
  data.onUpdate = function (keys) {
    configs.onUpdate && configs.onUpdate(keys);
    for (var key in to) {
      this$1[key] = keys[key];
    }
  };
  for(var key$1 in configs) {
    if(key$1 !== 'onUpdate') {
      data[key$1] = configs[key$1];
    }
  }
  var tween = new Tween(data);
  this._.animationList.push(tween);
  this._.tick();

  return this;
};

// whether this shape can be dragged
Display.prototype.drag = function drag (bool) {
  this.enableDrag = bool;
};

// when select this shape, whether it should be changed the index
Display.prototype.changeIndex = function changeIndex (bool) {
  this.enableChangeIndex = bool;
};

function display(settings, _this) {
  var display = new Display(settings, _this);

  return Object.assign({}, display.commonData, {

    isDragging: false,

    hasEnter: false,

    hasDraggedIn: false,

    on: display.on,

    animateTo: display.animateTo,

    isPointInner: display.isPointInner,

    config: display.config,

    _: display._,

    isShape: true,

    parent: null,

    // Need to be updated points when added to the group for the second time?
    forceUpdate: false,

    updated: false,

    getBounding: function getBounding$1$$1() {
      return getBounding(this.scaled_matrix, this.scaled_lineWidth);
    }

  });
}

/*!
 * @PengJiyuan
 *
 * Two-dimensional coordinate system
 * Matrix transformation
 */

/**
 * return 3x3 Matrix
 */
var PI = Math.PI;
var COS = Math.cos;
var SIN = Math.sin;
var ABS = Math.abs;

var createTransformMatrix = function (originMatrix, angle) {
  if ( originMatrix === void 0 ) originMatrix = [0, 0];

  var tx = originMatrix[0];
  var ty = originMatrix[1];
  var radian = - (PI / 180 * angle);

  return [
    [COS(radian), -SIN(radian), (1 - COS(radian)) * tx + ty * SIN(radian)],
    [SIN(radian), COS(radian), (1 - COS(radian)) * ty - tx * SIN(radian)],
    [0, 0, 1]
  ];
};

/**
 * a, b, c     x     a*x + b*y + c*1
 * d, e, f  *  y  =  d*x + e*y + f*1
 * g, h, i     1     g*x + h*y + i*1
 */
var getTransformMatrix = function (originMatrix, matrix, angle) {
  if ( angle === void 0 ) angle = 0;

  var t = createTransformMatrix(originMatrix, angle);
  var ret = [];
  matrix.forEach(function (m) {
    var pm = [m[0], m[1], 1];
    var tx = t[0][0] * pm[0] + t[0][1] * pm[1] + t[0][2] * pm[2];
    var ty = t[1][0] * pm[0] + t[1][1] * pm[1] + t[1][2] * pm[2];
    // t[2] = [0, 0, 1]; ignore.
    ret.push([ABS(tx) < 0.0000001 ? 0 : tx, ABS(ty) < 0.0000001 ? 0 : ty]);
  });
  return ret;
};

/**
 * Define some vars.
 * @includes: set {x, y, width, height, moveX, moveY...} to scaled_xxx.
 *            set {x, y, width, height} to matrix array.
 *            set origin point.
 */
var DefineScale = function(scale) {
  var this$1 = this;
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  args.forEach(function (a) {
    if(a === 'matrix') {
      this$1.scaled_matrix = this$1.matrix.map(function (m) { return m.map(function (n) { return n * scale; }); });
    } else {
      this$1[("scaled_" + a)] = this$1[a] * scale;
    }
  });
};

/**
 * @params: {x, y, width, height}
 * define matrix and origin point.
 */
var DefineMatrix = function(x, y, width, height, rotate) {
  this.matrix = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height]
  ];
  this.origin = [
    x + 0.5 * width,
    y + 0.5 * height
  ];
  this.scaled_matrix = getTransformMatrix(this.origin, this.matrix, rotate);
};

var arc = function(settings, _this) {
  var draw = function() {
    var canvas = _this.canvas;
    var scale = _this.scale;

    DefineScale.call(this, scale, 'x', 'y', 'width', 'height', 'moveX', 'moveY', 'radius');

    canvas.save();
    if(this.fixed) {
      canvas.translate(-_this.transX, -_this.transY);
    }
    canvas.translate(this.scaled_moveX, this.scaled_moveY);
    canvas.translate(this.scaled_x, this.scaled_y);
    canvas.beginPath();
    if(!isNaN(this.startAngle) && !isNaN(this.endAngle)) {
      canvas.arc(0, 0, this.scaled_radius, Math.PI / 180 * this.startAngle, Math.PI / 180 * this.endAngle, false);
      canvas.save();
      canvas.rotate(Math.PI / 180 * this.endAngle);
      canvas.moveTo(this.scaled_radius, 0);
      canvas.lineTo(0, 0);
      canvas.restore();
      canvas.rotate(Math.PI / 180 * this.startAngle);
      canvas.lineTo(this.scaled_radius, 0);
    } else {
      canvas.arc(0, 0, this.scaled_radius, 0, Math.PI*2);
    }
    if(this.style === 'fill') {
      canvas.fillStyle = this.color;
      canvas.fill();
    } else {
      canvas.strokeStyle = this.color;
      canvas.stroke();
    }
    canvas.closePath();
    canvas.restore();
  };

  return Object.assign({}, display(settings, _this), {
    type: 'arc',
    draw: draw,
    style: settings.style,
    startAngle: settings.startAngle,
    endAngle: settings.endAngle,
    radius: settings.radius,
    scaled_radius: settings.radius * _this.scale
  });
};

var image = function(settings, _this) {
  // insert into images
  if(settings.src) {
    !~_this.images.indexOf(settings.src) && _this.images.push(settings.src);
  }

  var draw = function() {
    var canvas = _this.canvas;
    var src = settings.src;
    var scale = _this.scale;

    DefineScale.call(this, scale, 'x', 'y', 'width', 'height', 'moveX', 'moveY');

    canvas.save();
    canvas.translate(this.scaled_moveX, this.scaled_moveY);
    if(this.fixed) {
      canvas.translate(-_this.transX, -_this.transY);
    }
    try {
      if(this.sliceWidth && this.sliceHeight) {
        canvas.drawImage(
          _this.loader.getImg(src),
          this.sliceX,
          this.sliceY,
          this.sliceWidth,
          this.sliceHeight,
          this.scaled_x,
          this.scaled_y,
          this.scaled_width,
          this.scaled_height
        );
      } else {
        canvas.drawImage(
          _this.loader.getImg(src),
          this.scaled_x,
          this.scaled_y,
          this.scaled_width,
          this.scaled_height
        );
      }
    } catch (error) {
      throw new Error('The picture is not loaded successfully, please check the picture url : ' + src);
    }
    canvas.restore();
  };

  return Object.assign({}, display(settings, _this), {
    type: 'rectangle',
    draw: draw,
    sliceWidth: settings.sliceWidth,
    sliceHeight: settings.sliceHeight,
    sliceX: settings.sliceX,
    sliceY: settings.sliceY
  });
};

var COLOR = '#555';
var LINE_WIDTH = 1;
var FONT_SIZE = 14;
var RADIUS = {
  tl: 0,
  tr: 0,
  bl: 0,
  br: 0
};

function clip(_this, canvas, scale) {
  if(_this.cliping) {
    var bounding = _this.getBounding();
    if(_this.cliping.column) {
      canvas.rect(bounding.lt[0], bounding.lt[1], bounding.rt[0] - bounding.lt[0], _this.boundingHeight * scale);
    } else {
      canvas.rect(bounding.lt[0], bounding.lt[1], _this.boundingWidth * scale, bounding.rb[1] - bounding.rt[1]);
    }
    canvas.clip();
  }
}

var line = function(settings, _this) {
  var totalLength;

  var draw = function() {
    var canvas = _this.canvas;
    var lineCap = settings.lineCap;
    var lineJoin = settings.lineJoin;
    var smooth = settings.smooth;
    var scale = _this.scale;

    if(this.matrix && this.matrix.length < 2) {
      throw 'The line needs at least two points';
    }

    this.scaled_matrix = this.matrix.map(function (m) { return m.map(function (n) { return n * scale; }); });
    DefineScale.call(this, scale, 'moveX', 'moveY', 'lineWidth');

    var matrix = this.scaled_matrix;

    canvas.save();
    canvas.translate(this.scaled_moveX, this.scaled_moveX);
    if(this.fixed) {
      canvas.translate(-_this.transX, -_this.transY);
    }

    // clip path
    clip(this, canvas, scale);

    canvas.beginPath();
    canvas.lineWidth = this.scaled_lineWidth;
    canvas.strokeStyle = this.color;
    canvas.lineDashOffset = this.offset;
    if(this.dash && utils.isArr(this.dash)) {
      canvas.setLineDash(this.dash);
    }
    if(lineCap) {
      canvas.lineCap = lineCap;
    }
    if(lineJoin) {
      canvas.lineJoin = lineJoin;
    }
    if(smooth) {
      var getCtrlPoint = function(ps, i, a, b) {
        var pAx, pAy, pBx, pBy;
        if(!a || !b) {
          a = 0.25;
          b = 0.25;
        }
        if( i < 1) {
          pAx = ps[0][0] + (ps[1][0] - ps[0][0]) * a;
          pAy = ps[0][1] + (ps[1][1] - ps[0][1]) * a;
        } else {
          pAx = ps[i][0] + (ps[i + 1][0] - ps[i - 1][0])*a;
          pAy = ps[i][1] + (ps[i + 1][1] - ps[i - 1][1])*a;
        }
        if(i > ps.length-3) {
          var last = ps.length - 1;
          pBx = ps[last][0] - (ps[last][0] - ps[last - 1][0]) * b;
          pBy = ps[last][1] - (ps[last][1] - ps[last - 1][1]) * b;
        } else {
          pBx = ps[i + 1][0] - (ps[i + 2][0] - ps[i][0]) * b;
          pBy = ps[i + 1][1] - (ps[i + 2][1] - ps[i][1]) * b;
        }
        return {
          pA:{x: pAx, y: pAy},
          pB:{x: pBx, y: pBy}
        };
      };
      for(var i = 0; i < matrix.length; i++) {
        if(i === 0) {
          canvas.moveTo(matrix[i][0], matrix[i][1]);
        } else {
          var cMatrix = getCtrlPoint(matrix, i - 1);
          canvas.bezierCurveTo(cMatrix.pA.x, cMatrix.pA.y, cMatrix.pB.x, cMatrix.pB.y, matrix[i].x, matrix[i].y);
        }
      }
    } else {
      matrix.forEach(function(point, i) {
        i === 0 ? canvas.moveTo(point[0], point[1]) : canvas.lineTo(point[0], point[1]);
      });
    }
    canvas.stroke();
    canvas.closePath();
    canvas.restore();
  };

  return Object.assign({}, display(settings, _this), {
    type: 'line',
    draw: draw,
    totalLength: totalLength,
    lineWidth: settings.lineWidth || 1,
    dash: settings.dash,
    offset: settings.offset || 0,
    color: settings.color || COLOR,
    matrix: settings.matrix,
    scaled_matrix: settings.matrix
  });
};

var rectangle = function(settings, _this) {
  var draw = function() {
    var canvas = _this.canvas;
    var scale = _this.scale;

    DefineScale.call(this, scale, 'x', 'y', 'width', 'height', 'moveX', 'moveY');
    DefineMatrix.call(this, this.scaled_x, this.scaled_y, this.scaled_width, this.scaled_height, this.rotate);

    canvas.save();
    canvas.translate(this.scaled_moveX, this.scaled_moveY);

    if(this.fixed) {
      canvas.translate(-_this.transX, -_this.transY);
    }
    // clip path
    clip(this, canvas, scale);

    canvas.beginPath();
    var matrix = this.scaled_matrix;
    var radius = this.radius;

    canvas.moveTo(matrix[0][0] + radius.tl * scale, matrix[0][1]);
    canvas.lineTo(matrix[1][0] - radius.tr * scale, matrix[0][1]);
    canvas.quadraticCurveTo(matrix[1][0], matrix[0][1], matrix[1][0], matrix[0][1] + radius.tr * scale);
    canvas.lineTo(matrix[1][0], matrix[2][1] - radius.br * scale);
    canvas.quadraticCurveTo(matrix[1][0], matrix[2][1], matrix[1][0] - radius.br * scale, matrix[2][1]);
    canvas.lineTo(matrix[0][0] + radius.bl * scale, matrix[2][1]);
    canvas.quadraticCurveTo(matrix[0][0], matrix[2][1], matrix[0][0], matrix[2][1] - radius.bl * scale);
    canvas.lineTo(matrix[0][0], matrix[0][1] + radius.tl * scale);
    canvas.quadraticCurveTo(matrix[0][0], matrix[0][1], matrix[0][0] + radius.tl * scale, matrix[0][1]);

    if(this.style !== 'stroke') {
      canvas.fillStyle = this.color || COLOR;
      canvas.fill();
    } else {
      canvas.strokeStyle = this.color || COLOR;
      canvas.lineWidth = this.lineWidth;
      canvas.stroke();
    }
    canvas.closePath();
    canvas.restore();
  };

  return Object.assign({}, display(settings, _this), {
    type: 'polygon',
    draw: draw,
    rotate: !settings.radius ? settings.rotate : 0,
    radius: settings.radius || RADIUS
  });
};

var text = function(settings, _this) {
  // insert into images
  if(settings.background && settings.background.img) {
    !~_this.images.indexOf(settings.background.img) && _this.images.push(settings.background.img);
  }

  function text_ellipsis(ctx, str, maxWidth) {
    var width = ctx.measureText(str).width,
      ellipsis = '...',
      ellipsisWidth = ctx.measureText(ellipsis).width;

    if (width <= maxWidth || width <= ellipsisWidth) {
      return str;
    } else {
      var len = str.length;
      while (width >= maxWidth - ellipsisWidth && len-- > 0) {
        str = str.substring(0, len);
        width = ctx.measureText(str).width;
      }
      return str + ellipsis;
    }
  }

  var draw = function() {
    var canvas = _this.canvas;
    var scale = _this.scale;
    var center = settings.center;
    var fontFamily = settings.fontFamily || 'arial,sans-serif';
    var fontSize = settings.fontSize || FONT_SIZE;
    var fontWeight = settings.fontWeight || 400;
    var size = fontSize * scale;
    var font = "normal " + fontWeight + " " + size + "px " + fontFamily;

    DefineScale.call(this, scale, 'x', 'y', 'width', 'height', 'moveX', 'moveY', 'paddingTop', 'paddingLeft');

    var textWidth, ellipsisText;

    canvas.save();
    canvas.translate(this.scaled_moveX, this.scaled_moveY);
    if(this.fixed) {
      canvas.translate(-_this.transX, -_this.transY);
    }
    if(this.background) {
      if(this.background.color) {
        canvas.save();
        canvas.fillStyle = this.background.color;
        canvas.fillRect(this.scaled_x, this.scaled_y, this.scaled_width, this.scaled_height);
        canvas.restore();
      } else if(this.background.img) {
        canvas.drawImage(
          _this.loader.getImg(this.background.img),
          this.scaled_x,
          this.scaled_y,
          this.scaled_width,
          this.scaled_height
        );
      }
    }
    canvas.font = font;
    canvas.textBaseline = 'top';

    textWidth = canvas.measureText(this.text).width;
    ellipsisText = text_ellipsis(canvas, this.text, this.scaled_width - 8);

    if(this.style === 'stroke') {
      canvas.strokeStyle = this.color;
      if(center) {
        if(textWidth < this.scaled_width - 8) {
          canvas.strokeText(ellipsisText, this.scaled_x + this.scaled_paddingLeft + (this.scaled_width - textWidth - 8)/2, this.scaled_y + this.scaled_paddingTop);
        }
      } else {
        canvas.strokeText(ellipsisText, this.scaled_x + this.scaled_paddingLeft, this.scaled_y + this.scaled_paddingTop);
      }
    } else {
      canvas.fillStyle = this.color;
      if(center) {
        if(textWidth < this.scaled_width - 8) {
          canvas.fillText(ellipsisText, this.scaled_x + this.scaled_paddingLeft + (this.scaled_width - textWidth - 8)/2, this.scaled_y + this.scaled_paddingTop);
        }
      } else {
        canvas.fillText(ellipsisText, this.scaled_x + this.scaled_paddingLeft, this.scaled_y + this.scaled_paddingTop);
      }
    }
    canvas.restore();
  };

  return Object.assign({}, display(settings, _this), {
    type: 'rectangle',
    draw: draw,
    color: settings.color || COLOR,
    background: settings.background,
    text: settings.text || 'no text',
    style: settings.style || 'fill',
    paddingTop: settings.paddingTop || 0,
    paddingLeft: settings.paddingLeft || 0
  });
};

var polygon = function(settings, _this) {
  var draw = function() {
    var canvas = _this.canvas;
    var scale = _this.scale;

    DefineScale.call(this, scale, 'moveX', 'moveY', 'matrix', 'lineWidth');

    var matrix = this.scaled_matrix;

    canvas.save();
    canvas.translate(this.scaled_moveX, this.scaled_moveY);
    if(this.fixed) {
      canvas.translate(-_this.transX, -_this.transY);
    }
    // clip path
    canvas.beginPath();
    clip(this, canvas, scale);
    canvas.closePath();
    canvas.beginPath();

    matrix.forEach(function (point, i) {
      i === 0 ? canvas.moveTo(point[0], point[1]) : canvas.lineTo(point[0], point[1]);
    });
    canvas.lineTo(matrix[0][0], matrix[0][1]);

    if(this.style === 'fill') {
      canvas.fillStyle = this.color;
      canvas.fill();
    } else {
      canvas.strokeStyle = this.color;
      canvas.lineWidth = this.scaled_lineWidth;
      canvas.stroke();
    }
    canvas.closePath();
    canvas.restore();
  };

  return Object.assign({}, display(settings, _this), {
    type: 'polygon',
    draw: draw,
    style: settings.style || 'fill',
    color: settings.color || COLOR,
    lineWidth: settings.lineWidth || 1,
    matrix: settings.matrix,
    scaled_matrix: settings.matrix
  });
};

var shapes = {
  arc: arc,
  image: image,
  line: line,
  rectangle: rectangle,
  text: text,
  polygon: polygon
};

/**
 * A group is a container that can be inserted into child nodes
 */

// import getBounding from './bounding';
var group = function(settings, _this) {
  var draw = function() {
    var canvas = _this.canvas;
    var scale = _this.scale;

    DefineScale.call(this, scale, 'x', 'y', 'width', 'height', 'moveX', 'moveY');
    DefineMatrix.call(this, this.scaled_x, this.scaled_y, this.scaled_width, this.scaled_height);

    canvas.save();
    canvas.translate(this.scaled_moveX, this.scaled_moveY);

    if(this.fixed) {
      canvas.translate(-_this.transX, -_this.transY);
    }

    canvas.beginPath();
    var matrix = this.scaled_matrix;
    var radius = this.radius;

    canvas.moveTo(matrix[0][0] + radius.tl * scale, matrix[0][1]);
    canvas.lineTo(matrix[1][0] - radius.tr * scale, matrix[0][1]);
    canvas.quadraticCurveTo(matrix[1][0], matrix[0][1], matrix[1][0], matrix[0][1] + radius.tr * scale);
    canvas.lineTo(matrix[1][0], matrix[2][1] - radius.br * scale);
    canvas.quadraticCurveTo(matrix[1][0], matrix[2][1], matrix[1][0] - radius.br * scale, matrix[2][1]);
    canvas.lineTo(matrix[0][0] + radius.bl * scale, matrix[2][1]);
    canvas.quadraticCurveTo(matrix[0][0], matrix[2][1], matrix[0][0], matrix[2][1] - radius.bl * scale);
    canvas.lineTo(matrix[0][0], matrix[0][1] + radius.tl * scale);
    canvas.quadraticCurveTo(matrix[0][0], matrix[0][1], matrix[0][0] + radius.tl * scale, matrix[0][1]);

    if(utils.isObj(this.background)) {
      var bg = this.background;
      if(bg.color) {
        canvas.fillStyle = bg.color || COLOR;
        canvas.fill();
      }
    } else if(utils.isObj(this.border)) {
      var border = this.border;
      canvas.strokeStyle = border.color || COLOR;
      canvas.lineWidth = border.lineWidth || LINE_WIDTH;
      canvas.stroke();
    }
    canvas.closePath();
    var title = this.title;
    var size = title.fontSize || 14;
    var paddingTop = title.paddingTop || 4;
    var paddingLeft = title.paddingLeft || 2;
    if(title && typeof title === 'object') {
      canvas.fillStyle = '#000';
      canvas.textBaseline = 'top';
      canvas.font = "normal 400 " + (size * scale) + "px " + (title.fontFamily || 'arial,sans-serif');
      canvas.fillText(title.text, this.scaled_x + paddingLeft * scale, this.scaled_y + paddingTop * scale);
    }
    canvas.restore();
  };

  // update child's moveX and moveY
  var updateChild = function(child) {
    if(!child.updated || child.forceUpdate) {
      child.updated = true;
      child.moveX += child.parent.x;
      child.moveY += child.parent.y;
      child.enableChangeIndex = false;
      child.fixed = false;
      child.drag = false;
    }
  };

  /**
   * @param {Array} childs
   */
  var add = function(childs) {
    var this$1 = this;

    if(!utils.isArr(childs)) {
      throw 'The parameter must be an array';
    }
    if(!~this._.objects.indexOf(this)) {
      throw 'before add, please addChild the parent!';
    }
    childs.sort(function (a, b) { return a.zindex - b.zindex; });
    childs.forEach(function (child) {
      if(child.isShape) {
        child.parent = this$1;
        child.zindex = this$1.zindex + 0.1;
        updateChild(child);
        // group暂时不添加拖拽
        this$1.enableDrag = false;
        this$1.children.push(child);
      }
    });
    utils.insertArray(this._.objects, this._.objects.indexOf(this) + 1, 0, childs);
    this._._objects = utils.reverse(this._.objects);
  };

  var remove = function(child) {
    var index = this.children.indexOf(child);
    if(~index) {
      child.parent = null;
      this.children.splice(index, 1);
      this._.objects = this._.objects.filter(function (o) { return o !== child; });
      this._._objects = utils.reverse(this._.objects);
    }
  };

  return Object.assign({}, display(settings, _this), {
    type: 'group',
    draw: draw,
    background: settings.background,
    border: settings.border,
    radius: settings.radius || RADIUS,
    title: settings.title,
    children: [],
    add: add,
    remove: remove
  });
};

/**
 * Export for extend shapes.
 */




var ext = Object.freeze({
	display: display,
	DefineScale: DefineScale,
	DefineMatrix: DefineMatrix
});

var OMG = function OMG(config) {

  this.version = version;

  this.objects = [];

  this.transX = 0;

  this.transY = 0;

  this.deviceScale = 1;

  this.minDeviceScale = 0.5 * this.deviceScale;

  this.maxDeviceScale = 4 * this.deviceScale;

  this.scale = this.deviceScale;

  // the instance of image loader
  this.loader = null;

  this.prepareImage = config.prepareImage;

  this.pointerInnerArray = [];

  this.globalMousedown = void(0);

  this.globalMousemove = void(0);

  this.isDragging = false;

  this.Tween = Tween;

  this.animationList = [];

  this.animationId = null;

  this.animating = false;

  this.fpsFunc = null;

  this.fps = 0;

  this.fpsCacheTime = 0;

  // support event types
  this.eventTypes = [
    'mousedown',
    'mouseup',
    'mouseenter',
    'mouseleave',
    'mousemove',
    'drag',
    'dragend',
    'dragin',
    'dragout',
    'drop'
  ];

  this._event = new Event(this);

  this.color = new Color();

  this.element = config.element;

  this.canvas =this.element.getContext('2d');

  // init the width and height
  this.width = config.width;

  this.height = config.height;

  autoscale([this.element], {
    width: this.width,
    height: this.height,
    position: config.position || 'relative'
  });

  /**
   * @description: For extend shapes.
   *             Export functions to define scale and drag events...
   */
  this.ext = ext;

  this.clip = clip;

  // enable global drag event.
  this.enableGlobalTranslate = config.enableGlobalTranslate || false;

  // enable global scale event.
  this.enableGlobalScale = config.enableGlobalScale || false;

  // init images
  this.images = config.images || [];

  this.utils = utils;

  this.shapes = shapes;

};

OMG.prototype.init = function init () {
    var this$1 = this;

  Object.keys(this.shapes).forEach(function (shape) {
    this$1[shape] = function(settings) {
      return this.shapes[shape](settings, this);
    };
  });
  this.group = function(settings) {
    return group(settings, this);
  };
};

OMG.prototype.extend = function extend (ext) {
    var this$1 = this;

  for (var key in ext) {
    this$1.shapes[key] = ext[key];
  }
};

OMG.prototype.addChild = function addChild (child) {
  // multi or single
  if(utils.isArr(child)) {
    this.objects = this.objects.concat(child);
  } else {
    this.objects.push(child);
  }
  this.objects.sort(function (a, b) {
    return a.zindex - b.zindex;
  });
  // copy the reverse events array
  this._objects = utils.reverse(this.objects);
};

OMG.prototype.removeChild = function removeChild (child) {
  if(utils.isArr(child)) {
    this.objects = this.objects.filter(function (o) { return !~child.indexOf(o); });
  } else {
    this.objects = this.objects.filter(function (o) { return o !== child; });
  }
  this._objects = utils.reverse(this.objects);
};

OMG.prototype.removeFirstChild = function removeFirstChild () {
  this.objects.pop();
  this._objects = utils.reverse(this.objects);
};

OMG.prototype.removeLastChild = function removeLastChild () {
  this.objects.shift();
  this._objects = utils.reverse(this.objects);
};

OMG.prototype.removeAllChilds = function removeAllChilds () {
  this.objects = [];
  this._objects = [];
};

OMG.prototype.imgReady = function imgReady () {
  this.loader = new ImageLoader();
  this.loader.addImg(this.images);
};

OMG.prototype.show = function show () {
  var _this = this;
  // dirty, ready to remove
  if(this.prepareImage) {
    this.imgReady();
    this.loader.ready(function () {
      _this.draw();
      _this._event.triggerEvents();
    });
  } else {
    this.draw();
    this._event.triggerEvents();
  }
};

OMG.prototype.draw = function draw () {
  this.objects.forEach(function (item) {
    item.draw();
  });
};

OMG.prototype.redraw = function redraw () {
  this.clear();
  this.canvas.save();
  this.canvas.translate(this.transX, this.transY);
  this.draw();
  this.canvas.restore();
};

OMG.prototype.clear = function clear () {
  this.canvas.clearRect(0, 0, this.width, this.height);
};

OMG.prototype.tick = function tick () {
    var this$1 = this;

  var func = function () {
    if(this$1.fpsFunc) {
      var now = Date.now();
      if(now - this$1.fpsCacheTime >= 1000) {
        this$1.fpsFunc(this$1.fps);
        this$1.fps = 0;
        this$1.fpsCacheTime = now;
      } else {
        this$1.fps++;
      }
    }
    this$1.animationList.forEach(function (t, i) {
      // if finished, remove it
      if(t.finished) {
        this$1.animationList.splice(i--, 1);
      } else if(t.update) {
        t.update();
      } else {
        t();
      }
    });
    this$1.redraw();
    if(this$1.animationList.length === 0 && this$1.animating) {
      this$1.animating = false;
      cancelAnimationFrame(this$1[this$1.animationId]);
    } else {
      this$1[this$1.animationId] = requestAnimationFrame(func);
    }
  };
  if(this.animationList.length > 0 && !this.animating) {
    this.animating = true;
    this.animationId = Date.now();
    func();
  }
  return this.animationId;
};

/**
 * @param {func | Function}
 * The func you get the fps and do something.
 *
 * eg.
 * stage.fpsOn(function(fps) {
 * console.log(fps);
 * });
 */
OMG.prototype.fpsOn = function fpsOn (func) {
  this.fpsFunc = func;
  this.fpsCacheTime = Date.now();
};

// fps off
OMG.prototype.fpsOff = function fpsOff () {
  this.fpsFunc = null;
  this.fps = 0;
};

// add an animation to animationList.
OMG.prototype.animate = function animate (func) {
  this._event.triggerEvents();
  this.animationList.push(func);
  this.tick();
};

// clear all animations, includes global animation and shape animations.
OMG.prototype.clearAnimation = function clearAnimation () {
  this.animationList = [];
  this.animating = false;
  cancelAnimationFrame(this[this.animationId]);
};

// get current version
OMG.prototype.getVersion = function getVersion () {
  return this.version;
};

// global mousedown event.
OMG.prototype.mousedown = function mousedown (func) {
  this.globalMousedown = func;
};

// global mousemove event
OMG.prototype.mousemove = function mousemove (func) {
  this.globalMousemove = func;
};

/**
 *
 * @param {Object} opt
 *
 * @param {Function} opt.width- width after resize
 * @param {Function} opt.height - height after resize
 * @param {Function} opt.resize - callback triggered after resize
 */
OMG.prototype.resize = function resize (opt) {
    var this$1 = this;

  var update = function () {
    this$1.width = opt.width();
    this$1.height = opt.height();
    autoscale([this$1.element], {
      width: this$1.width,
      height: this$1.height,
      position: 'absolute'
    });
    this$1.redraw();
  };
  if(!window.onresize) {
    utils.bind(window, 'resize', function () {
      if(opt.resize) {
        opt.resize(update);
      } else {
        update();
      }
    });
  }
};

var index = function (config) {
  return new OMG(config);
};

return index;

})));
