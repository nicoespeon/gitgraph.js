var gitGraph = new GitGraph({
  template: 'blackarrow' // 'blackarrow' or 'metro' or Template Object
});

var master = gitGraph.branch('master');
gitGraph.commit({
  message:'Initial commit' ,
  color: 'pink'
}); // Commit on HEAD Branch
gitGraph.commit();
gitGraph.commit();

var dev = gitGraph.branch({
  name: 'dev',
});
gitGraph.commit('Youhou \\o/');
gitGraph.commit({
  dotColor: 'white',
  dotSize: 10,
  dotStrokeWidth: 10,
  message: "Alors c'est qui le papa ?",
  author: "Me <me@planee.fr>"
});
gitGraph.commit();

//master.checkout();
var test = gitGraph.branch({
  name: 'test',
});
gitGraph.commit({
  message: 'test'
});
gitGraph.commit();
dev.commit().commit(); // Commit on 'dev' Branch
master.checkout();
gitGraph.author = 'Fabien0102 <fabien0102@planee.fr>'; // Change author
master.commit();
dev.merge();
test.commit();
test.merge(null, false); // Merge into HEAD without merge commit
test.commit('error'); // Error: You can't commit on merged branch
gitGraph.render();
