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

var React = require('react');

var Button = require('react-bootstrap/lib/Button');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');

var mushi = require('../../common');

var Pager = require('../Pager');
var SetIntervalMixin = require('../Mixins').SetIntervalMixin;

var IssueModalForm = require('./ModalForm');
var IssueListFilter = require('./ListFilter');
var IssueListItem = require('./ListItem');

var IssueList = React.createClass({
    mixins: [SetIntervalMixin],

    getIssueCount: function() {
        mushi.api.get(this.props.endpoint, {
            dataType: 'json',
            data: {
                filters: this.state.filters,
                count: true
            },
            cache: false,
            success: function(response) {
                this.setState({count: response.count});
            }.bind(this)
        });
    },

    loadIssues: function() {
        mushi.api.get(this.props.endpoint, {
            dataType: 'json',
            data: {
                filters: this.state.filters,
                limit: this.props.limit,
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
            filters: 'status:open',
            offset: 0,
            count: 0
        };
    },

    componentDidMount: function() {
        this.getIssueCount();
        this.loadIssues();

        this.setInterval(this.getIssueCount, this.props.poll_interval);
        this.setInterval(this.loadIssues, this.props.poll_interval);
    },

    handleFiltersChange: function(filters_value) {
        this.state.filters = filters_value;
        this.loadIssues();
    },

    handlePaginate: function(page) {
        this.setState({offset: page * this.props.limit}, function() {
            this.loadIssues();
        });
    },

    handleCreate: function(new_milestone) {
        mushi.api.post(this.props.endpoint, {
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(new_milestone),
            success: function(response) {
                this.state.data.unshift(response);
                this.setState(this.state);
            }.bind(this)
        });
    },

    render: function() {
        var list_items = (function(list_data) {
            var rv = list_data.map(function(item) {
                return <IssueListItem key={item.uid} {...item} />;
            });

            if (rv.length > 0) {
                return rv;
            } else {
                return (
                    <div className="alert alert-info" role="alert">
                        <i className="fa fa-info-circle"></i> {"There are no issues matching the criteria."}
                    </div>
                );
            }
        })(this.state.data);

        return(
            <article className="mu-component mu-list-wrapper col-md-12">
                <div className="panel panel-default">
                    <header className="panel-heading clearfix">
                        <div className="pull-left">
                            <h2><i className="fa fa-exclamation-circle"></i> Issues</h2>
                        </div>
                        <div className="pull-right">
                            <span className="mu-filter-wrapper">
                                <IssueListFilter
                                    value={this.state.filters}
                                    onFiltersChange={this.handleFiltersChange}
                                />
                            </span>
                            <span className="mu-button-wrapper">
                                <ModalTrigger
                                    modal={<IssueModalForm
                                        title="Create a new issue"
                                        submitText="Create" submitStyle="success"
                                        hideMilestone={this.props.hideMilestone}
                                        onModalSubmit={this.handleCreate}
                                    />}
                                >
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

                    <footer className="panel-footer text-right">
                        <Pager
                            limit={this.props.limit}
                            offset={this.state.offset}
                            count={this.state.count}
                            pagesShown={3}
                            onPaginate={this.handlePaginate}
                        />
                    </footer>
                </div>
            </article>
        );
    }
});

module.exports = IssueList;
