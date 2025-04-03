import WebTorrent from 'webtorrent'

const client = new WebTorrent({ maxConns: 100, })
client.setMaxListeners(Infinity)

export default client
