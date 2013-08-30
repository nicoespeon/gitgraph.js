var gitGraph = new GitGraph({
  template: 'blackarrow' // 'blackarrow' or 'metro' or Template Object
});

var master = gitGraph.branch('master'); // Create branch named 'master'
gitGraph.commit('Initial commit') // Commit on HEAD Branch (here this is master)
.commit('My second commit')
.commit('Add awesome feature');

var dev = gitGraph.branch('dev'); // Create branch named 'dev' (a HEAD fork)
dev.commit('Youhou \\o/'); // Commit on dev
master.commit("I'm the master !"); // Commit on master

// Advanced commit method with style and specific author (HEAD)
gitGraph.commit({
  dotColor: 'white',
  dotSize: 10,
  dotStrokeWidth: 10,
  message: "Alors c'est qui le papa ?",
  author: "Me <me@planee.fr>"
});

//master.checkout(); // Checkout on master branch for create 'test' since master
var test = gitGraph.branch('test');
gitGraph.commit({
  message: 'test'
});
gitGraph.commit();
dev.commit().commit(); // 2 default Commit on 'dev'

gitGraph.author = 'Fabien0102 <fabien0102@planee.fr>'; // Change default author
master.commit(); // Default commit on master (you can see the new author)

master.checkout(); // Checkout on master branch
dev.merge(); // Merge dev into HEAD (master) (automatic merge commit)
test.commit('Final commit');
test.merge(null, false); // Merge into HEAD without merge commit

test.commit('error'); // Error: You can't commit on merged branch

gitGraph.render(); // Render gitGraph
