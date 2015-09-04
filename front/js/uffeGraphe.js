function UffeGraphe () {




	/* create an svg drawing */
	
	
	this.draw = SVG('drawing');

	this.line_width = 3;
	this.graduation_ratio_width = 30;

	this.graph_width = 400;
	this.maxvalue = 10;

	this.marginForLabels = 50;
	this.layer_plot_size = 10;



	this.allAxis = [];	

	this.allAxisSvgObg;
	this.allAxisLabelsSvgObj;
	
	// Le layer editable
	this.responseLayer = [];
	this.responseLayerSvgObj = this.draw.group();
	
	
	// Les layeurs affichés
	this.allViewLayers = [];	
	this.allViewLayersSvgObj = [];	
	
	this.on_change_callback = false;
	
	/**
	 *	Méthode qui trace un axe
	 *	
	 *	@brief 	trace un axe et les gaduations mais pas la legende
	 *
	 */	
	
	this.drawAnAxis = function(lineObj) {
		// Couleur par defaut
		var color = '#000';
		if (lineObj.lineColor !== undefined) {
			color = lineObj.lineColor;
		}
	
		var group = this.draw.group();
		var rect = this.draw.rect(this.line_width, this.graph_width).move(this.graph_width/2, 0 ).fill(color);	
		group.add(rect);
		
		for(var i = 0; i <= (this.maxvalue * 2); i++) {	
			var newMoveto =  i * (this.graph_width/(this.maxvalue * 2));
			var rectMini = this.draw.rect(this.graph_width/this.graduation_ratio_width, this.line_width).move(this.graph_width/2	 - (this.graph_width/this.graduation_ratio_width/2) + (this.line_width / 2), newMoveto).fill(color);
			group.add(rectMini);	
		}
		group.rotate(lineObj.rotation);
		return group;
	};
	
	
	/**
	 *	Méthode qui dessine les 6 axes
	 *	
	 */	
	
	this.drawAllAxis = function() {
		var group = this.draw.group();
		for(var i = 0; i < this.allAxis.length; i++) {
			this.allAxis[i].axisSvgObg = this.drawAnAxis(this.allAxis[i]);
			group.add(this.allAxis[i].axisSvgObg);
		}
		this.allAxisSvgObg = group;
		this.allAxisSvgObg.move(this.marginForLabels,this.marginForLabels);
		this.drawLegend();
	};
	
	
	/**
	 *	Méthode qui place correctement les labels
	 *	des axes
	 */
		
	this.drawLegend = function() {
		var correct = 90;	// variable de correction
		var group = this.draw.group();
		for(var i = 0; i < this.allAxis.length; i++) {
	
			var a = this.getPointsCoordFromAngleAndDistance(this.allAxis[i].rotation, ((this.graph_width / 2) + this.marginForLabels));
			var txt = this.draw.text(this.allAxis[i].a_name).move(a.x,a.y).size(14);
			
			self = this;
			
			txt.data('id',this.allAxis[i].id).data('zone','a');			
			txt.click(function(){
				self.updateAnLayerAxis(this.data('id'), this.data('zone'));
			});
			
			group.add(txt);
			
			var b = this.getPointsCoordFromAngleAndDistance(this.allAxis[i].rotation + 180, ((this.graph_width / 2) + this.marginForLabels));
			var txt = this.draw.text(this.allAxis[i].b_name).move(b.x,b.y).size(14);
			
			txt.data('id',this.allAxis[i].id).data('zone','b');			
			txt.click(function(){
				self.updateAnLayerAxis(this.data('id'), this.data('zone'));
			});

			group.add(txt);			
		}
		this.allAxisLabelsSvgOb = group;
	};	
	
	
	/**
	 *	Méthode se déclanchant au click
	 *	quand un axe est modifié
	 *	ici gestion des regles metier. Min / max etc etc
	 */
	
	this.updateAnLayerAxis = function(id, zone) {
		var i = self.findIndexById(id, this.responseLayer);
	
			var changed = false;	
			// si i existe alors on update un enregistrement
			if (i !== false) {
				if (zone == 'a') {
					if ((this.responseLayer[i].a_val != this.maxvalue) && (this.responseLayer[i].b_val != 0)) {
						this.responseLayer[i].a_val += 1;
						this.responseLayer[i].b_val -= 1;
						changed = true;
					}
				} else {
					if ((this.responseLayer[i].b_val != this.maxvalue) && (this.responseLayer[i].a_val != 0)) {
						this.responseLayer[i].a_val -= 1;
						this.responseLayer[i].b_val += 1;
						changed = true;
					}
				}
			} else {	
				// sinon on le crée
				var newElementOfResponse = {};
				newElementOfResponse.id = id;
				newElementOfResponse.a_val=5;
				newElementOfResponse.b_val=5;
				newElementOfResponse.color = "#FF0000";
				this.responseLayer.push(newElementOfResponse);
				changed = true;
			}
			
		if (changed) {	
			this.responseLayerSvgObj.remove();
			this.drawResponseLayer();
			if (this.on_change_callback !== false) {
				return this.on_change_callback();
			}
		}
	}
	
	
	/**
	 *	renvoi la position des points en fonction de l'angle et du score
	 *
	 *	@param 	rotation	angle de rotation
	 *	@param	a_val		Valeur a
	 *	@param	b_val		Valeur b
	 *
	 */
	
	this.getPointsCoord = function(rotation, a_val, b_val) {
		var resp = {};
		var a = this.getPointsCoordFromAngleAndDistance(rotation, ((this.graph_width/2)/this.maxvalue * a_val ));
		var b = this.getPointsCoordFromAngleAndDistance(rotation + 180, ((this.graph_width/2)/this.maxvalue * b_val ));		
		resp.ax = a.x;
		resp.ay = a.y;
		resp.bx = b.x;		
		resp.by = b.y;
		return resp;
	};	
	
	
	/**
	 *	renvoi un point a partir de l'angle et longeur en px
	 *
	 *	@param 	angle	angle de rotation
	 *	@param	distance	distance en pixel du point
	 */
	 
	this.getPointsCoordFromAngleAndDistance = function(angle, distance) {
		var correct = 90;
		var p = {}
		p.x = ((this.graph_width/2) + this.marginForLabels) + (distance * Math.cos((angle + correct)/180 * Math.PI));
		p.y = ((this.graph_width/2) + this.marginForLabels) + (distance * Math.sin((angle + correct)/180 * Math.PI));
		return p;
	}
	
	
	/**
	 *	renvoi la collection de plots
	 *	pour methode de polygones
	 *	
	 */
	
	this.getPointsCollection = function(layer) {
		var resp = [];
		var a_arr = [];
		var b_arr = [];		
		for(var i = 0; i < this.allAxis.length; i++) {
			var ret1 = this.findById(this.allAxis[i].id, layer);
			if (ret1 !== false) {
			
				var ret = this.getPointsCoord(this.allAxis[i].rotation, ret1.a_val, ret1.b_val);
			
				var tmp = [];
				tmp.push(ret.ax);
				tmp.push(ret.ay);			
				a_arr.push(tmp);
				var tmp = [];
				tmp.push(ret.bx);
				tmp.push(ret.by);			
				b_arr.push(tmp);
			}			
		}
		resp = a_arr.concat(b_arr);
		return resp;	
	};
	
	
	/**
	 *	Methode initialisant les axes
	 *		
	 *	@brief	Setteur des axes et calcul de la disposition des axes
	 */
	
	this.setAxes = function(axes_data) {
		var nbr_axis = axes_data.length;
		for(var i = 0; i < nbr_axis; i++) {
			axes_data[i].rotation = (180 / nbr_axis) * i;
		}
		this.allAxis = axes_data;		
		console.log(this.allAxis);
	};
	

	/**
	 *	Dessine une grille de réponse
	 *
	 *
	 */  

	this.drawLayer = function(layer) {
	
		var group = this.draw.group();
		if (layer.length > 0) {
			var plot_size = this.layer_plot_size;
			for (var i = 0; i < layer.length; i++) {
				var resp = this.findById(layer[i].id, this.allAxis);
				if (resp !== false) {
				
					points = this.getPointsCoord(resp.rotation, layer[i].a_val, layer[i].b_val);
				
					var c1 = this.draw
						.circle(plot_size)
						.fill(layer[i].color)
						.opacity(0.5)
						.move(points.ax - plot_size/2 + this.line_width / 2,points.ay - plot_size/2 + this.line_width / 2);

					group.add(c1);
				
					var c2 = this.draw
						.circle(plot_size)
						.fill(layer[i].color)
						.opacity(0.5)
						.move(points.bx - plot_size/2 + this.line_width / 2,points.by - plot_size/2 + this.line_width / 2 );					

					group.add(c2);					
				}
			}

			var poly = this.draw.polyline(this.getPointsCollection(layer)).fill(layer[0].color).opacity(0.3);
			group.add(poly);
		}
		return group;
		
	}


	/**
	 *	Methode qui supprime tous les
	 *	layers affichés
	 *
	 */

	this.clearAlldrawViewedLayer = function() {
		for(var i = 0; i < this.allViewLayers.length; i++) {
			this.allViewLayersSvgObj[i].remove();
		}
		this.allViewLayersSvgObj = 	[];
		this.allViewLayers = [];
	};



	this.drawViewedLayer= function() {
		for(var i = 0; i < this.allViewLayers.length; i++) {
			this.allViewLayersSvgObj[i] = this.drawLayer(this.allViewLayers[i]);
		}
	};


	/**
	 *	Methode qui upgrade le responseLayer existant
	 *
	 *
	 */

	this.drawResponseLayer= function() {
		this.responseLayerSvgObj.remove();
		this.responseLayerSvgObj = this.drawLayer(this.responseLayer);
		return this.responseLayerSvgObj;
	}


	this.setResponseLayer = function(rl) {
		this.responseLayer = rl;
	};

	this.setOnChangeCallback = function(callback) {
		this.on_change_callback = callback;
	}



	/**
	 *	Quelques méthodes purement utilitaires
	 *
	 *
	 */

	this.findById = function(searchValue, inSet) {
		for(var i = 0; i < inSet.length; i++) {
			if (inSet[i].id == searchValue) {
				return inSet[i];
				break;
			}
		}		
		return false;
	};


	this.findIndexById = function(searchValue, inSet) {
		for(var i = 0; i < inSet.length; i++) {
			if (inSet[i].id == searchValue) {
				return i;
				break;
			}
		}		
		return false;
	};
	

	this.findExistingColors = function() {
	
	
	
	}
	
	

};

/*


	var resp = [
		{
			'id': 'localglobal',
			'a_val': 7,
			'b_val': 3,
			'color' : "#FF0000",
		},
		{
			'id': 'equipeindividuel',
			'a_val': 4,
			'b_val': 6,
			'color' : "#FF0000",
		},
		{
			'id': 'espritcorps',
			'a_val': 2,
			'b_val': 8,
			'color' : "#FF0000",
		},		
		{
			'id': 'fondforme',
			'a_val': 5,
			'b_val': 5,
			'color' : "#FF0000",
		},				
		 ];	
		 
	var resp2 = [
		{
			'id': 'equipeindividuel',
			'a_val': 7,
			'b_val': 3,
			'color' : "#00FF00",
		},
		{
			'id': 'localglobal',
			'a_val': 4,
			'b_val': 6,
			'color' : "#00FF00",
		},
		{
			'id': 'fondforme',
			'a_val': 2,
			'b_val': 8,
			'color' : "#00FF00",
		},		
		{
			'id': 'espritcorps',
			'a_val': 5,
			'b_val': 5,
			'color' : "#00FF00",
		},				
		 ];			 
	*/
