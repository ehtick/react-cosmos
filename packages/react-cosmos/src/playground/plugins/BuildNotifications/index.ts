import { createPlugin, PluginContext } from 'react-plugin';
import { BuildMessage } from '../../../server/serverMessage';
import { MessageType } from '../../../utils/types';
import { MessageHandlerSpec } from '../MessageHandler/spec';
import { NotificationsSpec } from '../Notifications/spec';
import { BuildNotificationsSpec } from './spec';

type BuildNotificationsContext = PluginContext<BuildNotificationsSpec>;

const { on, register } = createPlugin<BuildNotificationsSpec>({
  name: 'buildNotifications',
});

on<MessageHandlerSpec>('messageHandler', {
  serverMessage: onServerMessage,
});

register();

function onServerMessage(context: BuildNotificationsContext, msg: MessageType) {
  const { getMethodsOf } = context;
  const notifications = getMethodsOf<NotificationsSpec>('notifications');

  const buildMsg = msg as BuildMessage;
  switch (buildMsg.type) {
    case 'buildStart':
      return notifications.pushStickyNotification({
        id: 'build',
        type: 'loading',
        title: 'Rebuilding...',
        info: 'Your code is updating.',
      });

    case 'buildError':
      return notifications.pushStickyNotification({
        id: 'build',
        type: 'error',
        title: 'Build failed',
        info: 'Check your terminal for more information.',
      });

    case 'buildDone':
      return notifications.removeStickyNotification('build');

    default:
    // Nada
  }
}