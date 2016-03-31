# Ultra Light AMD

Ultra Light AMD is a super lightweight, Promise based JS AMD module, for no nonsense JS dependency management.

## Purpose

This is a very simple, single purpose lightweight AMD library. It does exactly one thing, and that thing only; [asynchronous module definition](https://en.wikipedia.org/wiki/Asynchronous_module_definition), and it does it in a very small amount of code, by making use of native or polyfilled Promise support. It **does not** interface with any other library, it **does not** touch the DOM, it **does not** load anything, it **does** polutes the global namespace. In other words, it's exactly what it says on the box and absolutely nothing else. 

For all that it's around 50 lines of code, it minifies down to 625 bytes, and gzips down to 368 bytes.

## Usage

To use, include the ul_amd.js or ul_amd.min.js file before your code. 

Ultra Light AMD provides exactly two interface points. One to define new modules, and one to use defined modules. 

**Note 1:** You *cannot* use `def_module` without a module_name in place of `use_module`, as you can with most `require` and `define` implementations. 

**Note 2:** Neither `def_module`, nor `use_module` infer dependency names from the callback parameters. You must always specify the dependencies by name in the dependency list.

To define a module:

```javascript
// Without dependencies
def_module("module_name", function () {
  // Get module_value...
  return module_value;
});

// With one dependency
def_module("module_name", "dependency_name", function (dependency_value) {
  // Use dependency_value to get module_value...
  return module_value;
});

// With multiple dependencies
def_module("module_name", ["first_dep_name", "second_dep_name", ...], function (first_dep_value, second_dep_value, ...) {
  // Use dep_values to get module_value...
  return module_value;
});
```

To use module:

```javascript
// With one dependency
use_module("dependency_name", function (dependency_value) {
  // Use dependency_value...
});

// With multiple dependencies
use_module(["first_dep_name", "second_dep_name", ...], function (first_dep_value, second_dep_value, ...) {
  // Use dep_values...
});
```

There are no configuration options, no additional arguments or parameters, and no further functionality than already described. 

## Licence

MIT
