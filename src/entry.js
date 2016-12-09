
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
  var camera = new THREE.PerspectiveCamera(
    75, window.innerWidth/window.innerHeight, 0.1, 1000 );

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  let pickables = [];

  let bufferObj = loadSolid2();

  // Add mesh for each face
  var faceMaterial = new THREE.MeshLambertMaterial(
    { color: 0xff8800, shading: THREE.SmoothShading });
  for(let faceBuf of bufferObj.faceBuffers) {
    var geometry = new THREE.BufferGeometry();
    geometry.setIndex(
      new THREE.BufferAttribute(new Uint32Array(faceBuf.idx), 1));
    geometry.addAttribute('position',
      new THREE.BufferAttribute(new Float32Array(faceBuf.vtx), 3));
    if(faceBuf.nrm) {
      geometry.addAttribute('normal',
        new THREE.BufferAttribute(new Float32Array(faceBuf.nrm), 3));
    }
    let mesh = new THREE.Mesh(geometry, faceMaterial);
    //scene.add(mesh);
    //pickables.push(mesh);
  }

  // Add line for each edge
  var lineMaterial = new THREE.LineBasicMaterial(
    { vertexColors: THREE.VertexColors, linewidth : 1 });
  for(let edgeBuf of bufferObj.edgeBuffers) {
    let geometry = new THREE.BufferGeometry();
    let positions = [];
    let indices = [];
    let colors = [];
    let i=0;
    for(let point of edgeBuf.points) {
      positions.push(...point);
      colors.push(Math.random()*0.5+0.5, Math.random()*0.5+0.5, 1);
      if(i < edgeBuf.points.length-1) {
        indices.push(i, i+1);
      }
      i++;
    }
    geometry.addAttribute('position',
      new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.addAttribute('color',
      new THREE.BufferAttribute(new Float32Array(colors), 3));
    geometry.setIndex(
      new THREE.BufferAttribute(new Uint32Array(indices), 1));
    geometry.computeBoundingSphere();
    let mesh = new THREE.LineSegments( geometry, lineMaterial );
    scene.add(mesh);
    pickables.push(mesh);
  }

  scene.add( new THREE.AmbientLight( 0x111111 ) );
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.525 );
  directionalLight.position.x = 0;
  directionalLight.position.y = 5;
  directionalLight.position.z = 5;
  directionalLight.position.normalize();
  scene.add( directionalLight );

  let axishelper = new THREE.AxisHelper(5);
  scene.add(axishelper);

  camera.position.z = 5;
  camera.position.y = 5;
  camera.position.x = 5;
  camera.lookAt(new THREE.Vector3());

  let raycaster = new THREE.Raycaster();
  raycaster.linePrecision = 3;

  let controls = new THREE.TrackballControls(camera, renderer.domElement );
  controls.minDistance = 1.0;
  controls.maxDistance = 8.0;
  controls.dynamicDampingFactor = 0.1;

  let meshUnderCursor = null;

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

  let mouse = new THREE.Vector2();

  function onDocumentMouseMove(event) {

    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  }

  function onWindowResize(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  var render = function () {
    requestAnimationFrame(render);
    controls.update();

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(pickables, true);
    if (intersects.length > 0) {
      // if(meshUnderCursor) {
      //   if(meshUnderCursor.material instanceof THREE.LineBasicMaterial) {
      //     meshUnderCursor.material.linewidth = 1;
      //   }
      // }
      pickables.forEach(mesh => {
        if(mesh.material instanceof THREE.LineBasicMaterial) {
          mesh.material.linewidth = 1;
        }
      });
      meshUnderCursor = intersects[0].object;
      meshUnderCursor.material.linewidth = 4;
      console.log(meshUnderCursor);
    }

    renderer.render(scene, camera);
  };

  render();
};

