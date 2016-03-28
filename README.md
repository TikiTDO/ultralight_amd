# Sereth AMD

Sereth AMD is a super lightweight, Promise based JS AMD module, for no nonsense JS dependency management.

## Purpose

This is a very simple, single purpose lightweight AMD library. It does one single thing; asynchronous module definition, and it does it in a very small amount of code, by making use of native Promise support. It does not interface with any other library, it polutes the global namespace, and generally it does exactly what it says on the box and absolutely nothing else. 

For all that it's less than 50 lines of code, it minifies down to 638 bytes, and gzips down to 366 bytes. I use it primarily for rails projects, where any other AMD system is overkill.

## Usage

To use, include the sereth_amd.js or sereth_amd.min.js file before your code.

Sereth AMD provides exactly two interface points. One to define new modules, and one to use defined modules. 

To define a module:

```javascript
// Without dependencies
define_module(module_name, function () {
  // ...
  return module_value;
});

// With one dependency
define_module(module_name, dependency_name, function (first_dependency) {
  // ...
  return module_value;
});

// With multiple dependencies
define_module(module_name, [first_dependency_name, second_dependency_name, ...], function (first_dependency, second_dependency) {
  // ...
  return module_value;
});
```

To use modules:

```javascript
// With one dependency
use_module(dependency_name, function (first_dependency) {
  //...
});

// With multiple dependencies
use_module([first_dependency_name, second_dependency_name, ...], function (first_dependency, second_dependency) {
  // ...
});
```

There are no configuration options, no additional arguments or parameters. If you need something fancy, the code is small enough that you should be able to add it yourself.

## Licence

MIT
