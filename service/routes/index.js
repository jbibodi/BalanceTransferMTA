var express = require('express');
var router = express.Router();

var btoa = require('btoa');
var rp = require('request-promise');
var chaincodeId = process.env.CHAINCODE_ID;
var fs = require('fs');
var path = require('path');
//var rimraf = require('rimraf');
var envSetting = require('../helper/serviceKey');
var serviceKey = envSetting.serviceKey;
var tokenDetailsPath = path.join(__dirname, '..', 'helper', 'tokenDetails.json');

/*rimraf(tokenDetailsPath, (err) => {
  if (err) throw err;
  console.log("successfully deleted tokendetails.json")
});*/

fs.unlinkSync(tokenDetailsPath);

var getAmountForSpecificCompanyOptions = {
  method: 'GET',
  url: serviceKey.serviceUrl + '/chaincodes/' + chaincodeId + '/',
  headers: {
    "Authorization": ""
  }
};

function getAccessToken() {

  // options parameters which will be sent as a request to get access token.
  var options = {
    method: 'GET',
    url: serviceKey.oAuth.url + '/oauth/token',
    qs: { grant_type: 'client_credentials' },
    headers:
      { 'Authorization': 'Basic ' + btoa(serviceKey.oAuth.clientId + ":" + serviceKey.oAuth.clientSecret) }
  };

  // returns a promise if it is successful or failed
  return new Promise((resolve, reject) => {
    
    //send request to get access tokens
    rp(options).then((response) => {

      // returns a json object with access token, expires time in seconds, etc
      var body = JSON.parse(response);

      // write token details to file
      fs.writeFile(tokenDetailsPath, JSON.stringify(body), (err) => {
        if (err) {reject(err);}

        // if no error resolve and return the promise along with the access token
        resolve(body.access_token);
      });
    }).catch((err) => {
      reject(err);
    });
  });
}

// Generate a new token after every 11.5 hours
setInterval(() => {
  getAccessToken();
}, 41400000);

// function which will generate new access token and store in the token details file


/* GET home page. */
router.get('/', function (req, res, next) {
	console.log("Inside /");
  res.render('index', { title: 'Express' });
});

// routes all the request for get amount from client to this services
router.get('/getAmount', function (req, res, next) {
	console.log("Inside get Amount");
  // get the name of the company for which amount is to be fetched
  var companyName = req.query.companyName;
  // read the file to get access token
  fs.readFile(tokenDetailsPath, (err, data) => {
    // if err reading file, generate a new token and create file invoke getAmount function; if no error directly call getAmount function
    err ? handleTokenOrTokenFileReadErrorForGetAmount(companyName, res) : getAmount(companyName, JSON.parse(data).access_token).then((response) => {
      res.send(response);
    }).catch((err) => {
      res.status(400).send(err.error);
    });
  });
});

// function to generate access token if there is error reading a file.
function handleTokenOrTokenFileReadErrorForGetAmount(companyName, res) {
  // generates a new access token and write it to the token details files
  getAccessToken().then((access_token) => {
    // invokes get amount function for a specific company name.
    getAmount(companyName, access_token).then((response) => {
      // send the amount value back to the client/front-end
      res.send(response);
    }).catch((err) => {
      res.status(400).send(err.error);
    });
  });
}

//function to get the amount for a specific company
function getAmount(companyName, access_token) {
	console.log("Inside getAmount - print accesstoken");
	console.log(access_token);
  // returns a promise if it is successful or failed 
  return new Promise((resolve, reject) => {

    // create the options with token and company name
    var options = JSON.parse(JSON.stringify(getAmountForSpecificCompanyOptions));
    options.url = (options.url).concat(companyName);
    options.headers['Authorization'] = 'Bearer ' + access_token;

    // 
    rp(options).then((response) => {
    	console.log("Server response");
    	console.log(response);
      resolve(response);
    }).catch((err) => {
    	console.log("Server response");
    	console.log(err);
      reject(err);
    });
  });
}

router.post('/transferAmount', function (req, res, next) {
  (req.body.amount < 1 || req.body.amount > 1000) ?
    (res.status(400).send(JSON.stringify({ message: "Amount to be transferred is Required, range is >0 & <=1000" }))) : (fs.readFile(tokenDetailsPath, (err, data) => {
      err ? handleTokenOrTokenFileReadErrorForTransferToken(req, res) : transferAmount(req, res, JSON.parse(data).access_token);
    }));
});

function handleTokenOrTokenFileReadErrorForTransferToken(req, res) {
  getAccessToken().then((access_token) => {
    transferAmount(req, res, access_token);
  });
}

function transferAmount(req, res, access_token) {

  var fromCompanyName = req.body.fromCompanyName;
  var toCompanyName = req.body.toCompanyName;
  var amount = req.body.amount;

  getAmount(fromCompanyName, access_token).then((response) => {
    if (response > -1000) {
      var options = {
        method: 'POST',
        url: serviceKey.serviceUrl + '/chaincodes/' + chaincodeId + '/' + fromCompanyName,
        formData: {
          'toCompanyName': toCompanyName,
          'amountToBeTransferred': amount
        },
        headers: {
          'Authorization': 'Bearer ' + access_token
        }
      };

      rp(options).then((response) => {
        res.send(JSON.stringify({ message: response }));
      }).catch((err) => {
        res.status(400).send(err.error);
      });
    }
    else {
      res.status(400).send(JSON.stringify({ message: "Amount cannot be transferred! Settle up the balance first and try again", isSettleUp: true }));
    }
  }).catch((err) => {
    res.status(400).send(err.error);
  });
}

router.post('/settleUpBalance', function (req, res, next) {
  console.log("settle up balance");
  res.send(req.body);
});

module.exports = router;