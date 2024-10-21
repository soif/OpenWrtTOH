/*

	Copyright (c) 2024 Francois Dechery

     This program is free software: you can redistribute it and/or modify it under the 
	 terms of the GNU General Public License as published by the Free Software Foundation, 
	 either version 2 of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
	without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
	See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with this program. 
	If not, see <https://www.gnu.org/licenses/>. 

 */



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
function htmlViewLine(field,col,checked){
	let html='';
	let title	=col.title;
	let tip		=col.headerTooltip;
	if(tip==true){tip='';}
	html +='<li><input type="checkbox" value="'+field+'"';
	if( checked ){html +=' checked="true"';} 
	html +='> <a href="#" title="'+tip+'">'+title+"</a>\n";
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
function populateViewsContent(){
	let columns = tabuTable.getColumnDefinitions();  
	let view="";
	let col={};

	// display known (on Prefs) fields
	$.each(colViewGroups,function(key,arr){
		view +=htmlViewGroup(arr.name,key);
		$.each(arr.fields,function(k,field){
			col=tabuTable.getColumn(field);
			view +=htmlViewLine(field, col.getDefinition(), col.isVisible())
			//remove from colums
			const index = columns.findIndex(item => item.field === field);
			if (index !== -1) {columns.splice(index, 1)[0];}
		});
		view +="</ul>\n</div>\n";
	});

	// handle remaining unsorted fields (not defined in Prefs)
	if(columns.length > 0){
		view +=htmlViewGroup('Unsorted','unsorted');
		$.each(columns,function(key,arr){
			col=tabuTable.getColumn(arr.field);
			var def=col.getDefinition();
			def.headerTooltip +=' ('+arr.field+')'; //auto column dont have a tootil (only 'true')
			view +=htmlViewLine(arr.field, def , col.isVisible())
		});
		view +="</ul>\n</div>\n";
	}

	$("#toh-views-content").html(view);
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
		populateViewsContent();
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
	var name=value;
	name = name.replace(/_/g,' ');
	name = name.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase()); // UcFirst
	return '<a href="#" class="'+myclass+'" data-key="'+value+'">'+icon+name+'</a>'+"";
}
// Make Filter Preset ------------------------------------------
function htmlFilterDiv(filt,key,is_feature=false){
	var html='';
	var myclass='preset';
	if(is_feature){
		myclass='feature';
	}
	if(filt.type=='admin'){
		myclass +=" toh-filter-admin";
	}
	html +='<div class="toh-filter toh-filter-'+myclass+'">';
	html +='<span class="toh-filter-title">';
	if(is_feature){
		html +='<input type="checkbox" data-key="'+key+'">';
	}
	html +='<a href="#" class="toh-filter-button" data-key="'+key+'" title="';
	if(is_feature){
		html +=makeFeatureDescription(key);
	}
	html +='">'+filt.title+'</a></span>';
	html +='<span class="toh-filter-description">'+filt.description+'</span>';
	html +="</div>\n";
	return html;
}

// -------------------------------------------------------
function formatFilterDesc(filter){
	var title=columnStyles[filter.field].title;
	return title + " " + filter.type + " '" +filter.value + "'"; 
}

