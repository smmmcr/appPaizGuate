//	document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova is ready
    //
    function GlutenDB() {
        db.transaction(populateDB, errorCB, successCB);
    }
    // Populate the database 
    //
    function populateDB(tx) {
        /*CREACION TABLA CLIENTES*/
		tx.executeSql('DROP TABLE IF EXISTS glutenComCat');
		tx.executeSql('DROP TABLE IF EXISTS glutenComProd');
		tx.executeSql('DROP TABLE IF EXISTS glutenPrimerosPasos');
		tx.executeSql('DROP TABLE IF EXISTS tipoRecetaCeliacos');
		tx.executeSql('DROP TABLE IF EXISTS recetasCeliacos');	
		tx.executeSql('CREATE TABLE IF NOT EXISTS glutenComCat (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, pais TEXT)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS glutenComProd (id INTEGER PRIMARY KEY AUTOINCREMENT, id_categoria INTEGER, nombre TEXT, categoria TEXT, marca TEXT, fabricante TEXT, pais TEXT, imagen TEXT, presentacion TEXT)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS glutenPrimerosPasos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, info TEXT)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS tipoRecetaCeliacos (id INTEGER PRIMARY KEY, nombre TEXT, pais INTEGER, estado INTEGER)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS recetasCeliacos (id INTEGER PRIMARY KEY, pais_local INTEGER, nombre TEXT,ingredientes TEXT,preparacion TEXT, img TEXT, estado INTEGER,nombreChef TEXT,actvsemana INTEGER,tiporeceta INTEGER,patrocinador TEXT,dificultad TEXT,tiempo TEXT,porciones TEXT,costo TEXT)');
	   //tx.executeSql('CREATE TABLE IF NOT EXISTS glutenRectCat ()');
		 SincronizarDB(finSincro);
    }

    // Transaction error callback
    //
    function errorCB(tx, err) {
        console.log("Error processing SQL: "+err);
    }

    // Transaction success callback
    //
    function successCB() {
        console.log("success create DB!");
    }
	
