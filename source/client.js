const { ServiceBroker } = require("moleculer");
const ChannelsMiddleware = require("@moleculer/channels").Middleware;

const conf = {
    nodeID: "my-client",
    disableBalancer: true,
    transporter: 'amqp://localhost:5672',
    middlewares: [
        ChannelsMiddleware({
            adapter: 'amqp://localhost:5672',
        })
    ]
}


    const broker = new ServiceBroker(conf);

    broker.start()
        .then(async () => {
            console.log('start');
            
            await broker.sendToChannel('something.done', {no : 1});
           broker.stop();
        });

