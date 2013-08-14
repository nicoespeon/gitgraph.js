var branchs = [];
var colors = ["green", "blue", "red", "purple"];

/**
 * Main Branch construtor
 *
 * @param {Object} options
 **/
function Branch(options) {
  
  // Options
  this.context = options.context || null;
  this.name = options.name || "no name";
  this.origin = options.origin || 0;
  this.size = options.size || 400;
  this.lineWidth = options.lineWidth || 2;
  
  // Calcul column number for auto-color & auto-offset
  this.column = 0;
  this.calculColumn();
  
  // Options with auto value
  this.offsetX = options.offsetX || 20 + this.column * 20;
  this.color = options.color || colors[this.column];
  
  // Defaults values
  this.merge = false;
  this.smoothOffset = 50; // Size of merge/fork portion
  
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
 * Calcul column
 **/
Branch.prototype.calculColumn = function () {
  for (var i = 0; i < branchs.length; i++ ) {
    if (branchs[i].origin - branchs[i].size - branchs[i].smoothOffset * 2 < this.origin)
      this.column++;
  }
  console.log(this.column);
}