function SincronizarDB(finSincro){
		url = 'http://smmcr.net/fb/masxmenos/celiacos/appService.php?callback=?';
		/*SINCRONIZA CATEGORIAS*/
		$.getJSON(url,{accion:"comprasCat"}).done(function( data ) {
			console.log('Iniciando Sincronizacion de categorias...');
			$.each(data, function(index, item) {			
				db.transaction(function (tx) {  
				  tx.executeSql('INSERT INTO glutenComCat (id,nombre,pais) VALUES (?,?,?)', [item.id,item.nombre, item.pais]);
				});
			});
		},finSincro);
		/*SINCRONIZA PRODUCTOS*/
		$.getJSON(url,{accion:"comprasProd"}).done(function( data ) {
			console.log('Iniciando Sincronizacion de Productos...');
			$.each(data, function(index, item) {			
				db.transaction(function (tx) {  
				  tx.executeSql('INSERT INTO glutenComProd (id_categoria,nombre, categoria, marca, fabricante, pais, imagen, presentacion) VALUES (?,?,?,?,?,?,?,?)', [item.id_categoria,item.nombre,item.categoria, item.marca, item.fabricante, item.pais, item.imagen, item.presentacion]);
				});
			});
		},finSincro);
		/*SINCRONIZA Pasos*/
		$.getJSON(url,{accion:"comprasPasos"}).done(function( data ) {
			console.log('Iniciando Sincronizacion de Primeros Pasos...');
			$.each(data, function(index, item) {			
				db.transaction(function (tx) {  
				  tx.executeSql('INSERT INTO glutenPrimerosPasos (id,nombre, info) VALUES (?,?,?)', [item.id,item.tema,item.info]);
				});
			});
		},finSincro);
		/*SINCRONIZA tipo receta celiacos*/
		$.getJSON(url,{accion:"tipoReceta"}).done(function( data ) {
		console.log('Iniciando Sincronizacion tipo receta celiacos...');
		$.each(data, function(index, item) {
			db.transaction(function (tx) {  
			  tx.executeSql('INSERT INTO tipoRecetaCeliacos (id,nombre,pais,estado) VALUES (?,?,?,?)', [item.id,item.nombretipo,item.pais,item.estado]);
			});
		});
	},finSincro);
	/*SINCRONIZA RECETAS*/
	$.getJSON(url,{accion:"recetas"}).done(function( data ) {
		console.log('Iniciando Sincronizacion de Recetas Celiacos...');
		$.each(data, function(index, item) {			
			db.transaction(function (tx) {  
			  tx.executeSql('INSERT INTO recetasCeliacos (id,pais_local, nombre,ingredientes ,preparacion , img , estado ,nombreChef ,actvsemana ,tiporeceta ,patrocinador ,dificultad ,tiempo ,porciones ,costo ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [item.id,item.pais_local, item.nombre,item.ingredientes ,item.preparacion , item.img , item.estado ,item.nombreChef ,item.actvsemana ,item.tiporeceta ,item.patrocinador ,item.dificultad ,item.tiempo ,item.porciones ,item.costo]);
			});
		});
	},finSincro);
	
	}
function obtenerCatRecetasGluten(){
	var data = new Array();
	db.transaction(function (tx) {  
	tx.executeSql('SELECT * FROM tipoRecetaCeliacos where estado=1', [], function (tx, results) {
		var len = results.rows.length;
		for (var i=0; i<len; i++){
			data[i] = results.rows.item(i);
		}
	$('#contenidoulbusqueda2 ul').empty();
	  $.each(data, function(index, item) {	  
		  $('#contenidoulbusqueda2 ul').append('<li><a href="javascript:ShowSubGF('+item.id+','+"'tiporectaceliacos'"+')">'+item.nombre+'</a></li>');
		  });
		    $('#contenidoulbusqueda2 ul').attr('data-role', 'listview');
		
		    if (   $('#contenidoulbusqueda2 ul').hasClass('ui-listview')) {
		  $('#contenidoulbusqueda2 ul').listview("refresh");
		  }
		});
	});				
}
function GlutenRecetas(){
		var data = new Array();
		db.transaction(function (tx) {  
			tx.executeSql('SELECT * FROM glutenComCat ', [], function (tx, results) {
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					data[i] = results.rows.item(i);
				}
			$('#gfcCategorias').empty();
		
			  $.each(data, function(index, item) {		
				  $('#gfcCategorias').append('<li><a href="javascript:ShowSubGF('+item.id+','+"'variedad'"+')">'+item.nombre+'</a></li>');
				  });
				  $("#gfcCategorias").attr('data-role', 'listview');
 $("#gfcCategorias").attr('class', 'listavista');
  $(".listavista").listview('refresh', true);
   if (  $("#gfcCategorias").hasClass('ui-listview')) {
   // $("#guia #thelist").listview('refresh');
  $("#gfcCategorias").listview('refresh', true);
    } 
				 // $("#gfcCategorias").listview("refresh");
				});
			});	
	}	
	function GlutenVariedad(){
		var data = new Array();
		db.transaction(function (tx) {  
			tx.executeSql('SELECT * FROM glutenComCat', [], function (tx, results) {
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					data[i] = results.rows.item(i);
				}
			$('#gfcCategorias').empty();
			  $.each(data, function(index, item) {		
				  $('#gfcCategorias').append('<li><a href="javascript:ShowSubGF('+item.id+','+"'variedad'"+')">'+item.nombre+'</a></li>');
				  });
				    if (  $("#gfcCategorias").hasClass('ui-listview')) {
				  $("#gfcCategorias").listview("refresh");
				  }
				});
			});	
	}
	function GlutenPasos(){
		var data = new Array();
		db.transaction(function (tx) {  
			tx.executeSql('SELECT * FROM glutenPrimerosPasos', [], function (tx, results) {
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					data[i] = results.rows.item(i);
				}
			$('#pasos_list').empty();
			  $.each(data, function(index, item) {		
				  $('#pasos_list').append('<li><a href="javascript:ShowItemGF('+item.id+', '+"'pasos'"+' )">'+item.nombre+'</a></li>');
				  });
				     if (  $("#pasos_list").hasClass('ui-listview')) {
				   $("#pasos_list").listview("refresh", true);
				  }
				
				});
			});	
	}

	function ShowSubGF(id, categoria){	
		var data = new Array();
		var pagina;
		var contenedor;
		var tabla;
		var campo;
		switch(categoria){
			case 'variedad':
				pagina = '#glutenVariedadList';
				contenedor = '#gfcProductos';
				tabla = 'glutenComProd';
				campo = 'id_categoria';
				categoria = 'Productos';
			break;			
			case 'tiporectaceliacos':
				pagina = '#glutenRecetasList';
				contenedor = '#listaRecetasXCat ul';
				tabla = 'recetasCeliacos';
				campo = 'tiporeceta';
				categoria = 'tipoRecetaGluten';
				
			break;
			}
		db.transaction(function (tx) {  
			tx.executeSql('SELECT * FROM '+tabla+' WHERE '+campo+' = ?', [id], function (tx, results) {
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					data[i] = results.rows.item(i);
				}
			$(contenedor).empty();
			if(	categoria == 'Productos'){
			$(contenedor).html('<li data-role="list-divider">'+data[0].categoria+'</li>');
			}else if(categoria == 'tipoRecetaGluten'){
				/*tx.executeSql('SELECT * FROM tipoRecetaCeliacos WHERE id = ?', [21], function (tx, results) {
		
					var len = results.rows.length;
					for (var i=0; i<len; i++){
						data[i] = results.rows.item(i);
					}
					alert(data[0].nombre);
				$(contenedor).html('<li data-role="list-divider">'+data[0].nombre+'</li>');
				});*/
			}else{
		//	alert("ninguno");
			}
			  $.each(data, function(index, item) {		
				  $(contenedor).append('<li><a href="javascript:ShowItemGF('+item.id+',\''+categoria+'\')">'+item.nombre+'</a></li>');
				  });
				    if ( $(contenedor).hasClass('ui-listview')) {
					$(contenedor).listview("refresh");
					}
				});
			setTimeout( function() {
				$.mobile.changePage(pagina);
			}, 500);
			});
		
	}
	function ShowItemGF(id,categoria){
		var pagina;
		var campo = 'id';
		var tabla;
		var contenedor;
		var data = new Array();
		var row = new Array();
		switch(categoria){
			case 'pasos':
				pagina = '#glutenPasos';
				tabla = 'glutenPrimerosPasos';
				contenedor = '#contPasos';
				db.transaction(function (tx) {  
					tx.executeSql('SELECT * FROM '+tabla+' WHERE '+campo+' = ?', [id], function (tx, results) {
						var len = results.rows.length;
						for (var i=0; i<len; i++){
							data[i] = results.rows.item(i);
						}
						  $(contenedor).empty();
						  $('#titulo').html(data[0].nombre);
						  $(contenedor).append(data[0].info);
						  $(contenedor).append('<div class="clear"><li class="clear"></li></div>');
					});	
						 $("#contPasos ul").attr('data-role', 'listview');
					 
				});	
				
			break;
			case 'Productos':
				pagina = '#glutenVariedadDetail';
				tabla = 'glutenComProd';
				contenedor = '#contenidoDetail';
				db.transaction(function (tx) {  
					tx.executeSql('SELECT * FROM '+tabla+' WHERE '+campo+' = ?', [id], function (tx, results) {
						var len = results.rows.length;
						for (var i=0; i<len; i++){
							data[i] = results.rows.item(i);
						}
						//id INTEGER PRIMARY KEY AUTOINCREMENT, id_categoria INTEGER, nombre TEXT, categoria TEXT, marca TEXT, fabricante TEXT, pais TEXT, imagen TEXT, presentacion TEXT
						  $('#glutenVariedadDetail h2').html(data[0].nombre);
						  $('#glutenVariedadDetail #imgproducto img').attr("src","http://smmcr.net/fb/masxmenos/celiacos/compras/images/fotosproductos/"+data[0].imagen);
						  $('#glutenVariedadDetail #GFD_categoria').html('Categoria: '+data[0].categoria);
						  $('#glutenVariedadDetail #GFD_marca').html('Marca: '+data[0].marca);
						  $('#glutenVariedadDetail #GFD_fabricante').html('Fabricante: '+data[0].fabricante);
					});	
					 if ( $("#gfcProductosdetail").hasClass('ui-listview')) {
					$("#gfcProductosdetail").listview("refresh");
					}
				});	
			break;
			case 'tipoRecetaGluten':
				pagina = '#glutenRecetasDetail';
				tabla = 'recetasCeliacos';
				contenedor = '#vistaReceta';
				db.transaction(function (tx) {  
					tx.executeSql('SELECT * FROM '+tabla+' WHERE '+campo+' = ?', [id], function (tx, results) {
						var len = results.rows.length;
						for (var i=0; i<len; i++){
							data[i] = results.rows.item(i);
						}
					$("#titulorecetaprincipal").html("");
						$(contenedor).html("");
						//$("#recetafinalGluten").append("<a id='regresar' href='#glutenRecetasList'>Regresar</a>");
						$("#titulorecetaprincipal").append("<div id='titulorec1'><h3 id='nombrereceta'>"+results.rows.item(0).nombre+"</h3></div>");
						$(contenedor).append("<div id='titulorecetaGluten'><img src='http://movilmultimediasa.com/Celiacos/recetas/images/fotosrecetas/"+results.rows.item(0).img+"' alt='imgreceta' /></div>");
						$(contenedor).append("<li id='ingredientes'><h3 id='tituingre'>Ingredientes</h3>"+results.rows.item(0).ingredientes+"</li>");
						$(contenedor).append("<li id='preparacion'><h3 id='tituingre'>Preparación</h3>"+results.rows.item(0).preparacion+"</li>");
						$(contenedor).append('<div class="clear"><li class="clear"></li></div>');
						$("#glutenRecetasDetail ul").listview('refresh');
						//id INTEGER PRIMARY KEY AUTOINCREMENT, id_categoria INTEGER, nombre TEXT, categoria TEXT, marca TEXT, fabricante TEXT, pais TEXT, imagen TEXT, presentacion TEXT
					
				});
				setTimeout( function() {
					
						}, 500);
				});
			break;
		}
		setTimeout( function() {
			$.mobile.changePage(pagina);
		}, 500);
	}
	