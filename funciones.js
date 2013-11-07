var contenidoInicial;
var idtema;
var myScroll;
var a = 0;
var SyncCount=0;
/*-------------------------------------BD-----------------------------------------*/
var db;
var fileSystem = {}; 
document.addEventListener("deviceready", onDeviceReady, false);
 function onDeviceReady() {
//Inicializamos las BD
checkConnection();
    }
window.addEventListener('load', function() {
			document.body.addEventListener('touchmove', function(e) {
				e.preventDefault();
			}, false);
		}, false);		
$(document).one("mobileinit", function () {
  
	// Setting default page transition to slide
/*	$.mobile.defaultPageTransition = 'slide'; 
	$.mobile.defaultDialogTransition = 'slide';*/
	$.mobile.defaultPageTransition = 'none';
	$("#cargaimg" ).show();
	/*alert($(window).width());
	alert($(window).height());*/
	//appDB();

});
	 function checkConnection() {
            var networkState = navigator.connection.type;

            var states = {};
            states[Connection.UNKNOWN]  = 0;
            states[Connection.ETHERNET] = 1;
            states[Connection.WIFI]     = 1;
            states[Connection.CELL_2G]  = 1;
            states[Connection.CELL_3G]  = 1;
            states[Connection.CELL_4G]  = 1;
            states[Connection.CELL]     = 0;
            states[Connection.NONE]     = 0;
			if(states[networkState]!=0){
			appDB();
			}else{
			alert("Para utilizar esta aplicación necesita conexión a internet");
			 navigator.app.exitApp();
			}
        }
