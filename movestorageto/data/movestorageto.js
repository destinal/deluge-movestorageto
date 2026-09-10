/*
 * movestorageto.js
 *
 * Adds a "Move Storage To" submenu to the torrent context menu, listing the
 * folders under ~/media by name. Selecting one calls the same
 * core.move_storage RPC the built-in "Move Storage" dialog uses, skipping the
 * dialog entirely.
 */
Ext.ns('Deluge.plugins');

Deluge.plugins.MoveStorageToPlugin = Ext.extend(Deluge.Plugin, {

    name: 'MoveStorageTo',

    onEnable: function() {
        this.folderMenu = new Ext.menu.Menu({
            items: [{text: _('Loading...'), disabled: true}]
        });

        // Refresh on every open so folders added since page load show up.
        this.folderMenu.on('beforeshow', this.onFolderMenuShow, this);

        this.menuItem = new Ext.menu.Item({
            text: _('Move Storage To'),
            iconCls: 'icon-move',
            menu: this.folderMenu
        });

        deluge.menus.torrent.add(this.menuItem);
    },

    onDisable: function() {
        deluge.menus.torrent.remove(this.menuItem);
        this.menuItem = null;
        this.folderMenu = null;
    },

    onFolderMenuShow: function() {
        deluge.client.movestorageto.get_media_folders({
            success: this.onFoldersLoaded,
            failure: this.onFoldersFailed,
            scope: this
        });
    },

    onFoldersLoaded: function(result) {
        var menu = this.folderMenu;
        menu.removeAll();

        if (!result || !result.folders || !result.folders.length) {
            menu.add({text: _('(no folders found)'), disabled: true});
            return;
        }

        Ext.each(result.folders, function(name) {
            menu.add({
                text: name,
                iconCls: 'icon-move',
                // Full path is rebuilt here; only the bare name is displayed.
                handler: this.onFolderClick.createDelegate(
                    this, [result.root + '/' + name])
            });
        }, this);

        // Ext sizes the menu on first render; force a re-layout after refill.
        if (menu.rendered) {
            menu.doLayout();
        }
    },

    onFoldersFailed: function() {
        this.folderMenu.removeAll();
        this.folderMenu.add({text: _('(could not read folders)'), disabled: true});
    },

    onFolderClick: function(destination) {
        var torrentIds = deluge.torrents.getSelectedIds();
        if (!torrentIds || !torrentIds.length) {
            return;
        }
        deluge.client.core.move_storage(torrentIds, destination);
    }
});

Deluge.registerPlugin('MoveStorageTo', Deluge.plugins.MoveStorageToPlugin);
