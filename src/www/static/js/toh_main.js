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


// Filters functions ###############################################################################

// Make filter Preset Button ------------------------------------------
function htmlFilterPresetButton(myclass, value){
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

// display Filters Presets ------------------------------------------------
function buildFiltersPresets(){
	tmp_html='';
	for (const key in colFilterPresets){
		tmp_html+=htmlFilterDiv(colFilterPresets[key],key);
	}
	$('#toh-filters-presets .toh-filters-list').html(tmp_html);
}

// display Filters Features ------------------------------------------------
function buildFiltersFeatures(){
	tmp_html='';
	for (const key in colFilterFeatures){
		tmp_html+=htmlFilterDiv(colFilterFeatures[key],key,true);
	}
	$('#toh-filters-features-content').html(tmp_html);
}

// -------------------------------------------------------
function formatFilterDesc(filter){
	var title=columnStyles[filter.field].title;
	return title + " " + filter.type + " '" +filter.value + "'"; 
}

// -------------------------------------------------------
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

// Check on/off ALL features checkboxes -------------------------
function checkAllFeatures(state=true){
	$(".toh-filter-feature INPUT").prop('checked',state);
}

// Check on/off a feature checkbox ------------------------------
function checkFeature(feat,state=true){
	$(".toh-filter-feature INPUT[data-key="+feat+"]").prop('checked',state);
}

// Return a (flatted) list of the current filtered fields ------------------
function getTableFiltersFields(type='filters'){
	var fields=[];
	if(type=='filters'){
		var filters	=tabuTable.getFilters();
	}
	else if(type=='headerfilters'){
		var filters	=tabuTable.getHeaderFilters();
	}
	else{ // all
		var filters	=tabuTable.getFilters(true);
	}
	//console.log('GetFilterFields type='+type+' ----');
	//console.log(filters);
	$.each(filters,function(i,f){
		if(Array.isArray(f)){
			$.each(f,function(j,ff){
				if (!fields.includes(ff.field)){
					fields.push(ff.field);					
				}
			});
		}
		else{
			if (!fields.includes(f.field)){
				fields.push(f.field);					
			}
		}

	});
	//console.log(fields);
	return fields;
}

// ----------------------------------------------------
function applyFilterPreset(key){
	var set=getFilterSet('preset',key);
	if(Object.keys(set).length > 0 ){
		$('#toh-filters-presets A').removeClass('selected');
		$("#toh-filters-presets A[data-key="+key+"]").addClass('selected');
		tabuTable.setFilter(set.filters ); //,  {matchAll:true}
		checkAllFeatures(false);
		if(set.features.length > 0 ){		
			$.each(set.features,function(j,feat){
				checkFeature(feat);
			});	
		}
	}
}

// ----------------------------------------------------
function applyFilterFeature(key,bool){
	var set=getFilterSet('feature',key);
	//console.log('Set Features '+key+' ---------------------------');
	if(typeof(set.filters) !='object'){
		return false;
	}
	if(set.filters.length > 0){
		//console.log('Set Features '+key+' ------- DONE --------------');
		$('#toh-filters-presets A').removeClass('selected');
		//console.log(set);
		checkFeature(key,bool);
		if(bool){
			tabuTable.addFilter(set.filters);
		}
		else{
			tabuTable.removeFilter(set.filters);
		}		
	}
}

// get filters array (also merge features filters for Presets)--------------------
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


// Views functions #########################################################################

// Make a column line -------------------------------------------
function htmlColumnLine(field,col,checked){
	let html='';
	let title	=col.title;
	let tip		=col.headerTooltip;
	if(tip==true){tip='';}
	html +='<div class="toh-col toh-col-column">';
	html +='<input type="checkbox" data-key="'+field+'"';
	if( checked ){html +=' checked="true"';} 
	html +='> <a href="#" title="'+tip+'">'+title+"</a>\n";
	html +="</div>";
	return html;
}

// Make a column Group  ------------------------------------------
function htmlColumnGroup(title,group){
	let html='';
	html +='<div class="toh-colgroup" data-group="'+group+'">'+"\n"+'<div class="toh-colgroup-title"><a href="#" class="view-link" title="Toggle group visibility"><i class="fa-solid fa-square"></i> '+title+'</a></div>'+"\n";
	html +='<ul>'+"\n";
	return html;
}

// Display the views presets ---------------------------------
function buildViewsPresets(){
	var tmp_html='';
	tmp_html+=htmlFilterPresetButton('toh-view toh-view-custom','custom');
	tmp_html+=htmlFilterPresetButton('toh-view','all');
	tmp_html+=htmlFilterPresetButton('toh-view','none');
	for (const key in colViews){
		tmp_html+=htmlFilterPresetButton('toh-view',key);
	}
	$('#toh-cols-presets').html(tmp_html);
}

// Displays the views Columns ---------------------------------
function buildViewsColumns(){
	let columns = tabuTable.getColumnDefinitions();  
	let view="";
	let col={};

	// display known (on Prefs) fields
	$.each(colViewGroups,function(key,arr){
		view +=htmlColumnGroup(arr.name,key);
		$.each(arr.fields,function(k,field){
			col=tabuTable.getColumn(field);
			view +=htmlColumnLine(field, col.getDefinition(), col.isVisible())
			//remove from colums
			const index = columns.findIndex(item => item.field === field);
			if (index !== -1) {columns.splice(index, 1)[0];}
		});
		view +="</ul>\n</div>\n";
	});

	// handle remaining unsorted fields (not defined in Prefs)
	if(columns.length > 0){
		view +=htmlColumnGroup('Unsorted','unsorted');
		$.each(columns,function(key,arr){
			col=tabuTable.getColumn(arr.field);
			var def=col.getDefinition();
			def.headerTooltip +=' ('+arr.field+')'; //auto column dont have a tootil (only 'true')
			view +=htmlColumnLine(arr.field, def , col.isVisible())
		});
		view +="</ul>\n</div>\n";
	}

	$("#toh-cols-columns-content").html(view);
	updateColGroupIcons();
}

// Check on/off a Column checkbox ------------------------------
function checkColumn(feat,state=true){
	$(".toh-col-column INPUT[data-key="+feat+"]").prop('checked',state);
	updateColGroupIcons();
}

// Check on/off ALL Columns checkboxes -------------------------
function checkAllColumns(state=true){
	$(".toh-col-column INPUT").prop('checked',state);
	updateColGroupIcons();
}

//  Show and Check on/off ALL Column checkboxes ------------------------------
function showAndCheckColumn(col,state=true){
	checkColumn(col,state);
	if(state){
		tabuTable.showColumn(col);
	}
	else{
		tabuTable.hideColumn(col);
	}
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

// Apply a View Preset : show/hide columns -----------------------
function applyColumnPreset(key){
	showLoading();
	setTimeout(function(){

		//tabuTable.blockRedraw();
		if(key=='all'){
			$('#toh-cols-presets A').removeClass('selected');
			$("#toh-cols-presets A[data-key="+key+"]").addClass('selected');
			checkAllColumns(true);
			showAllColumns(true);
		}
		else if(key=='none'){
			$('#toh-cols-presets A').removeClass('selected');
			$("#toh-cols-presets A[data-key="+key+"]").addClass('selected');	
			checkAllColumns(false);
			showAllColumns(false);
		}
		else{
			var set=getColumnSet(key);
			if(set.length > 0){
				$('#toh-cols-presets A').removeClass('selected');
				$("#toh-cols-presets A[data-key="+key+"]").addClass('selected');	
				checkAllColumns(false);
				showAllColumns(false);
				set.forEach(col => {
					showAndCheckColumn(col);
				});	
			}
		}
		//tabuTable.redraw(true);
		//tabuTable.restoreRedraw();
	},0);

}
// Apply a (single) Column : show/hide -----------------------

function applyColumCol(key,state){
	showAndCheckColumn(key,state);
}

// get filters array (also merge features filters for Presets)--------------------------
function getColumnSet(key){
	set=[];
	if(key=='all'){
		$.each(colViews,function(k,col){
			if(!set.includes(col)){
				set.push(col);
			}
		});
	}
	else if (key=='none'){
		set=[];
	}
	else if(typeof(colViews[key]) !='undefined'){
		set=colViews[key];
	}
	return set;
}

// set columns view depending on the selected Filter option ---------------------------------
function applyColumnsFromFilters(){
	var opt=$("#toh-filters-options INPUT[name='filtcol']:checked").val();
	var fields	=getTableFiltersFields('all');
	if(opt=='add'){
		$.each(fields,function(i,col){
			showAndCheckColumn(col);
		});
		showAndCheckColumn('brand');
		showAndCheckColumn('model');
	}
	else if(opt=='repl'){
		showAllColumns(false);
		checkAllColumns(false);
		$.each(fields,function(i,col){
			showAndCheckColumn(col);
		});
		showAndCheckColumn('brand');
		showAndCheckColumn('model');
	}
}

// Update group Icons in the columns block ------------------
function updateColGroupIcons(){
	$('.toh-colgroup').each(function(i){
		var total=$(this).find('.toh-col-column').length;
		var checked=$(this).find('.toh-col-column INPUT:checked').length;
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


// URL functions ######################################################################################################

// Get Url parameter -----------------------------------------------
function getUrlParameter(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	var results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
// Get Url parameter or default value -----------------------------
function getUrlParameterOrDefault(name, defaultValue='') {
	var value = getUrlParameter(name);
	return value !== '' ? value : defaultValue;
}

// update the browser Url (without reloading the page) ------------
function updateBrowserUrl(newURL) {
	const state = {}; // State object
	const title = ''; // Title (ignored by most browsers)
	history.replaceState(state, title, newURL);
}

// get the currently checked features ---------------
function getCheckedFeatures(){
	var checked=[];
	$('.toh-filters-list INPUT').each(function(i){
		if($(this).is(':checked')){
			checked.push($(this).attr('data-key'));
		}
	});
	return checked;
}

// get the currently checked columns ---------------
function getCheckedColumns(){
	var checked=[];
	$('.toh-col-column INPUT').each(function(i){
		if($(this).is(':checked')){
			checked.push($(this).attr('data-key'));
		}
	});
	// console.log(checked);
	return checked;
}

  // build, then update the browser Url  ------------
function buildBrowserUrl(and_update=true){
	//console.log('buildBrowserUrl');
	var url=window.location.pathname;
	var params=[];
	var tmp_list;
	var tmp_preset;

	// make features
	tmp_preset=$('#toh-filters-presets A.selected').attr('data-key');
	if(tmp_preset !=undefined){
		params.push(prefs.p_filter+'='+tmp_preset);
	}
	else{
		tmp_list= getCheckedFeatures();
		if(tmp_list.length>0){
			params.push( prefs.p_features+'='+tmp_list.join(",") );
		}
	}

	// make colums
	tmp_preset=$('#toh-cols-presets A.selected').attr('data-key');
	if(tmp_preset !=undefined && tmp_preset !='custom'){
		params.push(prefs.p_view+'='+tmp_preset);
	}
	else{
		tmp_list= getCheckedColumns();
		if(tmp_list.length>0){
			params.push( prefs.p_columns+'='+tmp_list.join(",") );
		}  
	}

	if(and_update){
		url +="?";
		url +=params.join('&');
		updateBrowserUrl(url);
	}
	console.log(url);
}


// Cookie functions ###################################################################################

// save a cookie ---------------------------------------------------
function saveCookie(c_name, content, type='json', with_prefix=true){
	var c_path=prefs.cook_path;
	if(c_path==''){
		c_path=window.location.pathname;
	}
	var c_content=content;
	if(type=='json'){
		c_content=JSON.stringify(content);
	}
	document.cookie = prefs.cook_prefix + c_name + "=" + encodeURIComponent(c_content) + "; max-age="+prefs.cook_duration+"; path="+c_path;
}

// extract a cookie from the list---------------------------------------------------
function _extractCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
  }

// load a cookie ---------------------------------------------------
function loadCookie(c_name, type='json'){
	//console.log('loadCookie:'+c_name);
	var cookie=_extractCookie(prefs.cook_prefix + c_name);
	//console.log('loadCookie Result:'+cookie);

	if(cookie){
		var c_content=decodeURIComponent(cookie);
		if(type=='json'){
			return JSON.parse(c_content);
		}
		else{
			return c_content;
		}
	}
	else{
		return false;
	}
}

// -----------------------------
function loadPresetCookies(type){ //'features' or 'columns'
	//console.log('---loadPresetCookies:'+type);
	var c_value	='';

	for (let i = 1; i <= prefs.cook_preset_count; i++) {
		c_value=loadCookie(prefs['cook_name_'+type]+i);
		//console.log('p'+i);
		//console.log(c_value);
		if(typeof(toh_cookies[type]) !='object'){
			//console.log('-create type:'+type);
			toh_cookies[type]={};
		}
		if(c_value !=undefined || c_value==''){
			//console.log('-save:'+c_value);
			toh_cookies[type][i]=c_value;
		}
		else{
			//console.log('-create index:'+i);
			toh_cookies[type][i]={};
		}		
	}
	//console.log('---loadPresetCookies RESULT:');
	//console.log(toh_cookies);
}

// -----------------------------
function storePresetCookie(type, number=0, name='user'){ // type= 'features' or 'columns'
	//console.log('StoreCookie:'+type+', '+number+', '+name);
	if(name==''){
		name=number;
	}
	var preset={
		name: name,
		list: []
	};
	if(type=='features'){
		preset.list=getCheckedFeatures();
		saveCookie(prefs.cook_name_features+number, preset);
	}
	else if(type=='columns'){
		preset.list=getCheckedColumns();
		saveCookie(prefs.cook_name_columns+number, preset);
	}
	//console.log('storePresetCookie:'+type+", "+number);
	//console.log(preset.list);
}

// -----------------------------
function buildUserPresets(type){// type= 'features' or 'columns'
	//console.log('buildUserPresets: '+type);
	var sel='';
	var name='';
	var html='';
	if(type=='features'){
		sel="#toh-filters-upresets .toh-upresets-content";
	}
	else if(type=='columns'){
		sel="#toh-cols-upresets .toh-upresets-content";
	}
	else{
		return false;
	}
	for (let i = 1; i <= prefs.cook_preset_count; i++) {
		//console.log('pr'+i);
		var myclass='';
		if(typeof(toh_cookies[type][i])=='object'){
			if(typeof(toh_cookies[type][i].name) =='string'){
				name=toh_cookies[type][i].name;
				myclass="toh-used";
			}
			else{
				name=i;
			}
		}
		else{
			name=+i;
		}
		html +='<a href="#" class="toh-upreset-but '+myclass+'" data-key="'+i+'" data-type="'+type+'">'+name+'</a>';
	}
	$(sel).html(html);
}

//------------------------------------------------------
function applyUserPreset(type,num){
	var preset=toh_cookies[type][num];
	if(preset==false){
		console.log('empty preset: '+type+'/'+num);
	}
	if(type=='features'){
		checkAllFeatures(false);
	}
	else if(type=='columns'){
		checkAllColumns(false);
	}
	else{
		return false;
	}
	$.each(preset.list,function(i,key){
		if(type=='features'){
			applyFilterFeature(key,true);
		}
		else if(type=='columns'){
			applyColumCol(key,true);
		}
		else{
			return false;
		}
	});
}
//------------------------------------------------------
function loadCookiesAndBuildUserPresets(){
	loadPresetCookies('features');
	loadPresetCookies('columns');
	buildUserPresets('features');
	buildUserPresets('columns');
	$(".toh-upresets-title A").prop('title',prefs.tooltip_upreset);
	
}

// Misc functions ###################################################################################

// Position the Image Preview div -------------------------------
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

// Show Loading --------------------------------------------------------
function showLoading(){
	$('#toh-loading').show();
}
// Hide Loading --------------------------------------------------------
function hideLoading(){
	$('#toh-loading').hide();
}

// Set default Filters & View -------------------------------------------
function SetDefaults(){
	//console.log('SetDefaults');
	//show presets
	$(".toh-filters-but-toggle").trigger('click');
	
	var tmp_value;
	var tmp_arr;
	
	//columns or columns preset
	tmp_value=getUrlParameter(prefs.p_columns);
	if(tmp_value == ''){
		// set preset
		tmp_value=getUrlParameterOrDefault(prefs.p_view, prefs.def_view);
		if(getColumnSet(tmp_value).length == 0){
			tmp_value=prefs.def_view;
		}
		applyColumnPreset(tmp_value);
	}
	else{
		tmp_arr=tmp_value.split(',');
		$.each(tmp_arr,function(i,key){
			applyColumCol(key);
		});
	}
	
	
	//features or filter preset
	//console.log('SetDefaults Filter');
	tmp_value=getUrlParameter(prefs.p_features);
	if(tmp_value == ''){
		//console.log('SetDefaults Filter Preset');
		// set preset
		tmp_value=getUrlParameterOrDefault(prefs.p_filter, prefs.def_filter);
		applyFilterPreset(tmp_value);
		//console.log('SetDefaults Filter Preset DONE');
	}
	else{
		//console.log('SetDefaults Filter Features');
		tmp_arr=tmp_value.split(',');
		$.each(tmp_arr,function(i,key){
			applyFilterFeature(key);
		});
	}
	//console.log('SetDefaults URL');

	buildBrowserUrl();
	table_inited=true;
}



/*
//create indexed object  ---------------------------------------
function createIndexedObject(arrayOfObjects, key) {
	return arrayOfObjects.reduce((acc, obj) => {
		if (obj.hasOwnProperty(key)) {
			acc[obj[key]] = obj;
		}
		return acc;
	}, {});
}
*/



// ############################################################################################################
// ## MAIN ####################################################################################################
// ############################################################################################################

var tabuTable;
var table_inited=false;
var toh_cookies={};

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
	

	// make column order from the colViewGroups ------------------------------
	let columnOrder=[];
	$.each(colViewGroups,function(key,obj){
		$.each(obj.fields,function(f,field){
			columnOrder.push(field);
		});
	});

	//  Click: Toggle Filters Visibility -----------------------------
	$('.toh-filters-but-toggle').on('click',function(e){
		e.preventDefault();
		$('#toh-filters-container').toggle();
		$(this).children('I').toggleClass('fa-caret-right fa-caret-down');
	});

	//  Click: Toggle Views Visibility -------------------------------
	$('.toh-cols-but-toggle').on('click',function(e){
		e.preventDefault();
		$('#toh-cols-container').toggle();
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
	

			// display Filters & views 

			buildFiltersPresets();
			buildFiltersFeatures();
			buildViewsColumns();
			buildViewsPresets();
			

			//console.log(toh_cookies);
	
			//set default views
			SetDefaults();

			loadCookiesAndBuildUserPresets();

			// sort columns						
			tabuTable.setSort([
				{column:"model", dir:"asc"}, //then sort by this second
				{column:"brand", dir:"asc"} //sort by this first
			]);

		});   
	});


	// User Presets ##########################################################################################


	$('.toh-upresets-content').on('click','.toh-upreset-but',function(e){
		e.preventDefault();
		var num=$(this).attr('data-key');
		var type=$(this).attr('data-type');
		console.log("Click user preset:"+type+' '+num);
		if(e.shiftKey){
			console.log('save');
			var name="user"+num;
			storePresetCookie(type,num,name);
			$(this).html(name);
			$(this).removeClass('toh-used').addClass('toh-used');
		}
		else{
			console.log('load');
			applyUserPreset(type,num);
		}
	
	});

	// Top Filters ##########################################################################################

	//  Click: Filter Preset ------------------------------------------
	$('#toh-top-filters').on('click','.toh-filter-preset .toh-filter-button',function(e){
		//console.log("Click filter preset");
		e.preventDefault();
		var key=$(this).attr('data-key');
		applyFilterPreset(key);
	});

	// Click: Feature CheckBox -------------------------------------------
	$('#toh-top-filters').on('click','.toh-filter-feature INPUT',function(e){
		//console.log("Click checkbox feature");
		var key=$(this).attr('data-key');
		applyFilterFeature(key, $(this).is(":checked") );
	});

	// Click: Feature link ----------------------
	$('#toh-top-filters').on('click','.toh-filter-title A',function(e){
		e.preventDefault();
		var cb=$(this).parent().find('INPUT').trigger('click');
	});


	// Top Views (columns) ################################################################################

	// Click: View Preset ---------------------------------------------------
	$('#toh-cols-presets').on('click','A',function(e){
		e.preventDefault();
		let view=$(this).attr('data-key');
		//console.log('apply '+view);
		if(view=='custom'){
			$(".toh-cols-but-toggle").trigger('click');
		}
		else{
			applyColumnPreset(view);
		}
	});

	// Click (or viewchanged): one view CheckBox ----------------------
	$('#toh-cols-columns-content').on('click viewchanged','INPUT',function(e){
		var key=$(this).attr('data-key');
		$('#toh-cols-presets A').removeClass('selected');
		$('#toh-cols-presets A[data-key=custom]').addClass('selected');
		applyColumCol(key, $(this).is(":checked") );
	});

	// Click: one view link ----------------------
	$('.toh-cols-list').on('click','A',function(e){
		e.preventDefault();
		var cb=$(this).parent().find('INPUT').trigger('click');
	});

	//  Click: View Group ---------------------------------------------------
	$('#toh-cols-columns-content').on('click','.toh-colgroup-title A',function(e){
		e.preventDefault();
		//e.stopPropagation();
		showLoading();
		var checked	=$(this).parents('.toh-colgroup').find('.toh-col-column INPUT:checked').length;
		var inputs	=$(this).parents('.toh-colgroup').find('.toh-col-column INPUT');
		if(checked==0){
			inputs.prop('checked', true).trigger('viewchanged');
		}
		else{
			inputs.prop('checked', false).trigger('viewchanged');
		}
		updateColGroupIcons();
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
		var allfilters	=getTableFiltersFields('all');
		var filters		=getTableFiltersFields('filters');
		var headfilters	=getTableFiltersFields('headerfilters');
		var myclass='';
		$(".tabulator-col").removeClass('toh-col-allfilter toh-col-filter toh-col-headerfilter');
		$.each(allfilters,function(i,f){
			if(filters.includes(f) && headfilters.includes(f)){
				myclass='toh-col-allfilter';
			}
			else if(filters.includes(f)){
				myclass='toh-col-filter';
			}
			else if(headfilters.includes(f)){
				myclass='toh-col-headerfilter';
			}

			if(myclass !=''){
				//console.log('apply header class: '+myclass+' to '+f);
				$(".tabulator-col[tabulator-field='"+f+"']").addClass(myclass);
			}			

		});
	}
	
	// Expand header-filter INPUT on focus -----------------------------------
	$('#toh-table').on('focus','.tabulator-header-filter INPUT', function() {
		var w=$(this).outerWidth();
		if (w < 50) {
			var pw=$(this)[0].style.width;
			$(this).attr('data-orig-pwidth',pw);
			$(this).css('position','absolute');
			$(this).parents('.tabulator-col').css('overflow','visible');
			$(this).animate({
				width: '100px',
			}, 100);
		}
	});

	// Restore header-filter INPUT on blur ---------------------------------
	$('#toh-table').on('blur','.tabulator-header-filter INPUT', function() {
		var pw=$(this).attr('data-orig-pwidth');
		if (pw !='' || pw > 0) {
			$(this).css('position','static');
			$(this).parents('.tabulator-col').css('overflow','hidden');
			$(this).animate({width: pw}, 100);
		}
		setColumHeaderColors();
	});



	// tabuTable events ################################################################################################

	// Resfresh column color on header-filter INPUT' blur ---------------------------------
	tabuTable.on("dataFiltered", function(filters, rows){
		//console.log('dataFiltered Event ----------');
		//console.log(getTableFiltersFields('headerfilters'));
		applyColumnsFromFilters();
		setColumHeaderColors();
		toggleFilterClearButVisibility();
		if(table_inited){
			buildBrowserUrl();
		}
	});

	// Resfresh column color on header-filter INPUT' blur ---------------------------------
	tabuTable.on("columnVisibilityChanged", function(column, visible){
		if(table_inited){
			buildBrowserUrl();
		}
	});

	// Resfresh column color on header-filter INPUT' blur ---------------------------------
	tabuTable.on("dataSorted", function(sorters, rows){
		toggleSortClearButVisibility();
	});
	


});
