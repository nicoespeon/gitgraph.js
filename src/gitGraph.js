// --------------------------------------------------------------------
// ----------------------      GitGraph         -----------------------
// --------------------------------------------------------------------

function GitGraph(options) {
  // Options
  options = options || {};

  this.elementId = options.elementId || "gitGraph";
  this.template = options.template || new Template();
  this.author = options.author || 'Sergio Flores <saxo-guy@epic.com>';
  
  // Canvas init
  this.canvas = document.getElementById(this.elementId);
  this.context = this.canvas.getContext('2d');
  this.origin = options.origin || this.canvas.height - this.template.commit.dot.size * 2;

  // Navigations vars
  this.HEAD = null;
  this.branchs = [];

  // Utilities
  this.columnMax = 0; // nb of column for message position
  this.commitOffset = 0;

  // Error: no render()
  this.context.fillStyle = 'red';
  this.context.font = 'bold 15pt Calibri';
  this.context.fillText('Error: No render() at the end', 150, 100);
}

/**
 * Create new branch
 **/
GitGraph.prototype.branch = function (options) {
  // Options
  options = options || {};
  options.parent = this;
  options.parentBranch = options.parentBranch || this.HEAD;

  // Calcul origin of branch
  if (options.parentBranch instanceof Branch) {
    options.origin = options.parentBranch.origin - (options.parentBranch.commits.length) * this.template.commit.spacing;
  } else {
    options.origin = this.origin;
  }

  // Add branch
  var branch = new Branch(options);
  this.branchs.push(branch);

  // Return
  return branch;
}

/**
 * Commit on HEAD
 **/
GitGraph.prototype.commit = function (options) {
  this.HEAD.commit(options);
}

/**
 * Render the canvas
 **/
GitGraph.prototype.render = function () {
  // Clear All
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Render
  for (var i = 1; i <= this.branchs.length; i++) {
    this.branchs[this.branchs.length - i].updateSize();
    this.branchs[this.branchs.length - i].draw();
  }
}

// --------------------------------------------------------------------
// ----------------------        Branch         -----------------------
// --------------------------------------------------------------------

/**
 * Main Branch construtor
 *
 * @param {Object} options
 **/
function Branch(options) {
  // Options
  options = options || {};

  this.parent = options.parent;
  this.parentBranch = options.parentBranch;
  this.targetBranch = options.targetBranch;
  this.context = this.parent.context;
  this.template = this.parent.template;
  this.name = options.name || "no-name";
  this.origin = options.origin || 300;
  this.size = options.size || 10;
  this.lineWidth = this.template.branch.lineWidth;
  this.margin = this.template.branch.margin;

  // Calcul column number for auto-color & auto-offset
  this.column = 0;
  this.calculColumn();

  // Options with auto value
  this.offsetX = this.margin + this.column * this.margin;
  this.color = options.color || this.template.branch.color || this.template.colors[this.column];

  // Defaults values
  this.smoothOffset = this.template.commit.spacing; // Size of merge/fork portion
  this.commits = [];

  this.checkout();
}

/**
 * Draw the branch 
 **/
Branch.prototype.draw = function () {
  // Fork part
  if (this.parentBranch) {
    this.context.beginPath();
    this.context.moveTo(this.offsetX, this.origin);
    if (this.template.branch.mergeStyle == 'bezier') {
      this.context.bezierCurveTo(
        this.offsetX, this.origin + this.smoothOffset / 2,
        this.parentBranch.offsetX, this.origin + this.smoothOffset / 2,
        this.parentBranch.offsetX, this.origin + this.smoothOffset);
    } else {
      this.context.lineTo(this.parentBranch.offsetX, this.origin + this.smoothOffset);
    }
    this.context.lineWidth = this.lineWidth;
    this.context.strokeStyle = this.color;
    this.context.stroke()
  }

  // Main part
  this.context.beginPath();
  this.context.moveTo(this.offsetX, this.origin);
  this.context.lineTo(this.offsetX, this.origin - this.size);
  this.context.lineWidth = this.lineWidth;
  this.context.strokeStyle = this.color;
  this.context.stroke();

  // Merge part
  if (this.targetBranch) {
    this.context.beginPath();
    this.context.moveTo(this.offsetX, this.origin - this.size);
    if (this.template.branch.mergeStyle == 'bezier') {
      this.context.bezierCurveTo(
        this.offsetX, this.origin - this.size - this.smoothOffset / 2,
        this.targetBranch.offsetX, this.origin - this.size - this.smoothOffset / 2,
        this.targetBranch.offsetX, this.origin - this.size - this.smoothOffset);
    } else {
      this.context.lineTo(this.targetBranch.offsetX, this.origin - this.size - this.smoothOffset);
    }
    this.context.lineWidth = this.lineWidth;
    this.context.strokeStyle = this.color;
    this.context.stroke()
  }

  // Commits part
  for (var i = 0; i < this.commits.length; i++) {
    this.commits[i].draw();
  }
}

