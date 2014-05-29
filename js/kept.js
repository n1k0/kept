/** @jsx React.DOM */

var initial = [
  {id: 1, type: "text", title: "This is a Text entry", text: "Hello World."},
  {id: 2, type: "text", title: "Lorem ipsum dolor sit amet",
   text: "**Consectetur adipisicing elit**, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},
  {id: 3, type: "todo", title: "Today", tasks: [
    {label: "Walk the dog", done: true},
    {label: "Clean the car", done: false},
    {label: "Buy a new carpet", done: false}
  ]},
  {id: 4, type: "text", title: "Ut enim ad minim veniam",
   text: "Quis nostrud *exercitation ullamco* laboris nisi ut aliquip ex ea commodo consequat."},
  {id: 5, type: "text", title: "Duis aute irure",
   text: "> Dolor in [reprehenderit](http://google.com/) in voluptate velit esse cillum dolore eu fugiat nulla pariatur."},
  {id: 6, type: "text", title: "Excepteur sint occaecat",
   text: "    Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."},
  {id: 7, type: "todo", title: "Trip to Paris", tasks: [
    {label: "Eat cheese", done: false},
    {label: "Eat more cheese", done: false},
    {label: "See Eiffel Tower", done: false},
    {label: "MOAR CHEESE", done: false}
  ]}
];

var Button      = ReactBootstrap.Button,
    Glyphicon   = ReactBootstrap.Glyphicon,
    Jumbotron   = ReactBootstrap.Jumbotron,
    Modal       = ReactBootstrap.Modal,
    Panel       = ReactBootstrap.Panel,
    ProgressBar = ReactBootstrap.ProgressBar;

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

function nextId(items) {
  return Math.max.apply(null, items.concat([0]).map(function(item) {
    return item.id || 0;
  })) + 1;
}

function KeptStore(options) {
  options = options || {};
  this._store = options.store || localStorage;
}

KeptStore.prototype = {
  load: function() {
    var data = this._store.getItem("keep.data");
    if (!data) {
      console.error("empty stored kept data:", data);
      return [];
    }
    try {
      return JSON.parse(data) || [];
    } catch (e) {
      console.error("failed parsing kept data:", data, e);
      return [];
    }
  },

  save: function(data) {
    try {
      this._store["keep.data"] = JSON.stringify(data);
    } catch (e) {
      console.error("failed saving keep data", e);
    }
  }
};

var GlyphiconLink = React.createClass({displayName: 'GlyphiconLink',
  render: function() {
    return this.transferPropsTo(React.DOM.a(null, Glyphicon( {glyph:this.props.glyph} )));
  }
});

// http://prometheusresearch.github.io/react-forms/examples/undo.html
var UndoStack = {
  getInitialState: function() {
    return {undo: [], redo: []};
  },

  snapshot: function() {
    var undo = this.state.undo.concat(this.getStateSnapshot());
    this.setState({undo: undo, redo: []});
  },

  hasUndo: function() {
    return this.state.undo.length > 0;
  },

  hasRedo: function() {
    return this.state.redo.length > 0;
  },

  redo: function() {
    this._undoImpl(true);
  },

  undo: function() {
    this._undoImpl();
  },

  _undoImpl: function(isRedo) {
    var undo = this.state.undo.slice(0);
    var redo = this.state.redo.slice(0);
    var snapshot;

    if (isRedo) {
      if (redo.length === 0) {
        return;
      }
      snapshot = redo.pop();
      undo.push(this.getStateSnapshot());
    } else {
      if (undo.length === 0) {
        return;
      }
      snapshot = undo.pop();
      redo.push(this.getStateSnapshot());
    }

    this.setStateSnapshot(snapshot);
    this.setState({undo:undo, redo:redo});
  }
};

var KeptApp = React.createClass({displayName: 'KeptApp',
  mixins: [UndoStack],

  store: new KeptStore(),

  getInitialState: function() {
    return {
      items: this.store.load()
    };
  },

  getStateSnapshot: function() {
    return {items: this.state.items};
  },

  setStateSnapshot: function(snapshot) {
    this.setState(snapshot);
  },

  _forms: {
    // XXX: use standard component constructor?
    text: function(data) {
      return KeptTextForm( {resetForm:this.resetForm, create:this.create, update:this.update, data:data} );
    },

    todo: function(data) {
      return KeptTodoForm( {resetForm:this.resetForm, create:this.create, update:this.update, data:data} );
    }
  },

  save: function(items) {
    this.store.save(items);
    this.snapshot();
    this.setState({items: items});
  },

  loadSamples: function() {
    this.save(initial);
  },

  formCreator: function(type) {
    return function(data) {
      this.setState({form: this._forms[type].call(this, data)});
    }.bind(this);
  },

  newItem: function(type) {
    return this.formCreator(type).bind(null, {});
  },

  resetForm: function() {
    this.setState({form: null});
  },

  create: function(itemData) {
    itemData.id = nextId(this.state.items);
    this.save(this.state.items.concat([itemData]));
    this.resetForm();
  },

  edit: function(itemData) {
    this.formCreator(itemData.type)(itemData);
  },

  update: function(updatedItem) {
    this.save(this.state.items.map(function(item) {
      if (item.id === updatedItem.id)
        return updatedItem;
      return item;
    }));
    this.resetForm();
  },

  remove: function(itemData) {
    this.save(this.state.items.filter(function(data) {
      return itemData !== data;
    }));
  },

  move: function(fromIndex, toIndex) {
    var items = this.state.items.slice(0);
    items.splice(toIndex, 0, items.splice(fromIndex, 1)[0]);
    this.save(items);
  },

  render: function() {
    return (
      React.DOM.div(null, 
        KeptMenuBar( {newItem:this.newItem,
                     loadSamples:this.loadSamples,
                     undo:this.undo,
                     redo:this.redo} ),
        this.state.form,
        KeptItems( {items:this.state.items,
                   newItem:this.newItem,
                   loadSamples:this.loadSamples,
                   edit:this.edit,
                   update:this.update,
                   remove:this.remove,
                   move:this.move} )
      )
    );
  }
});

var KeptMenuBar = React.createClass({displayName: 'KeptMenuBar',
  render: function() {
    // FIXME responsive menu display not available without jQuery -_-'
    return (
      React.DOM.nav( {className:"navbar navbar-default", role:"navigation"}, 
        React.DOM.div( {className:"container-fluid"}, 
          React.DOM.div( {className:"navbar-header"}, 
            React.DOM.a( {className:"navbar-brand", href:"#"}, "Kept")
          ),
          React.DOM.div(null, 
            React.DOM.ul( {className:"nav navbar-nav"}, 
              React.DOM.li(null, React.DOM.a( {href:"#", onClick:this.props.newItem("text")}, "Text")),
              React.DOM.li(null, React.DOM.a( {href:"#", onClick:this.props.newItem("todo")}, "Todo")),
              React.DOM.li(null, React.DOM.a( {href:"#", onClick:this.props.undo}, "Undo")),
              React.DOM.li(null, React.DOM.a( {href:"#", onClick:this.props.redo}, "Redo")),
              React.DOM.li(null, React.DOM.a( {href:"#", onClick:this.props.loadSamples}, "Load samples"))
            )
          )
        )
      )
    );
  }
});

var DefaultContent = React.createClass({displayName: 'DefaultContent',
  render: function() {
    return (
      Jumbotron( {className:"kept-default"}, 
        React.DOM.h1(null, "Welcome to Kept"),
        React.DOM.p(null, "Your list is currently empty."),
        React.DOM.p(null, "You can create"+' '+
          "a ", React.DOM.a( {href:"#", onClick:this.props.newItem("text")}, "Text"),","+' '+
          "a ", React.DOM.a( {href:"#", onClick:this.props.newItem("todo")}, "Todo"), " or",
          Button( {bsStyle:"success", bsSize:"large",
                  onClick:this.props.loadSamples}, "Load samples"),"."
        )
      )
    );
  }
});

var KeptItems = React.createClass({displayName: 'KeptItems',
  render: function() {
    if (!this.props.items.length) {
      return DefaultContent( {newItem:this.props.newItem,
                             loadSamples:this.props.loadSamples} );
    }
    return (
      React.DOM.div( {className:"kept-list"}, 
        this.props.items.map(function(itemData, key) {
          return KeptEntry( {key:key, itemData:itemData,
                    edit:this.props.edit,
                    remove:this.props.remove,
                    update:this.props.update,
                    move:this.props.move} )
        }.bind(this))
      )
    );
  }
});

var KeptEntry = React.createClass({displayName: 'KeptEntry',
  _components: {
    text: function(itemData) {
      return KeptText( {data:itemData} );
    },

    todo: function(itemData) {
      return KeptTodo( {data:itemData, update:this.props.update} );
    }
  },

  getComponent: function(data) {
    return this._components[data.type].call(this, data);
  },

  handleClickEdit: function() {
    this.props.edit(this.props.itemData);
  },

  handleClickDelete: function() {
    if (!confirm("Are you sure?"))
       return;
    this.getDOMNode().classList.add("fade");
    this.timeout = setTimeout(function() {
      this.getDOMNode().classList.remove("fade"); // just don't ask.
      this.props.remove(this.props.itemData);
    }.bind(this), 250); // .fade has a 250ms animation
  },

  handleDragStart: function(event) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData('text/plain', this.props.key);
  },

  handleDragEnter: function(event) {
    event.preventDefault();
  },

  handleDragLeave: function(event) {
    this.unhighlight();
    event.preventDefault();
  },

  handleOnDragOver: function(event) {
    event.preventDefault();
    this.highlight();
  },

  handleOnDrop: function(event) {
    event.preventDefault();
    this.unhighlight();
    this.props.move(event.dataTransfer.getData("text/plain"), this.props.key);
  },

  highlight: function() {
    this.getDOMNode().querySelector(".panel").classList.add("targetted");
  },

  unhighlight: function() {
    this.getDOMNode().querySelector(".panel").classList.remove("targetted");
  },

  render: function() {
    var panelHeader = (
      React.DOM.h3(null, 
        this.props.itemData.title || "Untitled",
        GlyphiconLink( {href:"#", glyph:"trash", onClick:this.handleClickDelete} ),
        GlyphiconLink( {href:"#", glyph:"edit", onClick:this.handleClickEdit} )
      )
    );
    return (
      React.DOM.div( {className:"kept-panel",
           onDragStart:this.handleDragStart,
           onDragEnter:this.handleDragEnter,
           onDragOver:this.handleOnDragOver,
           onDrop:this.handleOnDrop,
           onDragLeave:this.handleDragLeave,
           draggable:"true"}, 
        Panel( {bsStyle:"primary", header:panelHeader}, 
          this.getComponent(this.props.itemData)
        )
      )
    );
  }
});

