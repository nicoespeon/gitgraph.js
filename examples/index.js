var gitGraph = new GitGraph();

var master = gitGraph.branch({
  name: 'master',
  size: 400
});
gitGraph.commit(); // Commit on HEAD Branch
gitGraph.commit();
gitGraph.commit();

var dev = gitGraph.branch({
  name: 'dev',
});
gitGraph.commit();
gitGraph.commit();
gitGraph.commit();

master.checkout();
var test = gitGraph.branch({
  name: 'test',
});
gitGraph.commit({
message: 'test'
});
gitGraph.commit();
dev.commit(); // Commit on 'dev' Branch
master.commit();
master.checkout();
dev.merge();
test.merge();

gitGraph.render();