'use strict';

var dockerLib = require('dockerode');
var dockerCon;

function util(connection) {

  if (!dockerCon) {
    if (!connection) {
      dockerCon = new dockerLib({socketPath: '/var/run/docker.sock'});
    } else {
      dockerCon = new dockerLib(connection);
    }
  }
}

util.prototype.listContainers = function(cb) {
  dockerCon.listContainers(function (err, containers) {
    var list = [
      ['Id', 'Name', 'Image', 'Command', 'State', 'Status'],
    ];

    containers.forEach(function(container, index, array) {
      list.push([container.Id, container.Names[0], container.Image, container.Command, container.State, container.Status]);
    });

    cb(list);

  });
};

util.prototype.getInfo = function(cb) {
  var host = {};
  dockerCon.info(function (err, data) {
    host.Containers = data.Containers;
    host.ContainersRunning = data.ContainersRunning;
    host.ContainersPaused = data.ContainersPaused;
    host.ContainersStopped = data.ContainersStopped;
    host.Images = data.Images;

    host.OperatingSystem = data.OperatingSystem;
    host.Architecture = data.Architecture;
    host.MemTotal = data.MemTotal;
    host.Host = data.Name;
    host.ServerVersion = data.ServerVersion;

    dockerCon.version(function(vErr, vData) {

      host.ApiVersion = vData.ApiVersion;

      cb(host);
    })
  });
}

util.prototype.getContainer = function(containerId, cb) {
  var container = dockerCon.getContainer(containerId);
  return container.inspect(cb);
};

util.prototype.getContainerStats = function(containerId, cb) {
  var container = dockerCon.getContainer(containerId);
  return container.stats({stream: false}, function(err, stream) {
    cb(stream);
  })

};

util.prototype.getContainerLogs = function(containerId, cb) {
  var container = dockerCon.getContainer(containerId);
  return container.logs({
        follow: true,
        stdout: true,
        stderr: true,
        details: false,
        tail: 50,
        timestamps: true
      }, cb);
}

module.exports = util;
