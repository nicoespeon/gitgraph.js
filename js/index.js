// ----------------------- TEMPLATE GITGRAPHS ----------------------- //
var metro = new GitGraph({
  template: "metro",
  mode: "compact",
  orientation: "horizontal",
  elementId: "gitgraph-template-metro"
});

var memaster = metro.branch("master").commit().commit();
var medevelop = metro.branch("develop").commit();
memaster.commit();
medevelop.commit().commit();
medevelop.merge(memaster);

// ----------------------------------------------------------------

var blackarrow = new GitGraph({
  template: "blackarrow",
  mode: "compact",
  orientation: "horizontal",
  elementId: "gitgraph-template-blackarrow"
});

var bamaster = blackarrow.branch("master").commit().commit();
var badevelop = blackarrow.branch("develop").commit();
bamaster.commit();
badevelop.commit().commit();
badevelop.merge(bamaster);

// ----------------------- MAIN GITGRAPH ----------------------- //
// /!\ Must be in last for window.onresize() event /!\

var gitgraph = new GitGraph({
  template: "metro",
  author: ""
});

gitgraph.template.commit.message.font = "normal 24pt Calibri";

var project = gitgraph.branch("project")
  .commit({ message: "Project presentation", detailId: "detail-presentation" })
  .commit({ message: "Quick start", detailId: "detail-init" });

var example = gitgraph.branch("how-to")
  .commit({ message: "Basics", detailId: "detail-base" })
  .commit({ message: "Create a new branch", detailId: "detail-branch" })
  .commit({ message: "Add some commits", detailId: "detail-commit" })
  .commit({ message: "Checkout", detailId: "detail-checkout" })
  .commit({ message: "Merge your branch", detailId: "detail-merge" });

var links = gitgraph.branch("contribution")
  .commit({ message: "Wanna contribute?", detailId: "detail-contribute" })
  .commit({ message: "Use cases examples", detailId: "detail-examples" });

example.merge(project).delete();
links.merge(project).delete();

project.commit("See you soon \\o/");

var sergio = gitgraph.branch("sergio")
  .commit( { message: "Do you like George Michael?", detailId: "detail-sergio" });

// ----------------------- NAV ----------------------- //
$(function(){
  $("nav a").click(function(event){
    var margintop = parseInt($("section").css("marginTop"));
    var position = $("#detail-"+event.target.id.split("-")[1]).position().top - margintop - 30;
    $('html, body').animate({scrollTop: position});
  });
});
