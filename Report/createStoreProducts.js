const keys = require('../keys');
var ebay = require('ebay-api');
const fs = require('fs');
var items = [];
	
for(var i=1; i<=6; i++)
ebay.xmlRequest({
        serviceName: 'Finding',
        opType: 'findItemsIneBayStores',
        appId: keys.appId,
        params: {
				storeName: 'eSuperPrices',
                paginationInput:{
								entriesPerPage: '100',
								pageNumber: i,
                                },
                itemFilter: [{
                                name: 'HideDuplicateItems',
                                value: 'true'
                            },]
                },
        }, function(error, results) {
        // ...
			if(error)
				console.log(error);
			if(results.ack == 'Success'){
				if(results.searchResult.$.count > 1)
				results.searchResult.item.forEach(function(item){
				ebay.xmlRequest({
					serviceName: 'Shopping',
					opType: 'GetSingleItem',
					appId: keys.appId,
					params: {
						'ItemID': item.itemId,
						'IncludeSelector': 'Details,ItemSpecifics',
					}
				}, function(error, detail) {
					// ...
					if (error)
						console.log(error)
					if(detail.Ack == 'Success')
						items.push(detail.Item);
					if(items.length == results.paginationOutput.totalEntries)
						fs.writeFile('files/items.js','module.exports = '+JSON.stringify(items, null, '\t'),'utf-8');
					console.log(items.length+" "+results.paginationOutput.totalEntries);
				});
				});
				else
					ebay.xmlRequest({
					serviceName: 'Shopping',
					opType: 'GetSingleItem',
					appId: keys.appId,
					params: {
						'ItemID': results.searchResult.item.itemId,
						'IncludeSelector': 'Details,ItemSpecifics',
					}
				}, function(error, detail) {
					// ...
					if (error)
						console.log(error)
					if(detail.Ack == 'Success')
						items.push(detail.Item);
					if(items.length == results.paginationOutput.totalEntries)
						fs.writeFile('files/items.js','module.exports = '+JSON.stringify(items, null, '\t'),'utf-8');
					console.log(items.length+" "+results.paginationOutput.totalEntries);
				});
			}//finding results end
			});
//--------------------------------------------------------------------------------------