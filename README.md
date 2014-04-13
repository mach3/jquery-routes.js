
# jQuery-Routes

Simple router library for jQuery.

## Features

- Route client pages and run the action which is connected to the rule
- Resolve route by pathname or hash
- Support hashchange event (including polyfill for legacies)
- Watch the change of URL

## Basic Usage

Initialize instance, add rule with `add()`, then `resolve()`.

```javascript
var r = new $.Routes({mode: "path"});

// Add rules
r.add({
    "^/index": function(path){ ... },
    "^/user/(\\w+)": function(path, user_id){ ... },
    "^/status/(\\w+)/(\\w+)": function(path, user_id, item_id){ ... }
});

// Resolve and run action
r.resolve();
```


### Add Rules

There are a few ways to add rule.

```
// Add a rule
r.add("^/index", function(){... });

// Add rules by object
r.add({
    "^/index": function(){ ... },
    ...
});

// Add rules by array
r.add([
    {
        rule: "^/index",
        action: function(){ ... }
    },
    ...
]);
```

### Resolve

Call `resolve()` to resolve the route and run action.

```javascript
// Normally resolve
r.resolve();

// Manually resolve
r.resolve("/user/john");
```

Pass the path string to resolve manually.
If an argument ommitted, location.pathname or location.hash is to be used.

### Modes

2 modes are available.

```javascript
// Configure mode
r.config({mode: "hash"});
```

- **hash** - Resolve by `location.hash`
- **path** - Resolve by `location.pathname`

### Watching

Call `watch()` to observe, and call `unwatch()` to stop observing.

```javascript
// Start to observe the change of location.hash
// And call resolve for the first time
r.watch().resolve();

// Stop observing
r.unwatch();
```

On hash mode, set handler for hashchange event and call `resolve` on change.
For legacies which doesn't support hashchange event, polyfill it with setInterval.

On path mode, this is useful for pjax.



### Events

```javascript
// If path is not matched to any rule,
// manually resolve default page.
r.on("error", function(){
    this.resolve("/index");
});
```

- error - Triggered when failed to resolve
- success - Triggered when succeeded to resolve


### Options

```
r.config({
    mode: "hash",
    bind: myapp,
    hook: function(){ ... }
});
```

- **mode** - Select mode ("hash" or "path")
- **bind** - Scope object for executing actions
- **hook** - Function called before every actions
