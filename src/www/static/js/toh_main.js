

// ############################################################################################################
$(document).ready(function () {

	// Get parameters
	function getUrlParameter(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	// ------------------------------------------
	function getParameterOrDefault(name, defaultValue) {
		var value = getUrlParameter(name);
		return value !== '' ? value : defaultValue;
	}

	// ------------------------------------------
	function htmlViewLine(field,title,checked){
		let html='';
		html +='<li><input type="checkbox" value="'+field+'"';
		if( checked ){html +=' checked="true"';} 
		//html +='> '+title+' <small>('+field+")</small>\n";
		html +='> '+title+' <small class="dev-hidden">('+field+")</small>\n";
		return html;
	}

	// ------------------------------------------
	function htmlViewGroup(title,group){
		let html='';
		html +='<div class="view-group" data-group="'+group+'">'+"\n"+'<div class="group-title"><a href="#" class="view-link" title="Toggle group visibility"><i class="fa-solid fa-square"></i> '+title+'</a></div>'+"\n";
		html +='<ul>'+"\n";
		return html;
	}
		
	// ------------------------------------------
	function displayCustomColumns(){
		let columns = table.getColumnDefinitions();  
		let view="";
		let col={};
		$.each(colViewGroups,function(key,arr){
			view +=htmlViewGroup(arr.name,key);
			$.each(arr.fields,function(k,field){
				col=table.getColumn(field);
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
				col=table.getColumn(arr.field);
				view +=htmlViewLine(arr.field, arr.title, col.isVisible())
			});
			view +="</ul>\n</div>\n";
		}
		view ="<div class='devToggle'>view fields (DEV)</div>"+view;
		$("#custom-content").html(view);
		groupsUpdateIcon();

	}

	// ------------------------------------------
	function groupsUpdateIcon(){
		$('.view-group').each(function(i){
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
			$(this).find('.group-title I').removeClass().addClass(icon);
		});
	}

	// ------------------------------------------
	function applyView(key) {
		$('#head-loading').show();
		setTimeout(function(){
			//table.blockRedraw();
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
					arr.forEach(col => table.showColumn(col));
				}
			}
			displayCustomColumns();
			//table.redraw(true).then(hideLoading);
			//table.restoreRedraw();
		},0);
	}

	// ------------------------------------------
	function showAllColumns(bool) {
		var columnDefs = table.getColumnDefinitions();  
		columnDefs.forEach(function(column) {
			if(bool){
				table.showColumn(column.field);
			}
			else{
				table.hideColumn(column.field);
			}
		});
	}

	// ------------------------------------------
	function makeButton(myclass, value){
		var icon='';
		if(value=='custom'){
			icon='<i class="fa-solid fa-caret-right"></i> ';
		}
		var name=value;
		name = name.replace(/_/g,' ');
		name = name.replace(/(^\w{1})|(\s{1}\w{1})/g, match => match.toUpperCase());
		return '<a href="#" class="'+myclass+'" data-value="'+value+'">'+icon+name+'</a>'+"";
	}

	// handles Image Preview on hover --------------------------------------------------
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

	// Prevent default link behavior
	//$(document).on('click', 'a.cell-image', function(e) {
		//e.preventDefault();
	//});

	// Function to position the preview --------------------------------------------
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

	// ## MAIN #########################################################################
	// initialize table ################################################################
	var table = new Tabulator("#table-main", tabulatorOptions);


	//observe DOM, because i've not found a Tabulator event to do that, ie when changing a large amount of col visibility ---------
	var observer = new MutationObserver(function(mutations) {
		// Debounce the callback to avoid multiple triggers
		clearTimeout(window.domChangeTimer);
		window.domChangeTimer = setTimeout(function() {
		// Trigger a custom event when DOM changes are complete
		$(document).trigger('table-change-complete');
		}, 100);
	});

	// Configure the observer
	var config = { 
		childList: true, 
		subtree: true 
	};

	// Start observing the document body
	observer.observe(document.getElementById('table-main'), config);

	// Bind to the custom event
	$(document).on('table-change-complete', function() {
		console.log('table changes completed');
		$('#head-loading').hide();
	});
	
	/*

	table.on("redrawStarted", function(){
		//$('#head-loading').show();
		console.log('redrawStarted');
	});	
	table.on("redrawComplete", function(){
		//$('#head-loading').hide();
		console.log('redrawComplete');
	});	
	table.on("columnVisibilityChanged", function(){
		//$('#head-loading').show();
		console.log('columnVisibilityChanged');
	});	
	table.on("renderComplete", function(){
		//$('#head-loading').hide();
		console.log('renderComplete');
	});	
	table.on("tableRendered", function(){
		$('#head-loading').hide();
		console.log('tableRendered');
	});		

	table.on("tableBuilt", function(){
		console.log('tableBuilt');
	});	
	*/

	// Takes GET parameter of defauls
	let init_view=getParameterOrDefault('view',prefs.def_view);

	//make column order
	$.each(colViewGroups,function(key,obj){
		$.each(obj.fields,function(f,field){
			columnOrder.push(field);
		});
	});


	//Fetch content and build ------------------------------------------------------------

	$.getJSON( owrtUrls.toh_json, function( data ){ 
		//Makes columns
		var columns = data.columns.map((value, index) => ({
			field: value,
			title: data.captions[index],
			visible: false,
			...columnStyles[value]
		}));

		//init table with data
		$('#head-loading').show();
		table.setColumns(columns);
		table.setData(data.entries).then(function(){
			// order columns			
			columns.sort((a, b) => {
				const indexA = columnOrder.indexOf(a.field);
				const indexB = columnOrder.indexOf(b.field);
				if (indexA === -1 && indexB === -1) return 0; // Both names not in order, keep original order
				if (indexA === -1) return 1; // a's name not in order, move to end
				if (indexB === -1) return -1; // b's name not in order, move to end
				return indexA - indexB;
			});
			table.setColumns(columns);
			//default view
			//applyView('normal');
			$("#head-views-menu-links A[data-value='"+init_view+"']").trigger('click');
			//groupsUpdateIcon();

			// sort columns						
			table.setSort([
				{column:"model", dir:"asc"}, //then sort by this second
				{column:"brand", dir:"asc"} //sort by this first
			]);
			//$('#head-loading').hide();
		});   
	});


// handles presets, filter and views ########################################################################

	// make view custom ----------------
	var views_html='';
	views_html+=makeButton('toh-view toh-view-custom','custom');
	views_html+=makeButton('toh-view','all');
	views_html+=makeButton('toh-view','none');
	for (const key in colViews){
		views_html+=makeButton('toh-view',key);
	}
	$('#head-views-menu-links').html(views_html);
	//groupsUpdateIcon();


	// view presets click ----------------------
	$('#head-views-menu-links').on('click','A',function(e){
		let view=$(this).data('value');
		console.log('apply '+view);
		if(view=='custom'){
			$('#custom-content').toggle();
		    $(this).children('I').toggleClass('fa-caret-right fa-caret-down');
		}
		else{
			applyView(view);
			$('#head-views-menu-links A').removeClass('selected');
			$(this).addClass('selected');
			groupsUpdateIcon();
		}

	});


	// one view click (or change) ----------------------
	$('#custom-content').on('click viewchanged','INPUT',function(e){
		var field=$(this).val();
		if($(this).is(":checked")){
			table.showColumn(field);
		}
		else{
			table.hideColumn(field);
		}
		$('#head-views-menu-links A').removeClass('selected');
		$('#head-views-menu-links A[data-value=custom]').addClass('selected');

		groupsUpdateIcon();
	});

	//  view group click ----------------------
	$('#custom-content').on('click','.group-title A',function(e){
		e.preventDefault();
		//e.stopPropagation();
		$('#head-loading').show();
		var checked	=$(this).parents('.view-group').find('LI INPUT:checked').length;
		var inputs	=$(this).parents('.view-group').find('LI INPUT');
		if(checked==0){
			inputs.prop('checked', true).trigger('viewchanged');
		}
		else{
			inputs.prop('checked', false).trigger('viewchanged');
		}
		groupsUpdateIcon();
	});


	// $('#custom-content').on('changed','INPUT',function(e){
	// 	//groupsUpdateIcon();
	// });
		
	$('#custom-content').on('click','.devToggle',function(e){
		e.preventDefault();
		e.stopPropagation();
		$('#custom-content SMALL').toggle();
	});
});

	