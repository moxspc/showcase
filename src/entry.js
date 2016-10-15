
const moxcad = window.require('moxcad')

window.onload = function () {
	var point1 = new moxcad.geom.Point(0,0,0);
	var point2 = new moxcad.geom.Point(22.8,0,0);
	var point3 = new moxcad.geom.Point(1,21.8,0);
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

	var bufferObj = solid.tessellate();
	let fi = 0;
	for(let faceBuf of bufferObj.faceBuffers) {
		console.log('Face',fi);
		console.log('Index');
		for(let i=0; i<faceBuf.idx.length; i++) {
			console.log(faceBuf.idx[i]);
		}
		console.log('Vertex');
		for(let i=0; i<faceBuf.vtx.length; i++) {
			console.log(faceBuf.vtx[i]);
		}
		fi++;
	}
};