/**
 * Add a commit
 *
 * @param {Commit} commit
 **/
Branch.prototype.commit = function (options) {
  options = options || {};

  options.parent = this.parent;
  options.colorMessage = options.colorMessage || options.color || this.template.commit.message.color || null;
  options.colorDot = options.colorDot || options.color || this.template.commit.dot.color || null;
  options.color = options.color || this.template.commit.color || this.template.colors[this.column];
  options.x = this.offsetX;
  options.y = this.parent.origin - this.parent.commitOffset;
  options.arrowDisplay = (this.commits.length == 0 || options.type == 'mergeCommit') ? false : this.template.arrow.active;
  
  var commit = new Commit(options);
  this.commits.push(commit);

  this.parent.commitOffset += this.template.commit.spacing;
    
}

/**
 * Checkout onto this branch
 **/
Branch.prototype.checkout = function () {
  this.parent.HEAD = this;
}

/**
 * Merge branch
 *
 * @param {Branch} target (Default HEAD)
 * @param {boolean} mergeCommit
 **/
Branch.prototype.merge = function (target, mergeCommit) {
  // Merge
  this.targetBranch = target || this.parent.HEAD;

  // Update size of branch
  this.size = this.origin - (this.parent.origin - this.parent.commitOffset) - this.template.commit.spacing;

  // Optionnal Merge commit 
  mergeCommit = (typeof mergeCommit == 'boolean') ? mergeCommit : this.template.branch.mergeCommit;
  if (mergeCommit) {
    this.targetBranch.commit({
      message: "Merge branch '" + this.name + "' into " + this.targetBranch.name,
      type: 'mergeCommit'
    });
  }
}

/**
 * Update size of branch
 **/
Branch.prototype.updateSize = function () {
  if (this.targetBranch instanceof Branch == false)
    this.size = this.parent.commitOffset;
}

/**
 * Calcul column
 **/
Branch.prototype.calculColumn = function () {
  for (var i = 0; i < this.parent.branchs.length; i++) {
    this.parent.branchs[i].updateSize();
    if (this.parent.branchs[i].origin - this.parent.branchs[i].size <= this.origin)
      this.column++;
  }
  this.parent.columnMax = (this.column > this.parent.columnMax) ? this.column : this.parent.columnMax;
}

// --------------------------------------------------------------------
// ----------------------        Commit         -----------------------
// --------------------------------------------------------------------

/**
 * Main Commit construtor
 *
 * @param {Object} options
 **/
function Commit(options) {
  // Options
  options = options || {};

  this.parent = options.parent;
  this.template = this.parent.template;
  this.context = this.parent.context;
  this.author = options.author || this.parent.author;
  this.message = options.message || "He doesn't like George Michael! Boooo!";
  this.messageDisplay = options.messageDisplay || this.template.commit.message.display;
  this.date = options.date || new Date().toUTCString();
  this.sha1 = options.sha1 || (Math.random(100)).toString(16).substring(3, 10);
  this.colorMessage = options.colorMessage || options.color;
  this.colorDot = options.colorDot || options.color;
  this.radius = options.size || this.template.commit.dot.size;
  this.arrowDisplay = options.arrowDisplay;
  this.strokeWidth = options.strokeWidth || this.template.commit.dot.strokeWidth;
  this.strokeStyle = options.strokeStyle || this.template.commit.dot.strokeStyle;
  this.x = options.x;
  this.y = options.y;
}

