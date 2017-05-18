const keys = require('../keys');
var ebay = require('ebay-api');
const fs = require('fs');
const products = require('./files/items');
var count = 1;

fs.writeFile('files/uplog.js', 'module.exports = [','utf-8');
var csv = require("fast-csv");
var stream = fs.createReadStream('../STDPRICE_FULL.TXT');
csv
    .fromStream(stream, {
        headers: true
    })
    .on("data", function(data) {
	for(var i=0; i < products.length; i++)
		if (data['Vendor Part Number'] == products[i].ItemSpecifics.NameValueList.filter( function(itemSpecifics){
												return itemSpecifics.Name == 'MPN';
											})[0].Value)
			products[i].Ingram = data;
    })
    .on("end", function() {
		products.forEach(function(product){
if(product.Ingram){//
		var params = {
					  Item:{
						ItemID: product.ItemID,
						//Title: 'Changed Now',
						StartPrice: price(parseFloat(product.Ingram["Customer Price with Tax"]), 
										parseFloat(product.Ingram["Weight"]))
						 /*ShippingDetails :{
							 	"ShippingType": "Flat",
								"ShippingServiceOptions": [
								{
								  "ShippingServicePriority": 1,
								  "ShippingService": "AU_Registered",
								  "ShippingServiceCost": 3.50,
								  "ShippingServiceAdditionalCost": 2},
								{
								  "ShippingServicePriority": 2,
								  "ShippingService": "AU_Courier",
								  "ShippingServiceCost": 6,
								  "ShippingServiceAdditionalCost": 4},
								]
							  }*/
						}
					  }
	//if(revisePrice !== parseFloat(product.CurrentPrice.amount))
		ebay.xmlRequest({
				  serviceName : 'Trading',
				  opType : 'ReviseFixedPriceItem',
				  devId: keys.devId,
				  certId: keys.certId,
				  appId: keys.appId,
				  sandbox: false,
				  authToken: keys.token,

				  params: params,
					}, function(error, results) {
					  // ...
						//if(error) console.error(error);
						if(results.Ack !== 'Failure'){
							console.log(count + ' ' + results.ItemID);
							count++;
							fs.appendFile('files/uplog.js', JSON.stringify(results, null, '\t')+',','utf-8');
						}
						else console.log(results);
					});
			}
		});
	});
//---------------------------------------------------------------------------------------------------------------
function price(buy, weight){
	//calculate base cost    
    var total = buy + postage(weight, buy);
	var base = +(Math.round((total
                             + (total * .125) 
                             + 1.20) 
                + "e+2")  + "e-2");
	
    //set price with reasonable profit margin
	if(base * .05 < 5 || base * .05 > 10)
        return reg(base + 5);
    else 
        return reg(base + (base *.05));
	//check postage cost
	function postage (w, b){
            if(w <= .05) return 3.50;
			else if(w <= .600) return 7.60;
			else if (w >= 5 || b >= 800) return 16.50;
			else return 11;
			}
	//check if needs to be registered
	function reg (p){
		if(p > 150) return p + 2.95;
		else return p;
	}
	}
//-----------------------------------------------------------------------------------------------------------------
