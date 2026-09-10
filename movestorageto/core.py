import os

from deluge.core.rpcserver import export
from deluge.log import LOG as log
from deluge.plugins.pluginbase import CorePluginBase

# Folders offered in the submenu are the immediate subdirectories of this path.
MEDIA_ROOT = os.path.join(os.path.expanduser("~"), "media")


class Core(CorePluginBase):

    def enable(self):
        pass

    def disable(self):
        pass

    @export
    def get_media_folders(self):
        """Return the bare names of the directories under MEDIA_ROOT.

        The web UI shows only these names; it rejoins them with the root to
        build the destination passed to core.move_storage.
        """
        try:
            names = sorted(
                name for name in os.listdir(MEDIA_ROOT)
                if not name.startswith(".")
                and os.path.isdir(os.path.join(MEDIA_ROOT, name)))
        except OSError as e:
            log.error("MoveStorageTo: cannot list %s: %s", MEDIA_ROOT, e)
            names = []

        return {"root": MEDIA_ROOT, "folders": names}
