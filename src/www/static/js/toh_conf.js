
// Config ########################################################################
let owrtUrls={
	www: 			"https://openwrt.org/",
	toh_json:		"https://openwrt.org/toh.json",
	media:			"https://openwrt.org/_media/",
	github_commit:	"https://github.com/openwrt/openwrt/commit/",
}

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
			},

			initialSort:[
				{column:"brand", dir:"asc"}, 	//sort by this first
				{column:"model", dir:"desc"}, //then sort by this second
			],

};

let prefs={
	def_view: 'normal'
};

// Columns Formatters ###############################################################################################################

function FormatterLink(cell, formatterParams, onRendered) {
	var value = cell.getValue();
	if (value && value.length > 0) {
		return "<a href='" + value + "' target='_blank'>" + formatterParams.label + "</a>";
	} 
	return value;
}
function FormatterLinkCommit(cell, formatterParams, onRendered) {
	var value = cell.getValue();
	if (value && value.length > 0) {
		var commit=value.replace(/.*?;h=/g,'');
		var gh_link=owrtUrls.github_commit + commit;
		return "<a href='" + value + "' target='_blank' title='Origin'>Orig.</a> | <a href='" + gh_link + "' target='_blank' title='Github'>GH</a>";
	} 
	return '';
}
function FormatterLinkDevice(cell, formatterParams, onRendered) {
	var value = cell.getValue();
	if (value && value.length > 0) {
		value=value.replace(/:/g,'/');
		return "<a href='" + owrtUrls.www + value + "' target='_blank'>TOH</a>";
	} 
	return value;
}
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
function FormatterCleanEmpty(cell, formatterParams, onRendered) {
	var value = cell.getValue();
	if (value && value.length > 0) {
		value=value.replace(/-/g,'');
		return value;
	} 
	return "";
}
function FormatterCleanWords(cell, formatterParams, onRendered) {
	var value = cell.getValue();
	if (value && value.length > 0) {
		value=value.replace(/more than/g,'&gt;'); // for GPIOs
		value=value.replace(/Qualcomm Atheros/g,'Atheros'); //  for CPU
		return value;
	} 
	return "";
}

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

// Columns Styles ###############################################################################################################

