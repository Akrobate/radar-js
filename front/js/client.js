$(document).ready(function(){

	console.log("test");
	var graph = new UffeGraphe();
	var graphid_editing = false;
	var allLayersToDraw = [];
	
	var axes = [
		{
			'id': 'localglobal',
			'a_name': "LOCAL",
			'b_name': "GLOBAL",
			'lineColor' : "#000",
		},{
			'id':"equipeindividuel",
			'a_name': "EQUIPE",
			'b_name': "INDIVIDUEL",
		},{
			'id': 'espritcorps',
			'a_name': "ESPRIT",
			'b_name': "CORPS",
		},{	'id':	"fondforme",
			'a_name': "FOND",
			'b_name': "FORME",
		},	
	];
	
	var colorsSet = ['#FFB60D','#E85F0C','#C50CE8','#634AFF','#009918','#0DFF70','#E8B40C'];
	graph.setAxes(axes);
	graph.drawAllAxis();
	
	var resp = [];
	
	
	/**
	 *	Methode callback pour l'enregistrement	
	 *
	 *	@brief	On sauvegarde quand les axes sont remplis
	 */
	
	graph.setOnChangeCallback(function() {
		if (this.responseLayer.length == 4) {
			console.log("Saving data");
  		 	localStorage.setItem('graphid'+graphid_editing, JSON.stringify(this.responseLayer));
		}
	});


	/**
	 *	Quand on se met en mode edition
	 *
	 */

	$('.graphSelector > li > span.view').click(function() {
	
		if ($(this).hasClass('glyphicon-minus-sign')) {
			// Add
			$(this).removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
			//allLayersToDraw 
			var graphid = $(this).parent('li').data('graphid');
			
			//allLayersToDraw.push()
			
			
			console.log(graphid);
		} else {
			// Remove
			$(this).removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
		}

		


		/*
		var id = $(this).parent().data('graphid');
		var dataToLoad = [];
	 	var graphObj = localStorage.getItem('graphid'+id);
		graphid_editing = id;
		  if(graph!=null) {
			dataToLoad = JSON.parse(graphObj);
			graph.setResponseLayer(dataToLoad);	
			graph.drawResponseLayer();
		  } else {	  
		  	 localStorage.setItem('graphid'+id, JSON.stringify(dataToLoad));
 			graph.setResponseLayer(dataToLoad);	
			graph.drawResponseLayer();		  	 
		  }
		  */
	});

	$('.graphSelector > li > span.edit').click(function() {
		$('.graphSelector > li').removeClass('active');		
		$(this).parent('li').addClass('active');
		var id = $(this).parent().data('graphid');
		
		console.log(id);
		
	 	var graphObj = getGraphFromId(id);
	 	
		graphid_editing = id;
		  if(graphObj != null) {
		  	console.log("not null");
			graph.setResponseLayer(graphObj);	
			graph.drawResponseLayer();
		  } else {
  		  	console.log(" null");	  
		  	createGraphFromId(id);
		  	console.log(dataToLoad);
 			graph.setResponseLayer(dataToLoad);	
			graph.drawResponseLayer();		  	 
		  }
	});

	
	$('.clearLocalStorage').click(function() {
		var l = localStorage.clear();
		console.log("Clearing local storage : " + l);
	});
	
	
	
	function getGraphFromId(id) {
		var dataToLoad = [];
		var graphObj = localStorage.getItem('graphid'+id);
		dataToLoad = JSON.parse(graphObj);
		if(graphObj == null) {
			return null;
		}
		return dataToLoad;
	}
	
	
	function createGraphFromId(id) {
		var dataToLoad = [];
		 localStorage.setItem('graphid'+id, JSON.stringify(dataToLoad));
	}	
	
	
	
	
});