var KeptText = React.createClass({displayName: 'KeptText',
  render: function() {
    return (
      React.DOM.div( {className:"text-entry"}, 
        React.DOM.div( {className:"text-entry-text",
             dangerouslySetInnerHTML:{__html: marked(this.props.data.text)}} )
      )
    );
  }
});

var KeptTextForm = React.createClass({displayName: 'KeptTextForm',
  handleCancel: function() {
    this.props.resetForm();
  },

  handleSubmit: function() {
    var id = parseInt(this.refs.id.getDOMNode().value.trim(), 10);
    var process = id ? this.props.update : this.props.create;
    process({
      type: "text",
      id: id,
      title: this.refs.title.getDOMNode().value.trim(),
      text: this.refs.text.getDOMNode().value.trim()
    });
  },

  componentDidMount: function() {
    this.getDOMNode().querySelector("textarea").focus();
  },

  render: function() {
    var data = this.props.data;
    return (
      Modal( {title:"Create new Text", onRequestHide:this.props.resetForm, animation:false}, 
        React.DOM.form( {role:"form", onSubmit:this.handleSubmit}, 
          React.DOM.div( {className:"modal-body"}, 
            React.DOM.input( {type:"hidden", ref:"id", defaultValue:data.id} ),
            React.DOM.div( {className:"form-group"}, 
              React.DOM.input( {ref:"title", type:"text", className:"form-control", placeholder:"Title", defaultValue:data.title} )
            ),
            React.DOM.div( {className:"form-group"}, 
              React.DOM.textarea( {ref:"text", className:"form-control", placeholder:"Text (accept markdown contents)…", defaultValue:data.text, rows:"8", required:true} )
            )
          ),
          React.DOM.div( {className:"modal-footer form-group"}, 
            React.DOM.button( {type:"submit", className:"btn btn-primary"}, "Save"),
            " ",
            React.DOM.a( {href:"#", onClick:this.handleCancel}, "Cancel")
          )
        )
      )
    );
  }
});