function appDB() {
	db = window.openDatabase("masxmenos", "1.0", "Masxmenos", 2000000);
	db.transaction(populateRecetasDB, errorCB, successCB);
	GlutenDB();
}
// Populate the database 
function populateRecetasDB(tx) {
	/*CREACION TABLA CLIENTES*/
	 tx.executeSql('DROP TABLE IF EXISTS tipoReceta');
	 tx.executeSql('DROP TABLE IF EXISTS recomendaciones');
	 tx.executeSql('DROP TABLE IF EXISTS banner');
	 tx.executeSql('DROP TABLE IF EXISTS conocersugar');
	 tx.executeSql('DROP TABLE IF EXISTS categoriassugar');
	 tx.executeSql('DROP TABLE IF EXISTS recetas');
	 tx.executeSql('DROP TABLE IF EXISTS guia');
	 tx.executeSql('DROP TABLE IF EXISTS productosVariedadSugar');
	tx.executeSql('DROP TABLE IF EXISTS recetasSugerFree');
	 tx.executeSql('DROP TABLE IF EXISTS miercolesFrescos');
	tx.executeSql('CREATE TABLE IF NOT EXISTS productosVariedadSugar (id INTEGER PRIMARY KEY, nombre TEXT,categoria TEXT,marca TEXT,fabricante INTEGER, estado INTEGER,pais INTEGER,imagen TEXT)');
	tx.executeSql('CREATE TABLE IF NOT EXISTS recetasSugerFree (id INTEGER PRIMARY KEY, titulo TEXT,ingredientes TEXT,preparacion TEXT,categoria INTEGER, estado INTEGER,pais INTEGER,chef TEXT,nutricionales TEXT,imagen TEXT)');
	 tx.executeSql('CREATE TABLE IF NOT EXISTS conocersugar (id INTEGER PRIMARY KEY, titulo TEXT, texto TEXT, estado INTEGER)');
	 tx.executeSql('CREATE TABLE IF NOT EXISTS categoriassugar (id INTEGER PRIMARY KEY, nombre TEXT, estado INTEGER, pais INTEGER)');
	 tx.executeSql('CREATE TABLE IF NOT EXISTS tipoReceta (id INTEGER PRIMARY KEY, nombre TEXT, pais INTEGER, estado INTEGER)');
	 tx.executeSql('CREATE TABLE IF NOT EXISTS recomendaciones (id INTEGER PRIMARY KEY, recomendacion TEXT, estado INTEGER, pais_local INTEGER, idreceta INTEGER)');
	 tx.executeSql('CREATE TABLE IF NOT EXISTS recetas (id INTEGER PRIMARY KEY, pais_local INTEGER, nombre TEXT,ingredientes TEXT,preparacion TEXT, img TEXT, estado INTEGER,nombreChef TEXT,actvsemana INTEGER,tiporeceta INTEGER,patrocinador TEXT,dificultad TEXT,tiempo TEXT,porciones TEXT,costo TEXT)');
	 tx.executeSql('CREATE TABLE IF NOT EXISTS banner (id INTEGER PRIMARY KEY, nombreBanner TEXT, estado INTEGER)');
	 tx.executeSql('CREATE TABLE IF NOT EXISTS guia (id INTEGER PRIMARY KEY, nombreImg TEXT, estado INTEGER)');
	 tx.executeSql('CREATE TABLE IF NOT EXISTS miercolesFrescos (id INTEGER PRIMARY KEY,  nombreImg TEXT, estado INTEGER)');
	 //tx.executeSql('CREATE TABLE IF NOT EXISTS glutenRectCat ()');
	 SincronizarDBrecetas(finSincro);
}
// Transaction error callback
function errorCB(tx, err) {
	console.log("Error processing SQL: "+err);
}
// Transaction success callback
function successCB() {
	console.log("success create DB!");
}	
function SincronizarDBrecetas(finSincro){
	url = 'http://smmcr.net/fb/masxmenos/recetas/recetas.php?callback=?';
	/*SINCRONIZA CATEGORIAS*/
	$.getJSON(url,{accion:"tipoReceta"}).done(function( data ) {
		$.each(data, function(index, item) {
			db.transaction(function (tx) {  
			  tx.executeSql('INSERT INTO tipoReceta (id,nombre,pais,estado) VALUES (?,?,?,?)', [item.id,item.nombretipo,item.pais,item.estado]);
			});
		});
	
	},finSincro);
	$.getJSON(url,{accion:"banner"}).done(function( data ) {
		console.log('Iniciando Sincronizacion de Recomendaciones...');
		$.each(data, function(index, item) {			
			db.transaction(function (tx) {  
			  tx.executeSql('INSERT INTO banner (id,nombreBanner, estado) VALUES (?,?,?)', [item.id,item.nombreBanner,item.estado]);
			});
		});	
	mostrarBanner();		
	},finSincro);
	$.getJSON(url,{accion:"recetaSugar"}).done(function( data ) {
		//console.log(data);
		console.log('Iniciando Sincronizacion de Recetas Suger Free...');
		$.each(data, function(index, item) {	
			db.transaction(function (tx) { 
			  tx.executeSql('INSERT INTO recetasSugerFree (id,titulo,ingredientes,preparacion,categoria,estado,pais,chef,nutricionales,imagen) VALUES (?,?,?,?,?,?,?,?,?,?)', [item.id,item.titulo,item.ingredientes ,item.preparacion , item.categoria , item.estado ,item.pais ,item.chef ,item.nutricionales ,item.imagen]);
			});
		});
	},finSincro);
	$.getJSON(url,{accion:"productosSugar"}).done(function( data ) {
		console.log('Iniciando Sincronizacion de sugar...');
		$.each(data, function(index, item) {			
			db.transaction(function (tx) {  
			  tx.executeSql('INSERT INTO productosVariedadSugar (id,nombre,categoria,marca,fabricante,estado,pais,imagen) VALUES (?,?,?,?,?,?,?,?)', [item.id,item.nombre,item.categoria,item.marca,item.fabricante,item.estado,item.pais,item.imagen]);
			});
		});
		
	},finSincro);
	$.getJSON(url,{accion:"sugar"}).done(function( data ) {
		console.log('Iniciando Sincronizacion de sugar...');
		$.each(data, function(index, item) {			
			db.transaction(function (tx) {  
			  tx.executeSql('INSERT INTO conocersugar (id, titulo, texto, estado) VALUES (?,?,?,?)', [item.id,item.titulo,item.texto, item.estado]);
			});
		});
		
	},finSincro);
	$.getJSON(url,{accion:"categoriassugar"}).done(function( data ) {
		console.log('Iniciando Sincronizacion de Categoriasugar...');
		$.each(data, function(index, item) {			
			db.transaction(function (tx) {  
			  tx.executeSql('INSERT INTO categoriassugar (id, nombre, estado, pais) VALUES (?,?,?,?)', [item.id,item.nombre,item.estado, item.pais]);
			});
		});
		
	},finSincro);
	$.getJSON(url,{accion:"recomendaciones"}).done(function( data ) {
		console.log('Iniciando Sincronizacion de Recomendaciones...');
		$.each(data, function(index, item) {			
			db.transaction(function (tx) {  
			  tx.executeSql('INSERT INTO recomendaciones (recomendacion, estado, pais_local, idreceta) VALUES (?,?,?,?)', [item.id,item.recomendacion,item.estado, item.pais_local, item.idreceta]);
			});
		});
		
	},finSincro);
	/*SINCRONIZA RECETAS*/
	$.getJSON(url,{accion:"recetas"}).done(function( data ) {
		console.log('Iniciando Sincronizacion de Recetas...');
		$.each(data, function(index, item) {			
			db.transaction(function (tx) {  
			  tx.executeSql('INSERT INTO recetas (id,pais_local, nombre,ingredientes ,preparacion , img , estado ,nombreChef ,actvsemana ,tiporeceta ,patrocinador ,dificultad ,tiempo ,porciones ,costo ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [item.id,item.pais_local, item.nombre,item.ingredientes ,item.preparacion , item.img , item.estado ,item.nombreChef ,item.actvsemana ,item.tiporeceta ,item.patrocinador ,item.dificultad ,item.tiempo ,item.porciones ,item.costo]);
			});
		});
	
	},finSincro);
	/*SINCRONIZA GUIA*/
	$.getJSON(url,{accion:"guia"}).done(function( data ) {
		console.log('Iniciando Sincronizacion de guia...');
		$.each(data, function(index, item) {			
			db.transaction(function (tx) {  
			  tx.executeSql('INSERT INTO guia (id,nombreImg,estado) VALUES (?,?,?)', [item.id,item.nombreImg, item.estado]);
			});
		});

	},finSincro);
	/*SINCRONIZA GUIA*/
	$.getJSON(url,{accion:"miercoles"}).done(function( data ) {
		console.log('Iniciando Sincronizacion de miercoles...');
		$.each(data, function(index, item){			
			db.transaction(function (tx) {  
			  tx.executeSql('INSERT INTO miercolesFrescos (id,nombreImg,estado) VALUES (?,?,?)', [item.id,item.nombreImg, item.estado]);
			});
		});
	
	},finSincro);
	
}
function finSincro(){
SyncCount++; 
if (SyncCount >= 10){
/*	var cant = $("#home ul li").size();
	var width = $(window).width() - 30;
	var width_overview =  width * cant;
	$('#home #scrollMenu').css('width', width_overview+'px');
	//console.log($( "#etapa1" ).css("height"));*/
	setTimeout( function() {
	$( "#menuP" ).css("height",($(window).height()-($(".ui-header").height()*2)));
		//$( "#etapa1" ).css("height",$( "#menuP" ).height()-15);
		$( "#etapa2" ).css("height",$( "#etapa1" ).height()-15);
	myScroll3 = new iScroll('menuP', {hScrollbar: false,vScrollbar: false});
$("#cargaimg" ).hide();

	}, 1000);		
}
}
var tiendas;
function mostrarcontenidomapa(idcat){
tiendas=idcat;
			
			$.mobile.changePage( "#mostrarmapa", {
			reverse: false,
			changeHash: false
			});
		
			
			
}
function visulamapainfo(lat,longi,nombre,direccion,horario,telefono,imagenes){
 var centerLocation = new google.maps.LatLng(lat,longi);
        var myOptions = {
            center: centerLocation,
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            callback: function () { alert('callback'); }
        };
		mapdata=lat+","+longi;			
        map_element = document.getElementById("map_canvas");
        map = new google.maps.Map(map_element, myOptions);
			
					nombre=nombre;
					marker= new google.maps.Marker({						
					position: new google.maps.LatLng(lat,longi)
					, map: map				
					, icon: 'http://movilmultimediasa.com/masxmenos/ubicanos/images/bullet.png'
					});
					marker.setTitle(nombre);
					attachSecretMessage(marker);

        var mapwidth = $(window).width();
        var mapheight = $(window).height();
        $("#map_canvas").height(mapheight);
        $("#map_canvas").width(mapwidth);
        google.maps.event.trigger(map, 'resize');
        $("#direccion").html("");
		 $("#horario").html("");
		 $("#telefono").html("");
		 $("#servicios").html("");
		 imagenes=imagenes.split(",");
		$("#direccion").append("<h3>Direccion:</h3>");
		$("#direccion").append("<p>"+direccion+"</p>");
		 $("#horario").append("<h3>Horario:</h3>");
		 $("#horario").append("<p>"+horario+"</p>");
		 $("#telefono").append("<h3>Telefono:</h3>");
		 $("#telefono").append("<p>"+telefono+"</p>");
		 $("#servicios").append("<h3>Servicios:</h3>");
		$.each(imagenes, function(i, imagen){ 

		 $("#servicios").append("<img src=' img/"+imagen+".png '/>");
		});
}
function attachSecretMessage(marker) {
		contTD=String(marker.getTitle()).split("*");
		titulo=contTD[0];  
		direccion=contTD[1];    
		marker.setTitle(titulo);
		var infowindow = new google.maps.InfoWindow(	
		{ content: direccion,
		size: new google.maps.Size(50,50)
		});
		google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map,marker);
		map.setZoom(15);
		map.setCenter(marker.getPosition());
		});

		pos=String(marker.getPosition());
		pos=pos.split("(");
		pos=pos[1].split(")");
		pos=pos[0].split(",");
		pos1=pos[0];
		pos2=pos[1];
		moveToDarwin(pos1,pos2);
	}
