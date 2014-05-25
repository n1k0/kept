/** @jsx React.DOM */

var initial = [
  {id: 1, type: "text", title: "This is a Text entry", text: "Hello World."},
  {id: 2, type: "todo", title: "This is a Todo entry", tasks: [
    {label: "Plop", done: false},
    {label: "Plap", done: true}
  ]}
];

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
    try {
      return JSON.parse(this._store.getItem("keep.data")) || [];
    } catch (e) {
      console.error("failed loading keep data", e);
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

var KeptModal = React.createClass({
  render: function() {
    return <div className="kept-modal">{this.props.children}</div>
  }
});

var KeptApp = React.createClass({
  store: new KeptStore(),

  getInitialState: function() {
    return {
      items: this.store.load()
    };
  },

  _forms: {
    text: function(data) {
      return <KeptTextForm resetForm={this.resetForm} create={this.create} update={this.update} data={data} />;
    },

    todo: function(data) {
      return <KeptTodoForm resetForm={this.resetForm} create={this.create} update={this.update} data={data} />;
    }
  },

  formCreator: function(type) {
    return function(data) {
      this.setState({form: this._forms[type].call(this, data)});
    }.bind(this);
  },

  resetForm: function() {
    this.setState({form: null});
  },

  create: function(itemData) {
    itemData.id = nextId(this.state.items);
    var items = this.state.items.concat([itemData]);
    this.setState({form: null, items: items});
    this.store.save(items);
  },

  edit: function(itemData) {
    this.formCreator(itemData.type)(itemData);
  },

  update: function(updatedItem) {
    var items = this.state.items.map(function(item) {
      if (item.id === updatedItem.id)
        return updatedItem;
      return item;
    });
    this.store.save(items);
    this.setState({form: null, items: items});
  },

  remove: function(itemData) {
    var items = this.state.items.filter(function(data) {
      return itemData !== data;
    });
    this.setState({items: items});
    this.store.save(items);
  },

  render: function() {
    return (
      <div>
        <KeptMenuBar formCreator={this.formCreator} />
        <KeptModal>{this.state.form}</KeptModal>
        <KeptItems items={this.state.items} edit={this.edit} update={this.update} remove={this.remove} />
      </div>
    );
  }
});

var KeptMenuBar = React.createClass({
  newItem: function(type) {
    return this.props.formCreator(type).bind(null, {});
  },

  render: function() {
    // FIXME responsive menu display not available without jQuery -_-'
    return (
      <nav className="navbar navbar-default" role="navigation">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#menu">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="#">Kept</a>
          </div>
          <div className="collapse navbar-collapse" id="menu">
            <ul className="nav navbar-nav">
              <li><a href="#" onClick={this.newItem("text")}>New Text</a></li>
              <li><a href="#" onClick={this.newItem("todo")}>New Todo</a></li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
});

var KeptItems = React.createClass({
  render: function() {
    return <div className="kept-list">{
      this.props.items.map(function(itemData, key) {
        return <KeptEntry key={key} itemData={itemData}
                  edit={this.props.edit}
                  remove={this.props.remove}
                  update={this.props.update} />
      }.bind(this))
    }</div>
  }
});

var KeptPanel = React.createClass({
  render: function() {
    return (
      <div className="kept-entry panel panel-primary">
        <header className="panel-heading">
          <h3 className="panel-title">{this.props.title || "Untitled"}</h3>
        </header>
        <section className="panel-body">{this.props.children}</section>
        <footer className="panel-footer">
          <div className="btn-group">
            <button className="btn btn-default btn-sm" onClick={this.props.handleClickEdit}>
              <span className="glyphicon glyphicon-edit"></span>&nbsp;Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={this.props.handleClickDelete}>
              <span className="glyphicon glyphicon-trash"></span>&nbsp;Delete
            </button>
          </div>
        </footer>
      </div>
    );
  }
});

var KeptEntry = React.createClass({
  _components: {
    text: function(itemData) {
      return <KeptText data={itemData} />;
    },

    todo: function(itemData) {
      return <KeptTodo data={itemData} update={this.props.update} />;
    }
  },

  getComponent: function(data) {
    return this._components[data.type].call(this, data);
  },

  handleClickEdit: function() {
    this.props.edit(this.props.itemData);
  },

  handleClickDelete: function() {
    this.props.remove(this.props.itemData);
  },

  render: function() {
    return (
      <KeptPanel title={this.props.itemData.title}
                 handleClickEdit={this.handleClickEdit}
                 handleClickDelete={this.handleClickDelete}>
        {this.getComponent(this.props.itemData)}
      </KeptPanel>
    );
  }
});

var KeptText = React.createClass({
  render: function() {
    var data = this.props.data;
    return (
      <div className="text-entry">
        <div className="text-entry-text">{data.text}</div>
      </div>
    );
  }
});

var KeptTextForm = React.createClass({
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
      <form role="form" onSubmit={this.handleSubmit}>
        <input type="hidden" ref="id" defaultValue={data.id} />
        <h3>Create new Text</h3>
        <div className="form-group">
          <input ref="title" type="text" className="form-control" placeholder="Title" defaultValue={data.title} />
        </div>
        <div className="form-group">
          <textarea ref="text" className="form-control" placeholder="Text…" defaultValue={data.text} rows="5" required />
        </div>
        <div className="form-group">
          <button type="submit" className="btn btn-primary">OK</button>
          &nbsp;
          <a href="#" onClick={this.handleCancel}>Cancel</a>
        </div>
      </form>
    );
  }
});

var ProgressBar = React.createClass({
  getDefaultProps: function() {
    return {
      minValue: 0,
      maxValue: 100
    };
  },

  render: function() {
    return (
      <div className="progress">
        <div className="progress-bar"
             role="progressbar"
             aria-valuenow={this.props.value}
             aria-valuemin={this.props.minValue}
             aria-valuemax={this.props.maxValue}
             style={{width: this.props.value + "%"}}>
          <span>{this.props.value}%</span>
        </div>
      </div>
    );
  }
});

var KeptTodo = React.createClass({
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
    this.props.update({
      type: "todo",
      id: this.props.data.id,
      title: this.props.data.title,
      tasks: tasks
    });
    this.setState({tasks: tasks});
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
    var progress = 60;
    return (
      <div>
        <ProgressBar value={this.getProgress()} />
        <ul className="list-group">{
          this.state.tasks.map(function(task, key) {
            return <KeptTodoTask key={key} data={task} toggle={this.toggle} />
          }.bind(this))
        }</ul>
        <p><a href="#" onClick={this.clearCompleted}>Clear completed</a></p>
      </div>
    );
  }
});

