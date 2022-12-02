const ChannelsMiddleware = require("@moleculer/channels").Middleware;
const { ServiceBroker } = require("moleculer");


const conf = {
    nodeID: "my-service",
    disableBalancer: true,
    transporter: 'amqp://localhost:5672',
    middlewares: [
        ChannelsMiddleware({
            adapter: 'amqp://localhost:5672',
        })
    ]
    
}


    const broker = new ServiceBroker(conf);

    broker.createService({
        name: "my-service",

        actions: {
            'test': (ctx) => {
                console.log(ctx);
            }
        },
        
        channels: {
            async "something.done"(payload) {
                return new Promise( (resolve) => {
                    setTimeout(() => {
                            console.log('something done!', payload);
                            resolve();
                        },
                        2000
                    );
                });
            },

        },
        
    });

    broker.start()
        .then(() => {console.log('service started')
        //setTimeout(async() => { await broker.stop()}, 5000)
    });

