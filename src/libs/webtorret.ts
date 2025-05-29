import WebTorrent from 'webtorrent'
import { EventEmitter } from 'stream'

const client = new WebTorrent({ maxConns: 1000, })
EventEmitter.setMaxListeners(1000)

export default client;
