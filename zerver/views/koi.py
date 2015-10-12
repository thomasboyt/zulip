import logging
import simplejson
import time

from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response
from django.template import RequestContext

from django.conf import settings
from zerver.models import get_client, UserMessage
from zerver.lib.actions import do_events_register
from zerver.lib.avatar import avatar_url

from zerver.views import(
    name_changes_disabled,
    approximate_unread_count,
    sent_time_in_epoch_seconds
)


@login_required(login_url = settings.HOME_NOT_LOGGED_IN)
def home(request):
    # We need to modify the session object every two weeks or it will expire.
    # This line makes reloading the page a sufficient action to keep the
    # session alive.
    request.session.modified = True

    user_profile = request.user
    request._email = request.user.email
    request.client = get_client("website")

    register_ret = do_events_register(user_profile, request.client,
                                      apply_markdown=True)
    user_has_messages = (register_ret['max_message_id'] != -1)

    if user_profile.pointer == -1:
        latest_read = None
    else:
        try:
            latest_read = UserMessage.objects.get(user_profile=user_profile,
                                                  message__id=user_profile.pointer)
        except UserMessage.DoesNotExist:
            # Don't completely fail if your saved pointer ID is invalid
            logging.warning("%s has invalid pointer %s" % (user_profile.email, user_profile.pointer))
            latest_read = None

    desktop_notifications_enabled = user_profile.enable_desktop_notifications

    if user_profile.realm.notifications_stream:
        notifications_stream = user_profile.realm.notifications_stream.name
    else:
        notifications_stream = ""

    page_params = dict(
        poll_timeout          = settings.POLL_TIMEOUT,

        # Pointer & message info

        initial_pointer       = register_ret['pointer'],
        initial_servertime    = time.time(), # Used for calculating relative presence age

        event_queue_id        = register_ret['queue_id'],
        last_event_id         = register_ret['last_event_id'],
        max_message_id        = register_ret['max_message_id'],
        unread_count          = approximate_unread_count(user_profile),
        furthest_read_time    = sent_time_in_epoch_seconds(latest_read),

        # Stream info

        subscribed_streams    = register_ret['subscriptions'],
        unsubscribed_streams  = register_ret['unsubscribed'],

        # People info

        people_list           = register_ret['realm_users'],
        bot_list              = register_ret['realm_bots'],
        initial_presences     = register_ret['presences'],

        # Realm info

        realm_name            = register_ret['realm_name'],
        realm_emoji           = register_ret['realm_emoji'],
        notifications_stream  = notifications_stream,

        realm_settings = dict(
            mandatory_topics      = user_profile.realm.mandatory_topics,
            name_changes_disabled = name_changes_disabled(user_profile.realm)
        ),

        # User info

        have_initial_messages = user_has_messages,

        user_profile = dict(
            full_name = user_profile.full_name,
            email = user_profile.email,
            avatar_url = avatar_url(user_profile),
        ),

        user_settings = dict(
            # Stream message notification settings:
            stream_desktop_notifications_enabled =
                user_profile.enable_stream_desktop_notifications,
            stream_sounds_enabled = user_profile.enable_stream_sounds,

            # Private message and @-mention notification settings:
            desktop_notifications_enabled = desktop_notifications_enabled,
            sounds_enabled =
                user_profile.enable_sounds,
            enable_offline_email_notifications =
                user_profile.enable_offline_email_notifications,
            enable_offline_push_notifications =
                user_profile.enable_offline_push_notifications,
            twenty_four_hour_time = register_ret['twenty_four_hour_time'],

            enable_digest_emails  = user_profile.enable_digest_emails,

            alert_words           = register_ret['alert_words'],
            muted_topics          = register_ret['muted_topics'],
            realm_filters         = register_ret['realm_filters'],

            autoscroll_forever = user_profile.autoscroll_forever,
            default_desktop_notifications = user_profile.default_desktop_notifications,
        ),

        user_permissions = dict(
            can_create_streams    = user_profile.can_create_streams(),
            is_admin              = user_profile.is_admin()
        )
    )

    response = render_to_response(
        "koi/index.html",
        {'page_params': simplejson.encoder.JSONEncoderForHTML().encode(page_params)},
        context_instance=RequestContext(request))

    return response
