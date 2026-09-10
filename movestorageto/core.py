import os

from deluge.configmanager import ConfigManager
from deluge.core.rpcserver import export
from deluge.log import LOG as log
from deluge.plugins.pluginbase import CorePluginBase

DEFAULT_PREFS = {
    # Immediate subdirectories of this path become the submenu entries.
    "media_root": os.path.join("~", "media"),
}


class Core(CorePluginBase):

    def enable(self):
        self.config = ConfigManager("movestorageto.conf", DEFAULT_PREFS)

    def disable(self):
        self.config.save()

    @export
    def get_config(self):
        return self.config.config

    @export
    def set_config(self, config):
        for key in config:
            self.config[key] = config[key]
        self.config.save()

    @export
    def get_media_folders(self):
        """Return the bare names of the directories under the configured root.

        The web UI shows only these names; it rejoins them with the root to
        build the destination passed to core.move_storage.
        """
        root = os.path.expanduser(self.config["media_root"])
        try:
            names = sorted(
                name for name in os.listdir(root)
                if not name.startswith(".")
                and os.path.isdir(os.path.join(root, name)))
        except OSError as e:
            log.error("MoveStorageTo: cannot list %s: %s", root, e)
            return {"root": root, "folders": [], "error": str(e)}

        return {"root": root, "folders": names}
