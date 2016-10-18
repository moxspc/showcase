
const moxcad = window.require('moxcad');
const THREE = require('three');
require('../ext/TrackballControls');

function loadSolid1() {
	var point1 = new moxcad.geom.Point(0,0,0);
	var point2 = new moxcad.geom.Point(1,0,0);
	var point3 = new moxcad.geom.Point(1,1,0);
	var point4 = new moxcad.geom.Point(0,1,0);
	var lineseg1 = new moxcad.geom.LineSegment(point1, point2);
	var lineseg2 = new moxcad.geom.LineSegment(point2, point3);
	var lineseg3 = new moxcad.geom.LineSegment(point3, point4);
	var lineseg4 = new moxcad.geom.LineSegment(point4, point1);
	var edge1 = lineseg1.makeEdge();
	var edge2 = lineseg2.makeEdge();
	var edge3 = lineseg3.makeEdge();
	var edge4 = lineseg4.makeEdge();
	var wire = new moxcad.topo.Wire(edge1, edge2, edge3, edge4);
	var face = wire.makeFace();
	var dir = new moxcad.geom.Vector(0,0,1);
	var solid = moxcad.ops.extrude(face, dir);

	return solid.tessellate();
}

function loadSolid2() {
  var point1 = new moxcad.geom.Point(0,0,0);
  var point2 = new moxcad.geom.Point(1,0,0);
  var point3 = new moxcad.geom.Point(1,1,0);
  var point3_4 = new moxcad.geom.Point(0.5,1.5,0);
  var point4 = new moxcad.geom.Point(0,1,0);

  var lineseg1 = new moxcad.geom.LineSegment(point1, point2);
  var lineseg2 = new moxcad.geom.LineSegment(point2, point3);
  var circarc3 = new moxcad.geom.CircularArc(point3, point3_4, point4);
  var lineseg4 = new moxcad.geom.LineSegment(point4, point1);

  var edge1 = lineseg1.makeEdge();
  var edge2 = lineseg2.makeEdge();
  var edge3 = circarc3.makeEdge();
  var edge4 = lineseg4.makeEdge();

  var wire = new moxcad.topo.Wire(edge1, edge2, edge3, edge4);
  var face = wire.makeFace();
  var dir = new moxcad.geom.Vector(0,0,1);
  var solid = moxcad.ops.extrude(face, dir);

  return solid.tessellate();
}


window.onload = function () {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  var material = new THREE.MeshLambertMaterial( { color: 0xff8800, shading: THREE.FlatShading });

  let bufferObj = loadSolid2();
  let faceBuf = bufferObj.faceBuffers[0];

  let vtx_ = new Float32Array([0,0,0,0,0,1,5,0,0,5,0,1]);
  let idx_ = new Uint32Array([2,0,1,2,1,3]);

  for(let faceBuf of bufferObj.faceBuffers) {
    var geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(faceBuf.idx), 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(faceBuf.vtx), 3));
    if(faceBuf.nrm) {
      geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(faceBuf.nrm), 3));
    }
    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
  }

  scene.add( new THREE.AmbientLight( 0x111111 ) );
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.525 );
  directionalLight.position.x = Math.random() - 0.5;
  directionalLight.position.y = Math.random() - 0.5;
  directionalLight.position.z = Math.random() - 0.5;
  directionalLight.position.normalize();
  scene.add( directionalLight );

  camera.position.z = 5;

  let controls = new THREE.TrackballControls( camera, renderer.domElement );
  controls.minDistance = 1.0;
  controls.maxDistance = 8.0;
  controls.dynamicDampingFactor = 0.1;

  var render = function () {
    requestAnimationFrame( render );
    controls.update();
    renderer.render(scene, camera);
  };

  render();
};
