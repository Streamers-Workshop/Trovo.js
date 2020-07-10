const fs = require('fs'), path = require('path'), util = require('util');

var instance = null;

function Plugins() {
  if(arguments.callee._singletonInstance) {
    return arguments.callee._singletonInstance;
  }
  arguments.callee._singletonInstance = this;
  this.plugins = new Map();
}

const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = source => fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)

Plugins.prototype.loadPlugins = async (directory) => {
  fs.access(file, function(err) {
    if (err) new Error(`File does not Exist or has Access Permission Issues: ${file}`);
    else {
      const directories = getDirectories(directory);
      for(const dir of directories) {
        try {
          var plugin = require(path.join(directory, dir, `${dir}.js`));
          console.log(`Loaded Plugin[${plugin.name}]: Type(${plugin.type}) for Platform(${plugin.platform}) from File (/${dir}/${dir}.js)`);
          if (fs.accessSync(path.join(directory, dir, `${dir}.json`), fs.constants.R_OK)) {
            plugin.settings = require(path.join(directory, dir, `${dir}.json`));
            console.log(`Loaded Plugin[${plugin.name}]: Settings from File (/${dir}/${dir}.json)`);
          } else {
            plugin.settings = null;
          }
          instance.plugins.set(dir, plugin);
        } catch(e) {
          console.error(`Error Attempting to Load Plugin(${dir}) located at: ${path.join(directory, dir)}`);
        }
      }
    }
  });
}

Plugins.prototype.getSettings = (plugin) => {
    const plugin = instance.plugins.get(plugin);
    if (!plugin) {
      console.error(`Invalid Plugin Requested. Check your spelling for Plugin: ${plugin}`);
      return undefined;
    }
    else return plugin.settings;
}

Plugins.prototype.getPlugin = (plugin) => {
    const plugin = instance.plugins.get(plugin);
    if (!plugin) {
      console.error(`Invalid Plugin Requested. Check your spelling for Plugin: ${plugin}`);
      return undefined;
    }
    else return plugin;
}

Plugins.prototype.triggerEvents = async (type, platform, client, data, plugins) => {
    for (var plugin of instance.plugins.entries()) {
      var value = plugin[1];
      if (!value.event) return;
      if (value.platform != platform) return;
      if (value.type != type) return;
      value.execute(data, client, plugins);
    }
}

Plugins.prototype.getChatCommand = async (command, platform) => {
  var output = null;
  for (var plugin of instance.plugins.entries()) {
    var value = plugin[1];
    if (!value.chat) return;
    if (value.platform != platform) return;
    if (value.command != command) return;
    if (value.alias.indexOf(command) <= -1) return;
    output = value;
    break;
  }
  return output;
}

Plugins.prototype.getEvent = async (type, platform) => {
  var output = null;
  for (var plugin of instance.plugins.entries()) {
    var value = plugin[1];
    if (!value.event) return;
    if (value.platform != platform) return;
    if (value.type != type) return;
    output = value;
    break;
  }
  return output;
}

module.exports = function() {
  return instance || (instance = new Plugins());
}();
