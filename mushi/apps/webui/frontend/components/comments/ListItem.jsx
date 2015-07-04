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

var moment = require('moment');

var Button = require('react-bootstrap/lib/Button');

var mushi = require('../../common');

var CommentListItem = React.createClass({
    getInitialState: function() {
        return this.props;
    },

        var issue = (function(issue) {
            if (issue) {
                return (
                    <span className="mu-comment-meta-item">
                        in <a className="mu-app-link" href={'#issues/' + issue.uid}>{issue.name}</a>
                    </span>
                );
            } else {
                return <span />;
            }
        })(this.state.issue);

        var author = (function(author) {
            if (author) {
                return <span>by <a className="mu-app-link" href={'#authors' + author.email}>{author.name}</a></span>;
            } else {
                return <span />;
            }
        })(this.state.author);

        var updated_at = (function(updated_at) {
            return <span>{moment(updated_at * 1000).fromNow()}</span>;
        })(this.state.updated_at);

        return (
            <div className="mu-list-item clearfix">
                <div className="mu-comment-content">
                    <div className="mu-comment-meta">
                        <div className="mu-comment-meta-item">
                            #{this.state.uid} {this.state.last_action} {author} {updated_at} {issue}
                        </div>
                        {tags}
                    </div>
                </div>
                <div className="mu-comment-actions">{comment_action}</div>
            </div>
        );
    }
});

module.exports = CommentListItem;
