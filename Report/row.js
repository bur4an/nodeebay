const keys = require('../keys');
var ebay = require('ebay-api');

const fs = require('fs');
var products = require('./files/items');

var count = 0;

var csv = require("fast-csv");
var stream = fs.createReadStream('../STDPRICE_FULL.TXT');
csv
    .fromStream(stream, {
        headers: true
    })
    .on("data", function(data) {
	for(var i=0; i<products.length; i++)
		if (data['Vendor Part Number'] == products[i].ItemSpecifics.NameValueList.filter( function(itemSpecifics){
												return itemSpecifics.Name == 'MPN';
											})[0].Value)
			products[i].Ingram = data;
    })
    .on("end", function() {
		//...
		fs.writeFile('files/rows.csv','ItemId,Title,Price,Buy,Profit,Qty,Weight\n','utf-8');
		products.forEach(function(product){
				{
					var weight = '', buy = '', profit = '', qty = '';
					if(product.Ingram)
						{
							weight = product.Ingram["Weight"];
							buy = product.Ingram["Customer Price with Tax"];
							qty = product.Ingram["Available Quantity"];
							profit = calcprofit( parseFloat(product.Ingram["Customer Price with Tax"]), parseFloat(product.Ingram["Weight"]), parseFloat(product.CurrentPrice.amount));
							
						}
					
					fs.appendFile('files/rows.csv',
										  product.ItemID+',"'
										  +product.Title+'",'
										  +product.CurrentPrice.amount+','
										  +buy+','
								  		  +profit+','
								  		  +qty+','
								  		  +weight+'\n',
									  'utf-8');
				}//operation end
		});
		
    });

//-------------------------------------------------------------------------------------------------------------------
function calcprofit(buy, weight, sell){
	//calculate base cost    
    
	return sell - (+(Math.round((buy 
                             + postage(weight, buy) 
                             + (sell * .105) 
                             + 1.20) 
                + "e+2")  + "e-2"));
	
	//check postage cost
	function postage (w, b){
            if(w <= .05) return 3.50;
			else if(w <= .600) return 7.60;
			else if (w >= 5 || b >= 800) return 16.50;
			else return 11;
			}
	}