Commit.prototype.draw = function () {
  // Dot
  this.context.beginPath();
  this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
  this.context.fillStyle = this.colorDot;
  this.context.strokeStyle = this.strokeStyle;
  this.context.lineWidth = this.strokeWidth;
  if(typeof(this.strokeWidth) == 'number') this.context.stroke();
  this.context.fill();
  this.context.closePath();

  // Arrow
  if (this.arrowDisplay) {
    this.arrow = new Arrow({
      parent: this.parent,
      x: this.x,
      y: this.y + this.radius + 2
    })
  }
  
  // Message
  if (this.messageDisplay) {
    var message = this.sha1 + ' ' + this.message + ' - ' + this.author;
    this.context.font = this.template.commit.message.font;
    this.context.fillStyle = this.colorMessage;
    this.context.fillText(message, (this.parent.columnMax + 2) * this.template.branch.margin, this.y + 3);
  }
}


// --------------------------------------------------------------------
// ----------------------        Arrow          -----------------------
// --------------------------------------------------------------------

function Arrow(options) {
  options = options || {};
  
  this.parent = options.parent;
  this.context = this.parent.context;
  this.template = this.parent.template.arrow;
  this.height = options.height || this.template.height;
  this.width = options.width || this.template.width;
  this.color = options.color || this.template.color;
  this.x = options.x;
  this.y = options.y;
  this.rotation = options.rotation;
  
  this.context.beginPath();
  this.context.fillStyle = this.color;
  this.context.moveTo(this.x + this.width, this.y + this.height); // Bottom left
  this.context.lineTo(this.x, this.y); // top
  this.context.lineTo(this.x - this.width, this.y + this.height); // Bottom right
  this.context.quadraticCurveTo(this.x, this.y + this.height / 2, this.x + this.width, this.y + this.height);
  this.context.fill();
}

// --------------------------------------------------------------------
// ----------------------       Template        -----------------------
// --------------------------------------------------------------------

function Template(options) {
  // Options
  options = options || {};
  options.branch = options.branch || {};
  options.arrow = options.arrow || {};
  options.commit = options.commit || {};
  options.commit.dot = options.commit.dot || {};
  options.commit.message = options.commit.message || {};
  
  this.colors = options.colors || ["#6963FF", "#47E8D4", "#6BDB52", "#E84BA5", "#FFA657"]; // One color for each column
  
  // Branch style
  this.branch = {};
  this.branch.color = options.branch.color || null; // Only one color
  this.branch.lineWidth = options.branch.lineWidth || 2;
  this.branch.smoothOffset = options.branch.smoothOffset || 50;
  this.branch.mergeStyle = options.branch.mergeStyle || 'bezier'; // 'bezier' | 'straight'
  this.branch.mergeCommit = options.branch.mergeCommit || true;
  this.branch.margin = options.branch.margin || 20; // Space between branchs

  // Arrow style
  this.arrow = {};
  this.arrow.height = options.arrow.height || null;
  this.arrow.width = options.arrow.width || null;
  this.arrow.color = options.arrow.color || this.branch.color || null;
  this.arrow.active = typeof(this.arrow.height) == 'number' && typeof(this.arrow.width) == 'number';

  // Commit style
  this.commit = {};
  this.commit.spacing = options.commit.spacing || 25;
  this.commit.color = options.commit.color || null; // Only one color, if null message takes branch color (full commit)
  
  this.commit.dot = {};
  this.commit.dot.color = options.commit.dot.color || null; // // Only one color, if null message takes branch color (only dot)
  this.commit.dot.size = options.commit.dot.size || 3;
  this.commit.dot.strokeWidth = options.commit.dot.strokeWidth || null;
  this.commit.dot.strokeStyle = options.commit.dot.strokeStyle || null;

  this.commit.message = {};
  this.commit.message.display = options.commit.message.display || true;
  this.commit.message.color = options.commit.message.color || null; // Only one color, if null message takes commit color (only message)
  this.commit.message.font = options.commit.message.font || 'normal 12pt Calibri';
}