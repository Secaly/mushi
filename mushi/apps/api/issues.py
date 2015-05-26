# Copyright 2015 Dimitri Racordon
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from flask import Blueprint, abort, current_app, jsonify, request

from sqlalchemy.orm.exc import NoResultFound

from werkzeug.exceptions import BadRequest

from mushi.core.auth import require_auth_token
from mushi.core.db import db_session
from mushi.core.db.models import Issue
from mushi.core.utils.http import jsonify_list

from .exc import ApiError


bp = Blueprint('issues', __name__)


@bp.route('/issues/')
@require_auth_token
def list_issues(auth_token):
    limit = request.args.get('limit')
    offset = request.args.get('offset')

    query = db_session.query(Issue)
    if limit is not None:
        query = query.limit(limit)
    if offset is not None:
        query = query.offset(offset)

    rv = [m.to_dict(max_depth=2) for m in query]
    return jsonify_list(rv)


@bp.route('/issues/', methods=['POST'])
@require_auth_token
def create_issue(auth_token):
    try:
        post_data = request.get_json(force=True)
    except BadRequest as e:
        raise ApiError(e.description)

    new_issue = Issue()
    new_issue.update(post_data)

    db_session.add(new_issue)
    db_session.commit()

    return jsonify(new_issue.to_dict(max_depth=2))


@bp.route('/issues/<uid>')
@require_auth_token
def show_issue(auth_token, uid):
    try:
        issue = db_session.query(Issue).filter(Issue.uid == uid).one()
    except NoResultFound:
        abort(404)

    return jsonify(issue.to_dict(max_depth=2))


@bp.route('/issues/<uid>', methods=['POST', 'PUT'])
@require_auth_token
def update_issue(auth_token, uid):
    try:
        issue = db_session.query(Issue).filter(Issue.uid == uid).one()
    except NoResultFound:
        abort(404)

    try:
        post_data = request.get_json(force=True)
    except BadRequest as e:
        raise ApiError(e.description)

    issue.update(post_data)

    db_session.commit()

    return jsonify(issue.to_dict(max_depth=2))


@bp.route('/issues/<uid>', methods=['DELETE'])
@require_auth_token
def delete_issue(auth_token, uid):
    try:
        db_session.query(Issue).filter(Issue.uid == uid).delete()
    except NoResultFound:
        abort(404)

    db_session.commit()

    return '', 204
