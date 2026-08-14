const http = require('http');
const crypto = require('crypto');
const querystring = require('qs');

const secretKey = 'IQQTBFVCHOXFTGLMITJIGOYAWJANMKYV';
const orderCode = 'WN14202002'; // order code created earlier

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

let vnp_Params = {
  vnp_Amount: '764150000',
  vnp_BankCode: 'NCB',
  vnp_BankTranNo: 'VNP14202002',
  vnp_CardType: 'ATM',
  vnp_OrderInfo: 'Thanh toan cho ma GD:' + orderCode,
  vnp_PayDate: '20260814202100',
  vnp_ResponseCode: '00',
  vnp_TmnCode: 'FGJPW2A4',
  vnp_TransactionNo: '14202002',
  vnp_TransactionStatus: '00',
  vnp_TxnRef: orderCode,
};

vnp_Params = sortObject(vnp_Params);
let signData = querystring.stringify(vnp_Params, { encode: false });
let hmac = crypto.createHmac("sha512", secretKey);
let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
vnp_Params['vnp_SecureHash'] = signed;

const returnUrl = '/order/vnpay_return?' + querystring.stringify(vnp_Params, { encode: false });

console.log('Sending VNPAY Callback simulation to:', returnUrl);

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: returnUrl,
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('VNPAY_RETURN_RESPONSE:', body);
  });
});

req.on('error', (e) => console.error('ERROR:', e));
req.end();
