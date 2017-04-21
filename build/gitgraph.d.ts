declare namespace GitGraph {

    /**
     * GitGraph options
     */
    interface GitGraphOptions {

        /**
         * Id of the canvas container
         */
        elementId?: string;

        /**
         * Template of the graph
         */
        template?: GitGraph.Template | string | any;

        /**
         * Default author for commits
         */
        author?: string;

        /**
         * Display mode
         */
        mode?: string;

        /**
         * DOM canvas (ex: document.getElementById(&quot;id&quot;))
         */
        canvas?: HTMLElement;

        /**
         * Graph orientation
         */
        orientation?: string;

        /**
         * Make arrows point to ancestors if true
         */
        reverseArrow?: boolean;

        /**
         * Add custom offsetX to initial commit.
         */
        initCommitOffsetX?: number;

        /**
         * Add custom offsetY to initial commit.
         */
        initCommitOffsetY?: number;

        /**
         * HTML Element containing tooltips in compact mode.
         */
        tooltipContainer?: HTMLElement;
    }

    /**
     * Options of branch
     */
    interface BranchOptions {

        /**
         * GitGraph constructor
         */
        parent: GitGraph;

        /**
         * Parent branch
         */
        parentBranch?: GitGraph.Branch;

        /**
         * Parent commit
         */
        parentCommit?: GitGraph.Commit;

        /**
         * Branch name
         */
        name?: string;

        /**
         * Branch line dash segments
         */
        lineDash?: number[];

        /**
         * Default options for commits
         */
        commitDefaultOptions?: any;
    }

    /**
      * Branch
      * @constructor
      * @param options Options of branch
      * @this Branch
      **/
    class Branch {
        constructor(options: GitGraph.BranchOptions);

        /**
          * Create new branch
          * @param options Branch name | Options of Branch
          * @see Branch
          * @this Branch
          * @return New Branch
          **/
        branch(options: string | GitGraph.BranchOptions): GitGraph.Branch;

        /**
          * Render the branch
          * @this Branch
          **/
        render(): void;

        /**
          * Add a commit
          * @param [options] Message | Options of commit
          * @see Commit
          * @this Branch
          **/
        commit(options?: string | GitGraph.BranchCommitOptions): void;

        /**
          * Tag the last commit of the branch.
          * @param [options] Message | Options of the tag
          * @see Tag
          * @this Branch
          * */
        tag(options?: string | GitGraph.TagOptions): void;

        /**
          * Checkout onto this branch
          * @this Branch
          **/
        checkout(): void;

        /**
          * Delete this branch
          * @this Branch
          **/
        delete(): void;

        /**
          * Merge branch
          * @param [target = this.parent.HEAD]
          * @param [commitOptions] Message | Options of commit
          * @param [commitOptions.fastForward = false] If true, merge should use fast-forward if possible
          * @see Commit
          * @this Branch
          * @return this
          **/
        merge(target?: GitGraph.Branch, commitOptions?: string | any): GitGraph.Branch;

        /**
          * Calcul column
          * @this Branch
          **/
        calculColumn(): void;

        /**
          * Push a new point to path.
          * This method will combine duplicate points and reject reversed points.
          * @this Branch
          */
        pushPath(): void;

    }

    /**
     * Commit options
     */
    interface CommitOptions {

        /**
         * GitGraph constructor
         */
        parent: GitGraph;

        /**
         * Position X (dot)
         */
        x: number;

        /**
         * Position Y (dot)
         */
        y: number;

        /**
         * Master color (dot &amp; message)
         */
        color: string;

        /**
         * Add a arrow under commit dot
         */
        arrowDisplay: boolean;

        /**
         * Author name &amp; email
         */
        author?: string;

        /**
         * Date of commit, default is now
         */
        date?: string;

        /**
         * DOM Element of detail part
         */
        detail?: string;

        /**
         * Sha1, default is a random short sha1
         */
        sha1?: string;

        /**
         * Parent commit
         */
        parentCommit?: GitGraph.Commit;

        /**
         * Type of commit
         */
        type?: string;

        /**
         * Tag of the commit
         */
        tag?: string;

        /**
         * Color of the tag
         */
        tagColor?: string;

        /**
         * Font of the tag
         */
        tagFont?: string;

        /**
         * If true, display a box around the tag
         */
        displayTagBox?: string;

        /**
         * Specific dot color
         */
        dotColor?: string;

        /**
         * Dot size
         */
        dotSize?: number;

        /**
         * Dot stroke width
         */
        dotStrokeWidth?: number;

        /**
         * undefined
         */
        dotStrokeColor?: string;

        /**
         * undefined
         */
        lineDash?: number[];

        /**
         * Commit message
         */
        message?: string;

        /**
         * Specific message color
         */
        messageColor?: string;

        /**
         * Font of the message
         */
        messageFont?: string;

        /**
         * Commit message display policy
         */
        messageDisplay?: boolean;

        /**
         * Commit message author policy
         */
        messageAuthorDisplay?: boolean;

        /**
         * Commit message author policy
         */
        messageBranchDisplay?: boolean;

        /**
         * Commit message hash policy
         */
        messageHashDisplay?: boolean;

        /**
         * Specific label color
         */
        labelColor?: string;

        /**
         * Font used for labels
         */
        labelFont?: string;

        /**
         * Tooltip message display policy
         */
        tooltipDisplay?: boolean;

        /**
         * OnClick event for the commit dot
         */
        onClick?: GitGraph.CommitCallback;

        /**
         * Any object which is related to this commit. Can be used in onClick or the formatter. Useful to bind the commit to external objects such as database id etc.
         */
        representedObject?: any;
    }

    /**
      * Commit
      * @constructor
      * @param options Commit options
      * @this Commit
      **/
    class Commit {
        constructor(options: GitGraph.CommitOptions);

        /**
          * Render the commit
          * @this Commit
          **/
        render(): void;

        /**
          * Render a arrow before commit
          * @this Commit
          **/
        arrow(): void;

    }

    /**
     * Tagged commit
     */
    interface TagOptions {

        /**
         * Specific tag color
         */
        color?: string;

        /**
         * Font of the tag
         */
        font?: string;
    }

    /**
      * Tag
      * @constructor
      * @param commit Tagged commit
      * @param [options] Tag options
      * @return 
      * @this Tag
      * */
    class Tag {
        constructor(commit: GitGraph.Commit, options?: GitGraph.TagOptions);

    }

    /**
     * Template options
     */
    interface TemplateOptions {

        /**
         * Colors scheme: One color for each column
         */
        colors?: string[];
        arrow?: {

            /**
             * Arrow color
             */
            color?: string;

            /**
             * Arrow size
             */
            size?: number;

            /**
             * Arrow offset
             */
            offset?: number;
        };
        branch?: {

            /**
             * Branch color
             */
            color?: string;

            /**
             * Branch line width
             */
            lineWidth?: number;

            /**
             * Branch line dash segments
             */
            lineDash?: number[];

            /**
             * Branch merge style
             */
            mergeStyle?: string;

            /**
             * Space between branches
             */
            spacingX?: number;

            /**
             * Space between branches
             */
            spacingY?: number;
        };
        commit?: {

            /**
             * Space between commits
             */
            spacingX?: number;

            /**
             * Space between commits
             */
            spacingY?: number;

            /**
             * Additional width to be added to the calculated width
             */
            widthExtension?: number;

            /**
             * Master commit color (dot &amp; message)
             */
            color?: string;
            dot?: {

                /**
                 * Commit dot color
                 */
                color?: string;

                /**
                 * Commit dot size
                 */
                size?: number;

                /**
                 * Commit dot stroke width
                 */
                strokeWidth?: number;

                /**
                 * Commit dot stroke color
                 */
                strokeColor?: string;

                /**
                 * Commit dot line dash segments
                 */
                lineDash?: number[];

            };
            message?: {

                /**
                 * Commit message color
                 */
                color?: string;

                /**
                 * Commit display policy
                 */
                display?: boolean;

                /**
                 * Commit message author policy
                 */
                displayAuthor?: boolean;

                /**
                 * Commit message branch policy
                 */
                displayBranch?: boolean;

                /**
                 * Commit message hash policy
                 */
                displayHash?: boolean;

                /**
                 * Commit message font
                 */
                font?: string;

            };

            /**
             * Tooltips policy
             */
            shouldDisplayTooltipsInCompactMode?: boolean;

            /**
             * Formatter for the tooltip contents.
             */
            tooltipHTMLFormatter?: GitGraph.CommitFormatter;
        };
    }

    /**
      * Template
      * @constructor
      * @param options Template options
      * @this Template
      **/
    class Template {
        constructor(options: GitGraph.TemplateOptions);

        /**
          * Get a default template from library
          * @param name Template name
          * @return [template] Template if exist
          **/
        get(name: string): GitGraph.Template;

    }

    /**
      * A callback for each commit
      * @callback CommitCallback
      * @param commit A commit
      * @param mouseOver True, if the mouse is currently hovering over the commit
      * @param event The DOM event (e.g. a click event)
      */
    type CommitCallback = (commit: GitGraph.Commit, mouseOver: boolean, event: Event) => void;

    /**
      * A formatter for commit
      * @callback CommitFormatter
      * @param commit The commit to format
      */
    type CommitFormatter = (commit: GitGraph.Commit) => void;

    /**
     * Branch commit options
     */
    interface BranchCommitOptions {

        /**
         * Master color (dot &amp; message)
         */
        color?: string;

        /**
         * Author name &amp; email
         */
        author?: string;

        /**
         * Date of commit, default is now
         */
        date?: string;

        /**
         * DOM Element of detail part
         */
        detail?: string;

        /**
         * Sha1, default is a random short sha1
         */
        sha1?: string;

        /**
         * Parent commit
         */
        parentCommit?: GitGraph.Commit;

        /**
         * Type of commit
         */
        type?: string;

        /**
         * Tag of the commit
         */
        tag?: string;

        /**
         * Color of the tag
         */
        tagColor?: string;

        /**
         * Font of the tag
         */
        tagFont?: string;

        /**
         * If true, display a box around the tag
         */
        displayTagBox?: string;

        /**
         * Specific dot color
         */
        dotColor?: string;

        /**
         * Dot size
         */
        dotSize?: number;

        /**
         * Dot stroke width
         */
        dotStrokeWidth?: number;

        /**
         * undefined
         */
        dotStrokeColor?: string;

        /**
         * Commit message
         */
        message?: string;

        /**
         * Specific message color
         */
        messageColor?: string;

        /**
         * Font of the message
         */
        messageFont?: string;

        /**
         * Commit message display policy
         */
        messageDisplay?: boolean;

        /**
         * Commit message author policy
         */
        messageAuthorDisplay?: boolean;

        /**
         * Commit message author policy
         */
        messageBranchDisplay?: boolean;

        /**
         * Commit message hash policy
         */
        messageHashDisplay?: boolean;

        /**
         * Specific label color
         */
        labelColor?: string;

        /**
         * Font used for labels
         */
        labelFont?: string;

        /**
         * Tooltip message display policy
         */
        tooltipDisplay?: boolean;

        /**
         * OnClick event for the commit dot
         */
        onClick?: GitGraph.CommitCallback;

        /**
         * Any object which is related to this commit. Can be used in onClick or the formatter. Useful to bind the commit to external objects such as database id etc.
         */
        representedObject?: any;
    }
}

