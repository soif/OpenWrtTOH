
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
	def_view: 'normal'
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
		hozAlign: "right",
		tooltip:true,         //show tool tips on cells
		headerSortTristate:true,
	},

	initialSort:[
		{column:"brand", dir:"asc"}, 	//sort by this first
		{column:"model", dir:"desc"}, //then sort by this second
	],
};


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
			out +='<a href="' + url + '" target="_blank" class="cell-image" title="'+url+'">'+label+'</a> ';
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

// Columns Styles ################################################################################################################
let colFilterMin={headerFilterPlaceholder:"Minimum", headerFilterFunc:">="};

let columnStyles={
	brand: 								{title:"Brand",	frozen:true,		clickPopup: cellModelPopupFormatter, hozAlign:"left"},
	model: 								{title:"Model",	frozen:true,		clickPopup: cellModelPopupFormatter, hozAlign:"left"},

	audioports:							{title:"Audio",				headerTooltip:'Audio Ports',			sorter: 'array', width:80, hozAlign:"left" },
	availability:						{title:"Availability",		headerTooltip:'Availability',			width:110, hozAlign:"right" },
	bluetooth:							{title:"BT",				headerTooltip:'Bluetooth version',		width:40, hozAlign:"left" },
	bootloader:							{title:"Boot",				headerTooltip:'BootLoader',				width:60, hozAlign:"left" },
	buttoncount:						{title:"Butt.",				headerTooltip:'Button count',			width:40, ...colFilterMin },
	cpu:								{title:"CPU",														formatter: FormatterCleanWords, width:120, hozAlign:"left" },
	comments:							{title:"Comments",			headerTooltip:'Comments',				width:200, hozAlign:"left" },
	commentsavports:					{title:"AV Comments",		headerTooltip:'AV ports Comments',		width:60, hozAlign:"left" },
	commentinstallation:				{title:"Inst.Comments",		headerTooltip:'Installation Comments',	width:60 , hozAlign:"left"},
	commentsnetworkports:				{title:"Net Comments",		headerTooltip:'Network ports Comments',	width:60 , hozAlign:"left"},
	commentrecovery:					{title:"Rec.Comments",		headerTooltip:'Recovery Comments',		 width:60, hozAlign:"left" },
	commentsusbsataports:				{title:"US Comments",		headerTooltip:'USB SATA ports Comments', width:60, hozAlign:"left" },
	cpucores:							{title:"Cores",				headerTooltip:'CPU number of Cores'	,	width:40, ...colFilterMin },
	cpumhz:								{title:"Mhz",				headerTooltip:'CPU Speed (MHz)'		,	width:40, ...colFilterMin },
	detachableantennas:					{title:"D.Ant.",			headerTooltip:'Detachable Antennas',	width:40	 },
	deviceid:							{title:"Device ID",			headerTooltip:'Device ID',				width:120, hozAlign:"left" },
	devicepage:							{title:"Page",				headerTooltip:'Device Page',			formatter: FormatterLinkDevice, tooltip:false, width:50 },
	devicetype:							{title:"Device Type",		headerTooltip:'Device Type',			width:120, hozAlign:"left" },
	ethernet100mports: 					{title:"Eth 100", 			headerTooltip:'Ethernet 100M ports',	width:55, formatter: FormatterCleanEmpty, ...colFilterMin },
	ethernet1gports: 					{title:"Eth 1G", 			headerTooltip:'Ethernet 1G ports',		width:50, formatter: FormatterCleanEmpty, ...colFilterMin },
	ethernet2_5gports: 					{title:"Eth 2.5G", 			headerTooltip:'Ethernet 2.5G ports',	width:60, formatter: FormatterCleanEmpty, ...colFilterMin },
	ethernet5gports: 					{title:"Eth 5G", 			headerTooltip:'Ethernet 5G ports',		width:50, formatter: FormatterCleanEmpty, ...colFilterMin },
	ethernet10gports: 					{title:"Eth 10G", 			headerTooltip:'Ethernet 10G ports',		width:55, formatter: FormatterCleanEmpty, ...colFilterMin},
	fccid:								{title:"FCC",				headerTooltip:'FCC ID',					formatter: FormatterLink, formatterParams:{ label:'FCC'},		width:40 },
	firmwareoemstockurl:				{title:"Stock",				headerTooltip:'OEM Stock Firmware',		formatter: FormatterLink, formatterParams:{ label:'Stock'},		width:50 },
	firmwareopenwrtinstallurl:			{title:"Install",			headerTooltip:'Owrt Firmware Install',	formatter: FormatterLink, formatterParams:{ label:'Inst.'},		width:50 },
	firmwareopenwrtupgradeurl:			{title:"Upgrade",			headerTooltip:'Owrt Firmware Upgrade',	formatter: FormatterLink, formatterParams:{ label:'Upgr.'}, 	width:55 },
	firmwareopenwrtsnapshotinstallurl:	{title:"Snap.Inst.",		headerTooltip:'Owrt Snapshot Install',	formatter: FormatterLink, formatterParams:{ label:'Sn.Inst.'},	width:70 },
	firmwareopenwrtsnapshotupgradeurl:	{title:"Snap.Upgr.",		headerTooltip:'Owrt Snapshot Upgrade',	formatter: FormatterLink, formatterParams:{ label:'Sn.Upgr.'},	width:70 },
	flashmb:							{title:"Flash",				headerTooltip:'Flash Memory (Mb)', 		formatter: FormatterArray, sorter: 'array', sorterParams: {type:"min", alignEmptyValues:"bottom"}, width:90, hozAlign:"left", ...colFilterMin },
	forumsearch:						{title:"Forum Search",		headerTooltip:'Forum Search', 			width:90, hozAlign:"left" },
	gitsearch:							{title:"Git Search",		headerTooltip:'Git Search',				width:90, hozAlign:"left" },
	gpios:								{title:"GPIOs",				headerTooltip:'GPIOs',					formatter: FormatterCleanWords, width:40, ...colFilterMin },
	installationmethods:				{title:"Inst.Method",		headerTooltip:'Installation method(s)', width:90, hozAlign:"left" },
	jtag:								{title:"JTAG",				headerTooltip:'has JTAG?',				formatter: FormatterYesNo, width:40 },
	ledcount:							{title:"Leds",				headerTooltip:'LED count',				formatter: FormatterCleanEmpty, width:40, ...colFilterMin },
	modem:								{title:"Modem",				headerTooltip:'Modem Type',				width:40 },
	oemdevicehomepageurl:				{title:"OEM",				headerTooltip:'OEM Page',				formatter: FormatterLink, formatterParams:{ label:'OEM'}, 	width:45 },
	outdoor:							{title:"OutDoor",													formatter: FormatterYesNo, sorter: 'string', 				width:40 },
	owrt_forum_topic_url:				{title:"Forum",				headerTooltip:'Forum Topic',			formatter: FormatterLink, formatterParams:{ label:'Forum'}, width:55 },
	packagearchitecture:				{title:"Pkg Arch",			headerTooltip:'Package Architecture',	width:90, hozAlign:"left" },
	phoneports:							{title:"Phone",				headerTooltip:'Phone Ports',			width:40 },
	powersupply:						{title:"Power",				headerTooltip:'Power Supply',			width:70, hozAlign:"left" },
	picture:							{title:"Image",				headerTooltip:'Device Picture',			formatter: FormatterImages, sorter: 'array', width:70, hozAlign:"center" },
	rammb:								{title:"RAM",				headerTooltip:'RAM (Mb)',				width:40, ...colFilterMin },
	recoverymethods:					{title:"Recovery",			headerTooltip:'Recovery Methods', 		width:80, hozAlign:"left" },
	sataports:							{title:"SATA",				headerTooltip:'SATA Ports', 			width:40, ...colFilterMin},
	serial:								{title:"Serial",			headerTooltip:'Serial port', 			formatter: FormatterYesNo,	width:45},
	serialconnectionparameters:			{title:"Serial Params.",		headerTooltip:'Serial connection parameters', width:90},
	serialconnectionvoltage:			{title:"S.Volt.",			headerTooltip:'Serial connection voltage', width:45},
	sfp_ports:							{title:"SFTP",				headerTooltip:'SFTP Ports', 			width:40, ...colFilterMin},
	sfp_plus_ports:						{title:"SFTP+",				headerTooltip:'SFTP+ Ports', 			width:40, ...colFilterMin},
	subtarget:							{title:"S.Target",			headerTooltip:'Sub Target',				width:60, hozAlign:"left" },
	supportedcurrentrel:				{title:"C.Release",			headerTooltip:'Supported Current Release', width:60 },
	supportedsincecommit:				{title:"S.Commit",			headerTooltip:'Supported Since Commit',	formatter: FormatterLinkCommit, width:70, hozAlign:"left", tooltip:false },
	supportedsincerel:					{title:"S.Release",			headerTooltip:'Supported Since Release', width:60 },
	switch:								{title:"Switch",			headerTooltip:'Switch',					width:120, hozAlign:"left" },
	target:								{title:"Target",			headerTooltip:'Target',					width:60, hozAlign:"left" },
	unsupported_functions:				{title:"Unsupported",		headerTooltip:'Unsupported Functions', 	width:85, hozAlign:"left" },
	usbports:							{title:"USB",				headerTooltip:'USB Ports', 				width:60, hozAlign:"left", ...colFilterMin },
	version:							{title:"Version",			headerTooltip:'Hardware Version', 		width:55, hozAlign:"left" },
	videoports:							{title:"Video",				headerTooltip:'Video Ports', 			sorter: 'array', width:80, hozAlign:"left" },
	vlan:								{title:"VLAN",				headerTooltip:'has VLAN?', 				formatter: FormatterYesNo, width:40},
	whereavailable:						{title:"Where to Buy",		headerTooltip:'Where to Buy', 			width:120, hozAlign:"left" },
	wlandriver:							{title:"WLAN Driver",		headerTooltip:'WLAN Driver', 			width:80, hozAlign:"left" },
	wlan24ghz:							{title:"2.4Ghz",			headerTooltip:'WLAN 2.4 Ghz', 			width:60, hozAlign:"left" },
	wlan50ghz:							{title:"5.0Ghz",			headerTooltip:'WLAN 5.0 Ghz', 			width:60, hozAlign:"left" },
	wlan60ghz:							{title:"6.0Ghz",			headerTooltip:'WLAN 60 Ghz', 			width:60, hozAlign:"left" },
	wlan600ghz:							{title:"200Ghz",			headerTooltip:'WLAN 600 Ghz', 			width:60, hozAlign:"left" },
	wlanhardware:						{title:"WLAN Hardware",		headerTooltip:'WLAN Hardware', 			formatter: FormatterArray, sorter: 'array', width:120, hozAlign:"left" },
	wlancomments:						{title:"WLAN Comments",		headerTooltip:'WLAN Comments', 			width:100, hozAlign:"left" },
	wikideviurl:						{title:"Wiki",				headerTooltip:'Wiki Page',				formatter: FormatterLink, formatterParams:{ label:'Wiki'}, width:40 },
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
			'rammb',
			'flashmb',
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
	// normal features -------
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
				{field:	"availability", 	type:"like",	value:'available'},
				{field:	"availability", 	type:"like",	value:'unknown'},
			]
		],
	},

	ideal_memory:{
		title:		"Memory Ideal",
		description:"at least 8MB Flash & 64MB RAM",
		type:		"normal",
		filters:[
			{field:	"rammb", 		type:">=",		value:8	},
			{field:	"flashmb", 		type:">=",		value:64},
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
			]
		],
	},

	poe:{
		title:		"PoE",
		description:"with PoE capability",
		type:		"normal",
		filters:[
			{field:	"powersupply", 	type:"like",	value:'poe'},
		],
	},

	sfp:{
		title:		"SFP ports",
		description:"with SFP port",
		type:		"normal",
		filters:[
			[
				{field:	"sfp_ports", 		type:">",	value:'0'},
				{field:	"sfp_plus_ports", 	type:">",	value:'0'},
			],
		],
	},

	wifi_ac:{
		title:		"Wifi AC",
		description:"802.11ac Wifi",
		type:		"normal",
		filters:[
			[
				{field:	"wlan24ghz", 	type:"like",	value:'ac'},
				{field:	"wlan50ghz", 	type:"like",	value:'ac'},
			]
		],
	},

	wifi_n:{
		title:		"Wifi N",
		description:"802.11n Wifi",
		type:		"normal",
		filters:[
			[
				{field:	"wlan24ghz", 	type:"like",	value:'n'},
				{field:	"wlan50ghz", 	type:"like",	value:'n'},
			]
		],
	},

	// admin features -------

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

	miss_pkg:{
		title:		"Miss Pkg",
		description:"missing Package Ach.",
		type:		"admin",
		filters:[
			{field:	"packagearchitecture", 	type:"=",	value:null},
		],
	},
	miss:{
		title:		"Miss Something",
		description:"miss Git | D.Page | Pkg",
		type:		"admin",
		filters:[
			[
				{field:	"supportedsincecommit", 	type:"=",	value:null},
				{field:	"devicepage", 				type:"=",	value:null},
				{field:	"packagearchitecture", 		type:"=",	value:null},
			],
		],
	},


};

