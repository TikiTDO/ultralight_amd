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
  // "use strict" implied, but not used because I like smaller files
  
  // Do nothing if already defined
  if(root.ul_amd) return;
  root.ul_amd = 1;

  // Minimizer hinting
  var Promise = root.Promise; 
  var function_type = "function";
  var callback_error = 'Missing callback';
  var exists_error = 'Module exists';

  // Can not work without Promise support
  if (!Promise) throw "Promise required";

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
  root['use_module'] = function (dependencies, callback) {
    if (typeof callback != function_type) throw callback_error;
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
  root['def_module'] = function (key, dependencies_or_callback, callback) {
    // Handle infixed optional dependencies parameter
    var dependencies = null;
    if (typeof dependencies_or_callback == function_type) callback = dependencies_or_callback;
    else dependencies = dependencies_or_callback;

    // Verify callback is a function
    if (typeof callback != function_type) throw callback_error;

    // Resolve the dependencies, and store the new module
    root.use_module(dependencies, function (dependencies_actual) {
      store_dependency(key, callback.apply(root, dependencies_actual));
    })
  }
  
  /* Local Variables */
  var dependency_resolvers = {};
  var dependency_promises = {};

  /* Helper Functions */
  // Returns a promise for a single named dependency
  function lookup_dependency(key) {
    if (!dependency_promises[key]) {
      dependency_promises[key] = new Promise(function(resolve) {
        dependency_resolvers[key] = resolve;
      });
    }

    return dependency_promises[key];
  }

  // Promises any number of named dependencies. Must return a promise that resolves to an array.
  function satisfy_dependencies(keys) {
    // Given no keys, resolve to an empty array
    if (!keys) return satisfy_dependencies([]);
    // Given array keys, map the keys into an array of individual promises, and combines them through Promise.all
    else if (Array.isArray(keys)) return Promise.all(keys.map(lookup_dependency));
    // Given a non-array like key, run a single lookup through Promise.all to get array resolution
    else return Promise.all([lookup_dependency(keys)]);
  }

  // Resolves a single named dependency
  function store_dependency(key, value) {
    // Lookup the dependency promise, and resolve
    if (!dependency_promises[key]) {
      // If module has not been looked up, just create a resolved promise
      dependency_promises[key] = Promise.resolve(value);
    } else if (dependency_resolvers[key]) {
      // If module has been looked up, try to resolve it. If there is a promise, but no resolver then it must have already been resolved.
      dependency_resolvers[key].call(dependency_promises[key], value);
      delete dependency_resolvers[key];
    } else {
      // If module has a promise, but does not have a resolve then it has already been define.
      throw exists_error;
    } 
  }
})(this);
