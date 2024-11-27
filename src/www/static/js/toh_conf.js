
// Configuration #################################################################################################

// Urls --------------------------------------------------------
let owrtUrls={
	www: 			"https://openwrt.org/",
	toh_json:		"https://openwrt.org/toh.json",
	media:			"https://openwrt.org/_media/",
	github_commit:	"https://github.com/openwrt/openwrt/commit/",
}

// Preferences --------------------------------------------------
let prefs={
	def_filter: 	'',					// default Filter Preset
	def_features: 	'',					// default Features (list ',' separated)
	def_view: 		'normal',			// default Columns View Preset
	def_columns: 	'',					// default Columns (list ',' separated)

	p_filter:		'filter',			//name of the filter preset URL parameter
	p_features:		'features',			//name of the features URL parameter
	p_view:			'view',				//name of the view URL parameter
	p_columns:		'columns',			//name of the columns URL parameter

	cook_prefix:	'toh_',				// the cookie's prefix,
	cook_duration:	3600*24*730,		// the cookie's duration (in sec),
	cook_path: 		'',					// the cookie's path (will be set to the current path if not set),
	cook_preset_count: 	3,				// how many uset preset (features or columns) cookies do we use
	cook_name_features:'myFeatures', 	// name of the features cookie,
	cook_name_columns:'myColumns',		// name of the columns cookie,
	cook_max_chars: 	12,				// max number of character allowed in the cookie name

	tooltip_upreset:"User Presets: Click to Load, Shit-click to save, Alt-click to delete",

};

// options for tabulator table (tabuTable) ---------------------
let tabulatorOptions={
	importFormat:"array",
	height: "100%",

	pagination: true,
	paginationCounter:"rows", 			//add pagination row counter
	paginationButtonCount: 10,
	paginationSize: 30,
	paginationSizeSelector:true,
	paginationSizeSelector:[10, 20, 30, 40, 50, 75, 100, 200, 300], //enable page size select element with these options

	columns:[],
	movableColumns:true,      		//allow column order to be changed
	columnDefaults:{
		headerFilter:true,
		headerTooltip:true,
//		hozAlign: 'right',
		tooltip:true,         //show tool tips on cells
		headerSortTristate:true,
	},

	initialSort:[
		{column:"brand", dir:"asc"}, 	//sort by this first
		{column:"model", dir:"desc"}, //then sort by this second
	],
	//debugEventsInternal:['data-filtered'], 

};




// ########################################################################################################################################
// Because these functions are referenced in the next colums definitions, we have to declare them first ###################################
// ########################################################################################################################################


// Cell Model Popup Formatter ###########################################################################################
var cellModelPopupFormatter = function(e, cell, onRendered){
	var data 	= cell.getData();
	var col={};
	var value='';
	var done=false;
	var contents = "<table class='toh-popup-details-table'>";

	$.each(colViewGroups,function(key,obj){
		$.each(obj.fields,function(f,field){
			col		= getMyColumnDefinition(field);
			value	=data[field];
			if(value == null || value == '-' || value == ''){
				//value='';
				return true; // continue
			}
			if(!done){
				contents +='<tr class="toh-popup-group-tr"><td colspan=2>'+obj.name+'</td></tr>';
				done=true;
			}
			contents +='<tr><td class="toh-popup-key">'+col.f_title+'</td><td class="toh-popup-value">'+formatLinkToHtml(value)+'</td></tr>';
		});
		done=false;
	});

	contents += "</table>";
	return contents;
};

