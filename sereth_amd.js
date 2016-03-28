/*
Copyright (c) 2015 Sereth Infrastructure Systems

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
// Simple promised-based AMD solution
// WARNING: No deadlock detection.
(function (root) {
  "use strict";

  // Can not work without Promise support
  if (!Promise) {throw "Native Promise support or polyfill required";}

  /** 
   * Define a module within the Sereth AMD environment 
   *
   * @param {Object} key
   *     The identifier for this module. This will be used to specify dependencies.
   * @param {Object|Object[]} [dependencies]
   *     The key, or array of keys of modules required for the definition of this module
   * @param {function} callback
   *     A callback that returns the value of the module to be stored. Parameters will be the requested dependency modules
   */ 
  root['use_modules'] = function (dependencies, callback) {
    // V
    if (typeof callback !== 'function') throw 'Module usage not a function: ' + key;;
    satisfy_dependencies(dependencies).then(function (dependencies_actual) {
      callback.apply(root, dependencies_actual);
    });
  }

  /** 
   * Define a module within the Sereth AMD environment 
   *
   * @param {Object} key
   *     The identifier for this module. This will be used to specify dependencies.
   * @param {Object|Object[]} [dependencies]
   *     The key, or array of keys of modules required for the definition of this module
   * @param {function} callback
   *     A callback that returns the value of the module to be stored. Parameters will be the requested dependency modules
   */ 
  root['define_module'] = function (key, dependencies_or_callback, callback) {
    // Handle infixed optional dependencies parameter
    var dependencies = null;
    if (typeof dependencies_or_callback === 'function') callback = dependencies_or_callback;
    else dependencies = dependencies_or_callback;

    // Verify callback is a function
    if (typeof callback !== 'function') throw 'Module define not a function: ' + key;

    // Resolve the dependencies, and store the new module
    root.use_modules(dependencies, function (dependencies_actual) {
      store_dependency(key, callback.apply(root, dependencies_actual));
    })
  }
  
  /* Local Variables */
  var dependency_resolvers = {};
  var dependency_promises = {};

  /* Helper Functions */
  // Returns a promise for a single named dependency
  function lookup_dependency(key) {
    if (!dependency_promises[key]) 
      dependency_promises[key] = new Promise(function(resolve, reject) {
        dependency_resolvers[key] = resolve;
      });

    return dependency_promises[key];
  }

  // Promises any number of named dependencies. Must return a promise that resolves to an array.
  function satisfy_dependencies(keys) {
    // Given no keys, resolve to an empty array
    if (!keys) return new Promise(function (resolve){ resolve([]) });
    // Given keys that responds to map (like an array), map the keys into an array of individual promises, and combines them through Promise.all
    else if (keys.map) return Promise.all(keys.map(lookup_dependency));
    // Given a non-array like key, run a single lookup through Promise.all to get array resolution
    else return Promise.all([lookup_dependency(keys)]);
  }

  // Resolves a single named dependency
  function store_dependency(key, value) {
    // Lookup the dependency promise, and resolve
    var dependency_promise = dependency_promises[key];
    var dependency_resolver = dependency_resolvers[key];

    if (!dependency_promise) {
      // If module has not been looked up, just create a resolved promise
      dependency_promises[key] = Promise.resolve(value);
    } else {
      // If module has been looked up, try to resolve it. If there is a promise, but no resolver then it must have already been resolved.
      if (dependency_resolver) {
        dependency_resolver.call(dependency_promise, value);
        delete dependency_resolvers[key];
      } else {
        throw "Module already exists:  " + key;
      }
    }
  }
})(this);
