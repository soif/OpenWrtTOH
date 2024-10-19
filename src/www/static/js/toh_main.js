
// Functions for Cell Model Popup Formatter ---------------------------------------------

function getMyColumnDefinition(field){
	let cols=columnStyles;
	let col={};
	if(typeof(cols[field]) != 'undefined' ){
		col=cols[field];
		if(typeof(col.headerTooltip) != 'undefined' && col.headerTooltip !==''){
			col.f_title=col.headerTooltip;
		}
		else if(typeof(col.title) != 'undefined' && col.title !==''){
			col.f_title=col.title;
		}
		else{
			col.f_title=field;
		}
	}
	else{
		col.f_title=field;
	}
	return col;
}

function formatLinkToHtml(url, name='link', target_blank=true){
	let pattern = /^http(s)?:\/\//;
	let target='';
	if(target_blank){
		target='_blank';
	}
	if(pattern.test(url)){
		return '<a href="'+url+'" target="'+target+'" title="'+url+'">'+name+'</a>';
	}
	return url;
}

// Loading --------------------------------------------------------
function showLoading(){
	$('#toh-loading').show();
}

function hideLoading(){
	$('#toh-loading').hide();
}

// Get Url parameter -----------------------------------------------
function getUrlParameter(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	var results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
// --------------------------------------------------------------
function getUrlParameterOrDefault(name, defaultValue) {
	var value = getUrlParameter(name);
	return value !== '' ? value : defaultValue;
}

// Make a "view" line -------------------------------------------
function htmlViewLine(field,title,checked){
	let html='';
	html +='<li><input type="checkbox" value="'+field+'"';
	if( checked ){html +=' checked="true"';} 
	html +='> '+title+"\n";
	return html;
}

// Make a "view" Group  ------------------------------------------
function htmlViewGroup(title,group){
	let html='';
	html +='<div class="toh-colgroup" data-group="'+group+'">'+"\n"+'<div class="toh-colgroup-title"><a href="#" class="view-link" title="Toggle group visibility"><i class="fa-solid fa-square"></i> '+title+'</a></div>'+"\n";
	html +='<ul>'+"\n";
	return html;
}
	
// Display the custom view block ---------------------------------
function displayCustomColumns(){
	let columns = tabuTable.getColumnDefinitions();  
	let view="";
	let col={};
	$.each(colViewGroups,function(key,arr){
		view +=htmlViewGroup(arr.name,key);
		$.each(arr.fields,function(k,field){
			col=tabuTable.getColumn(field);
			view +=htmlViewLine(field, col.getDefinition().title, col.isVisible())
			//remove from colums
			const index = columns.findIndex(item => item.field === field);
			if (index !== -1) {columns.splice(index, 1)[0];}
		});
		view +="</ul>\n</div>\n";
	});
	if(columns.length > 0){
		view +=htmlViewGroup('Unsorted','unsorted');
		$.each(columns,function(key,arr){
			col=tabuTable.getColumn(arr.field);
			view +=htmlViewLine(arr.field, arr.title, col.isVisible())
		});
		view +="</ul>\n</div>\n";
	}
	$("#toh-view-columns-content").html(view);
	groupsUpdateIcon();
}

// Update group Icons in the custom view block ------------------
function groupsUpdateIcon(){
	$('.toh-colgroup').each(function(i){
		var total=$(this).find('LI').length;
		var checked=$(this).find('LI INPUT:checked').length;
		var icon ="";
		if(checked==total){
			icon='fa-regular fa-square-check';
		}
		else if(checked==0){
			icon='fa-regular fa-square';
		}
		else{
			icon='fa-regular fa-square-minus';
		}
		$(this).find('.toh-colgroup-title I').removeClass().addClass(icon);
	});
}

// Apply a View Preset : show/hide columns -----------------------
function applyView(key) {
	showLoading();
	setTimeout(function(){
		//tabuTable.blockRedraw();
		if(key=='all'){
			showAllColumns(true);
		}
		else if(key=='none'){
			showAllColumns(false);
		}
		else{
			const arr = colViews[key];
			if (arr) {
				showAllColumns(false);
				arr.forEach(col => tabuTable.showColumn(col));
			}
		}
		displayCustomColumns();
		//tabuTable.redraw(true);
		//tabuTable.restoreRedraw();
	},0);
}

// Show or Hide ALL columns --------------------------------------
function showAllColumns(bool) {
	var columnDefs = tabuTable.getColumnDefinitions();  
	columnDefs.forEach(function(column) {
		if(bool){
			tabuTable.showColumn(column.field);
		}
		else{
			tabuTable.hideColumn(column.field);
		}
	});
}

// Make Preset Button ------------------------------------------
function htmlPresetButton(myclass, value){
	var icon='';
	if(value=='custom'){
		icon='<i class="fa-solid fa-caret-right"></i> ';
	}
	var name=value;
	name = name.replace(/_/g,' ');
	name = name.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase()); // UcFirst
	return '<a href="#" class="'+myclass+'" data-value="'+value+'">'+icon+name+'</a>'+"";
}

