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
var Input = require('react-bootstrap/lib/Input');
var Modal = require('react-bootstrap/lib/Modal');

var mushi = require('../../common');

var DropzoneWrapper = require('../DropzoneWrapper');

var CommentInputMixin = {
    getInitialState: function() {
        return {
            value: this.props.value,
            is_valid: (Boolean(this.props.value) || !this.props.required),
            bsStyle: null
        };
    },

    getValue: function() {
        return this.state.value;
    },

    handleChange: function(e) {
        this.setState({value: e.target.value});
    }
};

var CommentLabelInput = React.createClass({
    mixins: [CommentInputMixin],

    validate: function(value) {
        this.state.is_valid = Boolean(value);
        this.state.bsStyle = this.state.is_valid ? null : 'error';

        // Calling setState raises an exception when the enclosing modal is
        // closed immediately after `validate` has been called. A similar
        // unless identical issue has been reported on react's github:
        // https://github.com/facebook/react/issue/2410

        this.setState(this.state);
        return this.state.is_valid;
    },

    handleBlur: function(e) {
        this.validate(e.target.value);
    },

    render: function() {
        return (
            <Input
                {...this.props} type="text" label="Label" placeholder="Enter Label"
                bsStyle={this.state.bsStyle} value={this.state.value}
                onChange={this.handleChange} onBlur={this.handleBlur}
            />
        );
    }
});


var CommentContentInput = React.createClass({
    mixins: [CommentInputMixin],

    validate: function(value) {
        return true;
    },

    render: function() {
        return (
            <Input
                {...this.props} type="textarea" label="Content (optional)"
                placeholder="Enter content"
                bsStyle={this.state.bsStyle} value={this.state.value}
                onChange={this.handleChange}
            />
        );
    }
});


var CommentIssueInput = React.createClass({
    mixins: [CommentInputMixin],

    loadIssues: function() {
        mushi.api.get(this.props.endpoint + '?max-depth=1', {
            dataType: 'json',
            cache: false,
            success: function(response) {
                this.setState({issues: response});
            }.bind(this)
        });
    },

    getInitialState: function() {
        return {'issues': []};
    },

    componentDidMount: function() {
        this.loadIssues();
    },

    validate: function(value) {
        return true;
    },

    render: function() {
        var options = [<option value="" key="no-issue">No issue</option>].concat(
            this.state.issues.map(function(item) {
                return <option value={item.uid} key={item.uid}>{item.name}</option>;
            })
        );

        return (
            <Input
                {...this.props} type="select" label="Issue (optional)"
                bsStyle={this.state.bsStyle} value={this.state.value}
                onChange={this.handleChange}
            >
                {options}
            </Input>
        );
    }
});

var CommentAttachmentsInput = React.createClass({
    getValue: function() {
        return this.refs.dropzone.getValue();
    },

    validate: function(value) {
        return true;
    },

    render: function() {
        return (
            <div className="form-group clearfix">
                <label className="control-label">Attachments</label>
                <DropzoneWrapper ref="dropzone" thumbnails={this.props.thumbnails} />
            </div>
        );
    }
});

var CommentModalForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();

        // Retrieve form values.
        var data = {};
        var is_valid = true;

        for (var input_name in this.refs) {
            var input = this.refs[input_name];
            data[input_name] = input.getValue();

            // Exit if there are format validation errors.
            is_valid = is_valid && input.validate(data[input_name]);
        }

        if (!is_valid) {
            return;
        }

        this.props.onModalSubmit(data);
        this.props.onRequestHide();
        return;
    },

    render: function() {
        if (this.props.hideIssue) {
            var issue_input = <span />;
        } else {
            var issue_uid = (function(issue) {
                if (issue) {
                    return issue.uid;
                } else {
                    return null;
                }
            })(this.props.issue);

            var issue_input = (
            <CommentIssueInput ref="issue" endpoint='issues/' value={issue_uid} />
            );
        }

        return (
            <Modal {...this.props}>
                <form onSubmit={this.handleSubmit}>
                    <div className="modal-body">
                        <CommentLabelInput ref="label" value={this.props.label} required />
                        <CommentContentInput ref="content" value={this.props.content} />
                        <CommentAttachmentsInput ref="attachments" thumbnails={this.props.attachments} />
                    </div>
                    <div className="modal-footer">
                        <Button onClick={this.props.onRequestHide}>Cancel</Button>
                        <Button type="submit" bsStyle={this.props.submitStyle}>{this.props.submitText}</Button>
                    </div>
                </form>
            </Modal>
        );
    }
});

module.exports = CommentModalForm;
