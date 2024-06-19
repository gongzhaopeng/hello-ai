const express = require("express");
const bodyParser = require("body-parser");

const RPCClient = require('@alicloud/pop-core').RPCClient;

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.raw());

app.all("/*", (req, res) => {
    const requestId = req.headers["x-fc-request-id"];
    console.log("FC Invoke Start RequestId: " + requestId);

    const client = new RPCClient({
        accessKeyId: process.env.ALIYUN_AK_ID,
        accessKeySecret: process.env.ALIYUN_AK_SECRET,
        endpoint: process.env.ALIYUN_META_ENDPOINT,
        apiVersion: process.env.ALIYUN_META_API_VERSION
    });

    client.request('CreateToken').then((result) => {
        res.send(
            JSON.stringify({
                msg: result,
                request: {
                    query: req.query,
                    path: req.originalUrl,
                    data: req.body,
                    clientIp: req.headers["x-forwarded-for"],
                },
            })
        );
    });

    console.log("FC Invoke End RequestId: " + requestId);
});

app.listen(9000, () => {
    console.log("Express started on port 9000");
});
