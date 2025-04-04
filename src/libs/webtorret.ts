import WebTorrent from 'webtorrent'

const client = new WebTorrent({ maxConns: 100, })
client.setMaxListeners(1000)

export default client
