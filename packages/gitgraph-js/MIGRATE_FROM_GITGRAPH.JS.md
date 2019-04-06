# How to migrate from `gitgraph.js` package

`@gitgraph/js` is meant to replace the `gitgraph.js` package. I will refer to `gitgraph.js` as v1 and `@gitgraph/js` as v2.

## Instantiate the graph

In v1, you had to instantiate the `Gitgraph` class:

```js
const gitgraph = new Gitgraph({ elementId: "gitGraph" });
```

In v2, you would instantiate it like this:

```jsx
const graphContainer = document.getElementById("gitGraph");
const gitgraph = createGitgraph(graphContainer);
```

`createGitgraph()` also takes a second argument that would be the graph `options`. These are almost the same, with few exceptions. Let's compare what have changed from v1.

### Added

- `options.commitMessage` defines the default message for commit you'll create.
- `options.generateCommitHash` is a function that should return the commit hash. This is useful to generate predictable hashes if you need to.
- `options.compareBranchesOrder` is a sort function that allows you to change the ordering of the branches when rendered. It takes two branches name and should return a number greater than `0` to place `branchB` before `branchA`.

### Removed

- `options.elementId` and `options.canvas` allowed you to provide the graph container target. This is now done with the first argument of `createGitgraph()`, which expects an HTML element.
- `options.tooltipContainer` which was used to determine the HTML element that would contain tooltips, as they should be over the graph. The library handles that for you now, so it always work.

### Default orientation

Default orientation was _vertical, top to bottom_ in v1. In v2, default orientation is _vertical, bottom to top_.

That means the top-most commit will be the most recent one, by default. This is to match usual behavior of git GUI, which should be more intuitive.

Orientation is still customizable with `options.orientation` when you instantiate the graph.

## Create a branch

Basic branch creation is the same. You'd usually create a branch like this:

```js
const develop = gitgraph.branch("develop");
```

You can also provide a custom `options` parameter instead of the branch name. These `options` have changed a bit.

### Changed

| In v1 you used…      | in order to…                                  | now in v2, you should use instead… |
| -------------------- | --------------------------------------------- | ---------------------------------- |
| `options.color`      | Customize the color of the branch.            | `options.style.color`              |
| `options.lineWidth`  | Customize the width of the branch line.       | `options.style.lineWidth`          |
| `options.showLabel`  | Customize the visibility of the branch label. | `options.style.label.display`      |
| `options.labelColor` | Customize the color of the branch label.      | `options.style.label.color`        |

### Removed

