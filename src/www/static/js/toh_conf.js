
// Config ########################################################################
let owrtUrls={
	www: 			"https://openwrt.org/",
	toh_json:		"https://openwrt.org/",
	media:			"https://openwrt.org/_media/",
	github_commit:	"https://github.com/openwrt/openwrt/commit/",
}

let tabulatorOptions={
			importFormat:"array",
			height: "100%",
			columns:[],
			//renderHorizontal:"virtual",
			pagination: true,
			paginationSize: 30,
			paginationButtonCount: 10,
			//	autoColumns:true, 			//create columns from data field names
			movableColumns:true,      //allow column order to be changed
			columnDefaults:{
				headerFilter:true,
				headerTooltip:true,
				tooltip:true,         //show tool tips on cells
			},
};

let prefs={
	def_view: 'mini'
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
function FormatterFlash(cell, formatterParams, onRendered) {
	var arr = cell.getValue();
	var out='';
	var done=false;
	if (Array.isArray(arr) && arr.length > 0) {
		arr.forEach((value, index) => {
			value=value.replace(/NAND/g,' NAND');
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
	brand: {frozen:true},
	model: {frozen:true},
	devicepage:							{title:"Device Page",		formatter: FormatterLinkDevice, tooltip:false },
	ethernet100mports: 					{title: "Eth 100", 			formatter: FormatterCleanEmpty},
	ethernet1gports: 					{title: "Eth 1G", 			formatter: FormatterCleanEmpty},
	ethernet2_5gports: 					{title: "Eth 2.5G", 		formatter: FormatterCleanEmpty},
	ethernet5gports: 					{title: "Eth 5G", 			formatter: FormatterCleanEmpty},
	ethernet10gports: 					{title: "Eth 10G", 			formatter: FormatterCleanEmpty},
	fccid:								{title:"FCC Id",			formatter: FormatterLink, formatterParams:{ label:'FCC Id'} },
	firmwareoemstockurl:				{title:"Stock Firm.",		formatter: FormatterLink, formatterParams:{ label:'Stock'} },
	firmwareopenwrtinstallurl:			{title:"Owrt Install",		formatter: FormatterLink, formatterParams:{ label:'Install'} },
	firmwareopenwrtupgradeurl:			{title:"Owrt Upgrade",		formatter: FormatterLink, formatterParams:{ label:'Upgrade'} },
	firmwareopenwrtsnapshotinstallurl:	{title:"Owrt Snap.Inst.",	formatter: FormatterLink, formatterParams:{ label:'Snap.Install'} },
	firmwareopenwrtsnapshotupgradeurl:	{title:"Owrt Snap.Upgr.",	formatter: FormatterLink, formatterParams:{ label:'Snap.Upgrade'} },
	flashmb:							{title:"Flash (Mb)",		formatter: FormatterFlash, sorter: 'array', sorterParams: {type:"min", alignEmptyValues:"bottom"} },
	oemdevicehomepageurl:				{title:"OEM Page",			formatter: FormatterLink, formatterParams:{ label:'OEM'} },
	outdoor:							{title:"OutDoor",			formatter: FormatterYesNo, sorter: 'string' },
	owrt_forum_topic_url:				{title:"Forum",				formatter: FormatterLink, formatterParams:{ label:'Forum'} },
	picture:							{title:"Image",				formatter: FormatterImages, sorter: 'array' },
	supportedsincecommit:				{title:"Since Commit",		formatter: FormatterLinkCommit, tooltip:false },
	wikideviurl:						{title:"Wiki",				formatter: FormatterLink, formatterParams:{ label:'Wiki'} },
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
			'cpu',
			'rammb',
			'flashmb',
			'cpucores',
			'cpumhz',
			'switch',
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

	openwrt:{
		name: 'OpenWRT',
		fields:[
			'deviceid',
			'version',
			'target',
			'subtarget',
			'gitsearch',
			'supportedcurrentrel',
			'supportedsincecommit',
			'supportedsincerel',
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
			'forumsearch',
			'oemdevicehomepageurl',
			'owrt_forum_topic_url',
			'wikideviurl',
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

	wifi:{
		name: 'Wifi',
		fields:[
			'wlan24ghz',
			'wlan50ghz',
			'wlan60ghz',
			'wlan600ghz',
			'wlanhardware',
			'wlancomments',
		]
	},
};

let colViews={
	normal:	[
		...colViewGroups.base.fields,
		...colViewGroups.hardware_main.fields,
		...colViewGroups.links.fields
	],
	mini:	['brand','model','cpu','rammb','flashmb','devicepage'],

	hardware:	[
		...colViewGroups.base.fields,
		...colViewGroups.hardware_main.fields,
		...colViewGroups.hardware_ports.fields,
	],
	network:	[
		...colViewGroups.base.fields,
		...colViewGroups.network.fields,
	],
	software:	[
		...colViewGroups.base.fields,
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



