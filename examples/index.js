var gitGraph = new GitGraph();

var master = gitGraph.branch({
  name: 'master',
  size: 200
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

//master.checkout();
var test = gitGraph.branch({
  name: 'test',
});
gitGraph.commit({
message: 'test'
});
gitGraph.commit();
dev.commit(); // Commit on 'dev' Branch
master.checkout();
gitGraph.author = 'Fabien0102 <fabien0102@planee.fr>'; // Change author
master.commit();
dev.merge();
test.commit();
master.commit();
test.merge(null, false); // Merge into HEAD without merge commit

gitGraph.render();