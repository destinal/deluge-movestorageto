/*
 * movestorageto.js
 *
 * Adds a "Move Storage To" submenu to the torrent context menu, listing the
 * folders under the configured media root by name. Selecting one calls the
 * same core.move_storage RPC the built-in "Move Storage" dialog uses,
 * skipping the dialog.
 */
Ext.ns('Deluge.ux.preferences');
Ext.ns('Deluge.plugins');

/**
 * Preferences page holding the one setting: which directory to list.
 */
Deluge.ux.preferences.MoveStorageToPage = Ext.extend(Ext.Panel, {

    title: _('Move Storage To'),
    layout: 'fit',
    border: false,

    initComponent: function() {
        Deluge.ux.preferences.MoveStorageToPage.superclass.initComponent.call(this);

        this.mediaRoot = new Ext.form.TextField({
            fieldLabel: _('Media root'),
            name: 'media_root',
            width: 260
        });

        this.add({
            xtype: 'form',
            baseCls: 'x-plain',
            bodyStyle: 'padding: 5px',
            labelWidth: 80,
            items: [this.mediaRoot, {
                xtype: 'label',
                style: 'display: block; padding-top: 8px; color: #666;',
                html: _('Each subdirectory of this path becomes an entry in the '
                      + 'torrent right-click menu. "~" is expanded on the server.')
            }]
        });

        this.on('show', this.loadConfig, this);
    },

    loadConfig: function() {
        deluge.client.movestorageto.get_config({
            success: function(config) {
                this.mediaRoot.setValue(config.media_root);
            },
            scope: this
        });
    },

    // Called by Deluge's preferences window on OK/Apply.
    onApply: function() {
        deluge.client.movestorageto.set_config({
            media_root: this.mediaRoot.getValue()
        });
    }
});

Deluge.plugins.MoveStorageToPlugin = Ext.extend(Deluge.Plugin, {

    name: 'MoveStorageTo',

    onEnable: function() {
        this.prefsPage = deluge.preferences.addPage(
            new Deluge.ux.preferences.MoveStorageToPage());

        this.folderMenu = new Ext.menu.Menu({
            items: [{text: _('Loading...'), disabled: true}]
        });

        // Refresh on every open so folders added since page load show up,
        // and so a changed media root takes effect without a reload.
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
        deluge.preferences.removePage(this.prefsPage);
        this.menuItem = null;
        this.folderMenu = null;
        this.prefsPage = null;
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

        if (result && result.error) {
            menu.add({text: String.format(_('(cannot read {0})'), result.root),
                      disabled: true});
            return;
        }

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