// Columns Formatters ###############################################################################################################
// --------------------------------------------------------
function FormatterLink(cell, formatterParams, onRendered) {
	var value = cell.getValue();
	if (value && value.length > 0) {
		return "<a href='" + value + "' target='_blank'>" + formatterParams.label + "</a>";
	} 
	return value;
}
// --------------------------------------------------------
function FormatterLinkCommit(cell, formatterParams, onRendered) {
	var value = cell.getValue();
	if (value && value.length > 0) {
		var commit=value.replace(/.*?;h=/g,'');
		var gh_link=owrtUrls.github_commit + commit;
		return "<a href='" + value + "' target='_blank' title='Origin'>Orig.</a> | <a href='" + gh_link + "' target='_blank' title='Github'>GH</a>";
	} 
	return '';
}
// --------------------------------------------------------
function FormatterLinkDevice(cell, formatterParams, onRendered) {
	var value = cell.getValue();
	if (value && value.length > 0) {
		value=value.replace(/:/g,'/');
		return "<a href='" + owrtUrls.www + value + "' target='_blank'>TOH</a>";
	} 
	return value;
}
// --------------------------------------------------------
function FormatterImages(cell, formatterParams, onRendered) {
	var arr = cell.getValue();
	var url='';
	var out='';
	var label='';
	if (Array.isArray(arr) && arr.length > 0) {
		arr.forEach((value, index) => {
			if(value.match(/^http/)){
				url=value;
			}
			else{
				value=value.replace(/:/g,'/');
				url=owrtUrls.media + value;
			}
			if(value.match(/genericrouter1.png$/)){
				label='<i class="fa-regular fa-image generic"></i>';
			}
			else{
				label='<i class="fa-solid fa-image"></i>';
			}
			out +='<a href="' + url + '" target="_blank" class="cell-image">'+label+'</a> ';

			// preload images
			const img = new Image();
			img.src = url;

		});
		return out;
	} 
	return arr;
}
// --------------------------------------------------------
function FormatterCleanEmpty(cell, formatterParams, onRendered) {
	var value = cell.getValue();
	if (value && value.length > 0) {
		value=value.replace(/-/g,'');
		return value;
	} 
	return "";
}
// --------------------------------------------------------
function FormatterCleanWords(cell, formatterParams, onRendered) {
	var value = cell.getValue();
	if (value && value.length > 0) {
		value=value.replace(/more than/g,'&gt;'); // for GPIOs
		value=value.replace(/Qualcomm Atheros/g,'Atheros'); //  for CPU
		return value;
	} 
	return "";
}
// --------------------------------------------------------
function FormatterArray(cell, formatterParams, onRendered) {
	var arr = cell.getValue();
	var out='';
	var done=false;
	if (Array.isArray(arr) && arr.length > 0) {
		arr.forEach((value, index) => {
			value=value.replace(/NAND/g,' NAND'); // for Flash
			value=value.replace(/Qualcomm Atheros/g,'Atheros'); // for WLAN Hardware
			if(done){
				out +=" + ";
			}
			out +=value;
			done=true;
		});
		return out;
	}
	return arr;
}
// --------------------------------------------------------
function FormatterYesNo(cell, formatterParams, onRendered) {
	var value = cell.getValue();
	var icon='';
	if (typeof value === "string") {
		value=value.toLowerCase().trim();
	}
	if(value=='yes'){
		icon='fa-solid fa-check';
	}
	else if(value=='no'){
		icon='fa-solid fa-xmark';
	}
	else if(value=='-'){
		icon='fa-solid fa-question dash';
	}
	else if(value==''){
		icon='fa-solid fa-question empty';		
	}
	else{
		icon='fa-solid fa-question unknown';
	}
	return '<i class="'+icon+'"></i>';
}


// Handle the 'flashmb' weird data format #####################################################################################

// ---------------------------------------------------------------------------------------
function cellDebug(e, cell){
	console.log(cell);
	console.log(cell._cell.value);
}


// get the best value to use in sort/filter of the 'flashmb' column ----------------------
function _getFlashArrayBestValue(arr){
	// ignore these, just in case (because JS is SOOOOOOO sensitive)
	if(arr == null){
		return '';
	}
	if( typeof(arr) !="object" ){
		return arr;
	}

	var target=0;	
	// now we can walk into the array of values, without throwing a fatal error (did I ever said I love JS ?) .....
	arr.forEach((v) => {
		// 'microSD' or 'SD' means(?) we have Gigas available, so we rank as 128G
		if(v.match(/microsd/i) || v.match(/^SD$/)){
			//console.log('SD found in :'+v);
			v=128*1024;
		}
		// eMMC size is unknown, but if it is alone, it maybe(?) means at least 1M(?)
		else if(v.match(/eMMC/i) && arr.length==1){
			v=1;
		}
		// else we bet on the higher array.member value. (We only keep the number, ignoring letters)
		else{
			v=v.replace(/[^\d]+/g,'');
			v=Number(v);
		}
		// target is the highest found value
		if(v > target){
			target=v;
		}
	});
	return target;
}

// create the 'flash>=' filter operator ----------------------------------------------
Tabulator.extendModule("filter", "filters", {
	"flash>=":function(filtValue, rowValue, rowData, filterParams){
		//console.log('-----');
		//console.log('filtValue='+filtValue+'	| rowValue='+rowValue);
		return _getFlashArrayBestValue(rowValue) >= filtValue ? true : false;
	}
});

// custom sorter for the 'flashmb' column----------------------------------------------
function SorterFlash(a, b, aRow, bRow, column, dir, sorterParams){
	var aa=_getFlashArrayBestValue(a);
	var bb=_getFlashArrayBestValue(b);
	//console.log(a);
	//console.log(aa);
	return aa - bb;
}

// Defines the custom HeaderFilter for the "flashmb" column ----------------------------
function HeaderFilterFlash(cell, onRendered, success, cancel, editorParams){
	var container = document.createElement("span");

	//create and style inputs
	var minimum = document.createElement("input");
	minimum.setAttribute("type", "text");
	minimum.style.padding	= "4px";
	minimum.style.width		= "50%";
	minimum.style.boxSizing = "border-box";
	var search=minimum.cloneNode();
	
	minimum.setAttribute("placeholder", "Minimum");
	search.setAttribute("placeholder", "Search");

	minimum.value = cell.getValue();
	search.value = cell.getValue();

	function buildValues(){
		success({
			minimum:	minimum.value,
			search:		search.value,
		});
		if(minimum.value=='' && search.value==''){
			console.log('gotcha')
			// this fixes the Tabulator Bug, who never fires the 'dataFiltered' event when emptying the field
			tabuTable.setHeaderFilterValue('flashmb',null);
		}	
	}

	// events ---
	minimum.addEventListener("change",	buildValues);
	minimum.addEventListener("blur", 	buildValues);
	minimum.addEventListener("keyup",	buildValues); // for empty
	//minimum.addEventListener("input",	buildValues); // for empty
	search.addEventListener("change",	buildValues);
	search.addEventListener("blur",		buildValues);
	search.addEventListener("keyup",	buildValues); // for empty

	container.appendChild(minimum);
	container.appendChild(search);
	
	return container;
 }

