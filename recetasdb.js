//	document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova is ready
    //
	

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
				  $("#gfcCategorias").listview("refresh");
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
				  $("#pasos_list").listview("refresh");
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
			break;
			}
		db.transaction(function (tx) {  
			tx.executeSql('SELECT * FROM '+tabla+' WHERE '+campo+' = ?', [id], function (tx, results) {
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					data[i] = results.rows.item(i);
				}
			$(contenedor).empty();
			$(contenedor).html('<li data-role="list-divider">'+data[0].categoria+'</li>');
			  $.each(data, function(index, item) {		
				  $(contenedor).append('<li><a href="javascript:ShowItemGF('+item.id+','+"'Productos'"+')">'+item.nombre+'</a></li>');
				  });
					$(contenedor).listview("refresh");
				});
			});
			setTimeout( function() {
				$.mobile.changePage(pagina);
			}, 500);
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
						  $(contenedor).html("<li>"+data[0].info+"</li>");
					});	
					$(contenedor).listview("refresh");
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
						  $('#glutenVariedadDetail #imgproducto img').attr("src","http://movilmultimediasa.com/Celiacos/compras/images/fotosproductos/"+data[0].imagen);
						  $('#glutenVariedadDetail #GFD_categoria').html('Categoria: '+data[0].categoria);
						  $('#glutenVariedadDetail #GFD_marca').html('Marca: '+data[0].marca);
						  $('#glutenVariedadDetail #GFD_fabricante').html('Fabricante: '+data[0].fabricante);
					});	
					$("#gfcProductosdetail").listview("refresh");
				});	
			break;
		}
		setTimeout( function() {
			$.mobile.changePage(pagina);
		}, 500);
	}
	