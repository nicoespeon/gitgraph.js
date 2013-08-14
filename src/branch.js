var branchs = [];
/**
 * Main Branch construtor
 *
 * @param {Object} options
 **/
function Branch(options) {
  // Options
  this.context = options.context || null;
  this.name = options.name || "no name";
  this.color = options.color || "red";
  this.origin = options.origin || 0;
  this.size = options.size || 400;
  this.lineWidth = options.lineWidth || 2;
  
  // Defaults values
  this.merge = false;
  this.smoothOffset = 50; // Size of merge/fork portion
  
  // Auto offset
  this.offsetX = 20;
  this.autoOffsetX();

  if (options.parent) {
    this.parent = options.parent;
    this.drawFork();
  }

  this.drawMain();
  
  branchs.push(this);
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
  
  this.merge = true;
}

/**
 * Auto position the branch in function of others
 **/
Branch.prototype.autoOffsetX = function () {
  for (var i = 0; i < branchs.length; i++ ) {
    if (branchs[i].origin - branchs[i].size - branchs[i].smoothOffset * 2 < this.origin)
      this.offsetX += 20;
  }
  
}