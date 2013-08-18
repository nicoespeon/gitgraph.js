// --------------------------------------------------------------------
// ----------------------      GitGraph         -----------------------
// --------------------------------------------------------------------

function GitGraph(options) {
  // Options
  options = options || {};

  this.elementId = options.elementId || "gitGraph";
  this.colors = options.colors || ["#6963FF", "#47E8D4", "#6BDB52", "#E84BA5", "#FFA657"];
  this.commitsSpacing = options.commitsSpacing || 25;
  this.mergeCommit = options.mergeCommit || true;
  this.author = options.author || 'Sergio Flores <saxo-guy@epic.com>';
  this.messageDisplay = options.messageDisplay || true;

  // Canvas init
  this.canvas = document.getElementById(this.elementId);
  this.context = this.canvas.getContext('2d');
  this.origin = options.origin || this.canvas.height - 10;

  // Navigations vars
  this.HEAD = null;
  this.branchs = [];
  this.commitOffset = 0;

  // Utilities
  this.columnMax = 0;

  // Error: no render()
  this.context.fillStyle = 'red';
  this.context.font = 'bold 15pt Calibri';
  this.context.fillText('Error: No render() at the end', 150, 100);
}

/**
 * Create new branch
 **/
GitGraph.prototype.branch = function (options) {
  options = options || {};
  options.context = this.context;
  options.colors = this.colors;
  options.parentBranch = options.parentBranch || this.HEAD;

  // Calcul origin of branch
  if (options.parentBranch instanceof Branch) {
    options.origin = options.parentBranch.origin - (options.parentBranch.commits.length + 1) * this.commitsSpacing;
  } else {
    options.origin = this.origin;
  }

  options.parent = this;

  var branch = new Branch(options);
  this.branchs.push(branch);

  // Offset for first commit
  if (branch.parentBranch instanceof Branch && branch.column - branch.parentBranch.column == 1)
    this.commitOffset += this.commitsSpacing;

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
  this.context = options.context;
  this.name = options.name || "no-name";
  this.origin = options.origin || 300;
  this.size = options.size || 10;
  this.lineWidth = options.lineWidth || 2;

  // Calcul column number for auto-color & auto-offset
  this.column = 0;
  this.calculColumn();

  // Options with auto value
  this.offsetX = options.offsetX || 20 + this.column * 20;
  this.color = options.color || options.colors[this.column];

  // Defaults values
  this.smoothOffset = 50; // Size of merge/fork portion
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
    this.context.bezierCurveTo(
      this.offsetX, this.origin + this.smoothOffset / 2,
      this.parentBranch.offsetX, this.origin + this.smoothOffset / 2,
      this.parentBranch.offsetX, this.origin + this.smoothOffset);
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
    this.context.bezierCurveTo(
      this.offsetX, this.origin - this.size - this.smoothOffset / 2,
      this.targetBranch.offsetX, this.origin - this.size - this.smoothOffset / 2,
      this.targetBranch.offsetX, this.origin - this.size - this.smoothOffset);
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

  options.context = this.context;
  options.parent = this.parent;
  options.color = this.color;
  options.x = this.offsetX;
  options.y = this.parent.origin - this.parent.commitOffset;

  var commit = new Commit(options);
  this.commits.push(commit);

  this.parent.commitOffset += this.parent.commitsSpacing;
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
 * @param {Branch} target
 **/
Branch.prototype.merge = function (target, mergeCommit) {
  // Merge
  this.targetBranch = target || this.parent.HEAD;

  // Update size of branch
  this.size = this.parent.commitOffset - (this.parent.canvas.height - this.origin) - this.parent.commitsSpacing;

  // Optionnal Merge commit
  mergeCommit = (typeof mergeCommit == 'boolean') ? mergeCommit : this.parent.mergeCommit;
  if (mergeCommit) {
    this.targetBranch.commits.push(new Commit({
      message: "Merge branch '" + this.name + "' into " + this.targetBranch.name,
      context: this.context,
      parent: this.parent,
      color: this.targetBranch.color,
      x: this.targetBranch.offsetX,
      y: this.parent.origin - this.parent.commitOffset - 15
    }));
  }
  // Offset for futurs commits
  this.parent.commitOffset += this.smoothOffset;
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
    if (this.parent.branchs[i].origin - this.parent.branchs[i].size - this.parent.branchs[i].smoothOffset * 2 < this.origin)
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
  this.author = options.author || this.parent.author;
  this.message = options.message || "He doesn't like George Michael! Boooo!";
  this.messageDisplay = options.messageDisplay || this.parent.messageDisplay;
  this.date = options.date || new Date().toUTCString();
  this.sha1 = options.sha1 || (Math.random(100)).toString(16).substring(3, 10);
  this.context = options.context;
  this.color = options.color || "red";
  this.radius = options.size || 3;
  this.x = options.x;
  this.y = options.y;
}

Commit.prototype.draw = function () {
  // Dot
  this.context.beginPath();
  this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
  this.context.fillStyle = this.color;
  this.context.fill();
  this.context.closePath();

  // Arrow
  var arrowHeight = 10;
  var arrowWidth = 6;
  var arrowX = this.x;
  var arrowY = this.y + this.radius + 2;
  this.context.beginPath();
  this.context.moveTo(arrowX + arrowWidth, arrowY + arrowHeight); // Bottom left
  this.context.lineTo(arrowX, arrowY); // top
  this.context.lineTo(arrowX - arrowWidth, arrowY + arrowHeight); // Bottom right
  this.context.quadraticCurveTo(arrowX, arrowY + arrowHeight / 2, arrowX + arrowWidth, arrowY + arrowHeight)
  this.context.fill();

  // Message
  if (this.messageDisplay) {
    var message = this.sha1 + ' ' + this.message + ' - ' + this.author;
    this.context.font = 'normal 12pt Calibri';
    this.context.fillText(message, (this.parent.columnMax + 2) * 20, this.y + 3);
  }
}

// --------------------------------------------------------------------
// ----------------------       Template        -----------------------
// --------------------------------------------------------------------

function Template(options) {
  // Options
  options = options || {};
  
  // Branch style
  this.branch = {};
  this.branch.color = options.branch.color; // Only one color
  this.branch.colors = options.branch.colors; // One color for each column
  this.branch.lineWidth = options.branch.lineWidth;
  this.branch.smoothOffset = options.branch.smoothOffset;
  
  // Arrow
  this.arrow = {};
  this.arrow.arrowHeight = options.arrow.arrowHeight;
  this.arrow.arrowWidth = options.arrow.arrowWidth;
  
  // Commit style
  this.commit = {};
  this.commit.color = options.commit.color; // Only one color
  this.commit.colors = options.commit.colors; // One color for each column
  this.commit.size = options.commit.size;
  this.commit.strokeWidth = options.commit.strokeWidth;
  this.commit.strokeStyle = options.commit.strokeStyle;
  
  // Message style
  this.message = {};
  this.message.color = options.message.color; // Only one color
  this.message.colors = options.message.colors; // One color for each column
  this.message.font = options.message.font;
}