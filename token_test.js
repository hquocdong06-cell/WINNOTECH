//file này để tham khảo, test jwt


var jwt = require('jsonwebtoken');
var fs = require("fs"); 

var data = { username: 'SG' };

// var privatekey = fs.readFileSync('./key/privatekey.pem');
var cert = fs.readFileSync('./key/publickey.crt');


// var token = jwt.sign(data, privatekey, {
//     algorithm: 'RS256'
// });
var token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlNHIiwiaWF0IjoxNzc3MTIwNDY0fQ.DNnC5otjTuoYQ0GB89daS6IKHoSALioCrpLOKUbDR_C2_3updfOQ01Fer4oPcgDbmQcmfLGpTqHHQIo9YB22TcK1fwUoylEDgiwhMfpaxWBOR8FeuS_c7Z1T-eoRusmtgbSQPEEmUGpA2oX8jF_ppq6RyXvSGnGeSst9Ilk9GAWTWBde0f0lzlUDOXF7GBf5iCG1FczxJqDFAlUuLo72zuRl71ia3w-e5_tdQDrs4WuYSDC0nsY8264T0DTcnyYKQdbZu3FC3d5cJhNuol5Wn1tUwqyUmJfNzm2-WWbTDMRv19OlSRmA6mRzPMwHxE11WxLjEfM62Ymu-dpjEdXegg'
jwt.verify(token, cert, { algorithms: ['RS256']}, function (err, data) {
    console.log(err);
    console.log(data);
})
console.log("TOKEN:", token);