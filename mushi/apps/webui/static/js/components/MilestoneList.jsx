/* Copyright 2015 Dimitri Racordon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var ModalTrigger = ReactBootstrap.ModalTrigger;
var Button = ReactBootstrap.Button;

var MilestoneListFilterItem = React.createClass({
    handleClick: function(e) {
        e.preventDefault();
        this.props.onSelect(this.props.value);
    },

    render: function() {
        return <li><a href="#" onClick={this.handleClick}>{this.props.label}</a></li>;
    }
});

var MilestoneListFilter = React.createClass({
    getInitialState: function() {
        return {
            value: this.props.value,
        };
    },

    componentDidMount: function() {
        $(document.body).on('keydown', this.handleKeyDown);
    },

    componentWillUnMount: function() {
        $(document.body).off('keydown', this.handleKeyDown);
    },

    handleDropdown: function(value) {
        this.setState(
            {value: value},
            function() {
                this.props.onFiltersChange(value);
            }
        );
    },

    handleChange: function(e) {
        this.setState({value: e.target.value});
    },

    handleKeyDown: function(e) {
        if (e.keyCode == 13) {
            this.props.onFiltersChange(this.state.value);
        }
    },

    render: function() {
        return (
        <div className="input-group">
          <div className="input-group-btn">
            <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
              <i className="fa fa-search"></i> <span className="caret"></span>
            </button>
            <ul className="dropdown-menu" role="menu">
              <MilestoneListFilterItem onSelect={this.handleDropdown} value="status:open" label="Open" />
              <MilestoneListFilterItem onSelect={this.handleDropdown} value="status:closed" label="Closed" />
            </ul>
          </div>
          <input
            type="search" className="form-control" aria-label="Filter results"
            placeholder="Filter results" value={this.state.value} onChange={this.handleChange}
          />
        </div>
        );
    }
});

var MilestoneList = React.createClass({
    loadMilestones: function() {
        mushi.api.get(this.props.endpoint, {
            dataType: 'json',
            data: {
                filters: this.state.filters,
                limit: this.state.limit,
                offset: this.state.offset
            },
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this)
        });
    },

    getInitialState: function() {
        return {
            data: [],
            filters: null,
            limit: 5,
            offset: 0
        };
    },

    componentDidMount: function() {
        this.loadMilestones();
        setInterval(this.loadMilestones, this.props.poll_interval);
    },

    handleFiltersChange: function(filters_value) {
        this.state.filters = filters_value;
        this.loadMilestones();
    },

    handleCreate: function(new_milestone) {
        mushi.api.post(this.props.endpoint, {
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(new_milestone),
            success: function(response) {
                this.state.data.push(response);
                this.setState(this.state);
            }.bind(this)
        });
    },

    render: function() {
        list_items = (function(list_data) {
            var rv = list_data.map(function(item) {
                return <MilestoneListItem key={item.slug} {...item} />;
            });

            if (rv.length > 0) {
                return rv;
            } else {
                return (
                <div className="alert alert-info" role="alert">
                  <i className="fa fa-info-circle"></i> {"There are no milestones matching the criteria."}
                </div>
                );
            }
        })(this.state.data);

        return(
        <article className="mu-component mu-list-wrapper col-md-12">
          <div className="panel panel-default">
            <header className="panel-heading clearfix">
              <div className="pull-left">
                <h2><i className="fa fa-list"></i> Milestones</h2>
              </div>
              <div className="pull-right">
                <span className="mu-filter-wrapper">
                  <MilestoneListFilter value={this.state.filters} onFiltersChange={this.handleFiltersChange} />
                </span>
                <span className="mu-button-wrapper">
                  <ModalTrigger modal={<MilestoneFormModal onModalSubmit={this.handleCreate} title="Create a new milestone" submitText="Create" submitStyle="success" />}>
                    <Button bsStyle='success'><i className="fa fa-plus"></i></Button>
                  </ModalTrigger>
                </span>
              </div>
            </header>

            <div className="panel-body">
              <div id="mu-todo-list" className="mu-list">
                {list_items}
              </div>
            </div>
          </div>
        </article>
        )
    }
});
