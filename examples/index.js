var gitGraph = new GitGraph();

var master = gitGraph.branch({
  name: 'master',
  origin: 300,
  size: 300
});
var dev = gitGraph.branch({
  name: 'dev',
  origin: 240
});
master.checkout();
dev.merge();;
var test = gitGraph.branch({
  name: 'test',
  origin: 220,
});
gitGraph.commit({
  
});
master.checkout();
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