/* eslint quotes: 0, no-multi-spaces: 0, space-unary-ops: 0, space-infix-ops: 0, no-fallthrough: 0 */

import _ from 'lodash';
import { inHomeView } from '../reducers/streams';
import store from '../config/store';

// Avoid URI decode errors by removing characters from the end
// one by one until the decode succeeds.  This makes sense if
// we are decoding input that the user is in the middle of
// typing.
function robust_uri_decode(str) {
    var end = str.length;
    while (end > 0) {
        try {
            return decodeURIComponent(str.substring(0, end));
        } catch (e) {
            if (!(e instanceof URIError)) {
                throw e;
            }
            end--;
        }
    }
    return '';
}

function message_in_home(message) {
    if (message.type === "private" || message.mentioned) {
        return true;
    }

    return inHomeView(store.getState().streams, message.stream);
}

function message_matches_search_term(message, operator, operand) {
    switch (operator) {
    case 'is':
        if (operand === 'private') {
            return (message.type === 'private');
        } else if (operand === 'starred') {
            return message.starred;
        } else if (operand === 'mentioned') {
            return message.mentioned;
        } else if (operand === 'alerted') {
            return message.alerted;
        }
        return true; // is:whatever returns true

    case 'in':
        if (operand === 'home') {
            return message_in_home(message);
        }
        else if (operand === 'all') {
            return true;
        }
        return true; // in:whatever returns true

    case 'near':
        // this is all handled server side
        return true;

    case 'id':
        return (message.id.toString() === operand);

    case 'stream':
        if (message.type !== 'stream') {
            return false;
        }

        operand = operand.toLowerCase();
        return (message.stream.toLowerCase() === operand);

    case 'topic':
        if (message.type !== 'stream') {
            return false;
        }

        operand = operand.toLowerCase();
        return (message.subject.toLowerCase() === operand);

    case 'sender':
        return (message.sender_email.toLowerCase() === operand);

    case 'pm-with':
        return (message.type === 'private') &&
            (message.reply_to.toLowerCase() === operand.split(',').sort().join(','));
    }

    return true; // unknown operators return true (effectively ignored)
}


export default function Filter(operators) {
    if (operators === undefined) {
        this._operators = [];
    } else {
        this._operators = this._canonicalize_operators(operators);
    }
}

var canonical_operators = {"from": "sender", "subject": "topic"};

Filter.canonicalize_operator = function (operator) {
    operator = operator.toLowerCase();
    if (canonical_operators.hasOwnProperty(operator)) {
        return canonical_operators[operator];
    } else {
        return operator;
    }
};

Filter.canonicalize_term = function (opts) {
    var negated = opts.negated;
    var operator = opts.operator;
    var operand = opts.operand;

    // Make negated be explictly false for both clarity and
    // simplifying deepEqual checks in the tests.
    if (!negated) {
        negated = false;
    }

    operator = Filter.canonicalize_operator(operator);

    switch (operator) {
    case 'has':
        // images -> image, etc.
        operand = operand.replace(/s$/, '');
        break;

    case 'stream':
        break;
    case 'topic':
        break;
    case 'sender':
    case 'pm-with':
        operand = operand.toString().toLowerCase();
        if (operand === 'me') {
            // TODO: Use a user profile reducer
            operand = window.pageParams.profile.email;
        }
        break;
    case 'search':
        // The mac app automatically substitutes regular quotes with curly
        // quotes when typing in the search bar.  Curly quotes don't trigger our
        // phrase search behavior, however.  So, we replace all instances of
        // curly quotes with regular quotes when doing a search.  This is
        // unlikely to cause any problems and is probably what the user wants.
        operand = operand.toString().toLowerCase().replace(/[\u201c\u201d]/g, '"');
        break;
    default:
        operand = operand.toString().toLowerCase();
    }

    // We may want to consider allowing mixed-case operators at some point
    return {
        negated: negated,
        operator: operator,
        operand: operand
    };
};



/* We use a variant of URI encoding which looks reasonably
   nice and still handles unambiguously cases such as
   spaces in operands.

   This is just for the search bar, not for saving the
   narrow in the URL fragment.  There we do use full
   URI encoding to avoid problematic characters. */
function encodeOperand(operand) {
    return operand.replace(/%/g,  '%25')
                  .replace(/\+/g, '%2B')
                  .replace(/ /g,  '+');
}

function decodeOperand(encoded, operator) {
    if (operator !== 'pm-with' && operator !== 'sender') {
        encoded = encoded.replace(/\+/g, ' ');
    }
    return robust_uri_decode(encoded);
}

// Parse a string into a list of operators (see below).
export function parse(str) {
    var operators   = [];
    var search_term = [];
    var negated;
    var operator;
    var operand;
    var term;

    var matches = str.match(/"[^"]+"|\S+/g);
    if (matches === null) {
        return operators;
    }
    _.each(matches, function (token) {
        var parts, operator;
        parts = token.split(':');
        if (token[0] === '"' || parts.length === 1) {
            // Looks like a normal search term.
            search_term.push(token);
        } else {
            // Looks like an operator.
            // FIXME: Should we skip unknown operator names here?
            negated = false;
            operator = parts.shift();
            if (operator[0] === '-') {
                negated = true;
                operator = operator.slice(1);
            }
            operand = decodeOperand(parts.join(':'), operator);
            term = {negated: negated, operator: operator, operand: operand};
            operators.push(term);
        }
    });
    // NB: Callers of 'parse' can assume that the 'search' operator is last.
    if (search_term.length > 0) {
        operator = 'search';
        operand = search_term.join(' ');
        term = {operator: operator, operand: operand, negated: false};
        operators.push(term);
    }
    return operators;
};