/**
  * GitGraph
  * @constructor
  * @param [options] GitGraph options
  * @this GitGraph
  **/
declare class GitGraph {
    constructor(options?: GitGraph.GitGraphOptions);

    /**
      * Disposing canvas event handlers
      * @this GitGraph
      **/
    dispose(): void;

    /**
      * Create new branch
      * @param options Branch name | Options of Branch
      * @see Branch
      * @this GitGraph
      * @return New branch
      **/
    branch(options: string | GitGraph.BranchOptions): GitGraph.Branch;

    /**
      * Create new orphan branch
      * @param options Branch name | Options of Branch
      * @see Branch
      * @this GitGraph
      * @return New branch
      **/
    orphanBranch(options: string | GitGraph.BranchOptions): GitGraph.Branch;

    /**
      * Commit on HEAD
      * @param options Message | Options of commit
      * @see Commit
      * @this GitGraph
      * @return this Return the main object so we can chain
      **/
    commit(options: string | GitGraph.BranchCommitOptions): GitGraph;

    /**
      * Tag the HEAD
      * @param options Options of tag
      * @see Tag
      * @this GitGraph
      * @return this Return the main object so we can chain
      **/
    tag(options: GitGraph.TagOptions): GitGraph;

    /**
      * Create a new template
      * @param options The template name, or the template options
      * @see Template
      * @this GitGraph
      * @return 
      **/
    newTemplate(options: string | GitGraph.TemplateOptions): GitGraph.Template;

    /**
      * Render the canvas
      * @this GitGraph
      **/
    render(): void;

    /**
      * Hover event on commit dot
      * @param event Mouse event
      * @param callbackFn A callback function that will be called for each commit
      * @this GitGraph
      **/
    applyCommits(event: MouseEvent, callbackFn: GitGraph.CommitCallback): void;

    /**
      * Hover event on commit dot
      * @param event Mouse event
      * @this GitGraph
      **/
    hover(event: MouseEvent): void;

    /**
      * Click event on commit dot
      * @param event Mouse event
      * @this GitGraph
      **/
    click(event: MouseEvent): void;
}
