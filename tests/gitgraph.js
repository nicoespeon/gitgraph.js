describe( "Gitgraph.js", function () {

  var gitGraph, master, develop, canvas;

  beforeEach( function () {
    document.body = document.createElement( "body" );
    canvas = document.createElement( "canvas" );
  } );

  describe( "Gitgraph", function () {

    it( "should hide messages in compact mode", function () {
      gitGraph = new GitGraph( { canvas: canvas, mode: "compact" } );

      expect( gitGraph.template.commit.message.display ).toEqual( false );
    } );

    it( "should load the right template", function () {
      gitGraph = new GitGraph( { canvas: canvas, template: "blackarrow" } );

      expect( gitGraph.template ).toEqual( gitGraph.newTemplate( "blackarrow" ) );
    } );

    it( "should load the default template", function () {
      gitGraph = new GitGraph( { canvas: canvas, template: "wrongInput" } );

      expect( gitGraph.template ).toEqual( gitGraph.newTemplate( "metro" ) );
    } );

  } );

  describe( "Branch", function () {

    beforeEach( function () {
      gitGraph = new GitGraph( { canvas: canvas, template: "metro" } );

      master = gitGraph.branch( "master" );
      develop = gitGraph.branch( "develop" );
    } );

    it( "shoud have a name", function () {
      expect( gitGraph.branchs[ 0 ].name ).toEqual( "master" );
    } );

    it( "should be HEAD on develop", function () {
      expect( gitGraph.HEAD ).toEqual( develop );
    } );

    it( "should have the first color of template theme", function () {
      expect( master.color ).toEqual( gitGraph.template.colors[ 0 ] );
    } );

    it( "should have the color of branch template", function () {
      gitGraph = new GitGraph( { canvas: canvas, template: "blackarrow" } );
      master = gitGraph.branch( "master" );

      expect( master.color ).toEqual( gitGraph.template.branch.color );
    } );

    it( "should have the right column number", function () {
      expect( master.column ).toEqual( 0 );
      expect( develop.column ).toEqual( 1 );
    } );

    it( "should have the right commits count", function () {
      master.commit().commit().commit();

      expect( master.commits.length ).toEqual( 3 );
    } );

  } );

  describe( "Commit", function () {

    beforeEach( function () {
      gitGraph = new GitGraph( { canvas: canvas, template: "metro" } );

      master = gitGraph.branch( "master" );
      master.commit().commit();
      develop = gitGraph.branch( "develop" );
      develop.commit();
      master.commit( "message" );
      gitGraph.commit( "plop" );
    } );

    it( "should have the right message", function () {
      expect( master.commits[ 2 ].message ).toEqual( "message" );
    } );

    it( "should have a pretty color", function () {
      expect( master.commits[ 2 ].dotColor ).toEqual( gitGraph.template.colors[ 0 ] );
      expect( master.commits[ 2 ].messageColor ).toEqual( gitGraph.template.colors[ 0 ] );
    } );

    it( "should have the right position", function () {
      // Commit on master
      expect( master.commits[ 2 ].x ).toEqual( 0 );
      expect( master.commits[ 2 ].y ).toEqual( 240 );

      // Commit on develop
      expect( develop.commits[ 1 ].x ).toEqual( 50 );
      expect( develop.commits[ 1 ].y ).toEqual( 320 );
    } );

  } );

  describe( "Tag", function () {
    var latestCommit;

    beforeEach( function () {
      gitGraph = new GitGraph( { canvas: canvas, template: "metro" } );

      master = gitGraph.branch( "master" );
      master.commit().commit();
      gitGraph.tag("this is a tag")

      latestCommit = gitGraph.commits[ gitGraph.commits.length-1 ];
    } );

    it( "should have the right name", function () {
      expect( gitGraph.tags[ 0 ].name ).toEqual( "this is a tag" );
    } );

    it( "should defaults to template pretty color", function () {
      expect( gitGraph.tags[ 0 ].color ).toEqual( gitGraph.template.tag.color );
      expect( gitGraph.tags[ 0 ].bgColor ).toEqual( gitGraph.template.tag.bgColor );
    } );

    it( "should defaults to template font", function () {
      expect( gitGraph.tags[ 0 ].font ).toEqual( gitGraph.template.tag.font );
    } );

    it( "should have latest commit as reference", function () {
      expect( gitGraph.tags[ 0 ].reference ).toEqual( latestCommit );
    } );

    it( "should be displayed by default", function () {
      expect( gitGraph.tags[ 0 ].display ).toBe(true);
    } );

    it( "should have base position equals to reference position", function () {
      expect( gitGraph.tags[ 0 ].x ).toEqual( latestCommit.x );
      expect( gitGraph.tags[ 0 ].y ).toEqual( latestCommit.y );
    } );

  } );


} );