function moveToDarwin(lat,longi) {
	var darwin = new google.maps.LatLng(lat,longi);
	map.setCenter(darwin);
	}
function GoToLocation(lat,longi) {
	var message = ["This","is","the","secret","message"];
	contTD=String(marker.getTitle()).split("*");
	titulo=contTD[0];  
	direccion=contTD[1];    
	marker.setTitle(titulo);
	var infowindow = new google.maps.InfoWindow(	
	{ content: direccion,
	size: new google.maps.Size(50,50)
	});
	$(function(){
	infowindow.open(map,marker);
	map.setZoom(15);
	map.setCenter(marker.getPosition());	
	});
	moveToDarwin(lat,longi)
	}
function centrado(lat,longi) {
 var darwin = new google.maps.LatLng(lat,longi);
  map.setCenter(darwin);
}
function mostrarcanton(id){
	var arrCanton =[['	<option value="" >Canton</option><option value="9" class="1" >Montes de Oca</option>'+
							'<option value="8" class="1" >Moravia</option>'+
							'<option value="6" class="1" >Vázquez de Coronado</option>'+
							'<option value="1" class="1" >San José</option>'+
							'<option value="5" class="1" >Santa Ana</option>'+
							'<option value="4" class="1" >Goicoechea</option>'+
							'<option value="7" class="1" >Tibás</option>'+
							'<option value="3" class="1" >Desamparados</option>'+
							'<option value="2" class="1" >Escazú</option>'],['<option value="" >Canton</option><option value="10" class="2" >Heredia</option>'+
							'<option value="11" class="2" >Santo Domingo</option>'+
							'<option value="14" class="2" >San Pablo</option>'+
							'<option value="13" class="2" >Flores</option>'+
							'<option value="12" class="2" >Belén</option>'],['	<option value="" >Canton</option><option value="15" class="3" >Alajuela</option>'],
							['<option value="" >Canton</option><option value="16" class="6">Garabito</option>'],['<option value="" >Canton</option><option value="18" class="7" >Pococí</option>'+
						'<option value="17" class="7" >Limón</option>'],['<option value="" >Canton</option><option value="19" class="8" >Central </option><option value="20" class="8" >La Unión</option>']];
						/*alert(arrCanton[id-1]);*/
	$('#select2').html( arrCanton[id-1]);
}
function mostrarDistrito(id){
		var arrDistrito= [dis1=['<option value="">Seleccione Distrito</option><option value="1" class="1">Carmen</option><option value="997" class="1">Hatillo</option><option value="9" class="1">Pavas</option><option value="8" class="1">Mata Redonda</option>'],
		                  dis2=['<option value="">Seleccione Distrito</option><option value="14" class="2">San Rafael</option><option value="998" class="2">Guachipelin</option>'],
		                  dis3=['<option value="">Seleccione Distrito</option><option value="15" class="3">Desamparados</option><option value="19" class="3">San Antonio</option>'],
		                  dis4=['<option value="">Seleccione Distrito</option><option value="53" class="4">Guadalupe</option>'],
		                  dis5=['<option value="">Seleccione Distrito</option><option value="60" class="4">Santa Ana</option>'],
		                  dis6=['<option value="">Seleccione Distrito</option><option value="71" class="5">San Isidro</option>'],
		                  dis7=['<option value="">Seleccione Distrito</option><option value="81" class="6">San Juan</option>'],
					dis8=['<option value="">Seleccione Distrito</option><option value="86" class="7">San Vicente</option>'],
					dis9=['<option value="">Seleccione Distrito</option><option value="89" class="8">San Pedro</option><option value="90" class="8">Sabanilla</option>'],
					dis10=['<option value="">Seleccione Distrito</option><option value="122" class="9">Heredia</option>'],
					dis11=['<option value="">Seleccione Distrito</option><option value="133" class="10">Santo Domingo</option>'],
					dis12=['<option value="">Seleccione Distrito</option><option value="158" class="11">La Asunción</option>'],
					dis13=['<option value="">Seleccione Distrito</option><option value="159" class="12">San Joaquín</option>'],
					dis14=['<option value="">Seleccione Distrito</option><option value="162" class="13">San Pablo</option>'],
					dis15=['<option value="">Seleccione Distrito</option><option value="169" class="14">Alajuela</option>'],
					dis16=['<option value="">Seleccione Distrito</option><option value="445" class="15">Jacó</option>'],
					dis17=['<option value="">Seleccione Distrito</option><option value="447" class="16">Limón</option>'],
					dis18=['<option value="">Seleccione Distrito</option><option value="451" class="17">Guápiles</option>'],
					dis19=['<option value="">Seleccione Distrito</option><option value="999" class="17">Guadalupe </option>'],
					dis20=['<option value="">Seleccione Distrito</option><option value="296" class="17">Tres Ríos </option>']
					
					];
						$('#select3').html( arrDistrito[id-1]);
				
}
/*----------------------------------Recetas----------------------------------------------*/
function agregarContenido(id){
$.mobile.changePage( "#recetaSelec", {
  changeHash: false
});
			var data = new Array();			
db.transaction(function (tx) {
tx.executeSql('SELECT * FROM recetas where id="'+id+'"', [], function (tx, results) {
				$("#tituloreceta").html("");
		$("#recetafinal ul").html("");
		//$("#recetafinal").append("<a id='regresar' href='#recetas'>Regresar</a>");
		$("#tituloreceta").append("<div id='titulorec1'><h3 id='nombrereceta'>"+results.rows.item(0).nombre+"</h3></div>");
		$("#recetafinal ul").append("<div id='imgrecetan'><img src='https://movilmultimediasa.com/masxmenos/recetas/images/fotosrecetas/"+results.rows.item(0).img+"' alt='imgreceta' /></div>");
		$("#recetafinal ul").append("<div id='ingredientes'><h3 id='tituingre'>Ingredientes</h3>"+results.rows.item(0).ingredientes+"</div>");
		$("#recetafinal ul").append("<div id='preparacion'><h3 id='tituingre'>Preparación</h3>"+results.rows.item(0).preparacion+"</div>");
		$("#recetafinal ul").append("<div class='clear'><li class='clear'></li></div>");

	 $("#recetafinal ul").listview('refresh')
	});
});				

}
function agregarContenidosugar(id){
$.mobile.changePage( "#recetaSelecsugar", {
  changeHash: false
});	
		var data = new Array();			
db.transaction(function (tx) {
tx.executeSql('SELECT * FROM recetasSugerFree where id="'+id+'"', [], function (tx, results) {
				$("#recetaSelecsugar #tituloreceta").html("");
		$("#recetaSelecsugar #recetafinal ul").html("");
		//$("#recetaSelecsugar #recetafinal").append("<a id='regresar' href='#' data-rel='back'>Regresar</a>");
		$("#recetaSelecsugar #tituloreceta").append("<div id='titulorec1'><h3 id='nombrereceta'>"+results.rows.item(0).titulo+"</h3></div>");
		$("#recetaSelecsugar #recetafinal ul").append("<div id='imgrecetan'><img src='https://smmcr.net/fb/masxmenos/sugarfree/images/recetas/"+results.rows.item(0).imagen+"' alt='imgreceta' /></div>");
		$("#recetaSelecsugar #recetafinal ul").append("<div id='ingredientes'><h3 id='tituingre'>Ingredientes</h3>"+results.rows.item(0).ingredientes+"</div>");
		$("#recetaSelecsugar #recetafinal ul").append("<div id='preparacion'><h3 id='tituingre'>Preparación</h3>"+results.rows.item(0).preparacion+"</div>");
		$("#recetaSelecsugar #recetafinal ul").append("<div id='nutricionales'><h3 id='tituingre'>Nutricionales</h3>"+results.rows.item(0).nutricionales+"</div>");
		$("#recetaSelecsugar #recetafinal ul").append("<div class='clear'><li class='clear'></li></div>");

	 $("#recetaSelecsugar #recetafinal ul").listview('refresh')
	});
});	

}
function mostrarBanner(){
	var data = new Array();
		db.transaction(function (tx) {  
					tx.executeSql('SELECT * FROM banner WHERE estado = 1',[], function (tx, results) {
						var len = results.rows.length;
						for (var i=0; i<len; i++){
							data[i] = results.rows.item(i);
						}						
					cambiodebaner(data);
					});					
				});
}
var  i=0;
/*
function cambiodebaner(nombre){
						if(i<nombre.length){
						 $('.footer').animate({opacity: "0"},2000);				
						 $('.footer').append("<img src='https://smmcr.net/fb/masxmenos/banners/"+nombre[i].nombreBanner+"' alt='bannerfooter' />");
						setTimeout( function() {
						  $('.footer').animate({opacity: "1"}, 1000);	
						},3000);
						i+=1;
						setTimeout( function() {
							cambiodebaner(nombre);
						},5000);
						}else{						
						i=0;
						setTimeout( function() {
						cambiodebaner(nombre);
						},5000);
						}
}*/

function cambiodebaner(nombre){
			
							if(i<nombre.length){		
						 $('.footer').html("<img src='https://smmcr.net/fb/masxmenos/banners/"+nombre[i].nombreBanner+"' alt='bannerfooter' />");
					
						i+=1;
						setTimeout( function() {
							cambiodebaner(nombre);
						},5000);
						}else{						
						i=0;
						setTimeout( function() {
						cambiodebaner(nombre);
						},5000);
					}
}
function obtenerCatRecetas(){
	var data = new Array();
	db.transaction(function (tx) {  
	tx.executeSql('SELECT * FROM tipoReceta where estado=1', [], function (tx, results) {
		var len = results.rows.length;
		for (var i=0; i<len; i++){
			data[i] = results.rows.item(i);
		}
	 $('#listaRecetas ul').empty();
	  $.each(data, function(index, item) {		
		  $('#listaRecetas ul').append("<li ><a href='javascript:mostrarlista("+item.id+");'>"+item.nombre+"</a></li>");
		  });			
		  $('#listaRecetas ul').listview("refresh");
		});
	});				
}
function SugarVariedad(){
		var data = new Array();
		db.transaction(function (tx) {  
			tx.executeSql('SELECT * FROM productosVariedadSugar', [], function (tx, results) {
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					data[i] = results.rows.item(i);
				}
			$('#sugarProductos').empty();
			  $.each(data, function(index, item) {		
				  $('#sugarProductos').append('<li><a href="javascript:mostrarProductoSugar('+item.id+')">'+item.nombre+'</a></li>');
				  });
				    if (  $("#sugarProductos").hasClass('ui-listview')) {
				  $("#sugarProductos").listview("refresh");
				  }
				});
			});	
	}
function mostrarProductoSugar(id){
var data = new Array();
		db.transaction(function (tx) {  
					tx.executeSql('SELECT * FROM productosVariedadSugar WHERE id = ?', [id], function (tx, results) {
						var len = results.rows.length;
						for (var i=0; i<len; i++){
							data[i] = results.rows.item(i);
						}
						//id INTEGER PRIMARY KEY AUTOINCREMENT, id_categoria INTEGER, nombre TEXT, categoria TEXT, marca TEXT, fabricante TEXT, pais TEXT, imagen TEXT, presentacion TEXT
						  $('#sugarVariedadDetail h2').html(data[0].nombre);
						  $('#sugarVariedadDetail #imgproducto img').attr("src","https://smmcr.net/fb/masxmenos/sugarfree/images/productos/"+data[0].imagen);
						  $('#sugarVariedadDetail #NombreProductoSugar').html(data[0].nombre);

					});	
					 if ( $("#sugarVariedadDetail").hasClass('ui-listview')) {
					$("#sugarVariedadDetail").listview("refresh");
					}
				});
				 setTimeout( function() {
	$.mobile.changePage( "#sugarVariedadDetail", {
  changeHash: false
});	
$(".ui-li-thumb, .ui-listview .ui-li-icon, .ui-li-content").removeAttr("float");
	}, 500);
	}
