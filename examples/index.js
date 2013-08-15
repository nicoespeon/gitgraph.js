var gitGraph = new GitGraph();

var master = gitGraph.branch({
  name: 'master',
  size: 400
});
gitGraph.commit();
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
gitGraph.commit();
gitGraph.commit();
gitGraph.commit(null, dev);
master.checkout();
dev.merge();;
test.merge();


/*var master = new Branch({
  context: context,
  name: "master",
  origin: canvas.height - 20,
});

var dev = new Branch({
  context: context,
  name: "dev",
  origin: canvas.height - 120,
  //color: "green",
  size: 40,
  parent: master
});
master.checkout();
dev.merge();

var test = new Branch({
  context: context,
  name: "test",
  origin: canvas.height - 120,
  //color: "blue",
  size: 200,
  parent: master
});
master.checkout();
test.merge();*/