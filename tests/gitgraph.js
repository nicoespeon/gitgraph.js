// Unit tests for the `GitGraph` library.
describe("Gitgraph", function () {

  // Scenario - basic variables for tests
  // TO BE REFACTOR for proper testing (beforeEach / afterEach)
  var body = document.createElement("body");
  document.body = body;
  
  var gitGraph = new GitGraph({
    canvas: document.createElement("canvas"),
    template: "metro"
  });

  var master = gitGraph.branch("master").commit().commit();
  var develop = gitGraph.branch("develop").commit();
  master.commit("message");
  gitGraph.commit("plop");

  it("should hide messages in compact mode", function () {
    var gitGraph = new GitGraph({
      canvas: document.createElement("canvas"),
      mode: "compact"
    });

    expect(gitGraph.template.commit.message.display)
      .toEqual(false);
  });

  it("should load the right template", function () {
    expect(gitGraph.template)
      .toEqual(gitGraph.newTemplate("metro"));
  });

  it("should load the default template", function () {
    var gitGraph = new GitGraph({
      canvas: document.createElement("canvas"),
      template: "wrongInput"
    });
    expect(gitGraph.template)
      .toEqual(gitGraph.newTemplate("metro"));
  });

  describe("Branch", function () {
    it("shoud have a name", function () {
      expect(gitGraph.branchs[0].name)
        .toEqual("master");
    });

    it("should be HEAD on develop", function () {
      expect(gitGraph.HEAD)
        .toEqual(develop);
    });

    it("should have the first color of template theme", function () {
      expect(master.color)
        .toEqual(gitGraph.template.colors[0]);
    });

    it("should have the color of branch template", function () {
      var gitGraph = new GitGraph({
        canvas: document.createElement("canvas"),
        template: "blackarrow"
      });
      var master = gitGraph.branch("master");

      expect(master.color)
        .toEqual(gitGraph.template.branch.color);
    });

    it("should have the right column number", function () {
      expect(master.column)
        .toEqual(0);
      expect(develop.column)
        .toEqual(1);
    });

    it("should have the right commits count", function () {
      expect(master.commits.length)
        .toEqual(3);
      expect(develop.commits.length)
        .toEqual(2);
    });
  });

  describe("Commit", function () {
    it("should have the right message", function () {
      expect(master.commits[2].message)
        .toEqual("message");
    });

    it("should have a pretty color", function () {
      expect(master.commits[2].dotColor)
        .toEqual(gitGraph.template.colors[0]);
      expect(master.commits[2].messageColor)
        .toEqual(gitGraph.template.colors[0]);
    });

    it("should have the right position", function () {
      // Commit on master
      expect(master.commits[2].x)
        .toEqual(0);
      expect(master.commits[2].y)
        .toEqual(240);

      // Commit on develop
      expect(develop.commits[1].x)
        .toEqual(50);
      expect(develop.commits[1].y)
        .toEqual(320);
    });
  });
});
