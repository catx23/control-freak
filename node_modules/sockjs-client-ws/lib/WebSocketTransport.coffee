WebSocket = require('ws')
EventEmitter = require('events').EventEmitter
class WebSocketTransport extends EventEmitter
  @CONNECTING = 0
  @OPEN = 1
  @CLOSING = 2
  @CLOSED = 3
  constructor:(url)->
    @ws = new WebSocket(url)
    @ws.on 'message', @onData
    @ws.on 'close', =>
      @emit 'close'
    @ws.on 'open', =>
    @readyState = WebSocketTransport.CONNECTING
  send:(m)->
    @ws.send(JSON.stringify(m))
  close:->
    @ws.close()
  onData:(data)=>
    that = this
    type = data.slice(0, 1)
    switch type
      when "o"
        that._dispatchOpen()
      when "a"
        payload = JSON.parse(data.slice(1) or "[]")
        i = 0
        while i < payload.length
          that._dispatchMessage payload[i]
          i++
      when "m"
        payload = JSON.parse(data.slice(1) or "null")
        that._dispatchMessage payload
      when "c"
        payload = JSON.parse(data.slice(1) or "[]")
        that._didClose payload[0], payload[1]
      when "h"
        that._dispatchHeartbeat()
  _dispatchOpen:->
    that = this
    if that.readyState is WebSocketTransport.CONNECTING
      that.readyState = WebSocketTransport.OPEN
      @emit 'connection'
    else
      # The server might have been restarted, and lost track of our
      # connection.
      that._didClose 1006, "Server lost session"
  _dispatchMessage:(data) ->
    that = this
    return  if that.readyState isnt WebSocketTransport.OPEN
    @emit "data",data
  _dispatchHeartbeat:(data) ->
    that = this
    return  if that.readyState isnt WebSocketTransport.OPEN
    @emit "heartbeat"
  _didClose:(code, reason, force) ->
    that = this
    throw new Error("INVALID_STATE_ERR")  if that.readyState isnt WebSocketTransport.CONNECTING and that.readyState isnt WebSocketTransport.OPEN and that.readyState isnt WebSocketTransport.CLOSING
    if that._transport
      that._transport.close()
      that._transport = null
    that.readyState = WebSocketTransport.CLOSED
    @emit "close"
module.exports = WebSocketTransport