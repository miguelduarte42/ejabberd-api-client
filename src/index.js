const axios = require('axios');
const camelCase = require('lodash.camelcase');
const commands = require('./commands.js');

class Client {
  constructor(hostname = 'localhost', port = 5443, username, password, reqOptions = {}) {
    this.hostname = hostname;
    this.port     = port;
    this.username = username;
    this.password = password;
    this.reqOptions = reqOptions;

    Object.entries(commands).forEach(([command, description]) => {
      this[camelCase(command)] = (...args) => {
        const callArguments = {};

        (description.arguments || []).forEach(
          (name, position) => callArguments[name] = args[position]
        );

        return this.__call(command, callArguments);
      }
    });
  }

  __call(command, data = {}) {
    const json = JSON.stringify(data);

    return axios({
      method : 'post',
      url    : `https://${this.hostname}:${this.port}/api/${command}`,
      data,
      auth: this.username && this.password? { username: this.username, password: this.password } : undefined,
      headers : {
        'Content-Type'   : 'application/json',
        'Content-Length' : json.length
      },
      timeout : 1000,
        ...this.reqOptions
    })
    .then(
      response => response.data
    );
  }
}


module.exports = Client;
