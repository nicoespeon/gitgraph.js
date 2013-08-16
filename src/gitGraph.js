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

  // Canvas init
  this.canvas = document.getElementById(this.elementId);
  this.context = this.canvas.getContext('2d');
  this.origin = options.origin || this.canvas.height - 10;

  // Navigations vars
  this.HEAD = null;
  this.branchs = [];
  this.commitOffset = 0;

  // Error: no render()
  this.context.fillStyle = 'red';
  this.context.font = 'bold 15pt Calibri';
  this.context.fillText('Error: No render() at the end', 150, 100);
}

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

GitGraph.prototype.commit = function (options) {
  this.HEAD.commit(options);
}

GitGraph.prototype.render = function () {
  // Clear All
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Render
  for (var i = 0; i < this.branchs.length; i++) {
    this.branchs[i].updateSize();
    this.branchs[i].draw();
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
  console.log('[' + this.name + '] column:' + this.column);
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
  this.date = options.date || new Date().toUTCString();
  this.sha1 = Sha1.hash(options.message + new String(new Date().getTime()));
  this.context = options.context;
  this.color = options.color || "red";
  this.radius = options.size || 3;
  this.x = options.x;
  this.y = options.y;
}

Commit.prototype.draw = function () {
  this.context.beginPath();
  this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
  this.context.fillStyle = this.color;
  this.context.fill();
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  SHA-1 implementation in JavaScript | (c) Chris Veness 2002-2010 | www.movable-type.co.uk      */
/*   - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                             */
/*         http://csrc.nist.gov/groups/ST/toolkit/examples.html                                   */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Sha1 = {}; // Sha1 namespace

/**
 * Generates SHA-1 hash of string
 *
 * @param {String} msg                String to be hashed
 * @param {Boolean} [utf8encode=true] Encode msg as UTF-8 before generating hash
 * @returns {String}                  Hash of msg as hex character string
 */
Sha1.hash = function (msg, utf8encode) {
  utf8encode = (typeof utf8encode == 'undefined') ? true : utf8encode;

  // convert string to UTF-8, as SHA only deals with byte-streams
  if (utf8encode) msg = Utf8.encode(msg);

  // constants [§4.2.1]
  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];

  // PREPROCESSING 

  msg += String.fromCharCode(0x80); // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

  // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
  var l = msg.length / 4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
  var N = Math.ceil(l / 16); // number of 16-integer-blocks required to hold 'l' ints
  var M = new Array(N);

  for (var i = 0; i < N; i++) {
    M[i] = new Array(16);
    for (var j = 0; j < 16; j++) { // encode 4 chars per integer, big-endian encoding
      M[i][j] = (msg.charCodeAt(i * 64 + j * 4) << 24) | (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) |
        (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) | (msg.charCodeAt(i * 64 + j * 4 + 3));
    } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
  }
  // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
  // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
  // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
  M[N - 1][14] = ((msg.length - 1) * 8) / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14])
  M[N - 1][15] = ((msg.length - 1) * 8) & 0xffffffff;

  // set initial hash value [§5.3.1]
  var H0 = 0x67452301;
  var H1 = 0xefcdab89;
  var H2 = 0x98badcfe;
  var H3 = 0x10325476;
  var H4 = 0xc3d2e1f0;

  // HASH COMPUTATION [§6.1.2]

  var W = new Array(80);
  var a, b, c, d, e;
  for (var i = 0; i < N; i++) {

    // 1 - prepare message schedule 'W'
    for (var t = 0; t < 16; t++) W[t] = M[i][t];
    for (var t = 16; t < 80; t++) W[t] = Sha1.ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);

    // 2 - initialise five working variables a, b, c, d, e with previous hash value
    a = H0;
    b = H1;
    c = H2;
    d = H3;
    e = H4;

    // 3 - main loop
    for (var t = 0; t < 80; t++) {
      var s = Math.floor(t / 20); // seq for blocks of 'f' functions and 'K' constants
      var T = (Sha1.ROTL(a, 5) + Sha1.f(s, b, c, d) + e + K[s] + W[t]) & 0xffffffff;
      e = d;
      d = c;
      c = Sha1.ROTL(b, 30);
      b = a;
      a = T;
    }

    // 4 - compute the new intermediate hash value
    H0 = (H0 + a) & 0xffffffff; // note 'addition modulo 2^32'
    H1 = (H1 + b) & 0xffffffff;
    H2 = (H2 + c) & 0xffffffff;
    H3 = (H3 + d) & 0xffffffff;
    H4 = (H4 + e) & 0xffffffff;
  }

  return Sha1.toHexStr(H0) + Sha1.toHexStr(H1) +
    Sha1.toHexStr(H2) + Sha1.toHexStr(H3) + Sha1.toHexStr(H4);
}

//
// function 'f' [§4.1.1]
//
Sha1.f = function (s, x, y, z) {
  switch (s) {
  case 0:
    return (x & y) ^ (~x & z); // Ch()
  case 1:
    return x ^ y ^ z; // Parity()
  case 2:
    return (x & y) ^ (x & z) ^ (y & z); // Maj()
  case 3:
    return x ^ y ^ z; // Parity()
  }
}

//
// rotate left (circular left shift) value x by n positions [§3.2.5]
//
Sha1.ROTL = function (x, n) {
  return (x << n) | (x >>> (32 - n));
}

//
// hexadecimal representation of a number 
//   (note toString(16) is implementation-dependant, and  
//   in IE returns signed numbers when used on full words)
//
Sha1.toHexStr = function (n) {
  var s = "",
    v;
  for (var i = 7; i >= 0; i--) {
    v = (n >>> (i * 4)) & 0xf;
    s += v.toString(16);
  }
  return s;
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
/*              single-byte character encoding (c) Chris Veness 2002-2010                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Utf8 = {}; // Utf8 namespace

/**
 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
 * (BMP / basic multilingual plane only)
 *
 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
 *
 * @param {String} strUni Unicode string to be encoded as UTF-8
 * @returns {String} encoded string
 */
Utf8.encode = function (strUni) {
  // use regular expressions & String.replace callback function for better efficiency 
  // than procedural approaches
  var strUtf = strUni.replace(
    /[\u0080-\u07ff]/g, // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz

  function (c) {
    var cc = c.charCodeAt(0);
    return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
  });
  strUtf = strUtf.replace(
    /[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz

  function (c) {
    var cc = c.charCodeAt(0);
    return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
  });
  return strUtf;
}

/**
 * Decode utf-8 encoded string back into multi-byte Unicode characters
 *
 * @param {String} strUtf UTF-8 string to be decoded back to Unicode
 * @returns {String} decoded string
 */
Utf8.decode = function (strUtf) {
  // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
  var strUni = strUtf.replace(
    /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, // 3-byte chars

  function (c) { // (note parentheses for precence)
    var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
    return String.fromCharCode(cc);
  });
  strUni = strUni.replace(
    /[\u00c0-\u00df][\u0080-\u00bf]/g, // 2-byte chars

  function (c) { // (note parentheses for precence)
    var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
    return String.fromCharCode(cc);
  });
  return strUni;
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */