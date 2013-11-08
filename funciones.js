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
//checkConnection();
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
	appDB();

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
	db = window.openDatabase("paizguatemala", "1.0", "paizguatemala", 2000000);
	db.transaction(populateRecetasDB, errorCB, successCB);
}
// Populate the database 
function populateRecetasDB(tx) {
	/*CREACION TABLA CLIENTES*/
	 tx.executeSql('DROP TABLE IF EXISTS tipoReceta');
	 tx.executeSql('DROP TABLE IF EXISTS banner');
	 tx.executeSql('DROP TABLE IF EXISTS recetas');
	 tx.executeSql('DROP TABLE IF EXISTS guia');
	 tx.executeSql('DROP TABLE IF EXISTS miercolesFrescos');
	 tx.executeSql('CREATE TABLE IF NOT EXISTS tipoReceta (id INTEGER PRIMARY KEY, nombre TEXT, pais INTEGER, estado INTEGER)');
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
	url = 'http://smmcr.net/fb/masxmenos/recetas/dbsuper.php?p=2&callback=?';
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
if (SyncCount >= 4){
$("#cargaimg" ).hide();
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
 console.log(lat,longi);
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

		 $("#servicios").append("<img src=' img/"+imagen+"'/>");
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
	var arrCanton =[['<option value="" >Municipio</option><option value="1" class="8" >Ciudad</option>'+
					'<option value="2" class="1" >Mixco</option>'],['<option value="" >Municipio</option><option value="2" class="2" >Quetzaltenango</option>'],
					['<option value="" >Municipio</option><option value="3" class="3" >Huehuetenango</option>'],
					['<option value="" >Municipio</option><option value="4" class="6">Mazatenango</option>'],
					['<option value="" >Canton</option><option value="5" class="7" >Escuintla</option>'],
					['<option value="" >Canton</option><option value="6" class="8" >Chiquimula </option>']];
				/*alert(arrCanton[id-1]);*/
	$('#select2').html( arrCanton[id-1]);
}
function mostrarTienda(id){
		var arrTienda= [dis1=['<option value="">Seleccione Tienda</option>'+
		'<option value="262" class="1">Americas</option><option value="261" class="1">Pradera</option><option value="265" class="1">Montufar</option>'+
		'<option value="267" class="1">Novicentro</option><option value="270" class="1">Megacentro</option>'+
		'<option value="271" class="1">Asunción</option>	<option value="272" class="1">Salida al Pacifico</option>'+
		'<option value="273" class="1">Megaseis</option><option value="274" class="1">Petapa</option>'+
		'<option value="275" class="1">Utatlan</option><option value="277" class="1">Parroquia</option>'+
		'<option value="278" class="1">18 Calle</option><option value="279" class="1">Aguilar Batres</option>'],
	     dis2=['<option value="">Seleccione Tienda</option><option value="264" class="2">San Cristobal</option>'+
		 '<option value="276" class="2">Montserrat</option><option value="282" class="2">El Naranjo</option>'],
		 dis3=['<option value="">Seleccione Tienda</option><option value="283" class="3">Montblac</option>'],
		 dis4=['<option value="">Seleccione Tienda</option><option value="284" class="4">Huehuetenango</option>'],
		 dis5=['<option value="">Seleccione Tienda</option><option value="285" class="4">Mazatenango</option>'],
		 dis6=['<option value="">Seleccione Tienda</option><option value="286" class="5">Costa Grande</option>'],
		 dis7=['<option value="">Seleccione Tienda</option><option value="289" class="6">Chiquimula</option>'],
		 dis8=['<option value="">Seleccione Tienda</option><option value="290" class="7">Cóban</option>']];
		$('#select3').html( arrTienda[id-1]);
				
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
