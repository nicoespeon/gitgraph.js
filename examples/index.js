// Main for test
var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

var master = new Branch({
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
test.merge();