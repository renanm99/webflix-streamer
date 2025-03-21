import WebTorrent from 'webtorrent'

export const client = new WebTorrent({ maxConns: 100, })
client.setMaxListeners(100)
