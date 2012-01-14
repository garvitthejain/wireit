YUI.add('container-base', function(Y) {

/**
 * ContainerBase is an Overlay (XY positioning)
 * It is a WidgetChild (belongs to Layer)
 * It is also a WidgetParent (has many terminals)
 * @class ContainerBase
 * @extends Overlay
 * @uses WidgetParent
 * @uses WidgetChild
 * @uses WiresDelegate
 * @constructor
 */
var ContainerBase = Y.Base.create("container-base", Y.Overlay, [Y.WidgetParent, Y.WidgetChild, Y.WiresDelegate], {
	
	renderUI: function() {
		
		// make the overlay draggable
		this.drag = new Y.DD.Drag({
			node: this.get('boundingBox'), 
			handles : [ this._findStdModSection(Y.WidgetStdMod.HEADER) ]
		});
		
		this.drag.on('drag:drag', function() {
			this.redrawAllWires();
		}, this);
		
		// Make the overlay resizable
		if(this.get('resizable')) {
			var contentBox = this.get('contentBox');
			var resize = new Y.Resize({ 
				node: contentBox,
				handles: 'br'
			});
			/*resize.plug(Y.Plugin.ResizeConstrained, {
				minWidth: 50,
				minHeight: 50,
				maxWidth: 300,
				maxHeight: 300
				//preserveRatio: true
	    	});*/
			// On resize, fillHeight, & align terminals & wires
			resize.on('resize:resize', function() {
				// TODO: fillHeight
				this._fillHeight();
				this.alignTerminals();
				this.redrawAllWires();
			}, this);
		}
		
	},
	
	alignTerminals: function() {
		var contentBox = this.get('contentBox');
		this.each(function(term) {
			if(term.get('align')) {
				term.align( contentBox, ["tl",term.get('align').points[1]]);
			}
		}, this);
	},
	
	
	syncUI: function() {
		
		// Align terminals
		var c = this;
		this.each(function(term) {
			if(term.get('align')) {	
				term.align( c.get('contentBox') , ["tl",term.get('align').points[1]]);
			}
		});
		
	},
	
	// TODO: 
	toJSON: function() {
		//console.log(this);
		
		var o = {
		width: this.get('width'),
		height: this.get('height'),
		xy: this.get('xy'),
			type: "ContainerBase"/*,
			children: []*/
		};
		/*Y.Array.each(this._items, function(item) {
			o.children.push(item.toJSON());
		});*/
		return o;
	},
	
	getTerminal: function(name) {
		Y.Array.each(this._items, function(item) {
			if(item.get('name') === name) {
				return item;
			}
		});
		return null;
	}

}, {

	ATTRS: {
		defaultChildType: {
			value: 'Terminal'
		},
		
		zIndex: {
			value: 5
		},
		
		resizable: {
			value: true
		},
		
		fillHeight: {
			value: true
		}
	},
	
	EIGHT_POINTS: [
		{ align: {points:["tl", "tl"]}, dir: [-0.5, -0.5], name: "tl" },
		{ align: {points:["tl", "tc"]}, dir: [0, -1], name: "tc" },
		{ align: {points:["tl", "tr"]}, dir: [0.5, -0.5], name: "tr" },
		{ align: {points:["tl", "lc"]}, dir: [-1, 0], name: "lc" },
		{ align: {points:["tl", "rc"]}, dir: [1, 0], name: "rc" },
		{ align: {points:["tl", "br"]}, dir: [0.5, 0.5], name: "br" },
		{ align: {points:["tl", "bc"]}, dir: [0,1], name: "bc" },
		{ align: {points:["tl", "bl"]}, dir: [-0.5, 0.5], name: "bl" }
	],

	FOUR_CORNERS: [
		{ align: {points:["tl", "tl"]}, dir: [-0.5, -0.5], name: "tl" },
		{ align: {points:["tl", "tr"]}, dir: [0.5, -0.5], name: "tr" },
		{ align: {points:["tl", "br"]}, dir: [0.5, 0.5], name: "br" },
		{ align: {points:["tl", "bl"]}, dir: [-0.5, 0.5], name: "bl" }
	],

	FOUR_EDGES: [
		{ align: {points:["tl", "tc"]}, dir: [0, -1], name: "tc" },
		{ align: {points:["tl", "lc"]}, dir: [-1, 0], name: "lc" },
		{ align: {points:["tl", "rc"]}, dir: [1, 0], name: "rc" },
		{ align: {points:["tl", "bc"]}, dir: [0,1], name: "bc" }
	]
	
});

Y.ContainerBase = ContainerBase;

}, '3.5.0pr1a', {requires: ['overlay','widget-parent','widget-child','dd','resize','terminal-base','wires-delegate']});