let columnStyles={
	brand: {frozen:true, hozAlign:"left"},
	model: {frozen:true, hozAlign:"left"},

	audioports:							{title:"Audio",				headerTooltip:'Audio Ports',			sorter: 'array', width:80, hozAlign:"left" },
	availability:						{title:"Availability",		headerTooltip:'Availability',			width:110, hozAlign:"right" },
	bluetooth:							{title:"BT",				headerTooltip:'Bluetooth version',		width:40, hozAlign:"left" },
	bootloader:							{title:"Boot",				headerTooltip:'BootLoader',				width:60, hozAlign:"left" },
	buttoncount:						{title:"Butt.",				headerTooltip:'Button count',			width:40 },
	cpu:								{																	formatter: FormatterCleanWords, width:120, hozAlign:"left" },
	comments:							{title:"Comments",			headerTooltip:'Comments',				width:200, hozAlign:"left" },
	commentsavports:					{title:"AV Comments",		headerTooltip:'AV ports Comments',		width:60, hozAlign:"left" },
	commentinstallation:				{title:"Inst.Comments",		headerTooltip:'Installation Comments',	width:60 , hozAlign:"left"},
	commentsnetworkports:				{title:"Net Comments",		headerTooltip:'Network ports Comments',	width:60 , hozAlign:"left"},
	commentrecovery:					{title:"Rec.Comments",		headerTooltip:'Recovery Comments',		 width:60, hozAlign:"left" },
	commentsusbsataports:				{title:"US Comments",		headerTooltip:'USB SATA ports Comments', width:60, hozAlign:"left" },
	cpucores:							{title:"Cores",				headerTooltip:'CPU number of Cores'	,	width:40 },
	cpumhz:								{title:"Mhz",				headerTooltip:'CPU Speed (MHz)'		,	width:40 },
	detachableantennas:					{title:"D.Ant.",			headerTooltip:'Detachable Antennas',	width:40	 },
	deviceid:							{title:"Device ID",			headerTooltip:'Device ID',				width:120, hozAlign:"left" },
	devicepage:							{title:"Page",				headerTooltip:'Device Page',			formatter: FormatterLinkDevice, tooltip:false, width:50 },
	devicetype:							{title:"Device Type",		headerTooltip:'Device Type',			width:120, hozAlign:"left" },
	ethernet100mports: 					{title:"Eth 100", 			headerTooltip:'Ethertnet 100M ports',	width:55, formatter: FormatterCleanEmpty},
	ethernet1gports: 					{title:"Eth 1G", 			headerTooltip:'Ethertnet 1G ports',		width:50, formatter: FormatterCleanEmpty},
	ethernet2_5gports: 					{title:"Eth 2.5G", 			headerTooltip:'Ethertnet 2.5G ports',	width:60, formatter: FormatterCleanEmpty},
	ethernet5gports: 					{title:"Eth 5G", 			headerTooltip:'Ethertnet 5G ports',		width:50, formatter: FormatterCleanEmpty},
	ethernet10gports: 					{title:"Eth 10G", 			headerTooltip:'Ethertnet 10G ports',	width:55, formatter: FormatterCleanEmpty},
	fccid:								{title:"FCC",				headerTooltip:'FCC ID',					formatter: FormatterLink, formatterParams:{ label:'FCC'},		width:40 },
	firmwareoemstockurl:				{title:"Stock",				headerTooltip:'OEM Stock Firmware',		formatter: FormatterLink, formatterParams:{ label:'Stock'},		width:50 },
	firmwareopenwrtinstallurl:			{title:"Install",			headerTooltip:'Owrt Firmware Install',	formatter: FormatterLink, formatterParams:{ label:'Inst.'},		width:50 },
	firmwareopenwrtupgradeurl:			{title:"Upgrade",			headerTooltip:'Owrt Firmware Upgrade',	formatter: FormatterLink, formatterParams:{ label:'Upgr.'}, 	width:55 },
	firmwareopenwrtsnapshotinstallurl:	{title:"Snap.Inst.",		headerTooltip:'Owrt Snapshot Install',	formatter: FormatterLink, formatterParams:{ label:'Sn.Inst.'},	width:70 },
	firmwareopenwrtsnapshotupgradeurl:	{title:"Snap.Upgr.",		headerTooltip:'Owrt Snapshot Upgrade',	formatter: FormatterLink, formatterParams:{ label:'Sn.Upgr.'},	width:70 },
	flashmb:							{title:"Flash",				headerTooltip:'Flash Memory (Mb)', 		formatter: FormatterArray, sorter: 'array', sorterParams: {type:"min", alignEmptyValues:"bottom"}, width:90, hozAlign:"left" },
	forumsearch:						{title:"Forum Search",		headerTooltip:'Forum Search', 			width:90, hozAlign:"left" },
	gitsearch:							{title:"Git Search",		headerTooltip:'Git Search',				width:90, hozAlign:"left" },
	gpios:								{title:"GPIOs",				headerTooltip:'GPIOs',					formatter: FormatterCleanWords, width:40 },
	installationmethods:				{title:"Inst.Method",		headerTooltip:'Installation method(s)', width:90, hozAlign:"left" },
	jtag:								{title:"JTAG",				headerTooltip:'has JTAG?',				formatter: FormatterYesNo, width:40 },
	ledcount:							{title:"Leds",				headerTooltip:'LED count',				formatter: FormatterCleanEmpty, width:40 },
	modem:								{title:"Modem",				headerTooltip:'Modem Type',				width:40 },
	oemdevicehomepageurl:				{title:"OEM",				headerTooltip:'OEM Page',				formatter: FormatterLink, formatterParams:{ label:'OEM'}, 	width:45 },
	outdoor:							{title:"OutDoor",													formatter: FormatterYesNo, sorter: 'string', 				width:40 },
	owrt_forum_topic_url:				{title:"Forum",				headerTooltip:'Forum Topic',			formatter: FormatterLink, formatterParams:{ label:'Forum'}, width:55 },
	packagearchitecture:				{title:"Pkg Arch",			headerTooltip:'Package Architecture',	width:90, hozAlign:"left" },
	phoneports:							{title:"Phone",				headerTooltip:'Phone Ports',			width:40 },
	powersupply:						{title:"Power",				headerTooltip:'Power Supply',			width:70, hozAlign:"left" },
	picture:							{title:"Image",				headerTooltip:'Device Picture',			formatter: FormatterImages, sorter: 'array', width:70, hozAlign:"center" },
	rammb:								{title:"RAM",				headerTooltip:'RAM (Mb)', 				width:40 },
	recoverymethods:					{title:"Recovery",			headerTooltip:'Recovery Methods', 		width:80, hozAlign:"left" },
	sataports:							{title:"SATA",				headerTooltip:'SATA Ports', 			width:40},
	serial:								{title:"Serial",			headerTooltip:'Serial port', 			formatter: FormatterYesNo,	width:45},
	serialconnectionparameters:			{title:"Serial Params.",		headerTooltip:'Serial connection parameters', width:90},
	serialconnectionvoltage:			{title:"S.Volt.",			headerTooltip:'Serial connection voltage', width:45},
	sfp_ports:							{title:"SFTP",				headerTooltip:'SFTP Ports', 			width:40},
	sfp_plus_ports:						{title:"SFTP+",				headerTooltip:'SFTP+ Ports', 			width:40},
	subtarget:							{title:"S.Target",			headerTooltip:'Sub Target',				width:60, hozAlign:"left" },
	supportedcurrentrel:				{title:"C.Release",			headerTooltip:'Supported Current Release', width:60 },
	supportedsincecommit:				{title:"S.Commit",			headerTooltip:'Supported Since Commit',	formatter: FormatterLinkCommit, width:70, hozAlign:"left", tooltip:false },
	supportedsincerel:					{title:"S.Release",			headerTooltip:'Supported Since Release', width:60 },
	switch:								{title:"Switch",			headerTooltip:'Switch',					width:120, hozAlign:"left" },
	unsupported_functions:				{title:"Unsupported",		headerTooltip:'Unsupported Functions', 	width:85, hozAlign:"left" },
	usbports:							{title:"USB",				headerTooltip:'USB Ports', 				width:60, hozAlign:"left" },
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

// let columnOrder=[
// 	'brand',
// 	'model',
// 	'cpu',
// 	'rammb',
// 	'flashmb',
// ];
let columnOrder=[];


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



