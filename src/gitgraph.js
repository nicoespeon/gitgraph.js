(function () {
  "use strict";

  /**
   * Emit an event on the given element.
   * @param {HTMLElement} element - DOM element to trigger the event on.
   * @param {String} eventName - Name of the triggered event.
   * @param {Object} [data={}] - Custom data to attach to the event.
   * @private
   */
  function _emitEvent ( element, eventName, data ) {
    var event;

    if ( document.createEvent ) {
      event = document.createEvent( "HTMLEvents" );
      event.initEvent( eventName, true, true );
    } else {
      event = document.createEventObject();
      event.eventType = eventName;
    }

    event.eventName = eventName;
    event.data = data || {};

    if ( document.createEvent ) {
      element.dispatchEvent( event );
    } else {
      element.fireEvent( "on" + event.eventType, event );
    }
  }

  /**
   * GitGraph
   *
   * @constructor
   *
   * @param {Object} options - GitGraph options
   * @param {String} [options.elementId = "gitGraph"] - Id of the canvas container
   * @param {Template|String|Object} [options.template] - Template of the graph
   * @param {String} [options.author = "Sergio Flores <saxo-guy@epic.com>"] - Default author for commits
   * @param {String} [options.mode = (null|"compact")]  - Display mode
   * @param {HTMLElement} [options.canvas] - DOM canvas (ex: document.getElementById("id"))
   * @param {String} [options.orientation = ("vertical-reverse"|"horizontal"|"horizontal-reverse")] - Graph orientation
   *
   * @this GitGraph
   **/
  function GitGraph ( options ) {
    // Options
    options = (typeof options === "object") ? options : {};
    this.elementId = (typeof options.elementId === "string") ? options.elementId : "gitGraph";
    this.author = (typeof options.author === "string") ? options.author : "Sergio Flores <saxo-guy@epic.com>";

    // Template management
    if ( (typeof options.template === "string")
      || (typeof options.template === "object")) {
      this.template = this.newTemplate( options.template );
    }
    else if (options.template instanceof Template) {
      this.template = options.template;
    }
    else {
      this.template = this.newTemplate( "metro" );
    }

    this.mode = options.mode || null;
    if ( this.mode === "compact" ) {
      this.template.commit.message.display = false;
    }
    this.marginX = this.template.commit.dot.size * 2;
    this.marginY = this.template.commit.dot.size * 2;
    this.offsetX = 0;
    this.offsetY = 0;

    // Orientation
    switch ( options.orientation ) {
    case "vertical-reverse" :
      this.template.commit.spacingY *= -1;
      this.orientation = "vertical-reverse";
      break;
    case "horizontal" :
      this.template.commit.message.display = false;
      this.template.commit.spacingX = this.template.commit.spacingY;
      this.template.branch.spacingY = this.template.branch.spacingX;
      this.template.commit.spacingY = 0;
      this.template.branch.spacingX = 0;
      this.orientation = "horizontal";
      break;
    case "horizontal-reverse" :
      this.template.commit.message.display = false;
      this.template.commit.spacingX = -this.template.commit.spacingY;
      this.template.branch.spacingY = this.template.branch.spacingX;
      this.template.commit.spacingY = 0;
      this.template.branch.spacingX = 0;
      this.orientation = "horizontal-reverse";
      break;
    default:
      this.orientation = "vertical";
      break;
    }

    // Canvas init
    this.canvas = document.getElementById( this.elementId ) || options.canvas;
    this.context = this.canvas.getContext( "2d" );

    // Tooltip layer
    this.tooltip = document.createElement( "div" );
    this.tooltip.className = "gitgraph-tooltip";
    this.tooltip.style.position = "fixed";
    this.tooltip.style.display = "none";

    // Add tooltip div into body
    document.body.appendChild( this.tooltip );

    // Navigation vars
    this.HEAD = null;
    this.branchs = [];
    this.commits = [];

    // Utilities
    this.columnMax = 0; // nb of column for message position
    this.commitOffsetX = 0;
    this.commitOffsetY = 0;

    // Bindings
    var mouseMoveOptions = {
      handleEvent: this.hover,
      gitgraph: this
    };
    this.canvas.addEventListener( "mousemove", mouseMoveOptions, false );

    // Render on window resize
    window.onresize = this.render.bind( this );
  }

  /**
   * Create new branch
   *
   * @param {(String | Object)} options - Branch name | Options of Branch
   *
   * @see Branch
   * @this GitGraph
   *
   * @return {Branch} New branch
   **/
  GitGraph.prototype.branch = function ( options ) {
    // Options
    if ( typeof options === "string" ) {
      var name = options;
      options = {};
      options.name = name;
    }

    options = (typeof options === "object") ? options : {};
    options.parent = this;
    options.parentBranch = options.parentBranch || this.HEAD;

    // Add branch
    var branch = new Branch( options );
    this.branchs.push( branch );

    // Return
    return branch;
  };

  /**
   * Create new orphan branch
   *
   * @param {(String | Object)} options - Branch name | Options of Branch
   *
   * @see Branch
   * @this GitGraph
   *
   * @return {Branch} New branch
   **/
  GitGraph.prototype.orphanBranch = function ( options ) {
    // Options
    if ( typeof options === "string" ) {
      var name = options;
      options = {};
      options.name = name;
    }

    options = (typeof options === "object") ? options : {};
    options.parent = this;

    // Add branch
    var branch = new Branch( options );
    this.branchs.push( branch );

    // Return
    return branch;
  };

  /**
   * Commit on HEAD
   *
   * @param {Object} options - Options of commit
   *
   * @see Commit
   * @this GitGraph
   *
   * @return {GitGraph} this - Return the main object so we can chain
   **/
  GitGraph.prototype.commit = function ( options ) {
    this.HEAD.commit( options );

    // Return the main object so we can chain
    return this;
  };

  /**
   * Create a new template
   *
   * @param {(String|Object)} options - The template name, or the template options
   *
   * @return {Template}
   **/
  GitGraph.prototype.newTemplate = function ( options ) {
    if ( typeof options === "string" ) {
      return new Template().get( options );
    }
    return new Template( options );
  };

  /**
   * Render the canvas
   *
   * @this GitGraph
   **/
  GitGraph.prototype.render = function () {
    var backingStorePixelRatio;
    var scalingFactor;

    // Account for high-resolution displays
    scalingFactor = 1;

    if ( window.devicePixelRatio ) {
      backingStorePixelRatio = this.context.webkitBackingStorePixelRatio ||
                               this.context.mozBackingStorePixelRatio ||
                               this.context.msBackingStorePixelRatio ||
                               this.context.oBackingStorePixelRatio ||
                               this.context.backingStorePixelRatio || 1;

      scalingFactor *= window.devicePixelRatio / backingStorePixelRatio;
    }

    // Resize canvas
    var unscaledResolution = {
      x: Math.abs( this.columnMax * this.template.branch.spacingX )
         + Math.abs( this.commitOffsetX )
         + this.marginX * 2,
      y: Math.abs( this.columnMax * this.template.branch.spacingY )
         + Math.abs( this.commitOffsetY )
         + this.marginY * 2
    };

    if ( this.template.commit.message.display ) {
      unscaledResolution.x += 800;
    }

    this.canvas.style.width = unscaledResolution.x + "px";
    this.canvas.style.height = unscaledResolution.y + "px";

    this.canvas.width = unscaledResolution.x * scalingFactor;
    this.canvas.height = unscaledResolution.y * scalingFactor;

    this.context.scale( scalingFactor, scalingFactor );

    // Clear All
    this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );

    // Add some margin
    this.context.translate( this.marginX, this.marginY );

    // Translate for inverse orientation
    if ( this.template.commit.spacingY > 0 ) {
      this.context.translate( 0, this.canvas.height - this.marginY * 2 );
      this.offsetY = this.canvas.height - this.marginY * 2;
    }
    if ( this.template.commit.spacingX > 0 ) {
      this.context.translate( this.canvas.width - this.marginX * 2, 0 );
      this.offsetX = this.canvas.width - this.marginX * 2;
    }

    // Render branchs
    for ( var i = this.branchs.length - 1, branch; !!(branch = this.branchs[ i ]); i-- ) {
      branch.render();
    }

    // Render commits after to put them on the foreground
    for ( var j = 0, commit; !!(commit = this.commits[ j ]); j++ ) {
      commit.render();
    }
  };

  /**
   * Hover event on commit dot
   *
   * @param {MouseEvent} event - Mouse event
   *
   * @self Gitgraph
   **/
  GitGraph.prototype.hover = function ( event ) {
    var self = this.gitgraph;
    var isOut = true;

    // Fix firefox MouseEvent
    if (typeof InstallTrigger !== 'undefined')/* == (is Firefox) */ { 
      event.offsetX = event.offsetX ? event.offsetX : event.layerX;
      event.offsetY = event.offsetY ? event.offsetY : event.layerY;
      event.x = event.x ? event.x : event.clientX;
      event.y = event.y ? event.y : event.clientY;
    }
    
    function showCommitTooltip () {
      self.tooltip.style.left = event.x + "px"; // TODO Scroll bug
      self.tooltip.style.top = event.y + "px";  // TODO Scroll bug
      self.tooltip.textContent = commit.sha1 + " - " + commit.message;
      self.tooltip.style.display = "block";
    }

    function emitMouseoverEvent () {
      var mouseoverEventOptions = {
        author: commit.author,
        message: commit.message,
        date: commit.date,
        sha1: commit.sha1
      };

      _emitEvent( self.canvas, "commit:mouseover", mouseoverEventOptions );
    }

    for ( var i = 0, commit; !!(commit = this.gitgraph.commits[ i ]); i++ ) {
      var distanceX = (commit.x + self.offsetX + self.marginX - event.offsetX);
      var distanceY = (commit.y + self.offsetY + self.marginY - event.offsetY);
      var distanceBetweenCommitCenterAndMouse = Math.sqrt( Math.pow( distanceX, 2 ) + Math.pow( distanceY, 2 ) );
      var isOverCommit = distanceBetweenCommitCenterAndMouse < self.template.commit.dot.size;

      if ( isOverCommit ) {
        if ( !self.template.commit.message.display ) {
          showCommitTooltip();
        }

        if ( !commit.isMouseover ) {
          emitMouseoverEvent();
        }

        isOut = false;
        commit.isMouseover = true;
      } else {
        commit.isMouseover = false;
      }
    }

    if ( isOut ) {
      self.tooltip.style.display = "none";
    }
  };

  // --------------------------------------------------------------------
  // -----------------------      Branch         ------------------------
  // --------------------------------------------------------------------

  /**
   * Branch
   *
   * @constructor
   *
   * @param {Object} options - Options of branch
   * @param {GitGraph} options.parent - GitGraph constructor
   * @param {Branch} [options.parentBranch] - Parent branch
   * @param {String} [options.name = "no-name"] - Branch name
   *
   * @this Branch
   **/
  function Branch ( options ) {
    // Check integrity
    if ( options.parent instanceof GitGraph === false ) {
      return;
    }

    // Options
    options = (typeof options === "object") ? options : {};
    this.parent = options.parent;
    this.parentBranch = options.parentBranch;
    this.name = (typeof options.name === "string") ? options.name : "no-name";
    this.context = this.parent.context;
    this.template = this.parent.template;
    this.lineWidth = options.lineWidth || this.template.branch.lineWidth;
    this.lineDash = options.lineDash || this.template.branch.lineDash;
    this.spacingX = this.template.branch.spacingX;
    this.spacingY = this.template.branch.spacingY;
    this.size = 0;
    this.height = 0;
    this.width = 0;
    this.commits = [];
    this.path = []; // Path to draw, this is an array of points {x, y, type("start"|"join"|"end")}

    // Column number calculation for auto-color & auto-offset
    this.column = 0;
    this.calculColumn();

    // Options with auto value
    this.offsetX = this.column * this.spacingX;
    this.offsetY = this.column * this.spacingY;

    this.color = options.color || this.template.branch.color || this.template.colors[ this.column ];

    // Checkout on this new branch
    this.checkout();
  }

  /**
   * Create new branch
   *
   * @param {(String | Object)} options - Branch name | Options of Branch
   *
   * @see Branch
   * @this Branch
   *
   * @return {Branch} New Branch
   **/
  Branch.prototype.branch = function ( options ) {
    // Options
    if ( typeof options === "string" ) {
      var name = options;
      options = {};
      options.name = name;
    }

    options = (typeof options === "object") ? options : {};
    options.parent = this.parent;
    options.parentBranch = options.parentBranch || this;

    // Add branch
    var branch = new Branch( options );
    this.parent.branchs.push( branch );

    // Return
    return branch;
  };

  /**
   * Render the branch
   *
   * @this Branch
   **/
  Branch.prototype.render = function () {
    this.context.beginPath();

    for ( var i = 0, point; !!(point = this.path[ i ]); i++ ) {
      if ( point.type === "start" ) {
        this.context.moveTo( point.x, point.y );
      } else {
        if ( this.template.branch.mergeStyle === "bezier" ) {
          var path = this.path[ i - 1 ];

          this.context.bezierCurveTo(
            path.x - this.template.commit.spacingX / 2, path.y - this.template.commit.spacingY / 2,
            point.x + this.template.commit.spacingX / 2, point.y + this.template.commit.spacingY / 2,
            point.x, point.y
          );
        } else {
          this.context.lineTo( point.x, point.y );
        }
      }
    }

    this.context.lineWidth = this.lineWidth;
    this.context.strokeStyle = this.color;
    if ( this.context.setLineDash !== undefined ) {
      this.context.setLineDash(this.lineDash);
    }
    this.context.stroke();
    this.context.closePath();
  };

  /**
   * Add a commit
   *
   * @param {(String | Object)} [options] - Message | Options of commit
   * @param {String} [options.detailId] - Id of detail DOM Element
   *
   * @see Commit
   *
   * @this Branch
   **/
  Branch.prototype.commit = function ( options ) {
    if ( typeof (options) === "string" ) {
      var message = options;
      options = { message: message };
    } else if ( typeof (options) !== "object" ) {
      options = {};
    }

    options.arrowDisplay = this.template.arrow.active;
    options.branch = this;
    options.color = options.color || this.template.commit.color || this.template.colors[ this.column ];
    options.parent = this.parent;
    options.parentCommit = options.parentCommit || this.commits.slice( -1 )[ 0 ];

    // Special compact mode
    if ( this.parent.mode === "compact"
         && this.parent.commits.slice( -1 )[ 0 ]
         && this.parent.commits.slice( -1 )[ 0 ].branch !== options.branch
         && options.branch.commits.length
         && options.type !== "mergeCommit" ) {
      this.parent.commitOffsetX -= this.template.commit.spacingX;
      this.parent.commitOffsetY -= this.template.commit.spacingY;
    }

    options.messageColor = options.messageColor || options.color || this.template.commit.message.color || null;
    options.dotColor = options.dotColor || options.color || this.template.commit.dot.color || null;
    options.x = this.offsetX - this.parent.commitOffsetX;
    options.y = this.offsetY - this.parent.commitOffsetY;

    // Detail
    var isVertical = this.parent.orientation === "vertical";
    var isNotCompact = this.parent.mode !== "compact";
    if ( typeof options.detailId === "string" && isVertical && isNotCompact ) {
      options.detail = document.getElementById( options.detailId );
    } else {
      options.detail = null;
    }

    // Check collision (Cause of special compact mode)
    var previousCommit = options.branch.commits.slice( -1 )[ 0 ] || {};
    var commitPosition = options.x + options.y;
    var previousCommitPosition = previousCommit.x + previousCommit.y;
    var isCommitAtSamePlaceThanPreviousOne = (commitPosition === previousCommitPosition);

    if ( isCommitAtSamePlaceThanPreviousOne ) {
      this.parent.commitOffsetX += this.template.commit.spacingX;
      this.parent.commitOffsetY += this.template.commit.spacingY;
      options.x = this.offsetX - this.parent.commitOffsetX;
      options.y = this.offsetY - this.parent.commitOffsetY;
    }

    // Fork case: Parent commit from parent branch
    if ( options.parentCommit instanceof Commit === false && this.parentBranch instanceof Branch ) {
      options.parentCommit = this.parentBranch.commits.slice( -1 )[ 0 ];
    }

    var commit = new Commit( options );
    this.commits.push( commit );

    // Add point(s) to path
    var point = {
      x: commit.x,
      y: commit.y,
      type: "join"
    };

    // First commit
    var isFirstBranch = commit.parentCommit instanceof Commit;
    var isPathBeginning = this.path.length === 0;
    if ( isFirstBranch && isPathBeginning ) {
      var parent = {
        x: commit.parentCommit.branch.offsetX - this.parent.commitOffsetX + this.template.commit.spacingX,
        y: commit.parentCommit.branch.offsetY - this.parent.commitOffsetY + this.template.commit.spacingY,
        type: "start"
      };
      this.path.push( JSON.parse( JSON.stringify( parent ) ) ); // Elegant way for cloning an object
      parent.type = "join";
      this.parentBranch.path.push( parent );
    } else if ( isPathBeginning ) {
      point.type = "start";
    }
    this.path.push( point );

    // Increment commitOffset for next commit position
    this.parent.commitOffsetX += this.template.commit.spacingX;
    this.parent.commitOffsetY += this.template.commit.spacingY;

    // Add height of detail div (normal vertical mode only)
    if ( commit.detail !== null ) {
      commit.detail.style.display = "block";
      this.parent.commitOffsetY -= commit.detail.clientHeight - 40;
    }

    // Auto-render
    this.parent.render();

    // Return the main object so we can chain
    return this;
  };

  /**
   * Checkout onto this branch
   *
   * @this Branch
   **/
  Branch.prototype.checkout = function () {
    this.parent.HEAD = this;
  };

  /**
   * Delete this branch
   *
   * @this Branch
   **/
  Branch.prototype.delete = function () {
    this.isfinish = true;
  };

  /**
   * Merge branch
   *
   * @param {Branch} [target = this.parent.HEAD]
   * @param {(String | Object)} [commitOptions] - Message | Options of commit
   *
   * @this Branch
   *
   * @return {Branch} this
   **/
  Branch.prototype.merge = function ( target, commitOptions ) {
    // Merge target
    var targetBranch = target || this.parent.HEAD;

    // Check integrity of target
    if ( targetBranch instanceof Branch === false || targetBranch === this ) {
      return;
    }

    // Merge commit
    var defaultMessage = "Merge branch `" + this.name + "` into `" + targetBranch.name + "`";
    if ( typeof commitOptions !== "object" ) {
      var message = commitOptions;
      commitOptions = {};
      commitOptions.message = (typeof message === "string") ? message : defaultMessage;
    } else {
      commitOptions.message = commitOptions.message || defaultMessage;
    }
    commitOptions.type = "mergeCommit";
    commitOptions.parentCommit = this.commits.slice( -1 )[ 0 ];

    targetBranch.commit( commitOptions );

    // Add points to path
    var endOfBranch = {
      x: this.offsetX + this.template.commit.spacingX * 2 - this.parent.commitOffsetX,
      y: this.offsetY + this.template.commit.spacingY * 2 - this.parent.commitOffsetY,
      type: "join"
    };
    this.path.push( JSON.parse( JSON.stringify( endOfBranch ) ) ); // Elegant way for cloning an object

    var mergeCommit = {
      x: targetBranch.commits.slice( -1 )[ 0 ].x,
      y: targetBranch.commits.slice( -1 )[ 0 ].y,
      type: "end"
    };
    this.path.push( mergeCommit );

    endOfBranch.type = "start";
    this.path.push( endOfBranch ); // End of branch for future commits

    // Auto-render
    this.parent.render();

    // Checkout on target
    this.parent.HEAD = targetBranch;

    // Return the main object so we can chain
    return this;
  };

  /**
   * Calcul column
   *
   * @this Branch
   **/
  Branch.prototype.calculColumn = function () {
    for ( var i = 0, branch; !!(branch = this.parent.branchs[ i ]); i++ ) {
      if ( !branch.isfinish ) {
        this.column++;
      } else {
        break;
      }
    }

    this.parent.columnMax = (this.column > this.parent.columnMax) ? this.column : this.parent.columnMax;
  };

  // --------------------------------------------------------------------
  // -----------------------      Commit         ------------------------
  // --------------------------------------------------------------------

  /**
   * Commit
   *
   * @constructor
   *
   * @param {Object} options - Commit options
   * @param {GitGraph} options.parent - GitGraph constructor
   * @param {Number} options.x - Position X (dot)
   * @param {Number} options.y - Position Y (dot)
   * @param {String} options.color - Master color (dot & message)
   * @param {Boolean} options.arrowDisplay - Add a arrow under commit dot
   * @param {String} [options.author = this.parent.author] - Author name & email
   * @param {String} [options.date] - Date of commit, default is now
   * @param {String} [options.detail] - DOM Element of detail part
   * @param {String} [options.sha1] - Sha1, default is a random short sha1
   * @param {String} [options.dotColor = options.color] - Specific dot color
   * @param {Number} [options.dotSize = this.template.commit.dot.size] - Dot size
   * @param {Number} [options.dotStrokeWidth = this.template.commit.dot.strokeWidth] - Dot stroke width
   * @param {Number} [options.dotStrokeColor = this.template.commit.dot.strokeColor]
   * @param {Commit} [options.parentCommit] - Parent commit
   * @param {String} [options.message = "He doesn't like George Michael! Boooo!"] - Commit message
   * @param {String} [options.messageColor = options.color] - Specific message color
   * @param {Boolean} [options.messageDisplay = this.template.commit.message.display] - Commit message policy
   * @param {Boolean} [options.messageAuthorDisplay = this.template.commit.message.displayAuthor] - Commit message author policy
   * @param {Boolean} [options.messageHashDisplay = this.template.commit.message.displayHash] - Commit message hash policy
   * @param {String} [options.type = ("mergeCommit"|null)] - Type of commit
   *
   * @this Commit
   **/
  function Commit ( options ) {
    // Check integrity
    if ( options.parent instanceof GitGraph === false ) {
      return;
    }

    // Options
    options = (typeof options === "object") ? options : {};
    this.parent = options.parent;
    this.template = this.parent.template;
    this.context = this.parent.context;
    this.branch = options.branch;
    this.author = options.author || this.parent.author;
    this.date = options.date || new Date().toUTCString();
    this.detail = options.detail || null;
    this.sha1 = options.sha1 || (Math.random( 100 )).toString( 16 ).substring( 3, 10 );
    this.message = options.message || "He doesn't like George Michael! Boooo!";
    this.arrowDisplay = options.arrowDisplay;
    this.messageDisplay = booleanOptionOr(options.messageDisplay, this.template.commit.message.display);
    this.messageAuthorDisplay = booleanOptionOr(options.messageAuthorDisplay, this.template.commit.message.displayAuthor);
    this.messageHashDisplay = booleanOptionOr(options.messageHashDisplay, this.template.commit.message.displayHash);
    this.messageColor = options.messageColor || options.color;
    this.messageFont = options.messageFont || this.template.commit.message.font;
    this.dotColor = options.dotColor || options.color;
    this.dotSize = options.dotSize || this.template.commit.dot.size;
    this.dotStrokeWidth = options.dotStrokeWidth || this.template.commit.dot.strokeWidth;
    this.dotStrokeColor = options.dotStrokeColor || this.template.commit.dot.strokeColor || options.color;
    this.type = options.type || null;
    this.parentCommit = options.parentCommit;
    this.x = options.x;
    this.y = options.y;

    this.parent.commits.push( this );
  }

  /**
   * Render the commit
   *
   * @this Commit
   **/
  Commit.prototype.render = function () {
    // Dot
    this.context.beginPath();
    this.context.arc( this.x, this.y, this.dotSize, 0, 2 * Math.PI, false );
    this.context.fillStyle = this.dotColor;
    this.context.strokeStyle = this.dotStrokeColor;
    this.context.lineWidth = this.dotStrokeWidth;

    if ( typeof (this.dotStrokeWidth) === "number" ) {
      this.context.stroke();
    }

    this.context.fill();
    this.context.closePath();

    // Arrow
    if ( this.arrowDisplay && this.parentCommit instanceof Commit ) {
      this.arrow();
    }

    // Detail
    if ( this.detail !== null ) {
      this.detail.style.left = this.parent.canvas.offsetLeft + (this.parent.columnMax + 1) * this.template.branch.spacingX + 30 + "px";
      this.detail.style.top = this.parent.canvas.offsetTop + this.y + 40 + "px";
      this.detail.width = 30;
    }

    // Message
    if ( this.messageDisplay ) {
      var message = this.message;
      if ( this.messageHashDisplay ) {
        message = this.sha1 + " " + message;
      }
      if ( this.messageAuthorDisplay ) {
        message = message + (this.author ? " - " + this.author : "");
      }

      this.context.font = this.messageFont;
      this.context.fillStyle = this.messageColor;
      this.context.fillText( message, (this.parent.columnMax + 1) * this.template.branch.spacingX, this.y + 3 );
    }
  };

  /**
   * Render a arrow before commit
   *
   * @this Commit
   **/
  Commit.prototype.arrow = function Arrow () {
    // Options
    var size = this.template.arrow.size;
    var color = this.template.arrow.color || this.branch.color;

    // Angles calculation
    var alpha = Math.atan2(
      this.parentCommit.y - this.y,
      this.parentCommit.x - this.x
    );

    // Merge & Fork case
    if ( this.type === "mergeCommit" || this === this.branch.commits[ 0 ] /* First commit */ ) {
      alpha = Math.atan2(
        this.template.branch.spacingY * (this.parentCommit.branch.column - this.branch.column) + this.template.commit.spacingY,
        this.template.branch.spacingX * (this.parentCommit.branch.column - this.branch.column) + this.template.commit.spacingX
      );
      color = this.parentCommit.branch.color;
    }

    var delta = Math.PI / 7; // Delta between left & right (radian)

    // Top
    var h = this.template.commit.dot.size + this.template.arrow.offset;
    var x1 = h * Math.cos( alpha ) + this.x;
    var y1 = h * Math.sin( alpha ) + this.y;

    // Bottom left
    var x2 = (h + size) * Math.cos( alpha - delta ) + this.x;
    var y2 = (h + size) * Math.sin( alpha - delta ) + this.y;

    // Bottom center
    var x3 = (h + size / 2) * Math.cos( alpha ) + this.x;
    var y3 = (h + size / 2) * Math.sin( alpha ) + this.y;

    // Bottom right
    var x4 = (h + size) * Math.cos( alpha + delta ) + this.x;
    var y4 = (h + size) * Math.sin( alpha + delta ) + this.y;

    this.context.beginPath();
    this.context.fillStyle = color;
    this.context.moveTo( x1, y1 ); // Top
    this.context.lineTo( x2, y2 ); // Bottom left
    this.context.quadraticCurveTo( x3, y3, x4, y4 ); // Bottom center
    this.context.lineTo( x4, y4 ); // Bottom right
    this.context.fill();
  };

  // --------------------------------------------------------------------
  // -----------------------      Template       ------------------------
  // --------------------------------------------------------------------

  /**
   * Template
   *
   * @constructor
   *
   * @param {Object} options - Template options
   * @param {Array} [options.colors] - Colors scheme: One color for each column
   * @param {String} [options.arrow.color] - Arrow color
   * @param {Number} [options.arrow.size] - Arrow size
   * @param {Number} [options.arrow.offser] - Arrow offset
   * @param {String} [options.branch.color] - Branch color
   * @param {Number} [options.branch.linewidth] - Branch line width
   * @param {String} [options.branch.mergeStyle = ("bezier"|"straight")] - Branch merge style
   * @param {Number} [options.branch.spacingX] - Space between branchs
   * @param {Number} [options.branch.spacingY] - Space between branchs
   * @param {Number} [options.commit.spacingX] - Space between commits
   * @param {Number} [options.commit.spacingY] - Space between commits
   * @param {String} [options.commit.color] - Master commit color (dot & message)
   * @param {String} [options.commit.dot.color] - Commit dot color
   * @param {Number} [options.commit.dot.size] - Commit dot size
   * @param {Number} [options.commit.dot.strokewidth] - Commit dot stroke width
   * @param {Number} [options.commit.dot.strokeColor] - Commit dot stroke color
   * @param {String} [options.commit.message.color] - Commit message color
   * @param {Boolean} [options.commit.message.display] - Commit display policy
   * @param {Boolean} [options.commit.message.displayAuthor] - Commit message author policy
   * @param {Boolean} [options.commit.message.displayHash] - Commit message hash policy
   * @param {String} [options.commit.message.font = "normal 12pt Calibri"] - Commit message font
   *
   * @this Template
   **/
  function Template ( options ) {
    // Options
    options = (typeof options === "object") ? options : {};
    options.branch = options.branch || {};
    options.arrow = options.arrow || {};
    options.commit = options.commit || {};
    options.commit.dot = options.commit.dot || {};
    options.commit.message = options.commit.message || {};

    // One color per column
    this.colors = options.colors || [ "#6963FF", "#47E8D4", "#6BDB52", "#E84BA5", "#FFA657" ];

    // Branch style
    this.branch = {};
    this.branch.color = options.branch.color || null; // Only one color
    this.branch.lineWidth = options.branch.lineWidth || 2;
    this.branch.lineDash = options.branch.lineDash || [];

    // Merge style = "bezier" | "straight"
    this.branch.mergeStyle = options.branch.mergeStyle || "bezier";

    // Space between branchs
    this.branch.spacingX = (typeof options.branch.spacingX === "number") ? options.branch.spacingX : 20;
    this.branch.spacingY = options.branch.spacingY || 0;

    // Arrow style
    this.arrow = {};
    this.arrow.size = options.arrow.size || null;
    this.arrow.color = options.arrow.color || null;
    this.arrow.active = typeof (this.arrow.size) === "number";
    this.arrow.offset = options.arrow.offset || 2;

    // Commit style
    this.commit = {};
    this.commit.spacingX = options.commit.spacingX || 0;
    this.commit.spacingY = (typeof options.commit.spacingY === "number") ? options.commit.spacingY : 25;

    // Only one color, if null message takes branch color (full commit)
    this.commit.color = options.commit.color || null;

    this.commit.dot = {};

    // Only one color, if null message takes branch color (only dot)
    this.commit.dot.color = options.commit.dot.color || null;
    this.commit.dot.size = options.commit.dot.size || 3;
    this.commit.dot.strokeWidth = options.commit.dot.strokeWidth || null;
    this.commit.dot.strokeColor = options.commit.dot.strokeColor || null;

    this.commit.message = {};
    this.commit.message.display = booleanOptionOr(options.commit.message.display, true);
    this.commit.message.displayAuthor = booleanOptionOr(options.commit.message.displayAuthor, true);
    this.commit.message.displayHash = booleanOptionOr(options.commit.message.displayHash, true);

    // Only one color, if null message takes commit color (only message)
    this.commit.message.color = options.commit.message.color || null;
    this.commit.message.font = options.commit.message.font || "normal 12pt Calibri";
  }

  /**
   * Get a default template from library
   *
   * @param {String} name - Template name
   *
   * @return {Template} [template] - Template if exist
   **/
  Template.prototype.get = function ( name ) {
    var template = {};

    switch ( name ) {
    case "blackarrow":
      template = {
        branch: {
          color: "#000000",
          lineWidth: 4,
          spacingX: 50,
          mergeStyle: "straight"
        },
        commit: {
          spacingY: -60,
          dot: {
            size: 12,
            strokeColor: "#000000",
            strokeWidth: 7
          },
          message: {
            color: "black"
          }
        },
        arrow: {
          size: 16,
          offset: 2.5
        }
      };
      break;

    case "metro":
    /* falls through */
    default:
      template = {
        colors: [ "#979797", "#008fb5", "#f1c109" ],
        branch: {
          lineWidth: 10,
          spacingX: 50
        },
        commit: {
          spacingY: -80,
          dot: {
            size: 14
          },
          message: {
            font: "normal 14pt Arial"
          }
        }
      };
      break;
    }

    return new Template( template );
  };

  // --------------------------------------------------------------------
  // -----------------------      Utilities       -----------------------
  // --------------------------------------------------------------------

  function booleanOptionOr(booleanOption, defaultOption){
    return (typeof booleanOption === "boolean") ? booleanOption : defaultOption;
  }

  // Expose GitGraph object
  window.GitGraph = GitGraph;
  window.GitGraph.Branch = Branch;
  window.GitGraph.Commit = Commit;
  window.GitGraph.Template = Template;
})();