- `options.parentCommit` was use to specify the commit from which the created branch should start. This is computed internally now.
- `options.parentBranch` was used to specify a custom "parent branch" to the newly created branch. With the new modelling, it doesn't make sense.
- `options.lineDash` was used to customize the style of the branch line, using [Canvas `setLineDash()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash). This was specific to Canvas implementation and was removed from the core library. See rendering library documentation for customization.
- `options.column` was used to specify a custom column for the branch. It was not implemented in v2.
- `options.labelRotation` was used to control the orientation of the branch label. We thought it added unecessary complexity, so we removed it.

### Added

- `options.style` is used to customize branch style, overriding template. Following attributes are valid:
  - `options.style.color` for the color of the branch.
  - `options.style.lineWidth` for the width of the branch line.
  - `options.style.spacing` for the space between branches.
  - `options.style.mergeStyle` which can be `"straight"` or `"bezier"`.
  - `options.style.label.bgColor` for the background color of branch label.
  - `options.style.label.strokeColor` for the color of the branch label box stroke.
  - `options.style.label.borderRadius` for the border radius of the branch label box.
- `options.commitDefaultOptions` is used to customize default options for commits of the branch. Following attributes are valid:
  - `options.commitDefaultOptions.author` the default for commit author.
  - `options.commitDefaultOptions.subject` the default for commit subject.
  - `options.commitDefaultOptions.style` the default for commit style. All commit `options.style` values are valid.
  - `options.commitDefaultOptions.renderDot` the default `renderDot()` function for commit. See commit section for more details.
  - `options.commitDefaultOptions.renderMessage` the default `renderMessage()` function for commit. See commit section for more details.
  - `options.commitDefaultOptions.renderTooltip` the default `renderTooltip()` function for commit. See commit section for more details.

In v2, we have a default branch (`master`) so you can commit directly after creating the graph.

```js
const graphContainer = document.getElementById("gitGraph");
const gitgraph = createGitgraph(graphContainer);

gitgraph.commit(); // => will commit on "master"
```

## Create a commit

Basic commit creation is the same. You'd usually create a commit like this:

```js
// From HEAD
gitgraph.commit("Implement a new feature");

// From a branch
develop.commit("Prepare new release");

// You can still chain commits
develop
  .commit()
  .commit()
  .commit();
```

You can also provide a custom `options` parameter instead of the commit message. These `options` have changed a bit.

### Changed

| In v1 you used…                                | in order to…                                    | now in v2, you should use instead…                                 |
| ---------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| `options.sha1`                                 | Set a specific commit hash, so it's not random. | `options.hash`                                                     |
| `options.message`                              | Define the commit subject.                      | `options.subject`                                                  |
| `options.onClick(commit, isOverCommit, event)` | Execute callback when you click on commit dot.  | `options.onClick(commit)` (the other parameters have been removed) |
| `options.commitDotText`                        | Set a custom text in commit dot.                | `options.dotText`                                                  |
| `options.messageColor`                         | Set message color.                              | `options.style.message.color`                                      |
| `options.messageFont`                          | Set message font.                               | `options.style.message.font`                                       |
| `options.dotColor`                             | Set dot color.                                  | `options.style.dot.color`                                          |
| `options.dotFont`                              | Set dot font.                                   | `options.style.dot.font`                                           |
| `options.dotSize`                              | Set dot size.                                   | `options.style.dot.size`                                           |
| `options.dotStrokeWidth`                       | Set width of dot stroke.                        | `options.style.dot.strokeWidth`                                    |
| `options.dotStrokeColor`                       | Set color of dot stroke.                        | `options.style.dot.strokeColor`                                    |

### Removed

- `options.date` was not used, so it was removed.
- `options.detail` and `options.detailId` were used to inject a DOM element inside the canvas, to display as the commit body. See _Commit details_ section below to understand how it works.
- `options.messageDisplay` / `options.messageAuthorDisplay` / `options.messageBranchDisplay` / `options.messageHashDisplay` which were used to control how commit message would render. Now you can use `options.renderMessage(commit)` to customize message rendering.
- `options.displayTagBox`, `options.tagColor` and `options.tagFont` which were used to customize commit tag. Now you can customize tag style directly on the tag (see Tags section).
- `options.tooltipDisplay` which was used to control if tooltip would be rendered. Now you can use `options.renderTooltip(commit)` to customize tooltip rendering.
- `options.lineDash` was used to customize the style of the commit stroke, using [Canvas `setLineDash()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash). This was specific to Canvas implementation and was removed from the core library. See rendering library documentation for customization.
- `options.type` which was used internally to identify merge commits and shouldn't have been exposed in the first place. Now it has been removed.
- `options.representedObject` which was intended to hold reference to anything related to the commit. Thus, it could be later accessed, for example from callbacks. This was necessary because callback listener was set on the whole graph. In v2 you have commit context when you set the callback, so you don't need this anymore.
- `options.parentCommit` was used to specify a custom "parent commit". It has been removed to make the lib more predictable.
- `options.labelColor` and `options.labelFont` were used to customize branch label. Since it's a branch concept, it was removed from commit options.

### Added

- `options.body` which represents the body of the commit message.

More callbacks are available, with commit context:

- `options.onMessageClick(commit)` to execute callback when you click on commit message.
- `options.onMouseOver(commit)` to execute callback when your mouse hover the commit.
- `options.onMouseOut(commit)` to execute callback when your mouse exit the commit.

New options were implemented to override rendering. Their support depend on the rendering library you use, but here they are:

- `options.renderDot(commit)` to override commit dot rendering.
- `options.renderMessage(commit)` to override commit message rendering.
- `options.renderTooltip(commit)` to override commit tooltip rendering.

## Merges

In v1, to merge `develop` into `master` you used `develop.merge(master)`.

In v2, to merge `develop` into `master` you should use `master.merge(develop)`. This follows git natural usage: you checkout on `master`, then you merge `develop` into it.

In v1, you could merge the branch into "HEAD" if you didn't provide a target branch: `develop.merge()`. Since the order of branches has changed (and because it was confusing), this is not possible in v2.

In v2, you can match a branch to merge by its name: `master.merge("develop")` will work.

In v2, you can pass all Commit options as a second argument:

```js
master.merge(develop, { subject: "Add feature", dotText: "🎉" });
```

## Tags

The signature of the `tag()` function has changed a lot.

In v1, following calls were valid:

```js
// Tag commit at "HEAD".
gitgraph.tag("v1");

// Tag commit at "HEAD" with detailed options.
gitgraph.tag({
  tag: "v1",
  tagColor: "red",
  tagFont: "Arial",
  displayTagBox: false,
});
```

In v2, the `tag()` function is only on `gitgraph` instance and branches:

```js
// Tag the last commit of a branch
master.tag("v1");

// Tag commit at "HEAD".
gitgraph.tag("v1");

// Tag a commit at "HEAD" with detailed options.
gitgraph.tag({
  tag: "v1",
  style: {
    bgColor: "red",
    font: "Arial",
    strokeWidth: 0,
  },
});

// Tag a specific commit.
gitgraph.tag("v1", aCommit);

// Tag a specific commit, by commit hash.
gitgraph.tag("v1", "85eb054");

// Tag the last commit of a branch, by branch name.
gitgraph.tag("v1", "master");
```

