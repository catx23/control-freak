### Device Protocols

## Index

<a href="#tcp" name="source">1. TCP</a><br/>
<a href="#udp" name="source">2. UDP</a><br/>
<a href="#serial" name="source">3. Serial</a><br/>
<a href="#ssh" name="source">4. SSH</a><br/>
<a href="#driver" name="source">5. Driver</a><br/>
<a href="#mqtt" name="source">6. MQTT</a><br/>


<hr/>

## [1. TCP](#tcp)

**Device Network Options**

```js
{
  fd: null,
  allowHalfOpen: false,
  readable: false,
  writable: false
}
```

`fd` allows you to specify the existing file descriptor of socket.
Set `readable` and/or `writable` to `true` to allow reads and/or writes on this
socket (NOTE: Works only when `fd` is passed).
About `allowHalfOpen`, refer to `createServer()` and `'end'` event.

**Node-JS Module:** [net.Socket](https://nodejs.org/api/net.html#net_class_net_socket)

**Node-JS Module - Documentation:** [here](https://raw.githubusercontent.com/nodejs/node/master/doc/api/net.markdown)

**Node-JS Wrapper:** nxapp/protocol/TCP
 
## [2. UDP](#udp)

**Device Network Options** 

* `server`: `false` Set to true to create a server. It needs the following 2 options specified as well:
* `ip`: `129.168.1.1` The ip address to bind the server.
* `port`: `9999` The port to bind the server.



**Node-JS Module:** [net.Socket](https://nodejs.org/api/dgram.html)

**Node-JS Module - Documentation:** [here](https://github.com/nodejs/node/blob/master/doc/api/dgram.markdown)

**Node-JS Wrapper:** nxapp/protocol/UDP

**Client & Server example:** [here](http://www.hacksparrow.com/node-js-udp-server-and-client-example.html)

## [3. Serial](#serial)

**Device Network Options**

* `baudrate` Baud Rate, defaults to 9600. Should be one of: 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, or 50. Custom rates as allowed by hardware is supported.
* `databits` Data Bits, defaults to 8. Must be one of: 8, 7, 6, or 5.
* `stopbits` Stop Bits, defaults to 1. Must be one of: 1 or 2.
* `parity` Parity, defaults to 'none'. Must be one of: 'none', 'even', 'mark', 'odd', 'space'
* `rtscts` defaults to false
* `xon` defaults to false
* `xoff` defaults to false
* `xany` defaults to false
* `flowControl` `true` for `rtscts` or an array with one or more of the following strings to enable them `xon`, `xoff`, `xany`, `rtscts`. Overwrites any individual settings.
* `bufferSize` Size of read buffer, defaults to 65536. Must be an integer value.
* `parser` The parser engine to use with read data, defaults to rawPacket strategy which just emits the raw buffer as a "data" event. Can be any function that accepts EventEmitter as first parameter and the raw buffer as the second parameter. Defaults to "raw".
* `platformOptions` - sets platform specific options, see below.

**Node-JS Module:** [serialport](https://github.com/voodootikigod/node-serialport)

**Node-JS Wrapper:** nxapp/protocol/Serial

## [4. SSH](#ssh)

**Device Network Options**

**host** - _string_ - Hostname or IP address of the server. **Default:** `'localhost'`

**port** - _integer_ - Port number of the server. **Default:** `22`

**forceIPv4** - _boolean_ - Only connect via resolved IPv4 address for `host`. **Default:** `false`

**forceIPv6** - _boolean_ - Only connect via resolved IPv6 address for `host`. **Default:** `false`

**hostHash** - _string_ - 'md5' or 'sha1'. The host's key is hashed using this method and passed to the **hostVerifier** function. **Default:** (none)

**hostVerifier** - _function_ - Function with parameters `(hashedKey[, callback])` where `hashedKey` is a string hex hash of the host's key for verification purposes. Return `true` to continue with the handshake or `false` to reject and disconnect, or call `callback()` with `true` or `false` if you need to perform asynchronous verification. **Default:** (auto-accept if `hostVerifier` is not set)

**username** - _string_ - Username for authentication. **Default:** (none)

**password** - _string_ - Password for password-based user authentication. **Default:** (none)

**agent** - _string_ - Path to ssh-agent's UNIX socket for ssh-agent-based user authentication. **Windows users: set to 'pageant' for authenticating with Pageant or (actual) path to a cygwin "UNIX socket."** **Default:** (none)

**agentForward** - _boolean_ - Set to `true` to use OpenSSH agent forwarding (`auth-agent@openssh.com`) for the life of the connection. `agent` must also be set to use this feature. **Default:** `false`

**privateKey** - _mixed_ - _Buffer_ or _string_ that contains a private key for either key-based or hostbased user authentication (OpenSSH format). **Default:** (none)

**passphrase** - _string_ - For an encrypted private key, this is the passphrase used to decrypt it. **Default:** (none)

**localHostname** - _string_ - Along with **localUsername** and **privateKey**, set this to a non-empty string for hostbased user authentication. **Default:** (none)

**localUsername** - _string_ - Along with **localHostname** and **privateKey**, set this to a non-empty string for hostbased user authentication. **Default:** (none)

**tryKeyboard** - _boolean_ - Try keyboard-interactive user authentication if primary user authentication method fails. If you set this to `true`, you need to handle the `keyboard-interactive` event. **Default:** `false`

**keepaliveInterval** - _integer_ - How often (in milliseconds) to send SSH-level keepalive packets to the server (in a similar way as OpenSSH's ServerAliveInterval config option). Set to 0 to disable. **Default:** `0`

**keepaliveCountMax** - _integer_ - How many consecutive, unanswered SSH-level keepalive packets that can be sent to the server before disconnection (similar to OpenSSH's ServerAliveCountMax config option). **Default:** `3`

**readyTimeout** - _integer_ - How long (in milliseconds) to wait for the SSH handshake to complete. **Default:** `20000`

**sock** - _ReadableStream_ - A _ReadableStream_ to use for communicating with the server instead of creating and using a new TCP connection (useful for connection hopping).

**strictVendor** - _boolean_ - Performs a strict server vendor check before sending vendor-specific requests, etc. (e.g. check for OpenSSH server when using `openssh_noMoreSessions()`) **Default:** `true`

**algorithms** - _object_ - This option allows you to explicitly override the default transport layer algorithms used for the connection. Each value must be an array of valid algorithms for that category. The order of the algorithms in the arrays are important, with the most favorable being first. For a list of valid and default algorithm names, please review the documentation for the version of `ssh2-streams` used by this module. Valid keys:

    **kex** - _array_ - Key exchange algorithms.

    **cipher** - _array_ - Ciphers.

    **serverHostKey** - _array_ - Server host key formats.

    **hmac** - _array_ - (H)MAC algorithms.

    **compress** - _array_ - Compression algorithms.

**compress** - _mixed_ - Set to `true` to enable compression if server supports it, `'force'` to force compression (disconnecting if server does not support it), or `false` to explicitly opt out of compression all of the time. Note: this setting is overridden when explicitly setting a compression algorithm in the `algorithms` configuration option. **Default:** (only use compression if that is only what the server supports)

**debug** - _function_ - Set this to a function that receives a single string argument to get detailed (local) debug information. **Default:** (none)

**Authentication method priorities:** Password -> Private Key -> Agent (-> keyboard-interactive if `tryKeyboard` is `true`) -> Hostbased -> None

**exec**(< _string_ >command[, < _object_ >options], < _function_ >callback) - _boolean_ - Executes `command` on the server. Returns `false` if you should wait for the `continue` event before sending any more traffic. `callback` has 2 parameters: < _Error_ >err, < _Channel_ >stream. Valid `options` properties are:

**env** - _object_ - An environment to use for the execution of the command.

**pty** - _mixed_ - Set to `true` to allocate a pseudo-tty with defaults, or an object containing specific pseudo-tty settings (see 'Pseudo-TTY settings'). Setting up a pseudo-tty can be useful when working with remote processes that expect input from an actual terminal (e.g. sudo's password prompt).

**x11** - _mixed_ - Set to `true` to use defaults below, set to a number to specify a specific screen number, or an object with the following valid properties:

    **single** - _boolean_ - Allow just a single connection? **Default:** `false`

    **screen** - _number_ - Screen number to use **Default:** `0`

**shell**([[< _mixed_ >window,] < _object_ >options]< _function_ >callback) - _boolean_ - Starts an interactive shell session on the server, with an optional `window` object containing pseudo-tty settings (see 'Pseudo-TTY settings'). If `window === false`, then no pseudo-tty is allocated. `options` supports the `x11` option as described in exec(). `callback` has 2 parameters: < _Error_ >err, < _Channel_ >stream. Returns `false` if you should wait for the `continue` event before sending any more traffic.

**forwardIn**(< _string_ >remoteAddr, < _integer_ >remotePort, < _function_ >callback) - _boolean_ - Bind to `remoteAddr` on `remotePort` on the server and forward incoming TCP connections. `callback` has 2 parameters: < _Error_ >err, < _integer_ >port (`port` is the assigned port number if `remotePort` was 0). Returns `false` if you should wait for the `continue` event before sending any more traffic. Here are some special values for `remoteAddr` and their associated binding behaviors:

'' - Connections are to be accepted on all protocol families supported by the server.

'0.0.0.0' - Listen on all IPv4 addresses.

'::' - Listen on all IPv6 addresses.

'localhost' - Listen on all protocol families supported by the server on loopback addresses only.

'127.0.0.1' and '::1' - Listen on the loopback interfaces for IPv4 and IPv6, respectively.

**unforwardIn**(< _string_ >remoteAddr, < _integer_ >remotePort, < _function_ >callback) - _boolean_ - Unbind from `remoteAddr` on `remotePort` on the server and stop forwarding incoming TCP connections. Until `callback` is called, more connections may still come in. `callback` has 1 parameter: < _Error_ >err. Returns `false` if you should wait for the `continue` event before sending any more traffic.

**forwardOut**(< _string_ >srcIP, < _integer_ >srcPort, < _string_ >dstIP, < _integer_ >dstPort, < _function_ >callback) - _boolean_ - Open a connection with `srcIP` and `srcPort` as the originating address and port and `dstIP` and `dstPort` as the remote destination address and port. `callback` has 2 parameters: < _Error_ >err, < _Channel_ >stream. Returns `false` if you should wait for the `continue` event before sending any more traffic.

**sftp**(< _function_ >callback) - _boolean_ - Starts an SFTP session. `callback` has 2 parameters: < _Error_ >err, < _SFTPStream_ >sftp. For methods available on `sftp`, see the [`SFTPStream` client documentation](https://github.com/mscdex/ssh2-streams/blob/master/SFTPStream.md) (except `read()` and `write()` are used instead of `readData()` and `writeData()` respectively, for convenience). Returns `false` if you should wait for the `continue` event before sending any more traffic.

**subsys**(< _string_ >subsystem, < _function_ >callback) - _boolean_ - Invokes `subsystem` on the server. `callback` has 2 parameters: < _Error_ >err, < _Channel_ >stream. Returns `false` if you should wait for the `continue` event before sending any more traffic.

**openssh_noMoreSessions**(< _function_ >callback) - _boolean_ - OpenSSH extension that sends a request to reject any new sessions (e.g. exec, shell, sftp, subsys) for this connection. `callback` has 1 parameter: < _Error_ >err. Returns `false` if you should wait for the `continue` event before sending any more traffic.

**openssh_forwardInStreamLocal**(< _string_ >socketPath, < _function_ >callback) - _boolean_ - OpenSSH extension that binds to a UNIX domain socket at `socketPath` on the server and forwards incoming connections. `callback` has 1 parameter: < _Error_ >err. Returns `false` if you should wait for the `continue` event before sending any more traffic.

**openssh_unforwardInStreamLocal**(< _string_ >socketPath, < _function_ >callback) - _boolean_ - OpenSSH extension that unbinds from a UNIX domain socket at `socketPath` on the server and stops forwarding incoming connections. `callback` has 1 parameter: < _Error_ >err. Returns `false` if you should wait for the `continue` event before sending any more traffic.

**openssh_forwardOutStreamLocal**(< _string_ >socketPath, < _function_ >callback) - _boolean_ - OpenSSH extension that opens a connection to a UNIX domain socket at `socketPath` on the server. `callback` has 2 parameters: < _Error_ >err, < _Channel_ >stream. Returns `false` if you should wait for the `continue` event before sending any more traffic.

**Node-JS Module - Documentation:** [here](https://raw.githubusercontent.com/mscdex/ssh2/master/README.md)

**Node-JS Module:** [ssh2](https://github.com/mscdex/ssh2)

## [5. Driver](#driver)

This protocol will simply re-route to the Javascript file created for the Driver. For instance, you created a Driver called
"My Driver", then driver will run the node module : ./My Driver.js  

**Device Network Options** Custom

```js
{
  driver: './DriverName.js'
}
```

**driver** Optional, this defaults to *DRIVER LOCATION / My Driver Name.js*. Otherwise, its relative to the driver's location.

**Node-JS Module:** nxapp/protocols/Driver

**Example:** [Arduino - Johnny Five Driver File](https://github.com/net-commander/default-workspace/blob/master/system/drivers/Arduino/Arduino.js)


## [6. MQTT](#mqtt)


**Device Network Options** 

Defaults:

  * `keepalive`: `10` seconds, set to `0` to disable
  * `reschedulePings`: reschedule ping messages after sending packets (default `true`)
  * `clientId`: `'mqttjs_' + Math.random().toString(16).substr(2, 8)`
  * `protocolId`: `'MQTT'`
  * `protocolVersion`: `4`
  * `clean`: `true`, set to false to receive QoS 1 and 2 messages while offline
  * `reconnectPeriod`: `1000` milliseconds, interval between two reconnections
  * `connectTimeout`: `30 * 1000` milliseconds, time to wait before a CONNACK is received
  * `username`: the username required by your broker, if any
  * `password`: the password required by your broker, if any
  * `incomingStore`: a [Store](#store) for the incoming packets
  * `outgoingStore`: a [Store](#store) for the outgoing packets
  * `will`: a message that will sent by the broker automatically when the client disconnect badly. The format is:
    * `topic`: the topic to publish
    * `payload`: the message to publish
    * `qos`: the QoS
    * `retain`: the retain flag

**Node-JS Module:** [mqtt](https://github.com/mqttjs/MQTT.js)

**Node-JS Wrapper:** nxapp/protocol/MQTT