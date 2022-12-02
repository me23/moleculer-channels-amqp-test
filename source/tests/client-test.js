const { ServiceBroker } = require("moleculer");
const ChannelsMiddleware = require("@moleculer/channels").Middleware;
const { TestEnvironment } = require('jest-environment-node');

const conf = {
    nodeID: "service",
    disableBalancer: true,
    transporter : {
        type: "AMQP",
        options: {
            url: "amqp://localhost:5672",
            eventTimeToLive: 5000,
            prefetch: 1,
            socketOptions: {
                servername: process.env.RABBIT_SERVER_NAME
            },
            // If true, queues will be autodeleted once service is stopped, i.e., queue listener is removed
            autoDeleteQueues: true
        }
    },
    middlewares: [
        ChannelsMiddleware({
            adapter: {
                type: "AMQP",
                options: {
                    amqp: {
                        url: "amqp://localhost:5672",
                        // Options for `Amqplib.connect`
                        socketOptions: {
                            servername: process.env.RABBIT_SERVER_NAME
                        },
                        // Options for `assertQueue()`
                        queueOptions: {},
                        // Options for `assertExchange()`
                        exchangeOptions: {},
                        // Options for `channel.publish()`
                        messageOptions: {},
                        // Options for `channel.consume()`
                        consumerOptions: {}
                    },
                    maxInFlight: 10,
                    maxRetries: 3,
                    deadLettering: {
                        enabled: false
                        //queueName: "DEAD_LETTER",
                        //exchangeName: "DEAD_LETTER"
                    }
                }
            }
        })
    ]
}
const broker = new ServiceBroker(conf);
const cli = new ServiceBroker({ ...conf, ...{ nodeID: 'client' } });
let count = 0;

beforeAll(async () => {
  

    broker.createService({
        name: 'testService2',
        actions: {
            'doSomething': async (ctx) => {
                console.log('tue was!', broker.sendToChannel.toString());
                const res = await broker.sendToChannel("thing.done", {});
                console.log(res);
                return true;
            }
        },
        /*
        channels: {
            async "something2.done"(payload) {
                count++;
                console.log('something done!', payload);
            },

        }*/
    });
    
    broker.createService({
        name: 'testClient2',
        channels: {
            async "thing.done"(payload) {
                count++;
                console.log('something done!', payload);
            },

        }
    });



    await broker.start();
    //await cli.start();
});

afterAll(async () => {
   // await cli.stop();
    await broker.stop();
});

afterEach(() => {
    count = 0;
})

describe('test', () => {

    it('test', async () => {
        console.log(broker);
        const actions = await broker.call("$node.services");
        console.log('################################', actions);
        const res = await broker.call('testService2.doSomething');
        expect(res).toBeTruthy();
        expect(count).toEqual(1);
    });

});