function makeFeatureDescription(key){
	var features=colFilterFeatures[key];
	var desc='';
	var done_and=false;
	var done_or=false;
	$.each(features.filters,function(i,filter){
		if(Array.isArray(filter)){
			desc +="(";
			$.each(filter,function(j,orfilter){
				if(done_or){
					desc +=" OR ";
				}
				desc +=formatFilterDesc(orfilter);
				done_or=true;
			});
			desc +=") ";
			done_or=false;
		}
		else{
			if(done_and){
				desc +=" AND ";
			}
			desc +=formatFilterDesc(filter);
		}
		done_and=true;
	});
	return desc;
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
//create indexed object  ---------------------------------------
function createIndexedObject(arrayOfObjects, key) {
	return arrayOfObjects.reduce((acc, obj) => {
		if (obj.hasOwnProperty(key)) {
			acc[obj[key]] = obj;
		}
		return acc;
	}, {});
}

// Check on/off ALL features checkboxes -------------------------
function checkAllFeatures(state=true){
	$(".toh-filter-feature INPUT").prop('checked',state);
}

// Check on/off a feature checkbox ------------------------------
function checkFeature(feat,state=true){
	$(".toh-filter-feature INPUT[data-key="+feat+"]").prop('checked',state);
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
		hideLoading();
	});
	

	// Takes GET parameter of defauls ---------------------------------------
	let init_view=getUrlParameterOrDefault('view',prefs.def_view);

	// Set default Filters & View -------------------------------------------
	function SetDefaults(){
			//show presets
			$(".toh-filters-but-toggle").trigger('click');
			//default col view
			$("#toh-views-presets A[data-key='"+init_view+"']").trigger('click');
	}

	// make column order from the colViewGroups ------------------------------
	let columnOrder=[];
	$.each(colViewGroups,function(key,obj){
		$.each(obj.fields,function(f,field){
			columnOrder.push(field);
		});
	});

	// display View Preset menu --------------------------------------------------
	var tmp_html='';
	tmp_html+=htmlPresetButton('toh-view toh-view-custom','custom');
	tmp_html+=htmlPresetButton('toh-view','all');
	tmp_html+=htmlPresetButton('toh-view','none');
	for (const key in colViews){
		tmp_html+=htmlPresetButton('toh-view',key);
	}
	$('#toh-views-presets').html(tmp_html);

	// display Filter Presets ------------------------------------------------
	tmp_html='';
	for (const key in colFilterPresets){
		tmp_html+=htmlFilterDiv(colFilterPresets[key],key);
	}
	$('#toh-filters-presets .toh-filters-list').html(tmp_html);

	// display Filter Features ------------------------------------------------
	tmp_html='';
	for (const key in colFilterFeatures){
		tmp_html+=htmlFilterDiv(colFilterFeatures[key],key,true);
	}
	$('#toh-filters-features-content').html(tmp_html);


	//  Click: Toggle Filters Visibility -----------------------------
	$('.toh-filters-but-toggle').on('click',function(e){
		e.preventDefault();
		$('#toh-filters-container').toggle();
		$(this).children('I').toggleClass('fa-caret-right fa-caret-down');
	});

	//  Click: Toggle Views Visibility -------------------------------
	$('.toh-views-but-toggle').on('click',function(e){
		e.preventDefault();
		$('#toh-views-container').toggle();
		$(this).children('I').toggleClass('fa-caret-right fa-caret-down');
	});


	// Fetch content and build table ------------------------------------------
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

			//set default views
			SetDefaults();

			// sort columns						
			tabuTable.setSort([
				{column:"model", dir:"asc"}, //then sort by this second
				{column:"brand", dir:"asc"} //sort by this first
			]);

		});   
	});



	// Top Filters ##########################################################################################
	
	// get filters array (also merge features filters for Presets)--------------------------
	function getFilterSet(type, key){
		if(type=='preset'){
			var set=colFilterPresets[key];
		}
		else if(type=='feature'){
			var set=colFilterFeatures[key];
		}
		else{
			console.log('Unknown ('+key+') type: '+ type);
			return {};
		}
		if(typeof(set) !='object'){
			console.log('Unknown Set key: '+ key);
			return {};
		}
		//merge filters with features.filters
		if(type=='preset'){
			if( typeof(set.features) =='object'){ // cant we write it shorter ?
				$.each(set.features,function(i,fv){
					//console.log(i+'->'+fv)
					$.each(colFilterFeatures[fv].filters,function(j,filt){
						set.filters.push(filt);
					});
				});
			}
			else{
				set.features={};
			}
		}
		return set;
	}

	//  Click: Filter Preset ------------------------------------------
	$('#toh-top-filters').on('click','.toh-filter-preset .toh-filter-button',function(e){
		//console.log("Click filter preset");
		e.preventDefault();
		var key=$(this).attr('data-key');
		var set=getFilterSet('preset',key);
		//tabuTable.refreshFilter();
		tabuTable.setFilter(set.filters ); //,  {matchAll:true}
		checkAllFeatures(false);
		$.each(set.features,function(j,feat){
			checkFeature(feat);
		});
		//console.log(set);
	});

	// Click: Feature CheckBox -------------------------------------------
	$('#toh-top-filters').on('click','.toh-filter-feature INPUT',function(e){
		//console.log("Click checkbox feature");
		var key=$(this).attr('data-key');
		var set=getFilterSet('feature',key);
		//console.log(set);
		if($(this).is(":checked")){
			tabuTable.addFilter(set.filters);
		}
		else{
			tabuTable.removeFilter(set.filters);
		}
	});

	// Click: Feature link ----------------------
	$('#toh-top-filters').on('click','.toh-filter-title A',function(e){
		e.preventDefault();
		var cb=$(this).parent().find('INPUT').trigger('click');
	});


	// Top Views (columns) ################################################################################

	// Click: View Preset ---------------------------------------------------
	$('#toh-views-presets').on('click','A',function(e){
		e.preventDefault();
		let view=$(this).attr('data-key');
		//console.log('apply '+view);
		if(view=='custom'){
			$(".toh-views-but-toggle").trigger('click');
		}
		else{
			applyView(view);
			$('#toh-views-presets A').removeClass('selected');
			$(this).addClass('selected');
			groupsUpdateIcon();
		}
	});

	// Click (or viewchanged): one view CheckBox ----------------------
	$('#toh-views-content').on('click viewchanged','INPUT',function(e){
		var field=$(this).val();
		if($(this).is(":checked")){
			tabuTable.showColumn(field);
		}
		else{
			tabuTable.hideColumn(field);
		}
		$('#toh-views-presets A').removeClass('selected');
		$('#toh-views-presets A[data-key=custom]').addClass('selected');

		groupsUpdateIcon();
	});

	// Click: one view link ----------------------
	$('#toh-views-list').on('click','A',function(e){
		e.preventDefault();
		var cb=$(this).parent().find('INPUT').trigger('click');
	});

	//  Click: View Group ---------------------------------------------------
	$('#toh-views-content').on('click','.toh-colgroup-title A',function(e){
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



	// Top Buttons ###########################################################################################@

	// -------------------------------------------
	function toggleFilterClearButVisibility(){
		var $but_clear_filt	=$('.toh-but-clearfilters');
		var $but_clear_head	=$('.toh-but-clearheaderfilters');
		var $but_clear_all	=$('.toh-but-clearallfilters');
		// filters
		var cur_filters		=tabuTable.getFilters();
		if(cur_filters.length==0){
			$but_clear_filt.hide();
		}
		else{
			$but_clear_filt.show();
		}
		// header filters
		var cur_headfilters	=tabuTable.getHeaderFilters();
		if(cur_headfilters.length==0){
			$but_clear_head.hide();
		}
		else{
			$but_clear_head.show();
		}
		// ALL filters
		if(cur_filters.length>0 && cur_headfilters.length>0 ){
			$but_clear_all.show();
		}
		else{
			$but_clear_all.hide();
		}
	}

	// -------------------------------------------
	function toggleSortClearButVisibility(){
		var $but_clear_sort	=$('.toh-but-clearheadersorts');
		//console.log(tabuTable.getSorters());
		if(tabuTable.getSorters().length>0 ){
			$but_clear_sort.show();
		}
		else{
			$but_clear_sort.hide();
		}		
	}

	// Click: clear header sorts ----------------
	$(".toh-but-clearheadersorts").on('click', function (e) {
		e.preventDefault();
		tabuTable.clearSort();
	});

	// Click: clear filters ----------------
	$(".toh-but-clearfilters").on('click', function (e) {
		e.preventDefault();
		tabuTable.clearFilter();
		checkAllFeatures(false);
	});

	// Click: clear header filters ----------------
	$(".toh-but-clearheaderfilters").on('click', function (e) {
		e.preventDefault();
		tabuTable.clearHeaderFilter();
	});

	// Click: clear all filters ----------------
	$(".toh-but-clearallfilters").on('click', function (e) {
		e.preventDefault();
		tabuTable.clearHeaderFilter();
		tabuTable.clearFilter();
		checkAllFeatures(false);
	});



	// Header Filters ###########################################################################################@

	// Set Colum Headers Color-------------------------------------------------
	function setColumHeaderColors(){
		var allfilters	=createIndexedObject(tabuTable.getFilters(true),	'field');
		var filters		=createIndexedObject(tabuTable.getFilters(),		'field');
		var headfilters	=createIndexedObject(tabuTable.getHeaderFilters(),	'field');
		var myclass='';
		$(".tabulator-col").removeClass('toh-col-allfilter toh-col-filter toh-col-headerfilter');
		Object.keys(allfilters).forEach( f => {
			if(typeof(filters[f]) =='object' && typeof(headfilters[f]) =='object' && filters[f].value !='' && headfilters[f].value.length > 1 ){
				myclass='toh-col-allfilter';
			}
			else if(typeof(filters[f]) =='object' && filters[f].value !=''){
				myclass='toh-col-filter';
			}
			else if(typeof(headfilters[f]) =='object' && headfilters[f].value.length > 1){
				myclass='toh-col-headerfilter';
			}
			//console.log(f+' -> '+myclass);
		 	if(myclass !=''){
				//console.log('applied');
				$(".tabulator-col[tabulator-field='"+f+"']").addClass(myclass);
			}			
		});
	}
	
	// Expand header-filter INPUT on focus -----------------------------------
	$('#toh-table').on('focus','.tabulator-header-filter INPUT', function() {
		var w=$(this).width();
		if (w < 50) {
			$(this).attr('data-orig-width',w);
			$(this).css('position','absolute');
			$(this).parents('.tabulator-col').css('overflow','visible');
			$(this).animate({
				width: '100px',
			}, 100);
		}
	});

	// Restore header-filter INPUT on blur ---------------------------------
	$('#toh-table').on('blur','.tabulator-header-filter INPUT', function() {
		var w=$(this).attr('data-orig-width');
		if (w > 0) {
			$(this).css('position','static');
			$(this).parents('.tabulator-col').css('overflow','hidden');
			$(this).animate({
				width: '100%',
			}, 100);
		}
		setColumHeaderColors();
	});



	// events ################################################################################################

	// Resfresh column color on header-filter INPUT' blur ---------------------------------
	tabuTable.on("dataFiltered", function(filters, rows){
		setColumHeaderColors();
		toggleFilterClearButVisibility();
	});
	// Resfresh column color on header-filter INPUT' blur ---------------------------------
	tabuTable.on("dataSorted", function(filters, rows){
		toggleSortClearButVisibility();
	});
	

});