// Position the Image Preview div -------------------------------------------
function positionPreview($link, $container) {
	var linkOffset = $link.offset();
	var linkWidth = $link.outerWidth();
	var linkHeight = $link.outerHeight();
	var containerWidth = $container.outerWidth();
	var containerHeight = $container.outerHeight();
	var windowWidth = $(window).width();
	var windowHeight = $(window).height();
	var scrollTop = $(window).scrollTop();

	var left = linkOffset.left + linkWidth + 10; // 10px to the right of the link
	var top = linkOffset.top;

	// Check if the preview would go off the right edge of the window
	if (left + containerWidth > windowWidth) {
		left = linkOffset.left - containerWidth - 10; // 10px to the left of the link
	}

	// Check if the preview would go off the bottom of the viewport
	if (top + containerHeight > scrollTop + windowHeight) {
		top = Math.max(scrollTop, top + linkHeight - containerHeight);
	}

	// Ensure the preview doesn't go above the top of the viewport
	top = Math.max(scrollTop, top);

	$container.css({
		left: left,
		top: top
	});
}


// ############################################################################################################
// ## MAIN ####################################################################################################
// ############################################################################################################

var tabuTable;

$(document).ready(function () {

	// initialize table  -----------------------------------------------------
	tabuTable = new Tabulator("#toh-table", tabulatorOptions);

	// handles Image Preview on hover ----------------------------------------
	var $container = $('#toh-image-preview');
	$(document).on({
		mouseenter: function(e) {
		var $link = $(this);
		var imageUrl = $link.attr('href');
		$container.html('<img src="' + imageUrl + '" alt="Image Preview">');
		
		// Wait for the image to load before positioning
		$container.find('img').on('load', function() {
			positionPreview($link, $container);
		});

		$container.show();
		},
		mouseleave: function() {
		$container.hide().empty();
		}
	}, 'a.cell-image');


	// Observe the DOM to show/hide the loading icon  --------------------------
	// (because i've not found a Tabulator event to do that, ie when changing a large amount of column visibility)

	/*
	tabuTable.on("redrawStarted", function(){
		console.log('redrawStarted');
	});	
	tabuTable.on("redrawComplete", function(){
		console.log('redrawComplete');
	});	
	tabuTable.on("columnVisibilityChanged", function(){
		console.log('columnVisibilityChanged');
	});	
	tabuTable.on("renderComplete", function(){
		console.log('renderComplete');
	});	
	tabuTable.on("tableRendered", function(){
		console.log('tableRendered');
	});
	tabuTable.on("tableBuilt", function(){
		console.log('tableBuilt');
	});	
	*/

	var observer = new MutationObserver(function(mutations) {
		// Debounce the callback to avoid multiple triggers
		clearTimeout(window.domChangeTimer);
		window.domChangeTimer = setTimeout(function() {
			// Trigger a custom event when DOM changes are complete
			$(document).trigger('table-change-complete');
		}, 100);
	});

	// Start observing the document body
	observer.observe(document.getElementById('toh-table'), { childList: true, subtree: true });

	// Bind to the custom event
	$(document).on('table-change-complete', function() {
		//console.log('table changes completed');
		hideLoading();
	});
	

	// Takes GET parameter of defauls ---------------------------------------
	let init_view=getUrlParameterOrDefault('view',prefs.def_view);

	// make column order from the colViewGroups ------------------------------
	let columnOrder=[];
	$.each(colViewGroups,function(key,obj){
		$.each(obj.fields,function(f,field){
			columnOrder.push(field);
		});
	});


	// display view menu links ------------------------------------------------
	var views_html='';
	views_html+=htmlPresetButton('toh-view toh-view-custom','custom');
	views_html+=htmlPresetButton('toh-view','all');
	views_html+=htmlPresetButton('toh-view','none');
	for (const key in colViews){
		views_html+=htmlPresetButton('toh-view',key);
	}
	$('#toh-view-menu-links').html(views_html);
	//groupsUpdateIcon();


	// Fetch content and build table ------------------------------------------------------------
	$.getJSON( owrtUrls.toh_json, function( data ){ 
		//Makes columns
		var columns = data.columns.map((value, index) => ({
			field: value,
			title: data.captions[index],
			visible: false,
			...columnStyles[value]
		}));

		//init table with data
		showLoading();
		tabuTable.setColumns(columns);
		tabuTable.setData(data.entries).then(function(){
			// order columns			
			columns.sort((a, b) => {
				const indexA = columnOrder.indexOf(a.field);
				const indexB = columnOrder.indexOf(b.field);
				if (indexA === -1 && indexB === -1) return 0; // Both names not in order, keep original order
				if (indexA === -1) return 1; // a's name not in order, move to end
				if (indexB === -1) return -1; // b's name not in order, move to end
				return indexA - indexB;
			});
			tabuTable.setColumns(columns);

			//default view
			$("#toh-view-menu-links A[data-value='"+init_view+"']").trigger('click');

			// sort columns						
			tabuTable.setSort([
				{column:"model", dir:"asc"}, //then sort by this second
				{column:"brand", dir:"asc"} //sort by this first
			]);

		});   
	});


	// handles presets, filters and views ################################################################


	// Click: view presets ---------------------------------------------------
	$('#toh-view-menu-links').on('click','A',function(e){
		let view=$(this).data('value');
		//console.log('apply '+view);
		if(view=='custom'){
			$('#toh-view-columns-content').toggle();
		    $(this).children('I').toggleClass('fa-caret-right fa-caret-down');
		}
		else{
			applyView(view);
			$('#toh-view-menu-links A').removeClass('selected');
			$(this).addClass('selected');
			groupsUpdateIcon();
		}
	});

	// Click (or viewchanged): one view ------------------------------------
	$('#toh-view-columns-content').on('click viewchanged','INPUT',function(e){
		var field=$(this).val();
		if($(this).is(":checked")){
			tabuTable.showColumn(field);
		}
		else{
			tabuTable.hideColumn(field);
		}
		$('#toh-view-menu-links A').removeClass('selected');
		$('#toh-view-menu-links A[data-value=custom]').addClass('selected');

		groupsUpdateIcon();
	});

	//  Click: View group ---------------------------------------------------
	$('#toh-view-columns-content').on('click','.toh-colgroup-title A',function(e){
		e.preventDefault();
		//e.stopPropagation();
		showLoading();
		var checked	=$(this).parents('.toh-colgroup').find('LI INPUT:checked').length;
		var inputs	=$(this).parents('.toh-colgroup').find('LI INPUT');
		if(checked==0){
			inputs.prop('checked', true).trigger('viewchanged');
		}
		else{
			inputs.prop('checked', false).trigger('viewchanged');
		}
		groupsUpdateIcon();
	});

});
