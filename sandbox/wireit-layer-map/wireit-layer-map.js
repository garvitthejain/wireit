YUI.add("layer-map", function(Y){


/**
 * Widget to display a minimap on a layer
 * @class LayerMap
 * @extends CanvasElement
 * @constructor
 * @param {Layer} layer the layer object it is attached to
 * @param {Obj} options configuration object
 */
Y.LayerMap = function(layer,options) {
   
   /**
    * @attribute layer
    */
   this.layer = layer;
   
   this.setOptions(options);

	if(typeof options.parentEl == "string") {
		this.parentEl = Y.one(options.parentEl);
	}
	else if(this.layer && !this.parentEl) {
		this.parentEl = this.layer.el;
	}

   // Create the canvas element
   Y.LayerMap.superclass.constructor.call(this, this.parentEl);
   
   // Set the className
   this.element.className = this.className;
   
   this.initEvents();
   
   this.draw();
};

Y.extend(Y.LayerMap, Y.CanvasElement, {

   /** 
    * @attribute className
    * @description CSS class name for the layer map element
    * @default "WireIt-LayerMap"
    * @type String
    */
	className: "WireIt-LayerMap",
	
	/** 
    * @attribute style
    * @description display style
    * @default "WireIt-LayerMap"
    * @type String
    */
	style: "rgba(0, 0, 200, 0.5)",

	/** 
    * @attribute parentEl
    * @description DOM element that schould contain the layer
    * @default null
    * @type DOMElement
    */
	parentEl: null,
	
	/** 
    * @attribute lineWidth
    * @description Line width
    * @default 2
    * @type Integer
    */
	lineWidth: 2,

   /**
    * Set the options by putting them in this (so it overrides the prototype default)
    * @method setOptions
    */
   setOptions: function(options) {
      for(var k in options) {
			if( options.hasOwnProperty(k) ) {
				this[k] = options[k];
			}
		}
   },
   
   
   /**
    * Listen for various events that should redraw the layer map
    * @method initEvents
    */
   initEvents: function() {
      
      var layer = this.layer;
      
      // TODO: improve
      Y.one(this.element).on('mousedown', this.onMouseDown, this, true);
      Y.one(this.element).on('mouseup', this.onMouseUp, this, true);
      Y.one(this.element).on('mousemove', this.onMouseMove, this, true);
      Y.one(this.element).on('mouseout', this.onMouseUp, this, true);
      
      layer.on('eventAddWire', this.draw, this, true);
      layer.on('eventRemoveWire', this.draw, this, true);
      layer.on('eventAddContainer', this.draw, this, true);
      layer.on('eventRemoveContainer', this.draw, this, true);
      layer.on('eventContainerDragged', this.draw, this, true);
      layer.on('eventContainerResized', this.draw, this, true);

      Y.one(this.layer.el).on("scroll", this.onLayerScroll, this, true);
   },
   
   /**
    * When a mouse move is received
    * @method onMouseMove
    * @param {Event} e Original event
    * @param {Array} args event parameters
    */
   onMouseMove: function(e, args) { 
      e.stop();
      if(this.isMouseDown) {
         this.scrollLayer(e.clientX,e.clientY);
		}
   },   
   
   /**
    * When a mouseup or mouseout is received
    * @method onMouseUp
    * @param {Event} e Original event
    * @param {Array} args event parameters
    */
   onMouseUp: function(e, args) {
      e.stop();
      this.isMouseDown = false;
   },
   
   /**
    * When a mouse down is received
    * @method onMouseDown
    * @param {Event} e Original event
    * @param {Array} args event parameters
    */
   onMouseDown: function(e, args) {
      e.stop();
      this.scrollLayer(e.clientX,e.clientY);
      this.isMouseDown = true;
   },
   
   /**
    * Scroll the layer from mousedown/mousemove
    * @method scrollLayer
    * @param {Integer} clientX mouse event x coordinate
    * @param {Integer} clientY mouse event y coordinate
    */
   scrollLayer: function(clientX, clientY) {
      
      var canvasPos = Y.one(this.element).getXY();
      var click = [ clientX-canvasPos[0], clientY-canvasPos[1] ];
      
      // Canvas Region
      var canvasRegion = Y.one(this.element).getRegion();
      var canvasWidth = canvasRegion.right-canvasRegion.left-4;
      var canvasHeight = canvasRegion.bottom-canvasRegion.top-4;
      
      // Calculate ratio
      var layerWidth = this.layer.el.scrollWidth;
      var layerHeight = this.layer.el.scrollHeight;
      var hRatio = Math.floor(100*canvasWidth/layerWidth)/100;
      var vRatio = Math.floor(100*canvasHeight/layerHeight)/100;
      
      // Center position:
      var center = [ click[0]/hRatio, click[1]/vRatio ];
      
      // Region
      var region = Y.one(this.layer.el).getRegion();
      var viewportWidth = region.right-region.left;
      var viewportHeight = region.bottom-region.top;
      
      // Calculate the scroll position of the layer
      var topleft = [ Math.max(Math.floor(center[0]-viewportWidth/2),0) ,  Math.max(Math.floor(center[1]-viewportHeight/2), 0) ];
      if( topleft[0]+viewportWidth > layerWidth ) {
         topleft[0] = layerWidth-viewportWidth;
      }
      if( topleft[1]+viewportHeight > layerHeight ) {
         topleft[1] = layerHeight-viewportHeight;
      }
     
      this.layer.el.scrollLeft = topleft[0];
      this.layer.el.scrollTop = topleft[1];
   
   },
   
   /**
    * Redraw after a timeout
    * @method onLayerScroll
    */
   onLayerScroll: function() {
      
      if(this.scrollTimer) { window.clearTimeout(this.scrollTimer); }
      var that = this;
      this.scrollTimer = window.setTimeout(function() {
         that.draw();
      },50);
      
   },
   
   /**
    * Redraw the layer map
    * @method draw
    */
   draw: function() {
      var ctxt=this.getContext();
      
      // Canvas Region
      var canvasRegion = Y.one(this.element).getRegion();
      var canvasWidth = canvasRegion.right-canvasRegion.left-4;
      var canvasHeight = canvasRegion.bottom-canvasRegion.top-4;
      
      // Clear Rect
      ctxt.clearRect(0,0, canvasWidth, canvasHeight);
      
      // Calculate ratio
      var layerWidth = this.layer.el.scrollWidth;
      var layerHeight = this.layer.el.scrollHeight;
      var hRatio = Math.floor(100*canvasWidth/layerWidth)/100;
      var vRatio = Math.floor(100*canvasHeight/layerHeight)/100;

      // Draw the viewport
      var region = Y.one(this.layer.el).getRegion();
      var viewportWidth = region.right-region.left;
      var viewportHeight = region.bottom-region.top;
      var viewportX = this.layer.el.scrollLeft;
      var viewportY = this.layer.el.scrollTop;
      ctxt.strokeStyle= "rgb(200, 50, 50)";
      ctxt.lineWidth=1;
      ctxt.strokeRect(viewportX*hRatio, viewportY*vRatio, viewportWidth*hRatio, viewportHeight*vRatio);
   
      // Draw containers and wires
      ctxt.fillStyle = this.style;
      ctxt.strokeStyle= this.style;
      ctxt.lineWidth=this.lineWidth;
      this.drawContainers(ctxt, hRatio, vRatio);
      this.drawWires(ctxt, hRatio, vRatio);
   },
   
   /**
    * Subroutine to draw the containers
    * @method drawContainers
    */
   drawContainers: function(ctxt, hRatio, vRatio) {
      var containers = this.layer.containers;
      var n = containers.length,i,gIS = Y.WireIt.getIntStyle,containerEl;
      for(i = 0 ; i < n ; i++) {
         containerEl = containers[i].el;
         ctxt.fillRect(gIS(containerEl, "left")*hRatio, gIS(containerEl, "top")*vRatio, 
                       gIS(containerEl, "width")*hRatio, gIS(containerEl, "height")*vRatio);
      }
   },
   
   /**
    * Subroutine to draw the wires
    * @method drawWires
    */
   drawWires: function(ctxt, hRatio, vRatio) {
      var wires = this.layer.wires;
      var n = wires.length,i,wire;
      for(i = 0 ; i < n ; i++) {
         wire = wires[i];
         var pos1 = wire.terminal1.getXY(), 
             pos2 = wire.terminal2.getXY();

         // Stroked line
         // TODO:
         ctxt.beginPath();
         ctxt.moveTo(pos1[0]*hRatio,pos1[1]*vRatio);
         ctxt.lineTo(pos2[0]*hRatio,pos2[1]*vRatio);
         ctxt.closePath();
         ctxt.stroke();
      }
      
   }
   
   
});

}, '0.7.0',{
  requires: ['layer']
});