var KeptTodo = React.createClass({displayName: 'KeptTodo',
  getInitialState: function() {
    return {tasks: this.props.data.tasks};
  },

  // this is needed to map newly received props to current state
  componentWillReceiveProps: function(props) {
    this.setState({tasks: props.data.tasks});
  },

  clearCompleted: function() {
    this.updateTasks(this.state.tasks.filter(function(task) {
      return !task.done;
    }));
  },

  toggle: function(key) {
    this.updateTasks(this.state.tasks.map(function(task, i) {
      if (i !== key)
        return task;
      task.done = !task.done;
      return task;
    }));
  },

  updateTasks: function(tasks) {
    this.setState({tasks: tasks});
    this.props.update({
      type: "todo",
      id: this.props.data.id,
      title: this.props.data.title,
      tasks: tasks
    });
  },

  getProgress: function() {
    var done = this.state.tasks.filter(function(task) {
      return !!task.done;
    }).length;
    if (!this.state.tasks.length)
      return 0;
    return Math.round(done * 100 / this.state.tasks.length);
  },

  render: function() {
    return (
      React.DOM.div(null, 
        ProgressBar( {now:this.getProgress(), label:"%(percent)s%"} ),
        React.DOM.ul( {className:"list-group"}, 
          this.state.tasks.map(function(task, key) {
            return KeptTodoTask( {key:key, data:task, toggle:this.toggle} )
          }.bind(this))
        ),
        React.DOM.p(null, React.DOM.a( {href:"#", onClick:this.clearCompleted}, "Clear completed"))
      )
    );
  }
});

