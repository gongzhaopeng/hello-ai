const express = require("express");
const bodyParser = require("body-parser");

const RPCClient = require('@alicloud/pop-core').RPCClient;
const Nls = require('alibabacloud-nls')

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

    client.request('CreateToken').then((tokenRes) => {
        const tts = new Nls.SpeechSynthesizer({
            url: process.env.ALIYUN_NLS_ENDPOINT,
            appkey: process.env.TTS_APP_KEY,
            token: tokenRes.Token.Id
        })
        tts.on("data", (msg) => {
            res.write(msg)
        })

        req.json().then(reqJson => {
            let param = tts.defaultStartParams()
            param.text = reqJson.text
            param.voice = process.env.TTS_VOICE_ID

            // tts.start(param, true, 6000).then(() => {
            //     res.send()
            // })
            res.send(reqJson)
        })
    });

    console.log("FC Invoke End RequestId: " + requestId);
});

app.listen(9000, () => {
    console.log("Express started on port 9000");
});
