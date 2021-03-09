// import library 
const express = require('express');
const app = express();
app.set('view engine','html');
app.set('views','./');
app.engine('html', require('ejs').renderFile)
const { v4: uuidv4 } = require('uuid');// random unique Id
const crypto = require('crypto');//  make new random key
const NodeRSA = require('node-rsa');// encrypt data
const axios = require('axios');
const { url } = require('inspector');

//constraint
const PORT = 4040;

const endpoint = "https://test-payment.momo.vn/gw_payment/transactionProcessor";
const hostname = "https://test-payment.momo.vn";
const path = "/gw_payment/transactionProcessor";
const partnerCode = "MOMOGFND20210304";
//register account  to get  accessKey/secrectKey 
const accessKey = "lib17639ae0Y9ga8";
const serectkey = "VNRRzhlIzQUWr8dc7R77amy5EQbLKzY4";
const orderInfo = "pay with MoMo";
const returnUrl = "https://localhost:4040/errorcheckout";
const notifyurl = "https://callback.url/notify";
const amount = "1000"
const orderId = uuidv4()
const requestId = uuidv4()
const requestType = "captureMoMoWallet"
const extraData = "merchantName=;merchantId="   // merchantName/merchantId = StoreName/StoreId  to indentify your real strore if not 
var iv = new Buffer(16); // 16 byte buffer with random data
iv.fill(0); // fill with zeros


// encrypt  bodyjson
function encrypt_token(data) {
    var encipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv),
        buffer = Buffer.concat([
            encipher.update(data),
            encipher.final()
        ]);
    return buffer.toString('base64');
}
//decrypt data we recived
function decrypt_token(data) {
    var decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv),
        buffer = Buffer.concat([
            decipher.update(Buffer.from(data, 'base64')),
            decipher.final()
        ]);
    return buffer.toString();
}

const rawSignature = "partnerCode=" + partnerCode + "&accessKey=" + accessKey + "&requestId=" + requestId + "&amount=" + amount + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&returnUrl=" + returnUrl + "&notifyUrl=" + notifyurl + "&extraData=" + extraData;

const signature = crypto.createHmac('sha256', serectkey)
    .update(rawSignature)
    .digest('hex');



// set up request
var options = {
    hostname: hostname,
    port: 443,
    path: path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    requestType: requestType,
    amount: amount,
    requestId: requestId,
    orderId: orderId,
    orderInfo: orderInfo,
    returnUrl: returnUrl,
    notifyUrl: notifyurl,
    extraData: extraData,
    signature: signature,
    partnerCode: partnerCode,
    accessKey: accessKey
}

 
app.get('/',function(req,res) {
    res.render('checkout.html');
});
app.post('/errorcheckout', (req, res) => {
    res.send('<h2>Timeout click to make new transaction</h2><form action="checkout" method="POST"><input type="submit" value="Checkout"/></form>');
})
app.post('/checkout', async (req, res) => {

    const body = await axios.post(endpoint, options).then(response => {
        console.log('Data');
        console.log(response.data);
        return response.data.payUrl;

    }).catch(error => {
        console.log('error', error);
    });
    // res.json(body);
    res.redirect(body);
});

app.listen(PORT, () => {
    console.log('Server is running on:', PORT);
})