function obtenerpregunta(id){
	var data = new Array();
	db.transaction(function (tx) {  
	tx.executeSql('SELECT * FROM conocersugar where id="'+id+'"', [], function (tx, results) {
	results.rows.length;
	//$('#scrollp1').empty();
	switch(id){
	case 1:
	$('#Cuanta #scrollp1').html(results.rows.item(0).texto);
		setTimeout( function() {
		myScroll3 = new iScroll('contenScrollP1', {hScrollbar: false});
	}, 500);
	
    break;
	case 2:
	$('#Que #scrollp1').html(results.rows.item(0).texto);
		setTimeout( function() {
		myScroll3 = new iScroll('contenScrollP2', {hScrollbar: false});
	}, 500);
    break;
	case 3:
	$('#Como #scrollp1').html(results.rows.item(0).texto);
		setTimeout( function() {
		myScroll3 = new iScroll('contenScrollP3', {hScrollbar: false});
	}, 500);
    break;
	case 4:
	$('#Pequennos #scrollp1').html(results.rows.item(0).texto);
		setTimeout( function() {
		myScroll3 = new iScroll('contenScrollP4', {hScrollbar: false});
	}, 500);
    break;
	}
		
	});				
	});				
}
function obtenerCatRecetasSugar(){
	var data = new Array();
	db.transaction(function (tx) {
	tx.executeSql('SELECT * FROM categoriassugar where estado=1', [], function (tx, results) {
		var len = results.rows.length;
		for (var i=0; i<len; i++){
			data[i] = results.rows.item(i);
		}
	$('#cocinemos #contenidoulbusqueda2 ul').empty();
	  $.each(data, function(index, item) {	  
		  $('#cocinemos #contenidoulbusqueda2 ul').append('<li><a href="javascript:mostraListaRecetassugar('+item.id+')">'+item.nombre+'</a></li>');
		  });
		    $('#cocinemos #contenidoulbusqueda2 ul').attr('data-role', 'listview');
		
		    if (   $('#cocinemos #contenidoulbusqueda2 ul').hasClass('ui-listview')) {
		  $('#cocinemos #contenidoulbusqueda2 ul').listview("refresh");
		  }
		});
	});				
}
function mostraListaRecetassugar(idcat){
var data = new Array();			
db.transaction(function (tx) {
tx.executeSql('SELECT * FROM recetasSugerFree where estado=1 and categoria="'+idcat+'"', [], function (tx, results) {
	var len = results.rows.length;
	for (var i=0; i<len; i++){
		data[i] = results.rows.item(i);
	}				
$('#SugarList').empty();
  $.each(data, function(index, item){		
	clases='ui-li ui-li-static ui-btn-up-a';
	//alert(item.id);
		$("#SugarList").append("<li onclick='agregarContenidosugar("+item.id+")' class='"+clases+"'>"+item.titulo+"</li>");			
	 });
	 setTimeout( function() {
			 $("#SugarList").listview('refresh');
			 }, 900);
	});
});
setTimeout( function() {
$.mobile.changePage("#SugarRecetasList");
}, 500);
}
function obtenerGuia(){

	var data = new Array();
	db.transaction(function (tx) {  
	tx.executeSql('SELECT * FROM guia', [], function (tx, results) {
		var len = results.rows.length;
		for (var i=0; i<len; i++){
			data[i] = results.rows.item(i);
		}
    	$("#guia #thelist").empty();
	  $.each(data, function(index, item) {		
		$("#guia #thelist").append("<li><img src='https://smmcr.net/fb/masxmenos/guia/"+item.nombreImg+"' alt='"+item.nombreImg+"' /></li>");
		  });
	var cant = $("#guia #thelist li").size();
	var width = $(window).width() - 30;
	var width_overview =  width * cant;
	$('#guia #scroller').css('width', width_overview+'px');
		});

		setTimeout( function() {
	
		var myScroll1 = new iScroll('wrapper_guia', {
			snap: true,
			momentum: false,
			hScrollbar: false,
			vScrollbar: false
			});
	}, 500);	
	});				
}
function obtenerMiercoles(){
	var data = new Array();
	db.transaction(function (tx) {  
	tx.executeSql('SELECT * FROM miercolesFrescos', [], function (tx, results) {
		var len = results.rows.length;
		for (var i=0; i<len; i++){
			data[i] = results.rows.item(i);
		}
    $("#miercoles #thelist").empty();
	  $.each(data, function(index, item) {		
	$("#miercoles #thelist").append("<li><img src='https://smmcr.net/fb/masxmenos/guia/"+item.nombreImg+"' alt='"+item.nombreImg+"' /></li>");
		  });
	var cant =   $("#miercoles #thelist li").size();
	var width = $(window).width() - 30;
	var width_overview =  width * cant;
	$('#miercoles #scroller').css('width', width_overview+'px');
		});
	
			setTimeout( function() {
		var myScroll2 = new iScroll('wrapper_miercoles', {
						snap: true,
						momentum: false,
						hScrollbar: false,
						vScrollbar: false });
	}, 500);
	});				
}
function mostrarlista(idcat){
var data = new Array();			
db.transaction(function (tx) {
tx.executeSql('SELECT * FROM recetas where estado=1 and tiporeceta="'+idcat+'"', [], function (tx, results) {
	var len = results.rows.length;
	for (var i=0; i<len; i++){
		data[i] = results.rows.item(i);
	}				
$('#listaRecetasXcatCon ul').empty();
  $.each(data, function(index, item){		
	clases='ui-li ui-li-static ui-btn-up-a';
		$("#listaRecetasXcatCon ul").append("<li><a href='javascript:agregarContenido("+item.id+")'> "+item.nombre+"</a></li>");			
	 });
	 $("#listaRecetasXcatCon ul").listview('refresh');
	});
});
setTimeout( function() {
$.mobile.changePage("#listaRecetas");
}, 500);				
}
function volverreceta(id){
location.href="#recetas";
$("#recetaSelec").css("display","none");
$.mobile.changePage( "#recetas", {
  reverse: false,
  changeHash: false
});
$("#recetas").css("display","block");
}