var KeptTodoTask = React.createClass({
  handleChange: function() {
    this.props.toggle(this.props.key);
  },

  render: function() {
    var data = this.props.data;
    return (
      <li className="list-group-item">
        <label className={data.done ? "done" : ""}>
          <input type="checkbox" ref="done" onChange={this.handleChange} checked={data.done ? "checked" : ""} />
          <span className="todo-item-label">{data.label}</span>
        </label>
      </li>
    );
  }
});

var KeptTodoForm = React.createClass({
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
      <form className="todo-form" role="form" onSubmit={this.handleSubmit}>
        <input type="hidden" ref="id" defaultValue={this.props.data.id} />
        <h3>Create new Todo</h3>
        <div className="form-group">
          <input ref="title" type="text" className="form-control" placeholder="Title" defaultValue={this.props.data.title} />
        </div>
        <ul className="list-group">{
          this.state.tasks.map(function(task, key) {
            return <KeptTodoTaskForm key={key} data={task} updateTask={this.updateTask} removeTask={this.removeTask} />
          }, this)
        }</ul>
        <div className="form-group">
          <button className="btn btn-default" onClick={this.addTask}>Add task</button>
          &nbsp;
          <button className="btn btn-primary" type="submit">Save</button>
          &nbsp;
          <a href="#" onClick={this.handleCancel}>Cancel</a>
        </div>
      </form>
    );
  }
});

var KeptTodoTaskForm = React.createClass({
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
      <li className="form-inline list-group-item form-group">
        <input ref="done" type="checkbox" onChange={this.handleUpdate} checked={data.done ? "checked" : ""} />
        &nbsp;&nbsp;&nbsp;
        <input ref="label" type="text" className="form-control" size="100" placeholder="Label…" defaultValue={data.label}
               onBlur={this.handleUpdate} />
        &nbsp;&nbsp;&nbsp;
        <a className="btn btn-danger" onClick={this.handleRemove}>
          <span className="glyphicon glyphicon-remove"></span>
        </a>
      </li>
    );
  }
});

React.renderComponent(<KeptApp/>, document.getElementById('kept'));
