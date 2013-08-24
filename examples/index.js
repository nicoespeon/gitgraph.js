var gitGraph = new GitGraph({
  template: new Template({
    branch: {
      color: '#000000',
      lineWidth: 3,
      margin: 50,
      mergeStyle: 'straight'
    },
    commit: {
      spacing: 60,
      dot: {
        size: 12,
        strokeColor: '#000000',
        strokeWidth: 7
      },
      message: {
        color: 'black'
      }
    },
    arrow: {
      height: 16,
      width: 13
    }
  })
});

var master = gitGraph.branch({
  name: 'master',
});
gitGraph.commit(); // Commit on HEAD Branch
gitGraph.commit();
gitGraph.commit();

var dev = gitGraph.branch({
  name: 'dev',
});
gitGraph.commit('Youhou \\o/');
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
//master.commit();
test.merge(null, false); // Merge into HEAD without merge commit

gitGraph.render();
