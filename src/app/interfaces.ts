
export interface EnvProperties {
		production: boolean;
		auth: {
		  domain: string;
		  clientId: string;
		  audience?: string | undefined;
		  redirectUri: string;
		};
		httpInterceptor: {
		  allowedList: string[];
		};
		api: {
		  api: string;
		};
}

export interface Item {
    id:     string;
	name:   string;
	nett:   number;
	nett_unit: string;
	brand:  string;
}

export interface ItemNew {
	name:   string;
	nett:   number;
	nett_unit: string;
	brand:  string;
}


export interface Shop {
	id:      string;
	name:    string;
	branch:  string;
	city:    string;
	country: string;
}

export interface ShopNew {
	name:    string;
	branch:  string;
	city:    string;
	country: string;
}

//Mix of edge and vertice (Item) info
export interface SlistItem {
	label:	string;
	nett:	number;
	nett_unit:	string;
	price:	number;
	currency:	string;
	qty:	number;
	trolley: boolean;
	special: boolean;
	tag:	 string;
	edge_id:	string;
	item_id:	string;
	shop_id:	string
}

export interface SList {
	shop:  string;
	items: SlistItem[];
}


export interface TplDtl {
	shop:  string;
	items: TplItem[];
}

//Mix of edge and vertice (Item) info, similar to SlistItem but stripped down for Templates
export interface TplItem {
	label:	string;
	nett:	number;
	nett_unit:	string;
	qty:	number;
	tag:	 string;
	edge_id:	string;
	item_id:	string;
	shop_id:	string
}

export interface TplEdge {
	"_to":	string;
	"_from":	string;
	qty:	number;
}


//TODO:Same interface applies to Templates
export interface ShopListsAll {
	id: string;
	name: string;
	date: Date;
	hidden: boolean;
	label: string | Date;
}

export interface SlistEdgeItem {
	date:	number;
	price:	number;
	currency:	string;
	special:	boolean;
	trolley:	boolean
	qty:	number;
	tag:	string;
}
export interface SlistEdge extends SlistEdgeItem {
	"_to":	string;
	"_from":	string;
}

export interface TrendItem {
	shop:	string;
	branch:	string;
	city:	string;
	country: string;
	currency: string;
	price: 	number;
	date:	number;
	special: boolean;
	list_id: string;
}

export interface AdmUser {
	email:	string;
	role:	string;
}

export interface Cats {
	id:		string;
	url:	string;
	width:	number;
	height:	number;
}