//---------------------------------------------------------
let colFilterPresets={
	
	available_864_ac_wifi: {
		title:"Ideal AC, Avail.",
		description:"At least 8MB Flash and 64MB RAM + 802.11ac Wifi + (Available or Unknown)",
		orig_url:"https://openwrt.org/toh/views/toh_available_864_ac-wifi",
		filters:[],
		features:[
			'available',
			'ideal_memory',
			'wifi_ac',
		]
	},

	available_864_ac_wifi_gbit_eth: {
		title:"Ideal AC, Gbit, Avail.",
		description:"At least 8MB Flash and 64MB RAM + 802.11ac Wifi + Eth >=1G + (Available or Unknown)",
		orig_url:"https://openwrt.org/toh/views/toh_available_864_ac-wifi_gbit-eth",
		filters:[],
		features:[
			'available',
			'ideal_memory',
			'wifi_ac',
			'eth_1g',
		]

	},

	available_864_ac_wifi_gbit_eth_ant: {
		title:"Ideal AC, Gbit, Antennas, Avail.",
		description:"At least 8MB Flash and 64MB RAM + 802.11ac Wifi + Eth >=1G + Antennas (Available or Unknown)",
		orig_url:"https://openwrt.org/toh/views/toh_available_864_dual-wifi_gbit_extant",
		filters:[],
		features:[
			'available',
			'ideal_memory',
			'wifi_ac',
			'eth_1g',
			'antennas',
		]

	},

	poe: {
		title:"Poe powered",
		description:"Devices with PoE capability",
		filters:[],
		features:[
			'poe',
		],

	},


};