// Handle custom HeaderFilter's logic for the 'flashmb' colum ---------------------------------------------
function HeaderFilterFuncFlash(headerValue, rowValue, rowData, filterParams){
	var b_minimum=true;
	var b_search=true;
	//console.log('val='+rowValue);
	var m;
	if(headerValue =='' || headerValue==null || headerValue == undefined){
		return true;
	}
	
	if(headerValue.minimum != ""){
		b_minimum =  _getFlashArrayBestValue(rowValue) >= headerValue.minimum;
	}
	if(headerValue.search != ""){
		//console.log('---row='+rowValue);
		b_search=false;
		if(Array.isArray(rowValue)){
			var reg		= new RegExp(headerValue.search,'i');
			for (const v of rowValue) {
				if(v !=null){
					//console.log('v='+v);
					m=reg.test(v);
					console.log(m);
					if(m){
						b_search=true;
						break;	
					}
				}
			};
		}
	}
	return b_minimum && b_search; //must return a boolean, true if it passes the filter.
}

// get a clean number from a string column----------------------------------------------
function _getCleanNumber(rowValue,type=''){
	if(rowValue ==null){
		return '';
	}
	rowValue=rowValue.trim();
	if(rowValue==''){
		return '';
	}

	// if we have a sring like "64, 128, 256",  we keep the max
	if(rowValue.match(/,/i)){
		rowValue= rowValue.replace(/ /g,'');
		const numbers = rowValue.split(',').map(Number);
  		rowValue= Math.max(...numbers);
	}

	// specific to Ram column
	if(type=='ram'){
		if(String(rowValue).match(/[^\d]+/g)){
			//remove letter at start
			rowValue=rowValue.replace(/.*?(\d+)/g,'$1');
			// do we have GB ?
			if(rowValue.match(/[\d]+\s*GB/i)){
				rowValue=rowValue.replace(/[^\d]+/g,'');
				rowValue=Number(rowValue) * 1024 +1; //we add 1 to be sorted , ie for 4GB, just after 4096
			}
		}
	}

	// if we have letters, dont cast to number
	if(String(rowValue).match(/[^\d]+/g)){
		return rowValue;
	}
	else{
		return Number(rowValue);
	}
}

// custom sorter for the 'RamMb' column----------------------------------------------
function SorterRam(a, b, aRow, bRow, column, dir, sorterParams){
	var aa=_getCleanNumber(a,'ram');
	var bb=_getCleanNumber(b,'ram');
	//console.log(a);
	//console.log(aa);
	return Number(aa) - Number(bb);
}

// Handle custom HeaderFilter's logic for the 'RamMb' colum ---------------------------------------------
function HeaderFilterFuncRamMb(headerValue, rowValue, rowData, filterParams){
	//console.log(typeof(rowValue) + rowValue);
	if(headerValue =='' || headerValue==null || headerValue == undefined){
		return true;
	}
	var val=_getCleanNumber(rowValue,'ram');
	if(val ==''){
		return true;
	}

	// if we have something else than number, consider true;
	if(String(val).match(/[^\d]+/g)){
		return true;
	}

	return Number(val) >= Number(headerValue);
}




// ##########################################################################################################################################################
// Columns Styles ###########################################################################################################################################
// ##########################################################################################################################################################
let colFilterMin={headerFilterPlaceholder:"Minimum", headerFilterFunc:">="};