var KeptTodoTask = React.createClass({displayName: 'KeptTodoTask',
  handleChange: function() {
    this.props.toggle(this.props.key);
  },

  render: function() {
    var data = this.props.data;
    return (
      React.DOM.li( {className:"list-group-item"}, 
        React.DOM.label( {className:data.done ? "done" : ""}, 
          React.DOM.input( {type:"checkbox", ref:"done", onChange:this.handleChange, checked:data.done ? "checked" : ""} ),
          React.DOM.span( {className:"todo-item-label"}, data.label)
        )
      )
    );
  }
});

var KeptTodoForm = React.createClass({displayName: 'KeptTodoForm',
  getDefaultEntries: function() {
    return [{label: ""}];
  },

  getInitialState: function() {
    return {
      tasks: this.props.data && this.props.data.tasks || this.getDefaultEntries()
    };
  },

  addTask: function(event) {
    event.preventDefault();
    this.setState({
      tasks: this.state.tasks.concat(this.getDefaultEntries())
    });
    setTimeout(this.focusLatestInput, 0);
  },

  focusLatestInput: function() {
    var inputs = this.getDOMNode().querySelectorAll("input[type=text]");
    inputs[inputs.length - 1].focus();
  },

  handleCancel: function() {
    this.props.resetForm();
  },

  handleSubmit: function() {
    var id = parseInt(this.refs.id.getDOMNode().value.trim(), 10);
    var process = id ? this.props.update : this.props.create;
    process({
      type: "todo",
      id: id,
      title: this.refs.title.getDOMNode().value.trim(),
      tasks: (this.state.tasks || []).filter(function(task) {
        return !!task.label;
      })
    });
  },

  updateTask: function(key, data) {
    this.setState({
      tasks: this.state.tasks.map(function(task, index) {
        return index === key ? data : task;
      })
    });
  },

  removeTask: function(key) {
    this.setState({
      tasks: this.state.tasks.filter(function(task, index) {
        return index !== key;
      })
    });
  },

  componentDidMount: function() {
    this.focusLatestInput();
  },

  render: function() {
    console.log("---");
    return (
      Modal( {title:"Create new Todo", onRequestHide:this.props.resetForm, animation:false}, 
        React.DOM.form( {className:"todo-form", role:"form", onSubmit:this.handleSubmit}, 
          React.DOM.div( {className:"modal-body"}, 
            React.DOM.input( {type:"hidden", ref:"id", defaultValue:this.props.data.id} ),
            React.DOM.div( {className:"form-group"}, 
              React.DOM.input( {ref:"title", type:"text", className:"form-control", placeholder:"Title", defaultValue:this.props.data.title} )
            ),
            React.DOM.ul( {className:"list-group"}, 
              this.state.tasks.map(function(task, key) {
                return KeptTodoTaskForm( {key:key, data:task, updateTask:this.updateTask, removeTask:this.removeTask} )
              }, this)
            )
          ),
          React.DOM.div( {className:"modal-footer form-group"}, 
            React.DOM.button( {className:"btn btn-default", onClick:this.addTask}, "Add task"),
            " ",
            React.DOM.button( {className:"btn btn-primary", type:"submit"}, "Save"),
            " ",
            React.DOM.a( {href:"#", onClick:this.handleCancel}, "Cancel")
          )
        )
      )
    );
  }
});

var KeptTodoTaskForm = React.createClass({displayName: 'KeptTodoTaskForm',
  handleUpdate: function() {
    this.props.updateTask(this.props.key, {
      label: this.refs.label.getDOMNode().value.trim(),
      done: this.refs.done.getDOMNode().checked
    });
  },

  handleRemove: function(event) {
    event.preventDefault();
    this.props.removeTask(this.props.key);
  },

  render: function() {
    var data = this.props.data;
    console.log("rendering KeptTodoTaskForm", data.label);
    return (
      React.DOM.li( {className:"form-inline list-group-item form-group"}, 
        React.DOM.input( {ref:"done", type:"checkbox", onChange:this.handleUpdate, checked:data.done ? "checked" : ""} ),
        "   ",
        React.DOM.input( {ref:"label", type:"text", className:"form-control", placeholder:"Label…", defaultValue:data.label,
               onBlur:this.handleUpdate} ),
        "   ",
        React.DOM.a( {className:"danger", href:"#", onClick:this.handleRemove, title:"Remove task"}, 
          React.DOM.span( {className:"glyphicon glyphicon-remove"})
        )
      )
    );
  }
});

React.renderComponent(KeptApp(null), document.getElementById('kept'));
