/**
 * A group is a container that can be inserted into child nodes
 */

import { display } from '../display';
import { COLOR, LINE_WIDTH} from '../data/default';
import { DefineScale, DefineMatrix } from '../data/define';
// import getBounding from './bounding';
import utils from '../utils/helpers';

export default function(settings, _this) {
  const draw = function() {
    const canvas = _this.canvas;
    const scale = _this.scale;

    DefineScale.call(this, scale, 'x', 'y', 'width', 'height', 'moveX', 'moveY');
    DefineMatrix.call(this, this.scaled_x, this.scaled_y, this.scaled_width, this.scaled_height);

    canvas.save();
    canvas.translate(this.scaled_moveX, this.scaled_moveY);

    if(this.fixed) {
      canvas.translate(-_this.transX, -_this.transY);
    }
    canvas.beginPath();

    this.scaled_matrix.forEach((point, i) => {
      i === 0 ? canvas.moveTo(point[0], point[1]) : canvas.lineTo(point[0], point[1]);
    });
    canvas.lineTo(this.scaled_matrix[0][0], this.scaled_matrix[0][1]);

    if(utils.isObj(this.background)) {
      const bg = this.background;
      if(bg.color) {
        canvas.fillStyle = bg.color || COLOR;
        canvas.fill();
      }
    } else if(utils.isObj(this.border)) {
      const border = this.border;
      canvas.strokeStyle = border.color || COLOR;
      canvas.lineWidth = border.lineWidth || LINE_WIDTH;
      canvas.stroke();
    }
    canvas.closePath();
    canvas.restore();
  };

  // update child's moveX and moveY
  const updateChild = function(child) {
    child.moveX += child.parent.x;
    child.moveY += child.parent.y;
    child.enableChangeIndex = false;
    child.fixed = false;
    child.drag = false;
  };

  /**
   * @param {Array} childs 
   */
  const add = function(childs) {
    if(!utils.isArr(childs)) {
      throw 'The parameter must be an array';
    }
    if(!~this._.objects.indexOf(this)) {
      throw 'before add, please addChild the parent!';
    }
    childs.sort((a, b) => a.zindex - b.zindex);
    childs.forEach(child => {
      if(child.isShape) {
        child.parent = this;
        child.zindex = this.zindex + 0.1;
        updateChild(child);
        // group暂时不添加拖拽
        this.enableDrag = false;
        this.children.push(child);
      }
    });
    utils.insertArray(this._.objects, this._.objects.indexOf(this) + 1, 0, childs);
  };

  const remove = function(child) {
    const index = this.children.indexOf(child);
    if(~index) {
      child.parent = null;
      this.children.splice(index, 1);
      this._.objects = this._.objects.filter(o => o !== child);
      this._._objects = utils.reverse(this._.objects);
    }
  };

  return Object.assign({}, display(settings, _this), {
    type: 'group',
    draw,
    background: settings.background,
    border: settings.border,
    children: [],
    add,
    remove
  });
}