let columnStyles = {
//	|toh field,							|Col Name				|Full Name										|width		|Horinzontal Align	|sorter type		|stay left		|formatter						|formatterParams				|misc options
	brand:								{title: "Brand",		headerTooltip: 'Brand',							width: 100,	hozAlign: 'left',	sorter: undefined,	frozen: true,	formatter: undefined,			formatterParams: undefined,		clickPopup: cellModelPopupFormatter},
	model:								{title: "Model",		headerTooltip: 'Model',							width: 100,	hozAlign: 'left',	sorter: undefined,	frozen: true,	formatter: undefined,			formatterParams: undefined,		clickPopup: cellModelPopupFormatter},

	audioports:							{title: "Audio",		headerTooltip: 'Audio Ports',					width: 80,	hozAlign: 'left',	sorter: 'string',	frozen: false,	formatter: undefined,			formatterParams: undefined},
	availability:						{title: "Availability",	headerTooltip: 'Availability',					width: 110,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	bluetooth:							{title: "BT",			headerTooltip: 'Bluetooth version',				width: 40,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	bootloader:							{title: "Boot",			headerTooltip: 'BootLoader',					width: 60,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	buttoncount:						{title: "Butt.",		headerTooltip: 'Button count',					width: 40,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined,		...colFilterMin},
	cpu:								{title: "CPU",			headerTooltip: 'CPU',							width: 120,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: FormatterCleanWords,	formatterParams: undefined},
	comments:							{title: "Comments",		headerTooltip: 'Comments',						width: 200,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	commentsavports:					{title: "AV Comments",	headerTooltip: 'AV ports Comments',				width: 60,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	commentinstallation:				{title: "Inst.Comments",headerTooltip: 'Installation Comments',			width: 60,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	commentsnetworkports:				{title: "Net Comments",	headerTooltip: 'Network ports Comments',		width: 60,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	commentrecovery:					{title: "Rec.Comments",	headerTooltip: 'Recovery Comments',				width: 60,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	commentsusbsataports:				{title: "US Comments",	headerTooltip: 'USB SATA ports Comments',		width: 60,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	cpucores:							{title: "Cores",		headerTooltip: 'CPU number of Cores',			width: 40,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined,		...colFilterMin},
	cpumhz:								{title: "Mhz",			headerTooltip: 'CPU Speed (MHz)',				width: 40,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined,		...colFilterMin},
	detachableantennas:					{title: "D.Ant.",		headerTooltip: 'Detachable Antennas',			width: 40,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	deviceid:							{title: "Device ID",	headerTooltip: 'Device ID',						width: 120,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	devicepage:							{title: "Page",			headerTooltip: 'Device Page',					width: 50,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: FormatterLinkDevice,	formatterParams: undefined,		tooltip: false},
	devicetype:							{title: "Device Type",	headerTooltip: 'Device Type',					width: 120,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	ethernet100mports:					{title: "Eth 100",		headerTooltip: 'Ethernet 100M ports',			width: 55,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: FormatterCleanEmpty,	formatterParams: undefined,		...colFilterMin},
	ethernet1gports:					{title: "Eth 1G",		headerTooltip: 'Ethernet 1G ports',				width: 50,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: FormatterCleanEmpty,	formatterParams: undefined,		...colFilterMin},
	ethernet2_5gports:					{title: "Eth 2.5G",		headerTooltip: 'Ethernet 2.5G ports',			width: 60,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: FormatterCleanEmpty,	formatterParams: undefined,		...colFilterMin},
	ethernet5gports:					{title: "Eth 5G",		headerTooltip: 'Ethernet 5G ports',				width: 50,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: FormatterCleanEmpty,	formatterParams: undefined,		...colFilterMin},
	ethernet10gports:					{title: "Eth 10G",		headerTooltip: 'Ethernet 10G ports',			width: 55,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: FormatterCleanEmpty,	formatterParams: undefined,		...colFilterMin},
	fccid:								{title: "FCC",			headerTooltip: 'FCC ID',						width: 40,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: FormatterLink,		formatterParams: {label: 'FCC'}},
	firmwareoemstockurl:				{title: "Stock",		headerTooltip: 'OEM Stock Firmware',			width: 50,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: FormatterLink,		formatterParams: {label: 'Stock'}},
	firmwareopenwrtinstallurl:			{title: "Install",		headerTooltip: 'Owrt Firmware Install',			width: 50,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: FormatterLink,		formatterParams: {label: 'Inst.'}},
	firmwareopenwrtupgradeurl:			{title: "Upgrade",		headerTooltip: 'Owrt Firmware Upgrade',			width: 55,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: FormatterLink,		formatterParams: {label: 'Upgr.'}},
	firmwareopenwrtsnapshotinstallurl:	{title: "Snap.Inst.",	headerTooltip: 'Owrt Snapshot Install',			width: 70,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: FormatterLink,		formatterParams: {label: 'Sn.Inst.'}},
	firmwareopenwrtsnapshotupgradeurl:	{title: "Snap.Upgr.",	headerTooltip: 'Owrt Snapshot Upgrade',			width: 70,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: FormatterLink,		formatterParams: {label: 'Sn.Upgr.'}},
	flashmb:							{title: "Flash",		headerTooltip: 'Flash Memory (Mb)',				width: 90,	hozAlign: 'right',	sorter: SorterFlash,frozen: false,	formatter: FormatterArray,		formatterParams: undefined, headerFilter:HeaderFilterFlash, headerFilterFunc:HeaderFilterFuncFlash, headerFilterLiveFilter:false },	// , cellClick:cellDebug  , headerFilterEmptyCheck:HeaderFilterEmpty
	forumsearch:						{title: "Forum Search",	headerTooltip: 'Forum Search',					width: 90,	hozAlign: 'left',	sorter: 'string',	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	gitsearch:							{title: "Git Search",	headerTooltip: 'Git Search',					width: 90,	hozAlign: 'left',	sorter: 'string',	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	gpios:								{title: "GPIOs",		headerTooltip: 'GPIOs',							width: 40,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: FormatterCleanWords,	formatterParams: undefined,		...colFilterMin},
	installationmethods:				{title: "Inst.Method",	headerTooltip: 'Installation method(s)',		width: 90,	hozAlign: 'left',	sorter: 'string',	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	jtag:								{title: "JTAG",			headerTooltip: 'has JTAG?',						width: 40,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: FormatterYesNo,		formatterParams: undefined},	
	ledcount:							{title: "Leds",			headerTooltip: 'LED count',						width: 40,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: FormatterCleanEmpty,	formatterParams: undefined,		...colFilterMin},
	modem:								{title: "Modem",		headerTooltip: 'Modem Type',					width: 55,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	oemdevicehomepageurl:				{title: "OEM",			headerTooltip: 'OEM Page',						width: 45,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: FormatterLink,		formatterParams: {label: 'OEM'}},
	outdoor:							{title: "OutDoor",		headerTooltip: 'OutDoor',						width: 40,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: FormatterYesNo,		formatterParams: undefined},
	owrt_forum_topic_url:				{title: "Forum",		headerTooltip: 'Forum Topic',					width: 55,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: FormatterLink,		formatterParams: {label: 'Forum'}},
	packagearchitecture:				{title: "Pkg Arch",		headerTooltip: 'Package Architecture',			width: 90,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	phoneports:							{title: "Phone",		headerTooltip: 'Phone Ports',					width: 40,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: undefined,			formatterParams: undefined},
	powersupply:						{title: "Power",		headerTooltip: 'Power Supply',					width: 70,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	picture:							{title: "Image",		headerTooltip: 'Device Picture',				width: 70,	hozAlign: "center",	sorter: 'array',	frozen: false,	formatter: FormatterImages,		formatterParams: undefined,		tooltip: false},
	rammb:								{title: "RAM",			headerTooltip: 'RAM (Mb)',						width: 40,	hozAlign: 'right',	sorter: SorterRam,	frozen: false,	formatter: undefined,			formatterParams: undefined,		...colFilterMin,headerFilterFunc:HeaderFilterFuncRamMb},
	recoverymethods:					{title: "Recovery",		headerTooltip: 'Recovery Methods',				width: 80,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	sataports:							{title: "SATA",			headerTooltip: 'SATA Ports',					width: 40,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined,		...colFilterMin},
	serial:								{title: "Serial",		headerTooltip: 'Serial port',					width: 45,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: FormatterYesNo,		formatterParams: undefined},	
	serialconnectionparameters:			{title: "Serial Params.",headerTooltip: 'Serial connection parameters',	width: 90,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	serialconnectionvoltage:			{title: "S.Volt.",		headerTooltip: 'Serial connection voltage',		width: 45,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	sfp_ports:							{title: "SFP",			headerTooltip: 'SFP Ports',						width: 40,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: undefined,			formatterParams: undefined,		...colFilterMin},
	sfp_plus_ports:						{title: "SFP+",			headerTooltip: 'SFP+ Ports',					width: 40,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined,		...colFilterMin},
	subtarget:							{title: "S.Target",		headerTooltip: 'Sub Target',					width: 60,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	supportedcurrentrel:				{title: "C.Release",	headerTooltip: 'Supported Current Release',		width: 60,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	supportedsincecommit:				{title: "S.Commit",		headerTooltip: 'Supported Since Commit',		width: 70,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: FormatterLinkCommit,	formatterParams: undefined,		tooltip: false},
	supportedsincerel:					{title: "S.Release",	headerTooltip: 'Supported Since Release',		width: 60,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	switch:								{title: "Switch",		headerTooltip: 'Switch',						width: 120,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	target:								{title: "Target",		headerTooltip: 'Target',						width: 60,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	unsupported_functions:				{title: "Unsupported",	headerTooltip: 'Unsupported Functions',			width: 85,	hozAlign: 'left',	sorter: 'array',	frozen: false,	formatter: undefined,			formatterParams: undefined},	
	usbports:							{title: "USB",			headerTooltip: 'USB Ports',						width: 60,	hozAlign: 'left',	sorter: 'string',	frozen: false,	formatter: undefined,			formatterParams: undefined,		...colFilterMin},
	version:							{title: "Version",		headerTooltip: 'Hardware Version',				width: 55,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	videoports:							{title: "Video",		headerTooltip: 'Video Ports',					width: 80,	hozAlign: 'left',	sorter: 'string',	frozen: false,	formatter: undefined,			formatterParams: undefined},
	vlan:								{title: "VLAN",			headerTooltip: 'has VLAN?',						width: 40,	hozAlign: 'right',	sorter: undefined,	frozen: false,	formatter: FormatterYesNo,		formatterParams: undefined},
	whereavailable:						{title: "Where to Buy",	headerTooltip: 'Where to Buy',					width: 120,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	wlandriver:							{title: "WLAN Driver",	headerTooltip: 'WLAN Driver',					width: 80,	hozAlign: 'left',	sorter: 'string',	frozen: false,	formatter: undefined,			formatterParams: undefined},
	wlan24ghz:							{title: "2.4Ghz",		headerTooltip: 'WLAN 2.4 Ghz',					width: 60,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	wlan50ghz:							{title: "5.0Ghz",		headerTooltip: 'WLAN 5.0 Ghz',					width: 60,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	wlan60ghz:							{title: "6.0Ghz",		headerTooltip: 'WLAN 60 Ghz',					width: 60,	hozAlign: 'left',	sorter: 'string',	frozen: false,	formatter: undefined,			formatterParams: undefined},
	wlan600ghz:							{title: "600Ghz",		headerTooltip: 'WLAN 600 Ghz',					width: 60,	hozAlign: 'left',	sorter: 'string',	frozen: false,	formatter: undefined,			formatterParams: undefined},
	wlanhardware:						{title: "WLAN Hardware",headerTooltip: 'WLAN Hardware',					width: 120,	hozAlign: 'left',	sorter: 'array',	frozen: false,	formatter: FormatterArray,		formatterParams: undefined},
	wlancomments:						{title: "WLAN Comments",headerTooltip: 'WLAN Comments',					width: 100,	hozAlign: 'left',	sorter: undefined,	frozen: false,	formatter: undefined,			formatterParams: undefined},
	wikideviurl:						{title: "Wiki",			headerTooltip: 'Wiki Page',						width: 40,	hozAlign: 'right',	sorter: 'string',	frozen: false,	formatter: FormatterLink,		formatterParams: {label: 'Wiki'}}
};


// Columns Groups ###############################################################################################################

let colViewGroups={
	base:{
		name: 'Main',
		fields:[
			'brand',
			'model',
		]
	},
	
	hardware_main:{
		name: 'Hardware',
		fields:[
			'version',
			'cpu',
			'cpucores',
			'cpumhz',
			'flashmb',
			'rammb',
			'switch',
			'wlanhardware',
		]
	},

	hardware_ports:{
		name: 'Hardware Ports',
		fields:[
			'bluetooth',
			'buttoncount',
			'detachableantennas',
			'gpios',
			'jtag',
			'ledcount',
			'modem',
			'outdoor',
			'phoneports',
			'powersupply',
			'sataports',
			'usbports',
			'commentsusbsataports',
			'serial',
			'serialconnectionvoltage',
			'audioports',
			'videoports',
			'commentsavports',
		]
	},

	network:{
		name: 'Network',
		fields:[
			'ethernet100mports',
			'ethernet1gports',
			'ethernet2_5gports',
			'ethernet5gports',
			'ethernet10gports',
			'sfp_ports',
			'sfp_plus_ports',
			'vlan',
			'commentsnetworkports',
		]
	},

	wifi:{
		name: 'Wifi',
		fields:[
			'wlan24ghz',
			'wlan50ghz',
			'wlan60ghz',
			'wlan600ghz',
			'wlancomments',
		]
	},

	openwrt:{
		name: 'OpenWRT',
		fields:[
			'deviceid',
			'target',
			'subtarget',
			'gitsearch',
			'supportedcurrentrel',
			'supportedsincerel',
			'supportedsincecommit',
			'installationmethods',
			'commentinstallation',
			'unsupported_functions',
		]
	},

	software:{
		name: 'Software',
		fields:[
			'bootloader',
			'packagearchitecture',
			'wlandriver',
			'recoverymethods',
			'commentrecovery',
			'serialconnectionparameters',
		]
	},

	links:{
		name: 'Links',
		fields:[
			'devicepage',
			'firmwareopenwrtinstallurl',
			'firmwareopenwrtupgradeurl',
			'firmwareopenwrtsnapshotinstallurl',
			'firmwareopenwrtsnapshotupgradeurl',
			'firmwareoemstockurl',
			'oemdevicehomepageurl',
			'wikideviurl',
			'owrt_forum_topic_url',
			'forumsearch',
			'fccid',
		]
	},

	misc:{
		name: 'Misc',
		fields:[
			'devicetype',			
			'availability',
			'picture',			
			'whereavailable',			
			'comments',			
		]
	},

};

// Columns View Presets ###############################################################################################################

let colViews={
	normal:	[
		...colViewGroups.base.fields,
		...colViewGroups.hardware_main.fields,
		...colViewGroups.network.fields,
		...colViewGroups.wifi.fields,
		...colViewGroups.links.fields,
		'picture',
	],
	mini:	[
		...colViewGroups.base.fields,
		'cpu',
		'cpucores',
		'cpumhz',
		'rammb',
		'flashmb',
		'usbports',
		'wlan24ghz',
		'wlan50ghz',
		'ethernet1gports',
		'ethernet100mports',
		'devicepage',
		'wikideviurl',
		'owrt_forum_topic_url',
		'availability',
		'picture'
		],
	hardware:	[
		...colViewGroups.base.fields,
		...colViewGroups.hardware_main.fields,
		...colViewGroups.hardware_ports.fields,
	],
	network:	[
		...colViewGroups.base.fields,
		...colViewGroups.network.fields,
		...colViewGroups.wifi.fields,
	],
	software:	[
		...colViewGroups.base.fields,
		...colViewGroups.openwrt.fields,
		...colViewGroups.software.fields,
	],
	links:	[
		...colViewGroups.base.fields,
		...colViewGroups.links.fields,
	],
	misc:	[
		...colViewGroups.base.fields,
		...colViewGroups.misc.fields,
	],
};

// Columns Filter Presets ###############################################################################################################

// implements from: https://openwrt.org/toh/views/start
let colFilterFeatures={

	// normal features -------------------------------
	antennas:{
		title:		"Antennas",
		description:"with detachable antennas",
		type:		"normal",
		filters:[
			{field:	"detachableantennas", 	type:">",	value:''},
			{field:	"detachableantennas", 	type:"!=",	value:'-'},
		],
	},

	available:{
		title:		"Available",
		description:"Available or Unknown",
		type:		"normal",
		filters:[
			[
				{field:	"availability", 	type:"keywords",	value:'available unknown'},
				{field:	"availability", 	type:"=",			value:null},
			],
		],
	},

	eth_1g:{
		title:		"Ethernet 1G",
		description:"at least 1G Ethernet",
		type:		"normal",
		filters:[
			[
				{field:	"ethernet1gports", 		type:">=",	value:1},
				{field:	"ethernet2_5gports",	type:">=",	value:1},
				{field:	"ethernet5gports",		type:">=",	value:1},
				{field:	"ethernet10gports",		type:">=",	value:1},
			],
		],
	},

	eth_2d5g:{
		title:		"Ethernet 2.5G",
		description:"at least 2.5G Ethernet",
		type:		"normal",
		filters:[
			[
				{field:	"ethernet2_5gports",	type:">=",	value:1},
				{field:	"ethernet5gports",		type:">=",	value:1},
				{field:	"ethernet10gports",		type:">=",	value:1},
			],
		],
	},

	eth_10g:{
		title:		"Ethernet 10G",
		description:"at least 10G Ethernet",
		type:		"normal",
		filters:[
			{field:	"ethernet10gports",		type:">=",	value:1},
		],
	},

	memory_minimum:{
		title:		"Memory: Mini",
		description:"at least 16MB Flash & 64MB RAM",
		type:		"normal",
		filters:[
			{field:	"rammb", 		type:">=",		value:64},
			{field:	"flashmb", 		type:"flash>=",		value:16},
		],
		group: "memory",
	},

	memory_more:{
		title:		"Memory: More",
		description:"at least 64MB Flash & 128MB RAM",
		type:		"normal",
		filters:[
			{field:	"rammb", 		type:">=",		value:128},
			{field:	"flashmb", 		type:"flash>=",		value:64},
		],
		group: "memory",
	},

	modem_dsl:{
		title:		"Modem: DSL",
		description:"with DSL modem",
		type:		"normal",
		filters:[
			{field:	"modem", 	type:"like",	value:'DSL'},
			{field:	"unsupported_functions", 	type:"regex",	value:'^((?!DSL).)*$'},
		],
		group: "modem",
	},

	modem_cellular:{
		title:		"Modem: Cell.",
		description:"with cellular modem",
		type:		"normal",
		filters:[
			[
				{field:	"modem", 	type:"like",	value:'LTE'},
				{field:	"modem", 	type:"like",	value:'Cellular'},
			],
		],
		group: "modem",
	},

	outdoor:{
		title:		"OutDoor",
		description:"outdoor usage",
		type:		"normal",
		filters:[
			{field:	"outdoor", 	type:"=",	value:'Yes'},
		],
	},

	pci:{
		title:		"PCI",
		description:"with PCI slot",
		type:		"normal",
		filters:[
			{field:	"comments", 	type:"like",	value:'pci'},
		],
	},

	port_audio:{
		title:		"Port: Audio",
		description:"with audio port",
		type:		"normal",
		filters:[
			{field:	"audioports", 	type:"!=",	value: null},
			{field:	"audioports", 	type:"!=",	value:'-'},
		],
	},

	port_phone:{
		title:		"Port: Phone",
		description:"with phone port",
		type:		"normal",
		filters:[
			{field:	"phoneports", 	type:"!=",	value: null},
			{field:	"phoneports", 	type:"!=",	value:'-'},
		],
	},

	port_sfp:{
		title:		"Port: SFP",
		description:"with SFP port",
		type:		"normal",
		filters:[
			[
				{field:	"sfp_ports", 		type:">",	value:'0'},
				{field:	"sfp_plus_ports", 	type:">",	value:'0'},
				{field:	"devicetype", 		type:"like",value:'SFP'},
			],
		],
	},

	port_usb:{
		title:		"Port: USB",
		description:"with USB port",
		type:		"normal",
		filters:[
			{field:	"usbports", 	type:">=",	value:'1'},
		],
	},

	port_video:{
		title:		"Port: Video",
		description:"with video port",
		type:		"normal",
		filters:[
			{field:	"videoports", 	type:"!=",	value: null},
			{field:	"videoports", 	type:"!=",	value:'-'},
		],
	},

	power_bat:{
		title:		"Power: Battery",
		description:"battery powered",
		type:		"normal",
		filters:[
			{field:	"powersupply", 	type:"like",	value:'battery'},
		],
	},

	power_mains:{
		title:		"Power: Mains",
		description:"mains powered",
		type:		"normal",
		filters:[
			[
				{field:	"powersupply", 	type:"like",	value:'240'},
				{field:	"powersupply", 	type:"like",	value:'mains'},
			],
		],
	},

	power_poe:{
		title:		"Power: PoE",
		description:"PoE capable",
		type:		"normal",
		filters:[
			{field:	"powersupply", 	type:"like",	value:'poe'},
		],
	},

	power_usb:{
		title:		"Power: USB",
		description:"USB powered",
		type:		"normal",
		filters:[
			{field:	"powersupply", 	type:"like",	value:'usb'},
		],
	},

	type_board:{
		title:		"Type: Board",
		description:"Single board computer",
		type:		"normal",
		filters:[
			{field:	"devicetype", 	type:"like",	value:'Single Board Computer'},
		],
		group: "type",
	},

	type_modem:{
		title:		"Type: Modem",
		description:"with modem",
		type:		"normal",
		filters:[
			{field:	"devicetype", 	type:"like",	value:'Modem'},
		],
		group: "type",
	},

	type_switch:{
		title:		"Type: Switch",
		description:"Switch oriented",
		type:		"normal",
		filters:[
			{field:	"devicetype", 	type:"like",	value:'Switch'},
		],
		group: "type",
	},

	type_travel:{
		title:		"Type: Travel",
		description:"Portable device",
		type:		"normal",
		filters:[
			{field:	"devicetype", 	type:"like",	value:'Travel'},
		],
		group: "type",
	},

	type_wifiap:{
		title:		"Type: Wifi AP",
		description:"Wifi AP",
		type:		"normal",
		filters:[
			{field:	"devicetype", 	type:"like",	value:'Wifi AP'},
		],
		group: "type",
	},

	type_wifirouter:{
		title:		"Type: Wifi Router",
		description:"Wifi Router",
		type:		"normal",
		filters:[
			{field:	"devicetype", 	type:"like",	value:'Wifi Router'},
		],
		group: "type",
	},


	vlan:{
		title:		"VLAN",
		description:"supports VLAN",
		type:		"normal",
		filters:[
			{field:	"vlan", 	type:"=",	value:'Yes'},
		],
	},

	wifi_ac:{
		title:		"Wifi: AC",
		description:"with 802.11ac Wifi",
		type:		"normal",
		filters:[
			{field:	"wlan50ghz", 	type:"like",	value:'ac'},
		],
	},

	wifi_ax:{
		title:		"Wifi: AX",
		description:"with 802.11ax Wifi",
		type:		"normal",
		filters:[
			[
				{field:	"wlan24ghz", 	type:"like",	value:'ax'},
				{field:	"wlan50ghz", 	type:"like",	value:'ax'},
				{field:	"wlan60ghz", 	type:"like",	value:'ax'},
			],
		],
	},

	wifi_n:{
		title:		"Wifi: N",
		description:"with 802.11n Wifi",
		type:		"normal",
		filters:[
			[
				{field:	"wlan24ghz", 	type:"like",	value:'n'},
				{field:	"wlan50ghz", 	type:"like",	value:'n'},
			],
		],
	},

	// admin features --------------------------------

	miss_commit:{
		title:		"Miss Git",
		description:"missing Git commit",
		type:		"admin",
		filters:[
			{field:	"supportedsincecommit", 	type:"=",	value:null},
		],
	},

	miss_devpage:{
		title:		"Miss Dev Page",
		description:"missing device page",
		type:		"admin",
		filters:[
			{field:	"devicepage", 	type:"=",	value:null},
		],
	},

	miss_picture:{
		title:		"Miss Picture",
		description:"missing Picture",
		type:		"admin",
		filters:[
			[
				{field:	"picture", 	type:"=",	value:null},
				{field:	"picture", 	type:"like",	value:'genericrouter1.png'},
			],
		],
	},

	miss_pkg:{
		title:		"Miss Pkg",
		description:"missing Package Ach.",
		type:		"admin",
		filters:[
			{field:	"packagearchitecture", 	type:"=",	value:null},
		],
	},

	miss_wiki:{
		title:		"Miss Wiki",
		description:"missing Wiki page",
		type:		"admin",
		filters:[
			{field:	"wikideviurl", 	type:"=",	value:null},
		],
	},

	miss:{
		title:		"Miss Something",
		description:"miss anything above",
		type:		"admin",
		filters:[
			[
				{field:	"supportedsincecommit", 	type:"=",	value:null},
				{field:	"devicepage", 				type:"=",	value:null},
				{field:	"picture", 					type:"=",	value:null},
				{field:	"picture", 					type:"like",	value:'genericrouter1.png'},
				{field:	"packagearchitecture", 		type:"=",	value:null},
				{field:	"wikideviurl", 				type:"=",	value:null},
			],
		],
	},


};

//---------------------------------------------------------
let colFilterPresets={
	
	minimum_1664_ac_avail: {
		title:"Mini, AC, Avail.",
		description:"At least 16MB Flash and 64MB RAM + AC Wifi + Available",
		orig_url:"",
		filters:[],
		features:[
			'available',
			'memory_minimum',
			'wifi_ac',
		]
	},

	minimum_1664_ac_gbit_avail: {
		title:"Mini, AC, Gbit, Avail.",
		description:"At least 16MB Flash & 64MB RAM + AC Wifi + 1Gb Eth. + Available",
		orig_url:"https://openwrt.org/toh/views/toh_available_864_ac-wifi_gbit-eth",
		filters:[],
		features:[
			'available',
			'memory_minimum',
			'wifi_ac',
			'eth_1g',
		]
	},

	minimum_1664_ac_gbit_avail_ant: {
		title:"Mini, AC, Gbit, Avail., Ant.",
		description:"At least 16MB Flash & 64MB RAM + AC Wifi + 1Gb Eth. + Available + Antennas",
		orig_url:"https://openwrt.org/toh/views/toh_available_864_dual-wifi_gbit_extant",
		filters:[],
		features:[
			'available',
			'memory_minimum',
			'wifi_ac',
			'eth_1g',
			'antennas',
		]
	},

	minimum_1664_ax_gbit_avail: {
		title:"Mini, AX, Gbit, Avail.",
		description:"At least 16MB Flash & 64MB RAM + AX Wifi + 1Gb Eth. + Available",
		orig_url:"",
		filters:[],
		features:[
			'available',
			'memory_minimum',
			'wifi_ax',
			'eth_1g',
		]
	},

	more_864_ac_gbit_avail: {
		title:"More, AC, Gbit, Avail.",
		description:"At least 64MB Flash & 128MB RAM + AC Wifi + 1Gb Eth. + Available",
		orig_url:"",
		filters:[],
		features:[
			'available',
			'memory_more',
			'wifi_ac',
			'eth_1g',
		]
	},

	more_864_ax_gbit_avail: {
		title:"More, AX, Gbit, Avail.",
		description:"At least 64MB Flash & 128MB RAM + AX Wifi + 1Gb Eth. + Available",
		orig_url:"",
		filters:[],
		features:[
			'available',
			'memory_more',
			'wifi_ax',
			'eth_1g',
		]
	},

};