### Changed

For the detailed options signature, things have changed a bit:

| In v1 you used…         | in order to…                             | now in v2, you should use instead…            |
| ----------------------- | ---------------------------------------- | --------------------------------------------- |
| `options.tag`           | Define the name of the tag.              | `options.name`                                |
| `options.tagColor`      | Define the color of the tag background.  | `options.style.bgColor`                       |
| `options.tagFont`       | Define the font of the tag.              | `options.style.font`                          |
| `options.displayTagBox` | Customize the visibility of the tag box. | `options.style.strokeWidth` (`0` = no stroke) |

### Removed

- `options.displayTagBox` was used to customize the visibility of the tag box. If `false`, only the tag text is rendered. Now you can customize more elements. Thus, you can achieve the same result with `options.style.bgColor` set to `transparent` and `options.style.strokeWidth` set to `0`.

### Added

- `options.style.color` to customize tag text color.
- `options.style.strokeColor` to customize tag box border color.
- `options.style.borderRadius` to customize tag box border radius.
- `options.style.pointerWidth` to customize the width of the tag box pointer.

## Commit "details"

## Events

The way to create events has changed in v2.

In v1, you could add an event listener to `gitgraph.canvas`:

```js
gitgraph.canvas.addEventListener("graph:render", function(event) {
  console.log("Graph has been rendered", event.data);
});

gitgraph.canvas.addEventListener("commit:mouseover", function(event) {
  console.log("You're over this commit ->", event.data);
  this.style.cursor = "pointer";
});

gitgraph.canvas.addEventListener("commit:mouseout", function(event) {
  console.log("You just left this commit ->", event.data);
  this.style.cursor = "auto";
});
```

You also had the Commit's `options.onClick` callback, as described in the _Commit_ section.

In v2, there is no event on the gitgraph instance anymore. Instead, you can set callbacks on commits:

```js
develop.commit({
  subject: "Add new feature",
  onMessageClick(commit) {
    // …
  },
  onMouseOver(commit) {
    // …
  },
  onMouseOut(commit) {
    // …
  },
});
```

## Templates

### Changed

| In v1 you used…                                         | in order to…                        | now in v2, you should use instead… |
| ------------------------------------------------------- | ----------------------------------- | ---------------------------------- |
| `options.branch.spacingX` and `options.branch.spacingY` | Define the space between branches.  | `options.branch.spacing`           |
| `options.commit.spacingX` and `options.commit.spacingY` | Define the space between commits.   | `options.commit.spacing`           |
| `options.branch.showLabel`                              | Control visibility of branch label  | `options.branch.label.display`     |
| `options.branch.labelColor`                             | Define the color of branch label    | `options.branch.label.color`       |
| `options.branch.labelFont`                              | Define the font of the branch label | `options.branch.label.font`        |

### Removed

- `options.branch.lineDash` was used to customize the style of the commit stroke, using [Canvas `setLineDash()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash). This was specific to Canvas implementation and was removed from the core library. See rendering library documentation for customization.
- `options.commit.dot.lineDash` was used to customize the style of the commit stroke, using [Canvas `setLineDash()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash). This was specific to Canvas implementation and was removed from the core library. See rendering library documentation for customization.
- `options.commit.tooltipHTMLFormatter` was used to format HTML content of commit tooltips. This can now be achieved with Commit's `options.renderTooltip(commit)`. Implementation details depend on the rendering library.
- `options.branch.labelRotation` was used to customize branch label orientation. We dropped that as we think it adds unecessary complexity.

### Added

- `options.branch.label.bgColor` to customize the color of the branch label background color.
- `options.branch.label.strokeColor` to customize the color of the branch label box stroke.
- `options.branch.label.borderRadius` to customize the border radius of the branch label box.

In v2, you can extend an existing template with the `templateExtend()` function:

```js
import { createGitgraph, templateExtend, TemplateName } from "@gitgraph/js";

const metroTemplateWithoutAuthor = templateExtend(TemplateName.Metro, {
  commit: {
    message: {
      displayAuthor: false,
    },
  },
});

const graphContainer = document.getElementById("gitgraph");
const gitgraph = createGitgraph(graphContainer, {
  template: metroTemplateWithoutAuthor,
});
```

## Import (experimental)

In v2, you can now import a graph from a JSON file. The expected format of the JSON file is the one of [git2json](https://github.com/fabien0102/git2json).

Feature is still experimental though. A lot of work still have to be done, notably regarding performance.

If you're using it, don't hesitate to create issues to report feedbacks, so we can improve it until it's great!

Thanks!
