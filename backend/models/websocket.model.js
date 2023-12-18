import { WebSocketServer } from 'ws';
import { parse as urlParse } from 'url';
export default class wsServer {
    constructor(server) {
        this.server = new WebSocketServer({ server });
        this.vendorConnections = {}
        this.server.on("connection", (connection, request) => {
            const { id, identity } = urlParse(request.url, true).query;
            console.log(`${identity} ${id} connect websocket`);
            if (identity === 'vendor') {
                if (!(id in this.vendorConnections)) {
                    this.vendorConnections[id] = [];
                }
                this.vendorConnections[id].push(connection);
            }
            connection.on('message', bytesmsg => {
                const message = JSON.parse(bytesmsg.toString());
                console.log(`ws recieve ${message}`);
                if (message.Vendor_ID in this.vendorConnections) {
                    this.vendorConnections[message.Vendor_ID].forEach(vendorConnection => {
                        console.log(`send to vendor ${message.Vendor_ID}`)
                        vendorConnection.send(JSON.stringify(message));
                    });
                }
            });
            connection.on("close", (code) => {
                console.log(`${identity} ${id} disconnected websocket`);
                if (identity === 'vendor') {
                    this.vendorConnections[id] = this.vendorConnections[id].filter((vendorConnection) => vendorConnection._closeCode !== code);
                }
            })
        })
    }
}