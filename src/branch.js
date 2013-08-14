/**
 * Main Branch construtor
 *
 * @param {Object} options
 **/
function Branch(options) {
  this.context = options.context || null;
  this.name = options.name || "no name";
  this.offsetX = options.offsetX || 0;
  this.color = options.color || "red";
  this.origin = options.origin || 0;
  this.size = options.size || 400;
  this.lineWidth = options.lineWidth || 2;
  
  this.smoothOffset = 50; // Size of merge/fork portion

  if (options.parent) {
    this.parent = options.parent;
    this.drawFork();
  }

  this.drawMain();
}

/**
 * Draw Bezier curve between parent branch and this branch
 **/
Branch.prototype.drawFork = function () {
  this.context.beginPath();
  this.context.moveTo(this.offsetX, this.origin);
  this.context.bezierCurveTo(
    this.offsetX, this.origin + this.smoothOffset / 2,
    this.parent.offsetX, this.origin + this.smoothOffset / 2,
    this.parent.offsetX, this.origin + this.smoothOffset);
  this.context.lineWidth = this.lineWidth;
  this.context.strokeStyle = this.color;
  this.context.stroke()
}

/**
 * Draw Line for main part of branch 
 **/
Branch.prototype.drawMain = function () {
  this.context.beginPath();
  this.context.moveTo(this.offsetX, this.origin);
  this.context.lineTo(this.offsetX, this.origin - this.size);
  this.context.lineWidth = this.lineWidth;
  this.context.strokeStyle = this.color;
  this.context.stroke();
}

/**
 * Draw Bezier curve between this branch and merged branch
 **/
Branch.prototype.drawMerge = function () {
  this.context.beginPath();
  this.context.moveTo(this.offsetX, this.origin - this.size);
  this.context.bezierCurveTo(
    this.offsetX, this.origin - this.size - this.smoothOffset / 2,
    this.parent.offsetX, this.origin - this.size - this.smoothOffset / 2,
    this.parent.offsetX, this.origin - this.size - this.smoothOffset);
  this.context.lineWidth = this.lineWidth;
  this.context.strokeStyle = this.color;
  this.context.stroke()
}