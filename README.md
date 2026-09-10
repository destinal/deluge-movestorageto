# MoveStorageTo

A Deluge 1.3 plugin that adds a **Move Storage To** submenu to the torrent
right-click menu in the web UI, listing the folders under `~/media` by name.
Selecting one calls the same `core.move_storage` RPC as the built-in
"Move Storage" dialog, without the dialog.

## Why

The built-in dialog is a free-text path field. Typing it wrong is easy, and
an empty value silently fails on the daemon:

    Could not move storage for torrent d6859c6f... since  does not exist
    and could not create the directory: [Errno 2] ... ''

The submenu makes a bad destination unrepresentable.

## Layout

    movestorageto/core.py    runs in deluged; exports get_media_folders()
    movestorageto/webui.py   runs in deluge-web; registers the script
    movestorageto/data/movestorageto.js   the submenu and the move call

The folder list is read at runtime, so new directories under `~/media` appear
without editing the plugin. Only the bare name is shown; the full path is
rebuilt at click time.

A core component is required even though the feature is entirely web-side:
deluge-web takes its enabled-plugin list from the daemon
(`client.core.get_enabled_plugins()`), not from `web.conf`.

## Build and install

    python setup.py bdist_egg
    cp dist/MoveStorageTo-*.egg ~/.config/deluge/plugins/
    pkill -fu "$(whoami)" deluged && sleep 3 && deluged

Then enable it:

    deluge-console "connect 127.0.0.1:<port> <user> <pass>; plugin -e MoveStorageTo"

`deluge-web` picks the script up on its next start. On a Feral slot you cannot
restart the web UI yourself; the supervisor restarts it within five minutes.

## Notes

- Targets Deluge 1.3.15 on Python 2.7 with ExtJS 3.
- The move applies to every selected torrent, same as the built-in.
- Deluge gives no UI feedback for a move. Enable the hidden **Path** column
  (column header dropdown, Columns, Path) to watch `save_path` change; the web
  UI polls every 2 seconds, so no page reload is needed.