/* Convert a list of operators to a string.
   Each operator is a key-value pair like

       ['subject', 'my amazing subject']

   These are not keys in a JavaScript object, because we
   might need to support multiple operators of the same type.
*/
export function unparse(operators) {
    var parts = _.map(operators, function (elem) {

        if (elem.operator === 'search') {
            // Search terms are the catch-all case.
            // All tokens that don't start with a known operator and
            // a colon are glued together to form a search term.
            return elem.operand;
        } else {
            var sign = elem.negated ? '-' : '';
            return sign + elem.operator + ':' + encodeOperand(elem.operand.toString());
        }
    });
    return parts.join(' ');
};



Filter.prototype = {
    predicate: function Filter_predicate() {
        if (this._predicate === undefined) {
            this._predicate = this._build_predicate();
        }
        return this._predicate;
    },

    operators: function Filter_operators() {
        return this._operators;
    },

    public_operators: function Filter_public_operators() {
        var safe_to_return = _.filter(this._operators, function (value) {
            // Filter out the embedded narrow (if any).
            return !(page_params.narrow_stream !== undefined &&
                     value.operator === "stream" &&
                     value.operand.toLowerCase() === page_params.narrow_stream.toLowerCase());
        });
        return safe_to_return;
    },

    operands: function Filter_get_operands(operator) {
        return _.chain(this._operators)
            .filter(function (elem) { return !elem.negated && (elem.operator === operator); })
            .map(function (elem) { return elem.operand; })
            .value();
    },

    has_operand: function Filter_has_operand(operator, operand) {
        return _.any(this._operators, function (elem) {
            return !elem.negated && (elem.operator === operator && elem.operand === operand);
        });
    },

    has_operator: function Filter_has_operator(operator) {
        return _.any(this._operators, function (elem) {
            if (elem.negated && (!_.contains(['search', 'has'], elem.operator))) {
                return false;
            }
            return elem.operator === operator;
        });
    },

    is_search: function Filter_is_search() {
        return this.has_operator('search');
    },

    can_apply_locally: function Filter_can_apply_locally() {
        return (!this.is_search()) && (!this.has_operator('has'));
    },

    _canonicalize_operators: function Filter__canonicalize_operators(operators_mixed_case) {
        return _.map(operators_mixed_case, function (tuple) {
            return Filter.canonicalize_term(tuple);
        });
    },

    filter_with_new_topic: function Filter_filter_with_new_topic(new_topic) {
        var terms = _.map(this._operators, function (term) {
            var new_term = _.clone(term);
            if (new_term.operator === 'topic' && !new_term.negated) {
                new_term.operand = new_topic;
            }
            return new_term;
        });
        return new Filter(terms);
    },

    has_topic: function Filter_has_topic(stream_name, topic) {
        return this.has_operand('stream', stream_name) && this.has_operand('topic', topic);
    },

    // Build a filter function from a list of operators.
    _build_predicate: function Filter__build_predicate() {
        var operators = this._operators;

        if (! this.can_apply_locally()) {
            return function () { return true; };
        }

        // FIXME: This is probably pretty slow.
        // We could turn it into something more like a compiler:
        // build JavaScript code in a string and then eval() it.

        return function (message) {
            return _.all(operators, function (term) {
                var ok = message_matches_search_term(message, term.operator, term.operand);
                if (term.negated) {
                    ok = !ok;
                }
                return ok;
            });
        };
    }
};

Filter.operator_to_prefix = function (operator, negated) {
    var verb;

    if (operator === 'search') {
        return negated ? 'Exclude' : 'Search for';
    }

    verb = negated ? 'Exclude ' : 'Narrow to ';

    switch (operator) {
    case 'stream':
        return verb + 'stream';

    case 'near':
        return verb + 'messages around';

    case 'has':
        return verb + 'messages with one or more';

    case 'id':
        return verb + 'message ID';

    case 'topic':
        return verb + 'topic';

    case 'sender':
        return verb + 'messages sent by';

    case 'pm-with':
        return verb + 'private messages with';

    case 'in':
        return verb + 'messages in';
    }
    return '';
};

// Convert a list of operators to a human-readable description.
Filter.describe = function (operators) {
    if (operators.length === 0) {
        return 'Go to Home view';
    }

    var parts = [];

    if (operators.length >= 2) {
        var is = function (term, expected) {
            return (term.operator === expected) && !term.negated;
        };

        if (is(operators[0], 'stream') && is(operators[1], 'topic')) {
            var stream = operators[0].operand;
            var topic = operators[1].operand;
            var part = 'Narrow to ' + stream + ' > ' + topic;
            parts = [part];
            operators = operators.slice(2);
        }
    }

    var more_parts = _.map(operators, function (elem) {
        var operand = elem.operand;
        var canonicalized_operator = Filter.canonicalize_operator(elem.operator);
        if (canonicalized_operator ==='is') {
            var verb = elem.negated ? 'Exclude ' : 'Narrow to ';
            if (operand === 'private') {
                return verb + 'all private messages';
            } else if (operand === 'starred') {
                return verb + 'starred messages';
            } else if (operand === 'mentioned') {
                return verb + 'mentioned messages';
            } else if (operand === 'alerted') {
                return verb + 'alerted messages';
            }
        } else {
            var prefix_for_operator = Filter.operator_to_prefix(canonicalized_operator, elem.negated);
            if (prefix_for_operator !== '') {
                return prefix_for_operator + ' ' + operand;
            }
        }
        return 'Narrow to (unknown operator)';
    });
    return parts.concat(more_parts).join(', ');
};
